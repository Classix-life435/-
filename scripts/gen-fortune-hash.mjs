// reading_rules.original.md の sha256 を計算して reading_rules.hash.json を生成する。
// 原文を更新したら必ず実行すること:  npm run fortune:hash
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const sourceRel = "knowledge/fortune/reading_rules.original.md";
const hashRel = "knowledge/fortune/reading_rules.hash.json";

const text = readFileSync(join(root, sourceRel), "utf8");
if (!text.trim()) {
  console.error("ERROR: 原文が空です:", sourceRel);
  process.exit(1);
}

const hash = createHash("sha256").update(text, "utf8").digest("hex");
const out = {
  algorithm: "sha256",
  hash,
  sourceFile: sourceRel,
  generatedAt: new Date().toISOString(),
};
writeFileSync(join(root, hashRel), JSON.stringify(out, null, 2) + "\n");
console.log("wrote", hashRel, "\n  sha256:", hash);
