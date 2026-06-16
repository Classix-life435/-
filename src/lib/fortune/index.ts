// ============================================================
// src/lib/fortune — 公開エントリ
// ------------------------------------------------------------
// アプリ/サーバー側からの利用はこのモジュール経由が便利。
// loadFortuneRules() で原文+JSONを読み、buildFortunePrompt() に渡す。
//
// 注意: loadFortuneRules は fs を使うためサーバー側でのみ動作する。
//       静的エクスポートのクライアントからは呼べない。
//       （将来は API Route / バックエンドからこの getFortunePrompt を呼ぶ）
// ============================================================

import { loadFortuneRules } from "./loadFortuneRules";
import { buildFortunePrompt } from "./buildFortunePrompt";
import type { BuildFortunePromptInput, FortunePrompt } from "./types";

export { loadFortuneRules } from "./loadFortuneRules";
export { buildFortunePrompt, BIRTH_INFO_GUIDANCE } from "./buildFortunePrompt";
export type * from "./types";

/** 原文を読み込み、そのままプロンプトを組み立てる便利関数（サーバー側専用） */
export function getFortunePrompt(
  input: BuildFortunePromptInput
): FortunePrompt {
  const rules = loadFortuneRules();
  return buildFortunePrompt(input, rules);
}
