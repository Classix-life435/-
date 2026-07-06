import type { Script, SlidesResult, AudioResult, VideoResult } from './types';

/**
 * 動画合成をレンダーワーカー（Remotion / ffmpeg 等）に委譲する。
 * Vercel の関数タイムアウトを避けるため、合成は必ず外部ワーカーで行う設計。
 *
 * - RENDER_WORKER_URL があれば POST して合成を依頼
 * - 無ければ skipped（アプリは継続）
 *
 * ワーカー側の契約（例）:
 *   POST {RENDER_WORKER_URL}
 *   body: { script, slides, audio }
 *   res:  { url, durationSec }   … 同期合成の場合
 *   本番では jobId を返して非同期化し、generation_jobs でポーリングするのを推奨。
 */
export async function composeVideo(
  script: Script,
  slides: SlidesResult,
  audio: AudioResult,
): Promise<VideoResult> {
  const workerUrl = process.env.RENDER_WORKER_URL;
  if (!workerUrl) {
    return {
      meta: {
        stage: 'video',
        status: 'skipped',
        live: false,
        detail: 'RENDER_WORKER_URL 未設定のためスキップ',
      },
    };
  }

  try {
    const res = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script,
        slides: { url: slides.url, designId: slides.designId },
        audio: { url: audio.url, segmentUrls: audio.segmentUrls },
      }),
    });

    if (!res.ok) {
      const errText = (await res.text()).slice(0, 300);
      throw new Error(`render worker failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    return {
      url: data.url,
      durationSec: data.durationSec ?? audio.durationSec,
      meta: {
        stage: 'video',
        status: 'ok',
        live: true,
        detail: data.url ? '動画合成完了' : 'ワーカーにジョブを依頼（非同期）',
      },
    };
  } catch (err: any) {
    return {
      meta: {
        stage: 'video',
        status: 'error',
        live: true,
        detail: `動画合成 失敗: ${err?.message ?? err}`,
      },
    };
  }
}
