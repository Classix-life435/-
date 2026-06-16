// ============================================================
// data/moonCompatibilityMaster.ts
// ------------------------------------------------------------
// 月星座 × 月星座 の相性マスタ（moon_compatibility_master 相当）。
// 恋愛 / 仕事 / プライベートの 3 カテゴリごとにランキングを持つ。
//
// 【ガバナンス】
//   ここでも「絶対に合う」「絶対に合わない」と断定しない。
//   本番表示は approvalStatus === "approved" のものだけ。
//   実データが入るまでは draft（=準備中）のテンプレートとして出荷する。
//
//   相性ランキングの根拠（どの出典に基づくか）は sourceId で管理し、
//   後から先生・運営が順位や文面を修正できる。
// ============================================================

import type {
  CompatibilityCategory,
  MoonCompatibility,
  ZodiacKey,
} from "@/lib/moon/types";
import { ZODIAC_ORDER } from "@/data/moonSignKnowledge";

const CATEGORIES: CompatibilityCategory[] = ["love", "work", "private"];

/** 空テンプレート（draft）。本番では表示されず、診断側で「準備中」になる。 */
function draftCompat(
  base: ZodiacKey,
  target: ZodiacKey,
  category: CompatibilityCategory,
  rank: number
): MoonCompatibility {
  return {
    id: `mc-${base}-${target}-${category}`,
    baseMoonSign: base,
    targetMoonSign: target,
    category,
    rank,
    title: "",
    shortDescription: "",
    detailedDescription: "",
    caution: "",
    advice: "",
    sourceId: "src-book-tsuki-no-kesson",
    approvalStatus: "draft",
    approvedBy: null,
    approvedAt: null,
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
  };
}

/**
 * 全グリッド（base × target × category）を draft テンプレートとして生成。
 * rank は ZODIAC_ORDER 上の位置を初期値にしておく（承認時に並べ替える前提）。
 */
function buildGrid(): MoonCompatibility[] {
  const rows: MoonCompatibility[] = [];
  for (const base of ZODIAC_ORDER) {
    for (const category of CATEGORIES) {
      ZODIAC_ORDER.forEach((target, idx) => {
        rows.push(draftCompat(base, target, category, idx + 1));
      });
    }
  }
  return rows;
}

const GRID = buildGrid();

// ----------------------------------------------------------
// 表示経路（TOP3 / 1〜12位）の確認用サンプル。
// 牡羊座の「恋愛」上位 3 件だけを approved にする。
// 文面は明示的なプレースホルダーで、先生固有の知見ではない。
// ----------------------------------------------------------
const ARIES_LOVE_SAMPLE: Partial<
  Record<ZodiacKey, { rank: number; title: string }>
> = {
  leo: { rank: 1, title: "（サンプル）1位の相性タイトル" },
  sagittarius: { rank: 2, title: "（サンプル）2位の相性タイトル" },
  gemini: { rank: 3, title: "（サンプル）3位の相性タイトル" },
};

function applyAriesLoveSample(rows: MoonCompatibility[]): MoonCompatibility[] {
  return rows.map((row) => {
    if (row.baseMoonSign !== "aries" || row.category !== "love") return row;
    const sample = ARIES_LOVE_SAMPLE[row.targetMoonSign];
    if (!sample) return row;
    return {
      ...row,
      rank: sample.rank,
      title: sample.title,
      shortDescription:
        "（サンプル）相性の短い説明が入ります。相手を決めつけず、関係性を見直すヒントとして読み解きます。",
      detailedDescription:
        "（サンプル）監修済みの詳しい相性解説がここに入ります。これは表示確認用のプレースホルダーです。",
      caution:
        "（サンプル）気をつけたいポイントがここに入ります（不安を煽らない表現で）。",
      advice: "（サンプル）関係を心地よくするヒントがここに入ります。",
      sourceId: "src-demo-placeholder",
      approvalStatus: "approved",
      approvedBy: "demo-operator",
      approvedAt: "2026-06-16T00:00:00.000Z",
    };
  });
}

export const MOON_COMPATIBILITY_MASTER: MoonCompatibility[] =
  applyAriesLoveSample(GRID);

/** base 星座 × カテゴリ の相性一覧を rank 昇順で返す（承認状態は問わない） */
export function getCompatibilities(
  base: ZodiacKey,
  category: CompatibilityCategory
): MoonCompatibility[] {
  return MOON_COMPATIBILITY_MASTER.filter(
    (c) => c.baseMoonSign === base && c.category === category
  ).sort((a, b) => a.rank - b.rank);
}
