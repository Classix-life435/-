import { cn } from "@/lib/utils";
import type { Language } from "@/lib/qr/types";
import { languageMeta } from "@/lib/qr/mock-data";

export function LanguageChip({
  language,
  className,
}: {
  language: Language;
  className?: string;
}) {
  const m = languageMeta[language];
  const foreign = language !== "ja";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        foreign
          ? "bg-orange-50 text-orange-700 ring-orange-200"
          : "bg-slate-100 text-slate-600 ring-slate-200",
        className
      )}
      title={m.label}
    >
      <span aria-hidden>{m.flag}</span>
      {m.short}
    </span>
  );
}
