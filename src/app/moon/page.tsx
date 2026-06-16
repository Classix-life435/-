"use client";

import { useMemo, useState } from "react";
import { calcMoonSign, buildBirthDate } from "@/lib/moon/moonSign";
import { generateDiagnosis } from "@/lib/moon/diagnosis";
import type { CompatibilityCategory } from "@/lib/moon/types";
import type {
  CompatibilitySection,
  DiagnosisResult,
  DisplayField,
  CompatibilityRow,
} from "@/lib/moon/diagnosis";
import { saveDiagnosisLog } from "@/lib/moon/logStore";
import {
  DIAGNOSIS_BRAND_LABEL,
  NOT_READY_LABEL,
  RESULT_NOTES,
} from "@/lib/moon/labels";

const CATEGORY_LABEL: Record<CompatibilityCategory, string> = {
  love: "恋愛",
  work: "仕事",
  private: "プライベート",
};

// 主要タイムゾーン（出生地のUTCオフセット・分）
const TZ_OPTIONS: { label: string; minutes: number }[] = [
  { label: "日本 (JST +9:00)", minutes: 540 },
  { label: "UTC ±0:00", minutes: 0 },
  { label: "アメリカ東部 (-5:00)", minutes: -300 },
  { label: "アメリカ西部 (-8:00)", minutes: -480 },
  { label: "ヨーロッパ中部 (+1:00)", minutes: 60 },
];

/** 準備中なら淡色＋ラベル、そうでなければ本文を表示 */
function Field({ field }: { field: DisplayField }) {
  if (!field.ready) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
        {NOT_READY_LABEL}
      </span>
    );
  }
  return <span className="text-slate-700">{field.text}</span>;
}

function CompatBlock({ section }: { section: CompatibilitySection }) {
  const [open, setOpen] = useState(false);
  const rows = open ? section.ranking : section.top3;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="mb-2 font-semibold text-slate-800">
        {CATEGORY_LABEL[section.category]}の相性
      </h4>
      {!section.ready ? (
        <p className="text-sm text-slate-400">
          相性ランキングは{NOT_READY_LABEL}です。
        </p>
      ) : (
        <>
          <ol className="space-y-2">
            {rows.map((r: CompatibilityRow) => (
              <li
                key={r.targetMoonSign}
                className="flex items-start gap-3 rounded-lg bg-slate-50 p-2"
              >
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {r.rank}
                </span>
                <div className="text-sm">
                  <p className="font-medium text-slate-800">
                    {r.targetMoonSignJp}
                  </p>
                  <p className="mt-0.5">
                    <Field field={r.shortDescription} />
                  </p>
                </div>
              </li>
            ))}
          </ol>
          {section.ranking.length > 3 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
            >
              {open ? "TOP3だけ表示" : `1〜${section.ranking.length}位をすべて見る`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function MoonPage() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [tz, setTz] = useState(540);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [moonInfo, setMoonInfo] = useState<ReturnType<
    typeof calcMoonSign
  > | null>(null);
  const [error, setError] = useState("");

  const categories = useMemo<CompatibilityCategory[]>(
    () => ["love", "work", "private"],
    []
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const d = buildBirthDate(birthDate, birthTime || null, tz);
    if (!d) {
      setError("お誕生日を正しく入力してください。");
      return;
    }
    const moon = calcMoonSign(d);
    const diag = generateDiagnosis(moon.moonSign, {
      userId: null, // 本番では LINE userId を入れる
      moonProfileId: null,
    });
    saveDiagnosisLog(diag.log);
    setMoonInfo(moon);
    setResult(diag);
  }

  return (
    <div>
      <header className="mb-6 text-center">
        <p className="text-3xl">🌙</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">月星座占い</h1>
        <p className="mt-1 text-sm text-indigo-600">{DIAGNOSIS_BRAND_LABEL}</p>
      </header>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label className="block text-sm font-medium text-slate-700">
          お誕生日
          <input
            type="date"
            value={birthDate}
            min="1900-01-01"
            max="2026-12-31"
            onChange={(e) => setBirthDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            required
          />
        </label>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            出生時刻（任意）
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            出生地のタイムゾーン
            <select
              value={tz}
              onChange={(e) => setTz(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {TZ_OPTIONS.map((o) => (
                <option key={o.minutes} value={o.minutes}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          月は約2〜3日で星座が変わるため、時刻が不明な場合は正午で計算します（精度は落ちます）。
        </p>

        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          月星座を占う
        </button>
      </form>

      {result && moonInfo && (
        <section className="mt-8 space-y-5">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center">
            <p className="text-sm text-slate-600">あなたの月星座は…</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">
              {result.moonSignJp}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              月の黄経 {moonInfo.longitude.toFixed(1)}°
              {moonInfo.nearCusp && "（星座の境界付近です。出生時刻で結果が変わる場合があります）"}
            </p>
          </div>

          {/* 月星座の解説 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 font-semibold text-slate-800">
              月星座のテーマ
            </h3>
            {!result.sign.ready ? (
              <p className="text-sm text-slate-400">
                この月星座の診断文は{NOT_READY_LABEL}です（承認済みナレッジが登録されると表示されます）。
              </p>
            ) : (
              <dl className="space-y-3 text-sm">
                <Row label="テーマ" field={result.sign.themeTitle} />
                <Row label="概要" field={result.sign.shortDescription} />
                <Row label="詳しく" field={result.sign.detailedDescription} />
                <Row label="欠損として現れやすいテーマ" field={result.sign.deficiencyTheme} />
                <Row label="しがみつきやすいパターン" field={result.sign.attachmentPattern} />
                <Row label="手放しのヒント" field={result.sign.releaseAdvice} />
                <Row label="対向星座から学べること" field={result.sign.oppositeSignAdvice} />
              </dl>
            )}
          </div>

          {/* 相性 */}
          <div className="space-y-4">
            {categories.map((c) => (
              <CompatBlock key={c} section={result.compatibility[c]} />
            ))}
          </div>

          {/* 注記 */}
          <div className="rounded-xl bg-slate-100 p-4 text-xs leading-relaxed text-slate-500">
            {RESULT_NOTES.map((n) => (
              <p key={n}>※ {n}</p>
            ))}
            <p className="mt-2 text-slate-400">
              参照ナレッジ: {result.log.referencedKnowledgeIds.length}件
              （ログID: {result.log.id}）
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function Row({ label, field }: { label: string; field: DisplayField }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-0.5">
        <Field field={field} />
      </dd>
    </div>
  );
}
