import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "navy" | "teal" | "orange" | "slate";

const toneClasses: Record<Tone, { chip: string; value: string }> = {
  navy: { chip: "bg-slate-900 text-teal-300", value: "text-slate-900" },
  teal: { chip: "bg-teal-50 text-teal-600", value: "text-teal-700" },
  orange: { chip: "bg-orange-50 text-orange-600", value: "text-orange-600" },
  slate: { chip: "bg-slate-100 text-slate-600", value: "text-slate-800" },
};

interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  icon: React.ReactNode;
  tone?: Tone;
  hint?: string;
}

export function SummaryCard({
  label,
  value,
  unit,
  icon,
  tone = "navy",
  hint,
}: SummaryCardProps) {
  const t = toneClasses[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            t.chip
          )}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={cn("text-3xl font-bold tracking-tight", t.value)}>
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
