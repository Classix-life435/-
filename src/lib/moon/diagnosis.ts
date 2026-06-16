// ============================================================
// lib/moon/diagnosis.ts
// ------------------------------------------------------------
// 診断文の生成エンジン。仕様の「診断生成ルール」に沿って処理する。
//
//   1. ユーザーの月星座を取得
//   2. 承認済みの moon_sign_knowledge を取得
//   3. カテゴリごとの承認済み moon_compatibility_master を取得
//   4. 承認済みデータだけで表示文を作る（無い箇所は「準備中」）
//   5. 参照した knowledgeId をログに保存する
//   6. 承認済みデータが無い場合は該当箇所を「準備中」にする
//
// ★ AI は「ゼロから先生の知見を作る」ことはしない。ここで作るのは
//   承認済みナレッジの抽出・組み立てのみ。整形 AI を使う場合も
//   渡すのは承認済みナレッジだけ（labels.ts の guardrails 参照）。
// ============================================================

import type {
  CompatibilityCategory,
  GeneratedDiagnosisLog,
  MoonCompatibility,
  ZodiacKey,
} from "@/lib/moon/types";
import { getMoonSignKnowledge, ZODIAC_JP } from "@/data/moonSignKnowledge";
import { getCompatibilities } from "@/data/moonCompatibilityMaster";
import { fieldValue, filterDisplayable } from "@/lib/moon/governance";
import { NOT_READY_LABEL, PROMPT_VERSION } from "@/lib/moon/labels";

/** 表示用フィールド: 承認済みなら本文、なければ「準備中」フラグ */
export interface DisplayField {
  ready: boolean;
  /** ready=true のときの本文。false のときは null */
  text: string | null;
  /** 表示用（false のときは NOT_READY_LABEL を返す） */
  display: string;
}

function toField(value: string | null): DisplayField {
  const ready = value !== null;
  return {
    ready,
    text: value,
    display: ready ? (value as string) : NOT_READY_LABEL,
  };
}

export interface MoonSignSection {
  moonSign: ZodiacKey;
  moonSignJp: string;
  themeTitle: DisplayField;
  shortDescription: DisplayField;
  detailedDescription: DisplayField;
  deficiencyTheme: DisplayField;
  attachmentPattern: DisplayField;
  releaseAdvice: DisplayField;
  oppositeSignAdvice: DisplayField;
  loveAdvice: DisplayField;
  workAdvice: DisplayField;
  privateAdvice: DisplayField;
  /** この星座のナレッジが 1 つでも承認済みで表示できるか */
  ready: boolean;
}

export interface CompatibilityRow {
  rank: number;
  targetMoonSign: ZodiacKey;
  targetMoonSignJp: string;
  title: DisplayField;
  shortDescription: DisplayField;
  detailedDescription: DisplayField;
  caution: DisplayField;
  advice: DisplayField;
}

export interface CompatibilitySection {
  category: CompatibilityCategory;
  /** 承認済みで表示できる相性（rank 昇順） */
  ranking: CompatibilityRow[];
  /** TOP3（ranking の先頭 3 件） */
  top3: CompatibilityRow[];
  ready: boolean;
}

export interface DiagnosisResult {
  moonSign: ZodiacKey;
  moonSignJp: string;
  sign: MoonSignSection;
  compatibility: Record<CompatibilityCategory, CompatibilitySection>;
  /** 何か 1 つでも承認済みデータを表示できたか */
  hasAnyApproved: boolean;
  log: GeneratedDiagnosisLog;
}

const CATEGORIES: CompatibilityCategory[] = ["love", "work", "private"];

function buildSignSection(
  moonSign: ZodiacKey,
  refIds: string[]
): MoonSignSection {
  const k = getMoonSignKnowledge(moonSign);
  // 承認・許諾を満たさなければ各フィールドは null（→ 準備中）
  const f = (v: string | null | undefined) =>
    toField(k ? fieldValue(k, v) : null);

  const section: MoonSignSection = {
    moonSign,
    moonSignJp: ZODIAC_JP[moonSign],
    themeTitle: f(k?.themeTitle),
    shortDescription: f(k?.shortDescription),
    detailedDescription: f(k?.detailedDescription),
    deficiencyTheme: f(k?.deficiencyTheme),
    attachmentPattern: f(k?.attachmentPattern),
    releaseAdvice: f(k?.releaseAdvice),
    oppositeSignAdvice: f(k?.oppositeSignAdvice),
    loveAdvice: f(k?.loveAdvice),
    workAdvice: f(k?.workAdvice),
    privateAdvice: f(k?.privateAdvice),
    ready: false,
  };

  const anyReady = [
    section.themeTitle,
    section.shortDescription,
    section.detailedDescription,
    section.deficiencyTheme,
    section.attachmentPattern,
    section.releaseAdvice,
    section.oppositeSignAdvice,
    section.loveAdvice,
    section.workAdvice,
    section.privateAdvice,
  ].some((x) => x.ready);
  section.ready = anyReady;

  if (anyReady && k) refIds.push(k.id);
  return section;
}

function buildCompatRow(c: MoonCompatibility, refIds: string[]): CompatibilityRow {
  const f = (v: string | null | undefined) => toField(fieldValue(c, v));
  refIds.push(c.id);
  return {
    rank: c.rank,
    targetMoonSign: c.targetMoonSign,
    targetMoonSignJp: ZODIAC_JP[c.targetMoonSign],
    title: f(c.title),
    shortDescription: f(c.shortDescription),
    detailedDescription: f(c.detailedDescription),
    caution: f(c.caution),
    advice: f(c.advice),
  };
}

function buildCompatSection(
  moonSign: ZodiacKey,
  category: CompatibilityCategory,
  refIds: string[]
): CompatibilitySection {
  // 承認済み & 許諾OK のものだけに絞り、rank 昇順で並べ替える
  const approved = filterDisplayable(
    getCompatibilities(moonSign, category)
  ).sort((a, b) => a.rank - b.rank);

  const ranking = approved.map((c) => buildCompatRow(c, refIds));
  return {
    category,
    ranking,
    top3: ranking.slice(0, 3),
    ready: ranking.length > 0,
  };
}

let logCounter = 0;
function newLogId(): string {
  logCounter += 1;
  return `log-${Date.now()}-${logCounter}`;
}

/**
 * 月星座から診断結果を組み立てる。
 * 承認済みデータのみを使い、無い箇所は「準備中」になる。
 */
export function generateDiagnosis(
  moonSign: ZodiacKey,
  opts?: { userId?: string | null; moonProfileId?: string | null }
): DiagnosisResult {
  const refIds: string[] = [];

  const sign = buildSignSection(moonSign, refIds);

  const compatibility = {} as Record<
    CompatibilityCategory,
    CompatibilitySection
  >;
  for (const cat of CATEGORIES) {
    compatibility[cat] = buildCompatSection(moonSign, cat, refIds);
  }

  const hasAnyApproved =
    sign.ready || CATEGORIES.some((c) => compatibility[c].ready);

  const log: GeneratedDiagnosisLog = {
    id: newLogId(),
    userId: opts?.userId ?? null,
    moonProfileId: opts?.moonProfileId ?? null,
    promptVersion: PROMPT_VERSION,
    referencedKnowledgeIds: Array.from(new Set(refIds)),
    generatedText: summarizeForLog(moonSign, hasAnyApproved),
    createdAt: new Date().toISOString(),
  };

  return {
    moonSign,
    moonSignJp: ZODIAC_JP[moonSign],
    sign,
    compatibility,
    hasAnyApproved,
    log,
  };
}

function summarizeForLog(moonSign: ZodiacKey, hasAnyApproved: boolean): string {
  return hasAnyApproved
    ? `月星座 ${ZODIAC_JP[moonSign]} の承認済みナレッジを参照して診断を生成`
    : `月星座 ${ZODIAC_JP[moonSign]} は承認済みナレッジが無いため準備中表示`;
}
