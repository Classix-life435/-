// ============================================================
// loadFortuneRules.ts
// ------------------------------------------------------------
// knowledge/fortune/ の原文(.md)と補助JSONを読み込み、検証して返す。
//
// 設計上の注意:
//   - 実行時の import は Node 組み込みモジュールのみ（型は type-only）。
//     これにより Next のビルドに影響を与えず、素の Node からも実行できる。
//   - 原文は「鑑定AIの上位ルール」。要約・改変せず全文をそのまま読み込む。
//   - 原文が無い/空、JSONが壊れている場合はエラーにする。
//
// TODO(別フェーズ): ファイル読み込みは将来サーバー(API Routes)側で実行する。
//   静的エクスポートのクライアントからは fs を使えないため、鑑定生成は
//   サーバー/バックエンドで loadFortuneRules() → buildFortunePrompt() を呼ぶ。
// ============================================================

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

import type {
  FortuneRules,
  MoonSignRule,
  MoonTriggerRule,
  ProhibitedTopicRules,
  SunSignRule,
} from "./types";

export interface LoadFortuneRulesOptions {
  /** knowledge/fortune ディレクトリの絶対パス（既定: <cwd>/knowledge/fortune） */
  knowledgeDir?: string;
}

const FILE = {
  original: "reading_rules.original.md",
  hash: "reading_rules.hash.json",
  sun: "sun_signs.json",
  moon: "moon_signs.json",
  triggers: "moon_triggers.json",
  prohibited: "prohibited_topics.json",
} as const;

function defaultDir(): string {
  return join(process.cwd(), "knowledge", "fortune");
}

function readText(dir: string, file: string): string {
  const path = join(dir, file);
  if (!existsSync(path)) {
    throw new Error(`[loadFortuneRules] ファイルが見つかりません: ${path}`);
  }
  return readFileSync(path, "utf8");
}

function readJson<T>(dir: string, file: string): T {
  const raw = readText(dir, file);
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    throw new Error(
      `[loadFortuneRules] JSON の解析に失敗しました: ${file} (${(e as Error).message})`
    );
  }
}

/** { _note?, signs: Record<key, T> } 形式から値配列を取り出す */
function signsToArray<T>(obj: { signs?: Record<string, T> }, file: string): T[] {
  if (!obj || typeof obj !== "object" || !obj.signs) {
    throw new Error(`[loadFortuneRules] "signs" がありません: ${file}`);
  }
  return Object.values(obj.signs);
}

/**
 * 占い鑑定ルール（原文 + 補助JSON）を読み込んで検証する。
 */
export function loadFortuneRules(
  opts: LoadFortuneRulesOptions = {}
): FortuneRules {
  const dir = opts.knowledgeDir ?? defaultDir();

  // ---- 原文（上位ルール）----
  const rawRules = readText(dir, FILE.original);
  if (!rawRules.trim()) {
    throw new Error(
      `[loadFortuneRules] 原文が空です: ${join(dir, FILE.original)}`
    );
  }

  // ---- ハッシュ照合（原文が意図せず変わっていないか）----
  const hashMeta = readJson<{ algorithm: string; hash: string }>(
    dir,
    FILE.hash
  );
  const actual = createHash(hashMeta.algorithm || "sha256")
    .update(rawRules, "utf8")
    .digest("hex");

  // ---- 補助JSON ----
  const sunSigns = signsToArray<SunSignRule>(
    readJson(dir, FILE.sun),
    FILE.sun
  );
  const moonSigns = signsToArray<MoonSignRule>(
    readJson(dir, FILE.moon),
    FILE.moon
  );
  const moonTriggers = signsToArray<MoonTriggerRule>(
    readJson(dir, FILE.triggers),
    FILE.triggers
  );

  const prohibitedRaw = readJson<Record<string, unknown>>(
    dir,
    FILE.prohibited
  );
  const prohibitedTopics: ProhibitedTopicRules = {
    lifeAndDeath: prohibitedRaw.lifeAndDeath as ProhibitedTopicRules["lifeAndDeath"],
    medical: prohibitedRaw.medical as ProhibitedTopicRules["medical"],
    investmentGambling:
      prohibitedRaw.investmentGambling as ProhibitedTopicRules["investmentGambling"],
    fearBasedStatements:
      prohibitedRaw.fearBasedStatements as ProhibitedTopicRules["fearBasedStatements"],
    difficultPeriodWording:
      prohibitedRaw.difficultPeriodWording as ProhibitedTopicRules["difficultPeriodWording"],
  };

  return {
    rawRules,
    sunSigns,
    moonSigns,
    moonTriggers,
    prohibitedTopics,
    hash: {
      algorithm: hashMeta.algorithm || "sha256",
      expected: hashMeta.hash,
      actual,
      matches: hashMeta.hash === actual,
    },
  };
}
