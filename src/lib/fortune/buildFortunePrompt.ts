// ============================================================
// buildFortunePrompt.ts
// ------------------------------------------------------------
// 鑑定AIに渡すプロンプトを組み立てる純粋関数。
//
//   - reading_rules.original.md の全文を「最優先の上位ルール」として毎回注入する
//     （AIが原文を記憶している前提にしない）
//   - 月星座だけで終わらせず、最後は必ず太陽星座の方向へ着地させる
//   - 禁止事項（寿命・死期・病気・投資・ギャンブル等）を断定させない
//   - 星座情報が無い場合は鑑定を生成させず、マイページ設定案内を返させる
//
// 実行時 import は無し（型は type-only）。rules は呼び出し側で
// loadFortuneRules() を渡す（依存注入）。これにより素の Node からも
// テスト可能で、Next ビルドにも影響しない。
// ============================================================

import type {
  BuildFortunePromptInput,
  FortunePrompt,
  FortuneRules,
  MoonSignRule,
  MoonTriggerRule,
  SunSignRule,
} from "./types";

/** 星座情報が無いときに返す案内文（原文準拠・固定） */
export const BIRTH_INFO_GUIDANCE =
  "マイページでお誕生日を設定していただくと、あなたの星座に基づいたお話ができますよ";

/** 鑑定AIの返答ルール（プロンプトに明示する） */
const RESPONSE_RULES: string[] = [
  "あなたはマドモアゼル愛先生本人ではありません。",
  "許諾済みの鑑定ルール（上の原文）に従って返答します。",
  "原文ルールにないことを勝手に足さないこと。",
  "月は幻影・診断材料として扱うこと。",
  "太陽こそ本物・進むべき方向として扱うこと。",
  "悩みの構造は月星座で説明すること。",
  "最後は必ず太陽星座の方向へ導くこと（月星座だけで終わらせない）。",
  "相談者を責めないこと。",
  "不安を煽らないこと。",
  "断定しすぎないこと。",
  "口語トーンで返すこと。",
  "1文ごとに改行すること。",
  "基本は200字程度にすること。",
  "箇条書きをそのまま並べないこと。",
];

function findSun(
  rules: FortuneRules,
  sign?: string
): SunSignRule | undefined {
  if (!sign) return undefined;
  return rules.sunSigns.find((s) => s.sign === sign);
}
function findMoon(
  rules: FortuneRules,
  sign?: string
): MoonSignRule | undefined {
  if (!sign) return undefined;
  return rules.moonSigns.find((s) => s.sign === sign);
}
function findTriggers(
  rules: FortuneRules,
  sign?: string
): MoonTriggerRule | undefined {
  if (!sign) return undefined;
  return rules.moonTriggers.find((s) => s.sign === sign);
}

/** 相談者・相手の星座参照情報を組み立てる */
function buildSignReference(
  rules: FortuneRules,
  input: BuildFortunePromptInput
): string {
  const lines: string[] = [];
  const sun = findSun(rules, input.sunSign);
  const moon = findMoon(rules, input.moonSign);
  const trig = findTriggers(rules, input.moonSign);

  lines.push("## 相談者の星座");
  lines.push(`- 太陽星座: ${input.sunSign ?? "（未設定）"}`);
  if (sun?.trueDirection) lines.push(`  - 向かうべき本物の方向: ${sun.trueDirection}`);
  lines.push(`- 月星座: ${input.moonSign ?? "（未設定）"}`);
  if (moon?.missingKeyword) lines.push(`  - 欠けやすいキーワード: ${moon.missingKeyword}`);
  if (moon?.description) lines.push(`  - 月星座の説明: ${moon.description}`);
  if (moon?.oppositeSign) lines.push(`  - 対向星座: ${moon.oppositeSign}`);
  if (moon?.oppositeAdvice) lines.push(`  - 対向星座からの学び: ${moon.oppositeAdvice}`);
  if (trig && trig.triggers.length > 0) {
    lines.push(`  - 刺激しないほうがいいこと: ${trig.triggers.join(" / ")}`);
  }

  if (input.partnerSunSign || input.partnerMoonSign) {
    const psun = findSun(rules, input.partnerSunSign);
    const pmoon = findMoon(rules, input.partnerMoonSign);
    lines.push("");
    lines.push("## お相手の星座");
    lines.push(`- 太陽星座: ${input.partnerSunSign ?? "（未設定）"}`);
    if (psun?.trueDirection) lines.push(`  - 向かうべき本物の方向: ${psun.trueDirection}`);
    lines.push(`- 月星座: ${input.partnerMoonSign ?? "（未設定）"}`);
    if (pmoon?.missingKeyword) lines.push(`  - 欠けやすいキーワード: ${pmoon.missingKeyword}`);
  }

  return lines.join("\n");
}

/** 禁止事項（ガードレール）をプロンプト用テキストにする */
function buildProhibited(rules: FortuneRules): string {
  const p = rules.prohibitedTopics;
  const cats = [
    p.lifeAndDeath,
    p.medical,
    p.investmentGambling,
    p.fearBasedStatements,
    p.difficultPeriodWording,
  ].filter(Boolean);
  const lines: string[] = [
    "## 禁止事項（ガードレール・厳守）",
    "- 寿命・死期・病気について断定しないこと。",
    "- 投資・ギャンブルの是非や勝敗を断定しないこと。",
    "- 不安を煽る断定をしないこと。",
  ];
  for (const c of cats) {
    if (c && c.rules && c.rules.length > 0) {
      lines.push(`- ${c.labelJa}: ${c.rules.join(" / ")}`);
    }
  }
  return lines.join("\n");
}

/** 星座情報が揃っているか判定する */
function checkNeedsBirthInfo(input: BuildFortunePromptInput): boolean {
  const mode = input.mode ?? "self";
  const hasSelf = !!input.sunSign && !!input.moonSign;
  if (mode === "compatibility") {
    const hasPartner = !!input.partnerSunSign && !!input.partnerMoonSign;
    return !(hasSelf && hasPartner);
  }
  return !hasSelf;
}

/**
 * 鑑定プロンプトを組み立てる。
 * @param input ユーザー発話・星座情報・モード
 * @param rules loadFortuneRules() の結果（依存注入）
 */
export function buildFortunePrompt(
  input: BuildFortunePromptInput,
  rules: FortuneRules
): FortunePrompt {
  const mode = input.mode ?? "self";
  const needsBirthInfo = checkNeedsBirthInfo(input);

  const header = [
    "# あなたの役割",
    "あなたは、許諾済みの占い鑑定ルールに従って応答する鑑定アシスタントです。",
    "下の『鑑定ルール原文』が最優先の上位ルールです。記憶ではなく、毎回この原文に従ってください。",
    "",
    "# 鑑定ルール原文（最優先・一語一句・改変禁止）",
    "<<<BEGIN_READING_RULES>>>",
    rules.rawRules.trimEnd(),
    "<<<END_READING_RULES>>>",
    "",
    "# 返答ルール",
    ...RESPONSE_RULES.map((r) => `- ${r}`),
    "",
    buildProhibited(rules),
    "",
    buildSignReference(rules, input),
    "",
    "# 着地のしかた（重要）",
    "- まず悩みの構造を月星座（幻影・診断材料）で説明します。",
    "- ただし月星座だけで終わらせません。",
    "- 最後は必ず、相談者の太陽星座が示す『向かうべき本物の方向』へ着地させます。",
    `- 今回の鑑定モード: ${mode}`,
  ];

  if (needsBirthInfo) {
    header.push(
      "",
      "# 星座情報が不足しています（最優先の指示）",
      "- 鑑定を無理に生成しないこと。",
      "- 占いの内容は一切作らないこと。",
      `- 次の案内文だけを、口語トーンでそのまま返すこと: 「${BIRTH_INFO_GUIDANCE}」`
    );
  }

  return {
    system: header.join("\n"),
    user: input.userMessage,
    needsBirthInfo,
  };
}
