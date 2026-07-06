import type { Script, AudioResult } from './types';

/**
 * 解説音声（TTS）を生成する。
 * デフォルトは OpenAI 音声。他社（Azure/Google/ElevenLabs等）に差し替える場合は
 * この関数の中身だけ置き換えればパイプラインは変わらない。
 *
 * - OPENAI_API_KEY があれば本番接続
 * - 無ければ skipped（アプリは継続）
 *
 * 注意: 音声バイナリの保存先（S3/Supabase Storage 等）は運用に合わせて実装する。
 * ここでは data URL（base64）を返して、そのままプレビュー再生できるようにしている。
 * 大量・長尺の場合は必ずオブジェクトストレージへ保存すること。
 */
export async function generateAudio(script: Script): Promise<AudioResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      meta: {
        stage: 'audio',
        status: 'skipped',
        live: false,
        detail: 'OPENAI_API_KEY 未設定のためスキップ',
      },
    };
  }

  const model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
  const voice = process.env.OPENAI_TTS_VOICE || 'alloy';

  // ナレーションをセグメント単位で合成（導入・各スライド・まとめ）
  const parts = [
    script.intro,
    ...script.segments.map((s) => s.narration),
    script.outro,
  ].filter((t) => t && t.trim());

  try {
    const segmentUrls: string[] = [];
    for (const text of parts) {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, voice, input: text, response_format: 'mp3' }),
      });
      if (!res.ok) {
        const errText = (await res.text()).slice(0, 300);
        throw new Error(`TTS failed: ${res.status} ${errText}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      segmentUrls.push(`data:audio/mpeg;base64,${buf.toString('base64')}`);
    }

    return {
      url: segmentUrls[0],
      segmentUrls,
      // 実尺は合成後にメタ解析で取得するのが正確。ここでは概算（文字数ベース）。
      durationSec: estimateDurationSec(parts.join('')),
      meta: {
        stage: 'audio',
        status: 'ok',
        live: true,
        detail: `${segmentUrls.length} セグメントを ${model}/${voice} で合成`,
      },
    };
  } catch (err: any) {
    return {
      meta: {
        stage: 'audio',
        status: 'error',
        live: true,
        detail: `TTS 失敗: ${err?.message ?? err}`,
      },
    };
  }
}

/** 日本語の目安: 約6文字/秒 */
function estimateDurationSec(text: string): number {
  return Math.round(text.length / 6);
}
