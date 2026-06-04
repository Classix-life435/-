import Link from "next/link";
import {
  LogIn,
  LogOut,
  Users,
  BedDouble,
  MessageSquareWarning,
  Phone,
  AlertTriangle,
  AudioLines,
  ArrowRight,
  Bot,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ReservationStatusBadge,
  ChannelBadge,
  InquiryStatusBadge,
  PriorityBadge,
  CategoryBadge,
} from "@/components/ui/status-badge";
import {
  reservations,
  inquiries,
  dashboardStats,
  currentStaff,
} from "@/lib/mock-data";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const s = dashboardStats;
  const recentReservations = [...reservations]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);
  const recentInquiries = [...inquiries]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);
  const urgent = inquiries.filter(
    (i) => i.priority === "urgent" && i.status !== "resolved"
  );

  return (
    <div className="space-y-6">
      {/* 本日の業務状況ヘッダー */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white shadow-soft">
        <p className="text-sm font-medium opacity-80">本日の業務状況 ・ {formatDate("2026-06-04")}</p>
        <h1 className="mt-1 text-2xl font-bold">
          おはようございます、{currentStaff.name} さん
        </h1>
        <p className="mt-1 text-sm opacity-90">
          チェックイン {s.checkInsToday} 件、チェックアウト {s.checkOutsToday} 件の予定です。
          未対応の問い合わせが {s.openInquiries} 件あります。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/reservations"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm hover:bg-brand-50"
          >
            <Phone className="h-4 w-4" /> 新規電話予約を登録
          </Link>
          <Link
            href="/inquiries"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500/40 px-4 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/30 hover:bg-brand-500/60"
          >
            <MessageSquareWarning className="h-4 w-4" /> 問い合わせ対応へ
          </Link>
        </div>
      </div>

      {/* 数値カード */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="本日のチェックイン" value={s.checkInsToday} unit="件" icon={<LogIn className="h-5 w-5" />} tone="blue" />
        <StatCard label="本日のチェックアウト" value={s.checkOutsToday} unit="件" icon={<LogOut className="h-5 w-5" />} tone="sky" />
        <StatCard label="現在の宿泊中人数" value={s.guestsStaying} unit="名" icon={<Users className="h-5 w-5" />} tone="violet" />
        <StatCard label="空室数" value={s.vacantRooms} unit="室" icon={<BedDouble className="h-5 w-5" />} tone="green" />
        <StatCard label="未対応問い合わせ" value={s.openInquiries} unit="件" icon={<MessageSquareWarning className="h-5 w-5" />} tone="amber" hint={`緊急 ${s.urgentInquiries} 件を含む`} />
        <StatCard label="本日の電話予約" value={s.phoneReservationsToday} unit="件" icon={<Phone className="h-5 w-5" />} tone="blue" />
      </div>

      {/* 緊急対応 + AIステータス */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-rose-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="h-5 w-5" /> 緊急対応が必要な問い合わせ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgent.length === 0 && (
              <p className="text-sm text-slate-400">現在、緊急の問い合わせはありません。</p>
            )}
            {urgent.map((i) => (
              <Link
                key={i.id}
                href="/inquiries"
                className="flex items-center gap-4 rounded-xl border border-rose-200 bg-rose-50/60 p-3 transition-colors hover:bg-rose-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 font-bold text-rose-700">
                  {i.roomNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{i.guestName}</span>
                    <PriorityBadge value={i.priority} />
                  </div>
                  <p className="truncate text-sm text-slate-600">{i.content}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-rose-400" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* AI音声対応ステータス */}
        <Card className="bg-gradient-to-br from-slate-900 to-brand-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AudioLines className="h-5 w-5" /> AI音声対応ステータス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm font-semibold text-emerald-300">稼働中</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">本日のAI自動対応</span>
                <span className="text-lg font-bold">{s.aiHandledToday} 件</span>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-white/70">自己解決率</span>
                  <span className="font-bold">{Math.round(s.aiResolutionRate * 100)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${s.aiResolutionRate * 100}%` }}
                  />
                </div>
              </div>
              <Link
                href="/voice-ai"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-200 hover:text-white"
              >
                会話ログを確認 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 直近の予約 + 問い合わせ */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>直近の予約</CardTitle>
            <Link href="/reservations" className="text-sm font-medium text-brand-600 hover:underline">
              すべて見る
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentReservations.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                  {r.roomNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{r.guestName}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(r.checkIn)} 〜 {formatDate(r.checkOut)} ・ {r.roomType}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ReservationStatusBadge value={r.status} />
                  <ChannelBadge value={r.channel} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>直近の宿泊客問い合わせ</CardTitle>
            <Link href="/inquiries" className="text-sm font-medium text-brand-600 hover:underline">
              すべて見る
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentInquiries.map((i) => (
              <div key={i.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                  {i.roomNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-slate-800">{i.guestName}</p>
                    {i.aiHandled && (
                      <span title="AI対応済み">
                        <Bot className="h-3.5 w-3.5 text-brand-500" />
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500">{i.content}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <InquiryStatusBadge value={i.status} />
                  <CategoryBadge value={i.category} />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1.5 pt-1 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              本日 {dashboardStats.aiHandledToday} 件をAIが一次対応しました
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
