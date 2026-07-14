"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  X,
  MessagesSquare,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import type { Conversation, Language } from "@/lib/qr/types";
import { AcqsBadge } from "@/components/qr/acqs-badge";
import { LanguageChip } from "@/components/qr/language-chip";
import { conversations, languageMeta } from "@/lib/qr/mock-data";

type PeriodKey = "all" | "7d" | "30d";

const periods: { key: PeriodKey; label: string; days: number | null }[] = [
  { key: "all", label: "全期間", days: null },
  { key: "30d", label: "直近30日", days: 30 },
  { key: "7d", label: "直近7日", days: 7 },
];

// デモの基準日（QR_NOW と揃える）
const REF = new Date("2026-07-14T10:00:00+09:00").getTime();

export function ConversationLogView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");

  const jobCategories = React.useMemo(
    () => Array.from(new Set(conversations.map((c) => c.jobCategory))),
    []
  );
  const languages = React.useMemo(
    () => Array.from(new Set(conversations.map((c) => c.language))),
    []
  );

  const [job, setJob] = React.useState<string>("all");
  const [lang, setLang] = React.useState<string>("all");
  const [period, setPeriod] = React.useState<PeriodKey>("all");
  const [open, setOpen] = React.useState<Conversation | null>(null);

  const filtered = React.useMemo(() => {
    const days = periods.find((p) => p.key === period)?.days ?? null;
    return conversations
      .filter((c) => (categoryParam ? c.questionCategory === categoryParam : true))
      .filter((c) => (job === "all" ? true : c.jobCategory === job))
      .filter((c) => (lang === "all" ? true : c.language === lang))
      .filter((c) => {
        if (!days) return true;
        const age = (REF - new Date(c.timestamp).getTime()) / 86_400_000;
        return age <= days;
      })
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }, [categoryParam, job, lang, period]);

  const settled = filtered.filter((c) => c.isInterview).length;

  return (
    <div className="space-y-4">
      {/* カテゴリ絞り込み中のヘッダー */}
      {categoryParam && (
        <button
          onClick={() => router.push("/qr/logs")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          すべての会話ログに戻る
        </button>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            会話ログ
            {categoryParam && (
              <span className="ml-2 text-base font-semibold text-teal-600">
                「{categoryParam}」
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500">
            {filtered.length}件中、面接成立（3ターン以上）は{" "}
            <span className="font-semibold text-teal-600">{settled}件</span>
          </p>
        </div>
      </div>

      {/* フィルタ：職種 / 言語 / 期間 */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-card">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          絞り込み
        </span>
        <Select
          label="職種"
          value={job}
          onChange={setJob}
          options={[
            { value: "all", label: "すべて" },
            ...jobCategories.map((j) => ({ value: j, label: j })),
          ]}
        />
        <Select
          label="言語"
          value={lang}
          onChange={setLang}
          options={[
            { value: "all", label: "すべて" },
            ...languages.map((l) => ({
              value: l,
              label: languageMeta[l as Language].label,
            })),
          ]}
        />
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                period === p.key
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 会話一覧 */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
          条件に合う会話がありません
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((c) => (
            <ConversationCard key={c.id} conv={c} onOpen={() => setOpen(c)} />
          ))}
        </div>
      )}

      {open && (
        <ConversationDetail conv={open} onClose={() => setOpen(null)} />
      )}
    </div>
  );
}

function ConversationCard({
  conv,
  onOpen,
}: {
  conv: Conversation;
  onOpen: () => void;
}) {
  const interview = conv.isInterview;
  return (
    <button
      onClick={onOpen}
      className={cn(
        "flex flex-col gap-2 rounded-2xl border bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft",
        interview
          ? "border-teal-200 ring-1 ring-inset ring-teal-100"
          : "border-slate-200"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
            interview
              ? "bg-teal-50 text-teal-700 ring-teal-200"
              : "bg-slate-100 text-slate-500 ring-slate-200"
          )}
        >
          {interview ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {interview ? "面接成立" : "面接未満で離脱"}
        </span>
        <span className="text-[11px] text-slate-400">
          {conv.turns}ターン
        </span>
      </div>

      <p className="line-clamp-1 text-sm font-semibold text-slate-800">
        {conv.questionCategory}
      </p>
      <p className="line-clamp-2 text-xs text-slate-500">
        {conv.messages[0]?.text}
      </p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <LanguageChip language={conv.language} />
          <span className="text-[11px] text-slate-400">{conv.jobCategory}</span>
        </div>
        <span className="text-[11px] text-slate-400">
          {formatDateTime(conv.timestamp)}
        </span>
      </div>
      <AcqsBadge acqs={conv.acqs} className="mt-1" />
    </button>
  );
}

function ConversationDetail({
  conv,
  onClose,
}: {
  conv: Conversation;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const interview = conv.isInterview;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-soft sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4 text-teal-600" />
              <p className="truncate text-sm font-bold text-slate-800">
                {conv.questionCategory}
              </p>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                  interview
                    ? "bg-teal-50 text-teal-700 ring-teal-200"
                    : "bg-slate-100 text-slate-500 ring-slate-200"
                )}
              >
                {interview ? "面接成立" : "面接未満で離脱"}
              </span>
              <LanguageChip language={conv.language} />
              <span className="text-[11px] text-slate-400">
                {conv.jobCategory}・{conv.turns}ターン・
                {formatDateTime(conv.timestamp)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* A-CQS */}
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <span className="text-[11px] font-semibold text-slate-500">
            A-CQS
          </span>
          <AcqsBadge acqs={conv.acqs} />
        </div>

        {/* 会話本文 */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {conv.messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                m.role === "applicant" ? "justify-start" : "justify-end"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                  m.role === "applicant"
                    ? "rounded-tl-sm bg-slate-100 text-slate-700"
                    : "rounded-tr-sm bg-teal-600 text-white"
                )}
              >
                <p className="mb-0.5 text-[10px] font-semibold opacity-70">
                  {m.role === "applicant" ? "求職者" : "AI窓口"}
                </p>
                {m.text}
              </div>
            </div>
          ))}
          {!interview ? (
            <p className="pt-2 text-center text-xs text-slate-400">
              — {conv.turns}ターンで離脱（面接成立に至らず） —
            </p>
          ) : (
            !conv.reachedInterview && (
              <p className="pt-2 text-center text-xs text-orange-500">
                — 疑問は解消したが、面接予約には進まず帰った —
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span className="font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
