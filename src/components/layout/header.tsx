"use client";

import * as React from "react";
import { Bell, Search, Sparkles, ChevronDown } from "lucide-react";
import { PLATFORM_NAME, currentUser } from "@/lib/mock-data";

export function Header() {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const dateLabel = now
    ? now.toLocaleString("ja-JP", {
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-800">{PLATFORM_NAME}</span>
      </div>

      <div className="relative ml-2 hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="社員・応募者・契約・研修を検索"
          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* AIエージェント稼働ステータス */}
        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 ring-1 ring-inset ring-emerald-200 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">AIエージェント 稼働中</span>
        </div>

        <span className="hidden text-xs font-medium text-slate-500 lg:block">{dateLabel}</span>

        <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 py-1 pl-1 pr-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold leading-tight text-slate-800">{currentUser.name}</p>
            <p className="text-[11px] leading-tight text-slate-500">{currentUser.role}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
