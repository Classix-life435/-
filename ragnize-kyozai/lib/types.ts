// ドメイン型定義（API連携時のレスポンス型としても再利用可能）

/** 生成の入力（フロント → /api/generate） */
export interface GenerateInput {
  /** 教材のタイトル */
  title: string;
  /** 教材の元ネタ・要点（箇条書きや本文どちらでも可） */
  content: string;
  /** 想定尺（分）。台本の分量やスライド枚数の目安に使う */
  targetMinutes?: number;
  /** 想定受講者（例: 新入社員、管理職 など） */
  audience?: string;
  /** 排出先プログラムID（Supabaseの programs.id）。未指定なら排出時に選択 */
  programId?: string;
}

/** 1スライド分の台本セグメント */
export interface ScriptSegment {
  /** スライド見出し */
  heading: string;
  /** スライドに載せる要点（箇条書き） */
  bullets: string[];
  /** ナレーション（TTSに渡す原稿） */
  narration: string;
}

/** 台本＋構成（llm.ts の出力） */
export interface Script {
  title: string;
  /** 導入ナレーション */
  intro: string;
  segments: ScriptSegment[];
  /** まとめナレーション */
  outro: string;
  /** 生成元: claude | local */
  source: 'claude' | 'local';
}

/** 各工程の状態 */
export type StageStatus = 'ok' | 'skipped' | 'mock' | 'error';

/** 工程ごとの結果メタ（結果画面の「排出」タブに表示） */
export interface StageResult {
  stage: string;
  status: StageStatus;
  /** 本番接続か（キーが入っているか） */
  live: boolean;
  detail?: string;
}

/** スライド生成結果 */
export interface SlidesResult {
  /** Canvaのデザイン編集URL / エクスポートURL など */
  url?: string;
  designId?: string;
  meta: StageResult;
}

/** 音声生成結果 */
export interface AudioResult {
  /** 音声ファイルURL（複数セグメントを結合したもの、または代表） */
  url?: string;
  /** セグメントごとの音声URL */
  segmentUrls?: string[];
  durationSec?: number;
  meta: StageResult;
}

/** 動画合成結果 */
export interface VideoResult {
  url?: string;
  durationSec?: number;
  meta: StageResult;
}

/** Vimeoアップロード結果 */
export interface VimeoResult {
  videoId?: string;
  link?: string;
  embedUrl?: string;
  meta: StageResult;
}

/** パイプライン全体の成果物 */
export interface PipelineResult {
  input: GenerateInput;
  script: Script;
  slides: SlidesResult;
  audio: AudioResult;
  video: VideoResult;
  vimeo: VimeoResult;
  /** 全工程のメタ（排出タブ用） */
  stages: StageResult[];
}

/** LMSのプログラム（Supabase programs） */
export interface Program {
  id: string;
  name: string;
  description?: string | null;
}

/** LMS排出の入力（/api/publish） */
export interface PublishInput {
  programId: string;
  courseTitle: string;
  lessonTitle: string;
  /** Vimeoの埋め込みURL/リンク */
  videoUrl?: string;
  /** 台本本文（レッスン本文として保存） */
  scriptText?: string;
}

/** LMS排出の結果 */
export interface PublishResult {
  status: StageStatus;
  live: boolean;
  courseId?: string;
  lessonId?: string;
  detail?: string;
}
