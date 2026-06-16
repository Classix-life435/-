// ============================================================
// data/moonSignKnowledge.ts
// ------------------------------------------------------------
// 月星座ごとの監修ナレッジ（moon_sign_knowledge 相当）。
//
// 【超重要・ガバナンスの中心】
//   AI や運営が「先生の知見」を勝手に創作してはいけない。
//   実際の診断文は、許諾済み・監修済みのテキストをもとに登録し、
//   monitoring 者が approvalStatus を "approved" にして初めて表示される。
//
//   そのため、このファイルの 12 星座は原則 approvalStatus: "draft"（=準備中）
//   の「空テンプレート」として出荷する。先生／運営が内容を記入し、監修者が
//   承認した時点で本番表示に切り替わる。
//
//   唯一 "approved" になっている aries は、表示経路を確認するための
//   「明らかなプレースホルダー（要差し替え）」であり、先生固有の知見ではない。
// ============================================================

import type { MoonSignKnowledge, ZodiacKey } from "@/lib/moon/types";

/** すべての星座キー（表示順） */
export const ZODIAC_ORDER: ZodiacKey[] = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

/** 月星座キー → 日本語名 */
export const ZODIAC_JP: Record<ZodiacKey, string> = {
  aries: "牡羊座",
  taurus: "牡牛座",
  gemini: "双子座",
  cancer: "蟹座",
  leo: "獅子座",
  virgo: "乙女座",
  libra: "天秤座",
  scorpio: "蠍座",
  sagittarius: "射手座",
  capricorn: "山羊座",
  aquarius: "水瓶座",
  pisces: "魚座",
};

/**
 * まだ内容が入っていない星座の「空テンプレート」を作る。
 * approvalStatus は "draft" なので本番表示には使われず、診断側で「準備中」になる。
 */
function draftTemplate(moonSign: ZodiacKey): MoonSignKnowledge {
  return {
    id: `msk-${moonSign}`,
    moonSign,
    themeTitle: "",
    shortDescription: "",
    detailedDescription: "",
    deficiencyTheme: "",
    attachmentPattern: "",
    releaseAdvice: "",
    oppositeSignAdvice: "",
    loveAdvice: "",
    workAdvice: "",
    privateAdvice: "",
    // 許諾確認前のテンプレ出典に紐付けておく（許諾後に差し替える）
    sourceId: "src-book-tsuki-no-kesson",
    approvalStatus: "draft",
    approvedBy: null,
    approvedAt: null,
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
  };
}

// ----------------------------------------------------------
// 表示経路の確認用サンプル（牡羊座）。
// 内容は「ここに監修済みの診断文が入ります」という明示的な
// プレースホルダーであり、先生固有の知見ではない。
// 本番投入前に必ず監修済みテキストへ差し替えること。
// ----------------------------------------------------------
const ARIES_SAMPLE: MoonSignKnowledge = {
  id: "msk-aries",
  moonSign: "aries",
  themeTitle: "（サンプル）月星座のテーマがここに入ります",
  shortDescription:
    "（サンプル）ここに、無意識に求めやすいテーマの短い説明が入ります。これは表示確認用のプレースホルダーで、先生の知見ではありません。",
  detailedDescription:
    "（サンプル）監修済みの詳しい解説文がここに入ります。月星座は「本当の性格」ではなく、無意識に求めやすい・思い込みやすいテーマとして読み解きます。",
  deficiencyTheme:
    "（サンプル）月の欠損として現れやすいテーマの説明がここに入ります。",
  attachmentPattern:
    "（サンプル）無意識にしがみつきやすいパターンの説明がここに入ります。",
  releaseAdvice:
    "（サンプル）気づきと手放しにつながるヒントがここに入ります。",
  oppositeSignAdvice:
    "（サンプル）対向の星座から学べることがここに入ります。",
  loveAdvice: "（サンプル）恋愛における気づきのヒントがここに入ります。",
  workAdvice: "（サンプル）仕事における気づきのヒントがここに入ります。",
  privateAdvice:
    "（サンプル）プライベートにおける気づきのヒントがここに入ります。",
  sourceId: "src-demo-placeholder",
  approvalStatus: "approved",
  approvedBy: "demo-operator",
  approvedAt: "2026-06-16T00:00:00.000Z",
  createdAt: "2026-06-16T00:00:00.000Z",
  updatedAt: "2026-06-16T00:00:00.000Z",
};

export const MOON_SIGN_KNOWLEDGE: MoonSignKnowledge[] = ZODIAC_ORDER.map(
  (sign) => (sign === "aries" ? ARIES_SAMPLE : draftTemplate(sign))
);

/** 月星座のナレッジを引く（承認状態は問わない。フィルタは governance 側で行う） */
export function getMoonSignKnowledge(
  moonSign: ZodiacKey
): MoonSignKnowledge | undefined {
  return MOON_SIGN_KNOWLEDGE.find((k) => k.moonSign === moonSign);
}
