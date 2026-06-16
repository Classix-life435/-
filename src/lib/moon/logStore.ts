// ============================================================
// lib/moon/logStore.ts
// ------------------------------------------------------------
// generated_diagnosis_logs の保存先（MVP）。
// 静的サイトのため localStorage に保存する。
// 本番では「参照した knowledgeIds を必ずサーバーに送る」ことで、
// どの承認済みナレッジで診断したかを監査できるようにする。
// ============================================================

import type { GeneratedDiagnosisLog } from "@/lib/moon/types";

const LOG_KEY = "moon_diagnosis_logs_v1";
const MAX_LOGS = 50;

/** 診断ログを 1 件保存する（端末ローカル） */
export function saveDiagnosisLog(log: GeneratedDiagnosisLog): void {
  if (typeof window === "undefined") return;
  try {
    const logs = loadDiagnosisLogs();
    logs.unshift(log);
    localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  } catch {
    /* localStorage が使えない環境では黙ってスキップ */
  }
}

/** 保存済みの診断ログを読み出す */
export function loadDiagnosisLogs(): GeneratedDiagnosisLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as GeneratedDiagnosisLog[]) : [];
  } catch {
    return [];
  }
}
