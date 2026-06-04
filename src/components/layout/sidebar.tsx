"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Phone,
  CalendarDays,
  MessageSquareText,
  AudioLines,
  BookOpen,
  BedDouble,
  Users,
  Settings,
  Hotel,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/reservations", label: "電話予約", icon: Phone },
  { href: "/calendar", label: "宿泊カレンダー", icon: CalendarDays },
  { href: "/inquiries", label: "問い合わせ対応", icon: MessageSquareText, badge: 3 },
  { href: "/voice-ai", label: "音声AIログ", icon: AudioLines },
  { href: "/knowledge", label: "ナレッジ管理", icon: BookOpen },
  { href: "/rooms", label: "客室管理", icon: BedDouble },
  { href: "/staff", label: "スタッフ管理", icon: Users },
  { href: "/settings", label: "設定", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
          <Hotel className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-slate-800">
            Hotel Voice
          </p>
          <p className="text-sm font-bold leading-tight text-brand-600">
            Concierge
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
        <p className="text-xs font-semibold opacity-90">AI音声コンシェルジュ</p>
        <p className="mt-1 text-[11px] leading-relaxed opacity-80">
          24時間、宿泊客の問い合わせに自動応答。フロント業務を省人化します。
        </p>
      </div>
    </aside>
  );
}
