"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessagesSquare, CreditCard, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { account } from "@/lib/qr/mock-data";

const nav = [
  { href: "/qr", label: "ダッシュボード", icon: LayoutDashboard, exact: true },
  { href: "/qr/logs", label: "会話ログ", icon: MessagesSquare, exact: false },
  { href: "/qr/billing", label: "利用状況・課金", icon: CreditCard, exact: false },
];

const planLabel: Record<string, string> = {
  free: "Free プラン",
  standard: "Standard プラン",
  business: "Business プラン",
};

export function QrSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-slate-900 text-slate-100 lg:flex">
      {/* ロゴ（ネイビー基調＋ティール） */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-slate-900 shadow-sm">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">QR Phone</p>
          <p className="text-sm font-bold leading-tight text-teal-400">面接</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-teal-500/15 text-teal-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 現在プラン */}
      <div className="m-3 rounded-xl bg-white/5 p-4 ring-1 ring-inset ring-white/10">
        <p className="text-[11px] font-semibold text-slate-400">現在のプラン</p>
        <p className="mt-0.5 text-sm font-bold text-teal-300">
          {planLabel[account.plan]}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          AIによる質問対応は無料・無制限。課金対象は「面接成立（3ターン以上）」のみです。
        </p>
      </div>
    </aside>
  );
}
