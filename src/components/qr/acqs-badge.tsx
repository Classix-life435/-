import { cn } from "@/lib/utils";
import type { Acqs } from "@/lib/qr/types";

// A-CQS スコア（Q/A/E/P の4軸）を小さく並べて表示する。
const axes: { key: keyof Acqs; label: string; title: string }[] = [
  { key: "q", label: "Q", title: "疑問の解消度" },
  { key: "a", label: "A", title: "回答の的確さ" },
  { key: "e", label: "E", title: "求職者の関与度" },
  { key: "p", label: "P", title: "面接への前進度" },
];

function scoreTone(v: number): string {
  if (v >= 75) return "bg-teal-50 text-teal-700 ring-teal-200";
  if (v >= 50) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-rose-50 text-rose-700 ring-rose-200";
}

export function AcqsBadge({
  acqs,
  className,
}: {
  acqs: Acqs;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)} title="A-CQS スコア (Q:疑問解消 / A:回答精度 / E:関与 / P:前進)">
      {axes.map((ax) => (
        <span
          key={ax.key}
          title={`${ax.title}: ${acqs[ax.key]}`}
          className={cn(
            "inline-flex min-w-[2.4rem] items-center justify-center gap-0.5 rounded-md px-1 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
            scoreTone(acqs[ax.key])
          )}
        >
          <span className="opacity-60">{ax.label}</span>
          {acqs[ax.key]}
        </span>
      ))}
    </div>
  );
}
