import type {
  Account,
  Conversation,
  DashboardSummary,
  Language,
  QuestionInsight,
} from "./types";
import {
  BUSINESS_BREAKEVEN,
  FREE_QUOTA,
  PLAN_UNIT_PRICE,
  account,
  conversations,
} from "./mock-data";

// ============================================================
// 仮データ → 画面表示用の集計を導出する純粋関数群。
// 数字の定義（面接成立=3ターン以上／離脱率=1-面接へ÷質問数）は
// ここに一元化し、画面側では計算しない。
// ============================================================

/** 離脱率が「高い」と見なす閾値（この値以上を赤系で強調） */
export const HIGH_DROP_THRESHOLD = 0.7;
/** 多言語ヒントを出す離脱率の閾値 */
const MULTILINGUAL_DROP_THRESHOLD = 0.6;
/** 多言語ヒントを出す最低外国語質問数（単発ではなく傾向として現れているもの） */
const MULTILINGUAL_MIN_FOREIGN = 2;

/**
 * 離脱インサイトの並び順比較。離脱率降順を主軸に、同率は
 * 外国語質問数→質問数→カテゴリ名 で決定的に並べる（テーブルと共通）。
 */
export function compareByDropRate(a: QuestionInsight, b: QuestionInsight): number {
  if (b.dropRate !== a.dropRate) return b.dropRate - a.dropRate;
  if (b.foreignCount !== a.foreignCount) return b.foreignCount - a.foreignCount;
  if (b.askedCount !== a.askedCount) return b.askedCount - a.askedCount;
  return a.category.localeCompare(b.category, "ja");
}

const isForeign = (lang: Language) => lang !== "ja";

/**
 * 質問カテゴリごとの離脱インサイトを算出。
 * dropRate 降順（＝一番直すべき求人票が最上段）で返す。
 */
export function buildQuestionInsights(
  convs: Conversation[] = conversations,
  acct: Account = account
): QuestionInsight[] {
  const byCategory = new Map<string, Conversation[]>();
  for (const c of convs) {
    const list = byCategory.get(c.questionCategory) ?? [];
    list.push(c);
    byCategory.set(c.questionCategory, list);
  }

  const enabled = new Set(acct.languagesEnabled);

  const insights: QuestionInsight[] = [];
  for (const [category, list] of byCategory) {
    const askedCount = list.length;
    const toInterview = list.filter((c) => c.reachedInterview).length;
    const dropRate = 1 - toInterview / askedCount;
    const foreignConvs = list.filter((c) => isForeign(c.language));
    const foreignCount = foreignConvs.length;
    const languages = Array.from(new Set(list.map((c) => c.language)));

    // 外国語の質問が来ていて、その言語が未対応で、離脱率が高い
    // → 多言語対応をオンにすれば改善余地がある
    const hasUnsupportedForeign = foreignConvs.some(
      (c) => !enabled.has(c.language)
    );
    const needsMultilingual =
      foreignCount >= MULTILINGUAL_MIN_FOREIGN &&
      hasUnsupportedForeign &&
      dropRate >= MULTILINGUAL_DROP_THRESHOLD;

    insights.push({
      category,
      askedCount,
      toInterview,
      dropRate,
      jobCategory: list[0].jobCategory,
      foreignCount,
      languages,
      needsMultilingual,
    });
  }

  return insights.sort(compareByDropRate);
}

/** ダッシュボード上部サマリーカードの集計 */
export function buildDashboardSummary(
  convs: Conversation[] = conversations
): DashboardSummary {
  const totalQuestions = convs.length;
  const reachedInterview = convs.filter((c) => c.reachedInterview).length;
  const interviewsSettled = convs.filter((c) => c.isInterview).length;
  const overallDropRate =
    totalQuestions === 0 ? 0 : 1 - reachedInterview / totalQuestions;
  const foreignQuestions = convs.filter((c) => isForeign(c.language)).length;

  return {
    totalQuestions,
    reachedInterview,
    interviewsSettled,
    overallDropRate,
    foreignQuestions,
  };
}

/**
 * 質問→面接ファネルの3段階。
 * 「疑問は解消したのに面接に進まず帰った」層を可視化するため、
 * 中間に「対話が深まった（3ターン以上）」を挟む。
 */
export interface FunnelStage {
  key: "question" | "deepened" | "interview";
  label: string;
  sublabel: string;
  count: number;
}

export function buildFunnel(
  convs: Conversation[] = conversations
): FunnelStage[] {
  const total = convs.length;
  const deepened = convs.filter((c) => c.isInterview).length;
  const interview = convs.filter((c) => c.reachedInterview).length;
  return [
    {
      key: "question",
      label: "質問した",
      sublabel: "AI窓口に相談",
      count: total,
    },
    {
      key: "deepened",
      label: "対話が深まった",
      sublabel: "3ターン以上・疑問を解消",
      count: deepened,
    },
    {
      key: "interview",
      label: "面接へ進んだ",
      sublabel: "面接予約に到達",
      count: interview,
    },
  ];
}

/** 課金の概算 */
export interface Billing {
  plan: Account["plan"];
  interviewsThisMonth: number;
  unitPrice: number;
  billableCount: number; // 課金対象の面接回数（Freeは無料枠超過分）
  estimatedAmount: number; // 概算請求額（円）
  freeQuota: number;
  freeQuotaUsed: number;
  freeQuotaRemaining: number;
  // Business 提案
  standardCost: number;
  businessCost: number;
  suggestBusiness: boolean;
  businessBreakeven: number;
}

export function buildBilling(acct: Account = account): Billing {
  const { plan, interviewsThisMonth } = acct;
  const unitPrice = PLAN_UNIT_PRICE[plan];

  const freeQuotaUsed = Math.min(interviewsThisMonth, FREE_QUOTA);
  const freeQuotaRemaining = Math.max(FREE_QUOTA - interviewsThisMonth, 0);

  // Free: 無料枠を超えた分だけ課金（超過分はStandard単価想定）
  const billableCount =
    plan === "free"
      ? Math.max(interviewsThisMonth - FREE_QUOTA, 0)
      : interviewsThisMonth;

  const effectiveUnit = plan === "free" ? PLAN_UNIT_PRICE.standard : unitPrice;
  const estimatedAmount = billableCount * effectiveUnit;

  // 現行 Standard と Business の比較
  const standardCost = interviewsThisMonth * PLAN_UNIT_PRICE.standard;
  const businessCost = interviewsThisMonth * PLAN_UNIT_PRICE.business;

  // Standard で月500面接に近づいたら Business を提案
  const suggestBusiness =
    plan === "standard" && interviewsThisMonth >= BUSINESS_BREAKEVEN * 0.8;

  return {
    plan,
    interviewsThisMonth,
    unitPrice,
    billableCount,
    estimatedAmount,
    freeQuota: FREE_QUOTA,
    freeQuotaUsed,
    freeQuotaRemaining,
    standardCost,
    businessCost,
    suggestBusiness,
    businessBreakeven: BUSINESS_BREAKEVEN,
  };
}

/** ¥1,234 形式に整形 */
export function formatYen(n: number): string {
  return "¥" + n.toLocaleString("ja-JP");
}

/** 0.72 → "72%" */
export function formatPercent(ratio: number, digits = 0): string {
  return (ratio * 100).toFixed(digits) + "%";
}
