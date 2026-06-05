import Link from "next/link";
import {
  Users,
  UserCheck,
  GraduationCap,
  ClipboardList,
  HeartPulse,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stageIcons } from "@/components/stage-icon";
import { STAGES } from "@/lib/status";
import {
  dashboardStats,
  activities,
  impactStats,
  currentUser,
  applicants,
  contracts,
  enrollments,
  hrTasks,
  consultations,
} from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";
import type { StageId } from "@/lib/types";

// 各ステージの「件数 + 補足」をまとめる
const stageSummary: Record<StageId, { count: number; unit: string; note: string }> = {
  recruit: {
    count: applicants.filter((a) => a.status !== "rejected").length,
    unit: "名",
    note: `内定 ${applicants.filter((a) => a.status === "offer").length} 名`,
  },
  onboarding: {
    count: new Set(contracts.filter((c) => c.status !== "completed").map((c) => c.employeeName)).size,
    unit: "名",
    note: `署名待ち ${contracts.filter((c) => c.status === "sent").length} 件`,
  },
  learning: {
    count: enrollments.filter((e) => e.status !== "completed").length,
    unit: "件",
    note: `受講中 ${enrollments.filter((e) => e.status === "inProgress").length} 件`,
  },
  hr: {
    count: hrTasks.filter((t) => t.status !== "done").length,
    unit: "件",
    note: `AI一次対応 ${hrTasks.filter((t) => t.aiHandled).length} 件`,
  },
  retention: {
    count: consultations.length,
    unit: "件",
    note: `要フォロー ${consultations.filter((c) => c.mood === "risk").length} 名`,
  },
};

export default function DashboardPage() {
  const s = dashboardStats;
  const feed = [...activities].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 7);

  return (
    <div className="space-y-6">
      {/* ヒーロー：統一プラットフォーム */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 p-6 text-white shadow-soft">
        <div className="flex items-center gap-2 text-sm font-medium opacity-90">
          <Sparkles className="h-4 w-4" /> 人事部のAIエージェント、すべてをひとつに。
        </div>
        <h1 className="mt-1 text-2xl font-bold">
          おはようございます、{currentUser.name} さん
        </h1>
        <p className="mt-1 text-sm opacity-90">
          採用から定着まで、人財ライフサイクルを横断して管理できます。
          本日はAIが <span className="font-bold">{s.aiHandledToday}</span> 件の業務を自動処理しました。
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:max-w-md">
          {impactStats.map((m) => (
            <div key={m.label} className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-inset ring-white/20">
              <p className="text-[11px] opacity-80">{m.label}</p>
              <p className="text-lg font-bold leading-tight">
                {m.value}
                <span className="text-xs font-medium opacity-80">{m.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 人財ライフサイクル パイプライン（01〜05） */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">人財ライフサイクル（採用 → 定着）</h2>
          <span className="text-xs text-slate-400">在籍者 {s.employees} 名</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage, i) => {
            const Icon = stageIcons[stage.id];
            const sum = stageSummary[stage.id];
            return (
              <Link
                key={stage.id}
                href={stage.href}
                className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stage.chip}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-slate-300">{stage.no}</span>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-800">{stage.label}</p>
                <p className="text-[11px] text-slate-400">{stage.en}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-800">{sum.count}</span>
                  <span className="text-xs text-slate-400">{sum.unit}</span>
                </div>
                <p className={`mt-0.5 text-xs font-medium ${stage.text}`}>{sum.note}</p>
                <ChevronRight className="absolute right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-300 group-hover:block lg:hidden" />
                {/* ステージ間の矢印（lg以上） */}
                {i < STAGES.length - 1 && (
                  <span className="absolute -right-2.5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-300 lg:flex">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 主要KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="選考中の応募者" value={s.applicants} unit="名" icon={<Users className="h-5 w-5" />} tone="green" hint={`内定 ${s.offers} 名`} />
        <StatCard label="入社手続き中" value={s.onboarding} unit="名" icon={<UserCheck className="h-5 w-5" />} tone="blue" />
        <StatCard label="研修 受講中" value={s.learningInProgress} unit="件" icon={<GraduationCap className="h-5 w-5" />} tone="violet" />
        <StatCard label="未対応の労務" value={s.openHrTasks} unit="件" icon={<ClipboardList className="h-5 w-5" />} tone="amber" />
        <StatCard label="要フォロー社員" value={s.retentionRisk} unit="名" icon={<HeartPulse className="h-5 w-5" />} tone="red" />
        <StatCard label="本日のAI自動対応" value={s.aiHandledToday} unit="件" icon={<Sparkles className="h-5 w-5" />} tone="sky" />
      </div>

      {/* 横断アクティビティ + AIエージェント */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* アクティビティフィード（全ステージ横断） */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>横断アクティビティ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {feed.map((a) => {
              const stage = STAGES.find((x) => x.id === a.stage)!;
              const Icon = stageIcons[a.stage];
              return (
                <Link
                  key={a.id}
                  href={stage.href}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stage.chip}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold ${stage.text}`}>{stage.label}</span>
                      <span className="text-sm font-semibold text-slate-800">{a.employeeName}</span>
                      {a.aiHandled && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">
                          <Sparkles className="h-2.5 w-2.5" /> AI
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-slate-500">{a.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatDateTime(a.at)}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* AIエージェント一覧 */}
        <Card className="bg-gradient-to-br from-slate-900 to-brand-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-emerald-300" /> AIエージェント
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm font-semibold text-emerald-300">5モジュール 稼働中</span>
            </div>
            <div className="space-y-2.5">
              {STAGES.map((stage) => {
                const Icon = stageIcons[stage.id];
                return (
                  <Link
                    key={stage.id}
                    href={stage.href}
                    className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/10"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-white/70" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white">{stage.label}</p>
                      <p className="truncate text-[11px] text-white/50">{stage.products[0]}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/40" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
