// ============================================================
// data/knowledgeSources.ts
// ------------------------------------------------------------
// 出典・許諾マスタ（astrology_knowledge_sources 相当）。
//
// 【重要】
//   ここに登録された出典の許諾範囲（permissionStatus / quoteAllowed /
//   summaryAllowed）が、診断表示で「使えるかどうか」を決める。
//   実データ（先生の書籍・文字起こし等）を追加する際は、必ず
//   担当者が許諾を確認したうえで登録すること。
//
//   - permissionStatus === "prohibited" は絶対に表示・生成へ使わない
//   - 公開表示できるのは public_reference / licensed / supervised のみ
// ============================================================

import type { KnowledgeSource } from "@/lib/moon/types";

export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  // ----------------------------------------------------------
  // デモ用プレースホルダー出典。
  // 一般的な占星術のフレーム（=公開情報レベル）のみを指し、
  // 先生固有の知見は含まない。本番では実際の許諾済み出典へ差し替える。
  // ----------------------------------------------------------
  {
    id: "src-demo-placeholder",
    title: "（デモ用サンプル）運営作成プレースホルダー｜要差し替え",
    sourceType: "supervised_original",
    sourceReference:
      "運営が用意した表示確認用の仮テキスト。先生固有の知見は含まない。",
    permissionStatus: "public_reference",
    quoteAllowed: false,
    summaryAllowed: true,
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
  },

  // ----------------------------------------------------------
  // 実データ登録用テンプレート（未許諾・未監修なので prohibited 寄り）。
  // 許諾・監修が取れたら sourceType / permissionStatus / quoteAllowed /
  // summaryAllowed を正しい値に更新する。
  // ----------------------------------------------------------
  {
    id: "src-book-tsuki-no-kesson",
    title: "（テンプレート）マドモアゼル･ai 月の欠損論 書籍 ※許諾確認前",
    sourceType: "book",
    sourceReference: "書籍名・章・ページ番号をここに記載（許諾確認後に有効化）",
    // 許諾が確認できるまでは prohibited にしておき、表示に使われないようにする。
    permissionStatus: "prohibited",
    quoteAllowed: false,
    summaryAllowed: false,
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
  },
  {
    id: "src-youtube-transcript",
    title: "（テンプレート）マドモアゼル･ai 動画 文字起こし ※許諾確認前",
    sourceType: "youtube_transcript",
    sourceReference: "動画URL・タイムコードをここに記載（許諾確認後に有効化）",
    permissionStatus: "prohibited",
    quoteAllowed: false,
    summaryAllowed: false,
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
  },
];

/** id から出典を引く（見つからなければ undefined） */
export function getKnowledgeSource(
  id: string | null | undefined
): KnowledgeSource | undefined {
  if (!id) return undefined;
  return KNOWLEDGE_SOURCES.find((s) => s.id === id);
}
