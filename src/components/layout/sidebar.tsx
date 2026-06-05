"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { STAGES } from "@/lib/status";
import { stageIcons } from "@/components/stage-icon";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      {/* ロゴ */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 text-white shadow-sm">
          <span className="text-base font-black">V</span>
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-slate-800">VoxaLink</p>
          <p className="text-sm font-bold leading-tight text-brand-600">Workforce</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {/* 統一ダッシュボード */}
        <NavLink
          href="/"
          active={pathname === "/"}
          icon={<LayoutDashboard className="h-5 w-5 shrink-0" />}
          label="統一ダッシュボード"
        />

        <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          人財ライフサイクル
        </p>

        {STAGES.map((s) => {
          const Icon = stageIcons[s.id];
          const active = pathname.startsWith(s.href);
          return (
            <NavLink
              key={s.id}
              href={s.href}
              active={active}
              icon={<Icon className="h-5 w-5 shrink-0" />}
              label={s.label}
              no={s.no}
            />
          );
        })}
      </nav>

      <div className="m-3 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-600 p-4 text-white">
        <p className="text-xs font-semibold opacity-90">人事部のAIエージェント</p>
        <p className="mt-1 text-[11px] leading-relaxed opacity-80">
          採用・入社・教育・労務・定着まで、すべてをひとつに。AIが人事業務を効率化します。
        </p>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  active,
  icon,
  label,
  no,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  no?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-brand-50 text-brand-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <span className={cn(active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600")}>
        {icon}
      </span>
      {no && (
        <span className={cn("text-[11px] font-bold", active ? "text-brand-400" : "text-slate-300")}>
          {no}
        </span>
      )}
      <span className="flex-1">{label}</span>
    </Link>
  );
}
