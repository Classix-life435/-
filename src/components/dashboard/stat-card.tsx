import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  icon: React.ReactNode;
  tone?: "blue" | "green" | "amber" | "red" | "violet" | "sky";
  hint?: string;
}

const tones = {
  blue: "bg-brand-50 text-brand-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-rose-50 text-rose-600",
  violet: "bg-violet-50 text-violet-600",
  sky: "bg-sky-50 text-sky-600",
};

export function StatCard({ label, value, unit, icon, tone = "blue", hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tones[tone])}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-slate-800">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
