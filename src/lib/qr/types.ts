// ============================================================
// QR Phone 面接 ── 採用担当向け管理画面 ドメイン型定義
//
// 採用ページに常駐するAI窓口が、求職者の質問に答え面接へ誘導する。
// この管理画面の主役は「応募しなかった人が、何に迷って帰ったのか」を
// 一枚で可視化すること。
//
// バックエンド接続時は、この型をそのままAPIレスポンス型として再利用する。
// （現在は lib/qr/mock-data.ts の仮データで動作）
// ============================================================

/** 対応言語。ja=日本語 / en=英語 / vi=ベトナム語 / zh=中国語 / pt=ポルトガル語 / tl=タガログ語 */
export type Language = "ja" | "en" | "vi" | "zh" | "pt" | "tl";

/** 求職者↔AI の1メッセージ */
export interface Message {
  role: "applicant" | "ai";
  text: string;
}

/** A-CQS スコア（4軸・各0-100）。会話の質を測る指標。 */
export interface Acqs {
  q: number; // Question resolution（疑問の解消度）
  a: number; // Answer accuracy（回答の的確さ）
  e: number; // Engagement（求職者の関与度）
  p: number; // Progression（面接への前進度）
}

/**
 * 1件の会話（＝1人の求職者がAI窓口に投げた相談）。
 * - isInterview: 3ターン以上で true（＝面接成立・課金対象）
 * - reachedInterview: 実際に面接予約へ進んだか（採用ファネルの最終到達）
 *   1〜2ターンで離脱した会話は面接成立に至らないため reachedInterview も false。
 */
export interface Conversation {
  id: string;
  jobCategory: string; // 職種
  language: Language;
  turns: number; // ターン数（1ターン = 求職者の質問 + AIの回答）
  isInterview: boolean; // 3ターン以上で true（＝課金対象の「面接成立」）
  questionCategory: string; // 「シフトの融通」等、最初の相談カテゴリ
  reachedInterview: boolean; // 面接（予約）へ進んだか
  acqs: Acqs;
  timestamp: string; // ISO
  messages: Message[];
}

/**
 * 質問カテゴリごとの離脱サマリー（離脱理由テーブルの1行）。
 * dropRate = 1 −（toInterview ÷ askedCount）
 */
export interface QuestionSummary {
  category: string;
  askedCount: number; // 質問した人
  toInterview: number; // うち面接へ進んだ人
  dropRate: number; // 離脱率（0-1）
}

/**
 * 離脱テーブル表示用に QuestionSummary を拡張した派生型。
 * 多言語アップセルのヒント判定に必要な情報を含む。
 */
export interface QuestionInsight extends QuestionSummary {
  jobCategory: string; // 代表職種
  foreignCount: number; // 外国語（ja以外）で質問した人数
  languages: Language[]; // このカテゴリに現れた言語
  /** 外国人の質問が来ているのに離脱率が高い → 多言語対応で改善余地あり */
  needsMultilingual: boolean;
}

export type Plan = "free" | "standard" | "business";

/** 契約アカウント（利用状況・課金） */
export interface Account {
  plan: Plan;
  interviewsThisMonth: number; // 面接成立数（3ターン以上・課金対象）
  freeQuotaRemaining: number; // Freeプランの無料枠残（それ以外は0）
  languagesEnabled: string[]; // 有効化中の言語
  jobCategoryCount: number; // 掲載職種数
}

/** ダッシュボード上部のサマリーカード集計 */
export interface DashboardSummary {
  totalQuestions: number; // 今月の総質問数
  reachedInterview: number; // 面接まで進んだ数
  interviewsSettled: number; // 面接成立数（3ターン以上・課金対象）
  overallDropRate: number; // 全体離脱率（0-1）
  foreignQuestions: number; // 外国人求職者からの質問数
}
