"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, LayoutGrid } from "lucide-react";
import { qrCurrentUser, QR_COMPANY_NAME } from "@/lib/qr/mock-data";

export function QrHeader() {
  const [dateLabel, setDateLabel] = React.useState("");

  React.useEffect(() => {
    const fmt = () =>
      new Date().toLocaleString("ja-JP", {
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    setDateLabel(fmt());
    const t = setInterval(() => setDateLabel(fmt()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-800">
          {QR_COMPANY_NAME}
        </p>
        <p className="text-[11px] text-slate-400">採用ダッシュボード</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-xs font-medium text-slate-500 lg:block">
          {dateLabel}
        </span>

        {/* 別プロダクト（人財DX）への切替口 */}
        <Link
          href="/"
          className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 sm:flex"
          title="VoxaLink Workforce へ"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Workforce
        </Link>

        <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 py-1 pl-1 pr-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-teal-300">
            {qrCurrentUser.name.charAt(0)}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold leading-tight text-slate-800">
              {qrCurrentUser.name}
            </p>
            <p className="text-[11px] leading-tight text-slate-500">
              {qrCurrentUser.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
