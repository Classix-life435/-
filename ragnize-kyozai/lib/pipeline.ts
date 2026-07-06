import type { GenerateInput, PipelineResult, StageResult } from './types';
import { generateScript } from './llm';
import { generateSlides } from './slides';
import { generateAudio } from './tts';
import { composeVideo } from './video';
import { uploadToVimeo } from './vimeo';

/**
 * 生成パイプラインのオーケストレーション。
 * 台本 → スライド → 音声 → 動画 → Vimeo の順に実行する。
 *
 * 各工程は「キーがあれば本番接続 / 無ければ skip」で、どこかが未接続でも
 * 全体は最後まで走り切る（結果画面の「排出」タブに工程ごとの状態を表示）。
 */
export async function runPipeline(input: GenerateInput): Promise<PipelineResult> {
  // 1. 台本・構成（Claude / ローカル）
  const script = await generateScript(input);

  // 2. スライド（Canva）— 台本に依存
  const slides = await generateSlides(script);

  // 3. 解説音声（TTS）— スライドと独立なので音声は台本から並行生成可
  const audio = await generateAudio(script);

  // 4. 動画合成（レンダーワーカー）— スライド＋音声に依存
  const video = await composeVideo(script, slides, audio);

  // 5. Vimeoアップロード（限定公開）— 合成動画に依存
  const vimeo = await uploadToVimeo(script, video);

  const stages: StageResult[] = [
    {
      stage: 'script',
      status: 'ok',
      live: script.source === 'claude',
      detail: script.source === 'claude' ? 'Claude で生成' : 'ローカル生成（ANTHROPIC_API_KEY 未設定）',
    },
    slides.meta,
    audio.meta,
    video.meta,
    vimeo.meta,
  ];

  return { input, script, slides, audio, video, vimeo, stages };
}
