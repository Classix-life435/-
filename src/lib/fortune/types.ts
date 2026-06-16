// ============================================================
// 占い鑑定ルール（ナレッジ原文 + 抽出JSON）の型定義
// ------------------------------------------------------------
// これらの型は knowledge/fortune/*.json の構造に対応する。
// 既存の月星座機能で定義済みの ZodiacKey を再利用する（型のみ・実行時依存なし）。
// ============================================================

// 既存 types を再利用（type-only import なので実行時には消える）
import type { ZodiacKey } from "../moon/types";

export type { ZodiacKey };

/** 鑑定モード */
export type FortuneMode = "self" | "compatibility" | "love" | "work" | "private";

// ---- 太陽の12星座（向かうべき本物の方向） ----
export interface SunSignRule {
  sign: ZodiacKey;
  labelJa: string;
  /** 向かうべき本物の方向（原文から抽出） */
  trueDirection: string;
}

// ---- 月の12星座キーワード（欠けやすいもの） ----
export interface MoonSignRule {
  sign: ZodiacKey;
  labelJa: string;
  /** 欠けやすいキーワード */
  missingKeyword: string;
  /** 説明（原文から抽出） */
  description: string;
  /** 対向の星座 */
  oppositeSign: ZodiacKey;
  /** 対向星座からのアドバイス（原文から抽出） */
  oppositeAdvice: string;
}

// ---- 月星座別・刺激しないほうがいいこと ----
export interface MoonTriggerRule {
  sign: ZodiacKey;
  labelJa: string;
  /** 刺激しないほうがいいこと（原文の項目を漏らさず） */
  triggers: string[];
}

// ---- 禁止事項（ガードレール） ----
export interface ProhibitedTopicCategory {
  labelJa: string;
  rules: string[];
}

export interface ProhibitedTopicRules {
  lifeAndDeath: ProhibitedTopicCategory;
  medical: ProhibitedTopicCategory;
  investmentGambling: ProhibitedTopicCategory;
  fearBasedStatements: ProhibitedTopicCategory;
  difficultPeriodWording: ProhibitedTopicCategory;
}

/** loadFortuneRules() の返却値 */
export interface FortuneRules {
  /** reading_rules.original.md の全文（一語一句そのまま） */
  rawRules: string;
  sunSigns: SunSignRule[];
  moonSigns: MoonSignRule[];
  moonTriggers: MoonTriggerRule[];
  prohibitedTopics: ProhibitedTopicRules;
  /** ハッシュ照合の結果（原文が改変されていないか） */
  hash: {
    algorithm: string;
    expected: string;
    actual: string;
    matches: boolean;
  };
}

/** buildFortunePrompt() の入力 */
export interface BuildFortunePromptInput {
  userMessage: string;
  sunSign?: ZodiacKey | string;
  moonSign?: ZodiacKey | string;
  partnerSunSign?: ZodiacKey | string;
  partnerMoonSign?: ZodiacKey | string;
  mode?: FortuneMode;
}

/** buildFortunePrompt() の返却値 */
export interface FortunePrompt {
  /** AI に渡すシステムプロンプト（原文全文 + ルールを内包） */
  system: string;
  /** ユーザー発話 */
  user: string;
  /** 星座情報が無く、マイページ設定案内に切り替えたか */
  needsBirthInfo: boolean;
}
