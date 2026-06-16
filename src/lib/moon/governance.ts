// ============================================================
// lib/moon/governance.ts
// ------------------------------------------------------------
// ナレッジ・ガバナンスの単一の入口（Single Source of Truth）。
// 「このデータを本番表示に使ってよいか？」の判定を全部ここに集約する。
//
// 表示に使ってよい条件（すべて満たすこと）:
//   1. approvalStatus === "approved"
//   2. 紐づく出典の permissionStatus が prohibited / internal_only でない
//   3. 中身（文面）が空でない
//
// 引用してよい条件: 出典の quoteAllowed === true
// 要約してよい条件: 出典の summaryAllowed === true
// ============================================================

import type {
  ApprovalStatus,
  KnowledgeSource,
  PermissionStatus,
} from "@/lib/moon/types";
import { getKnowledgeSource } from "@/data/knowledgeSources";

/** 本番で公開表示してよい許諾ステータス */
const DISPLAYABLE_PERMISSIONS: PermissionStatus[] = [
  "public_reference",
  "licensed",
  "supervised",
];

/** 表示に使ってよい承認ステータスは "approved" のみ */
export function isApproved(status: ApprovalStatus): boolean {
  return status === "approved";
}

/** 出典の許諾が公開表示可能か（prohibited / internal_only は不可） */
export function isPermissionDisplayable(
  source: KnowledgeSource | undefined
): boolean {
  if (!source) return false;
  return DISPLAYABLE_PERMISSIONS.includes(source.permissionStatus);
}

/** 承認済みナレッジ項目の共通形（最低限の判定に必要なフィールド） */
interface ApprovableItem {
  approvalStatus: ApprovalStatus;
  sourceId: string;
}

/**
 * 本番表示に使ってよいか総合判定する。
 *   - approved であること
 *   - 出典の許諾が公開可能であること
 * 文面の中身チェックは呼び出し側（fieldValue）で行う。
 */
export function canDisplay(item: ApprovableItem): boolean {
  if (!isApproved(item.approvalStatus)) return false;
  const source = getKnowledgeSource(item.sourceId);
  return isPermissionDisplayable(source);
}

/** 原文引用してよいか */
export function canQuote(sourceId: string): boolean {
  const source = getKnowledgeSource(sourceId);
  return !!source && source.quoteAllowed === true && isPermissionDisplayable(source);
}

/** 要約・言い換えに使ってよいか */
export function canSummarize(sourceId: string): boolean {
  const source = getKnowledgeSource(sourceId);
  return !!source && source.summaryAllowed === true && isPermissionDisplayable(source);
}

/**
 * 承認配列から、本番表示可能なものだけを抜き出す。
 */
export function filterDisplayable<T extends ApprovableItem>(items: T[]): T[] {
  return items.filter((item) => canDisplay(item));
}

/**
 * 表示してよい項目の「ある 1 フィールド」を安全に取り出す。
 *   - 表示不可、または中身が空なら null を返す（呼び出し側で「準備中」にする）
 */
export function fieldValue(
  item: ApprovableItem,
  value: string | null | undefined
): string | null {
  if (!canDisplay(item)) return null;
  const v = (value ?? "").trim();
  return v.length > 0 ? v : null;
}
