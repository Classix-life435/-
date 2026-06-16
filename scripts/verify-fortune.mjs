// ============================================================
// scripts/verify-fortune.mjs
// ------------------------------------------------------------
// 占い鑑定ナレッジ + loader/builder の簡易検証。
// 実行: npm run fortune:verify   （または node scripts/verify-fortune.mjs）
//
// Node が .ts を直接読めるため、実アプリの loader/builder をそのまま検証する。
// ============================================================

import { loadFortuneRules } from "../src/lib/fortune/loadFortuneRules.ts";
import {
  buildFortunePrompt,
  BIRTH_INFO_GUIDANCE,
} from "../src/lib/fortune/buildFortunePrompt.ts";

const ZODIAC = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

let pass = 0;
let fail = 0;
const warns = [];

function check(name, cond) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.error(`  ✗ ${name}`);
  }
}
function warn(msg) {
  warns.push(msg);
}

console.log("占い鑑定ナレッジ 検証\n");

// ---- ロード ----
let rules;
try {
  rules = loadFortuneRules();
  check("loadFortuneRules() が成功する", true);
} catch (e) {
  check("loadFortuneRules() が成功する", false);
  console.error("   →", e.message);
  process.exit(1);
}

// ---- 原文 ----
check("原文(reading_rules.original.md)が空でない", rules.rawRules.trim().length > 0);
check("ハッシュが原文と一致する", rules.hash.matches === true);
if (rules.rawRules.includes("<<<ORIGINAL_RULES_NOT_YET_PROVIDED>>>")) {
  warn(
    "reading_rules.original.md はまだプレースホルダーです（原文未受領）。" +
      "原文を貼り付けて npm run fortune:hash → fortune:verify を再実行してください。"
  );
}

// ---- 太陽12星座 ----
const sunKeys = rules.sunSigns.map((s) => s.sign).sort();
check("太陽12星座がすべて構造化されている", ZODIAC.every((z) => sunKeys.includes(z)) && rules.sunSigns.length === 12);
if (rules.sunSigns.some((s) => !s.trueDirection?.trim())) {
  warn("太陽星座の trueDirection が未記入です（原文から抽出して埋めてください）。");
}

// ---- 月12星座 ----
const moonKeys = rules.moonSigns.map((s) => s.sign).sort();
check("月12星座がすべて構造化されている", ZODIAC.every((z) => moonKeys.includes(z)) && rules.moonSigns.length === 12);
check(
  "月星座が必須フィールドを持つ(sign/labelJa/missingKeyword/description/oppositeSign/oppositeAdvice)",
  rules.moonSigns.every(
    (m) =>
      "sign" in m && "labelJa" in m && "missingKeyword" in m &&
      "description" in m && "oppositeSign" in m && "oppositeAdvice" in m
  )
);
if (rules.moonSigns.some((m) => !m.missingKeyword?.trim() || !m.description?.trim())) {
  warn("月星座の missingKeyword/description が未記入です（原文から抽出して埋めてください）。");
}

// ---- 月トリガー ----
const trigKeys = rules.moonTriggers.map((s) => s.sign).sort();
check("月星座別トリガーが12星座分ある", ZODIAC.every((z) => trigKeys.includes(z)) && rules.moonTriggers.length === 12);
if (rules.moonTriggers.every((t) => t.triggers.length === 0)) {
  warn("月星座別トリガーが全て空です（原文の項目を漏らさず入れてください）。");
}

// ---- 禁止事項 ----
const p = rules.prohibitedTopics;
check(
  "禁止事項が読み込める(5カテゴリ)",
  !!p.lifeAndDeath && !!p.medical && !!p.investmentGambling &&
    !!p.fearBasedStatements && !!p.difficultPeriodWording
);

// ---- builder: 星座あり ----
const withSign = buildFortunePrompt(
  { userMessage: "最近、仕事がうまくいかなくて落ち込んでいます。", sunSign: "leo", moonSign: "cancer", mode: "self" },
  rules
);
check("buildFortunePrompt が原文全文を含めている", withSign.system.includes(rules.rawRules.trimEnd()));
check("プロンプトに『太陽星座の方向へ着地』指示が含まれる", withSign.system.includes("太陽星座") && withSign.system.includes("着地"));
check("プロンプトに『月星座だけで終わらせない』指示が含まれる", withSign.system.includes("月星座だけで終わらせない"));
check("プロンプトに禁止事項(寿命・病気・投資)が含まれる",
  withSign.system.includes("寿命") && withSign.system.includes("病気") && withSign.system.includes("投資"));
check("プロンプトに『本人ではありません』が含まれる", withSign.system.includes("本人ではありません"));
check("星座が揃っているとき needsBirthInfo=false", withSign.needsBirthInfo === false);
check("user にユーザー発話が入る", withSign.user.includes("落ち込んで"));

// ---- builder: 星座なし → マイページ案内 ----
const noSign = buildFortunePrompt({ userMessage: "占ってほしいです" }, rules);
check("星座情報が無いとき needsBirthInfo=true", noSign.needsBirthInfo === true);
check("星座が無いときマイページ設定案内を返すプロンプトになる", noSign.system.includes(BIRTH_INFO_GUIDANCE));

// ---- compatibility: 自分のみ → 不足 ----
const compatPartial = buildFortunePrompt(
  { userMessage: "相性が知りたい", sunSign: "leo", moonSign: "cancer", mode: "compatibility" },
  rules
);
check("相性モードで相手情報が無いと needsBirthInfo=true", compatPartial.needsBirthInfo === true);

// ---- 結果 ----
console.log(`\n結果: ${pass} passed, ${fail} failed`);
if (warns.length) {
  console.log("\n注意(原文受領後に対応):");
  for (const w of warns) console.log("  ⚠ " + w);
}
process.exit(fail === 0 ? 0 : 1);
