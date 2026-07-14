"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  ChevronRight,
  Languages,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionInsight } from "@/lib/qr/types";
import {
  HIGH_DROP_THRESHOLD,
  compareByDropRate,
  formatPercent,
} from "@/lib/qr/compute";
import { languageMeta } from "@/lib/qr/mock-data";

type SortKey = "dropRate" | "askedCount" | "toInterview";

const columns: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "askedCount", label: "質問した人", align: "right" },
  { key: "toInterview", label: "うち面接へ", align: "right" },
  { key: "dropRate", label: "離脱率", align: "right" },
];

export function DropRateTable({ insights }: { insights: QuestionInsight[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = React.useState<SortKey>("dropRate");
  const [asc, setAsc] = React.useState(false);

  const sorted = React.useMemo(() => {
    const dir = asc ? 1 : -1; // 既定は降順
    return [...insights].sort((a, b) => {
      const primary = (a[sortKey] - b[sortKey]) * dir;
      if (primary !== 0) return primary;
      // 同値はカテゴリの深刻度で決定的に（ダッシュボードの見出しと一致）
      return compareByDropRate(a, b);
    });
  }, [insights, sortKey, asc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setAsc((v) => !v);
    } else {
      setSortKey(key);
      setAsc(false); // 新しい列は降順から
    }
  };

  const goToLogs = (category: string) => {
    router.push(`/qr/logs?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500">
              <th className="px-4 py-3 text-left font-semibold">
                よくある質問
              </th>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-right font-semibold">
                  <button
                    onClick={() => toggleSort(col.key)}
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-slate-800",
                      sortKey === col.key && "text-slate-900"
                    )}
                  >
                    {col.label}
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </button>
                </th>
              ))}
              <th className="w-8 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const high = row.dropRate >= HIGH_DROP_THRESHOLD;
              return (
                <tr
                  key={row.category}
                  onClick={() => goToLogs(row.category)}
                  className={cn(
                    "group cursor-pointer border-b border-slate-100 transition-colors last:border-0",
                    high ? "bg-rose-50/60 hover:bg-rose-50" : "hover:bg-slate-50"
                  )}
                >
                  {/* 質問カテゴリ + 多言語ヒント */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {high && (
                        <TriangleAlert className="h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "font-semibold",
                            high ? "text-rose-900" : "text-slate-800"
                          )}
                        >
                          {row.category}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {row.jobCategory}
                          {row.foreignCount > 0 && (
                            <span className="ml-1.5 text-orange-500">
                              ・外国語 {row.foreignCount}件
                            </span>
                          )}
                        </p>
                        {row.needsMultilingual && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-orange-50 px-1.5 py-0.5 text-[11px] font-medium text-orange-700 ring-1 ring-inset ring-orange-200">
                            <Languages className="h-3 w-3" />
                            多言語対応をオンにすると改善できます（
                            {row.languages
                              .filter((l) => l !== "ja")
                              .map((l) => languageMeta[l].label)
                              .join("・")}
                            ）
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                    {row.askedCount}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                    {row.toInterview}
                  </td>

                  {/* 離脱率（主役）：高いほど赤く、視線が最初に行くように */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:block">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            high
                              ? "bg-rose-500"
                              : row.dropRate >= 0.5
                                ? "bg-orange-400"
                                : "bg-teal-500"
                          )}
                          style={{ width: `${Math.round(row.dropRate * 100)}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "min-w-[3rem] font-bold tabular-nums",
                          high
                            ? "text-rose-600"
                            : row.dropRate >= 0.5
                              ? "text-orange-600"
                              : "text-teal-600"
                        )}
                      >
                        {formatPercent(row.dropRate)}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-3 text-slate-300">
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          離脱率 {Math.round(HIGH_DROP_THRESHOLD * 100)}%超（要改善）
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          50〜70%
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-teal-500" />
          50%未満
        </span>
        <span className="ml-auto hidden sm:block">行をクリックで会話ログへ</span>
      </div>
    </div>
  );
}
