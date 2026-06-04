import * as React from "react";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/status";

const toneClasses: Record<BadgeTone, string> = {
  blue: "bg-brand-50 text-brand-700 ring-brand-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

export function Badge({ tone = "slate", dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
