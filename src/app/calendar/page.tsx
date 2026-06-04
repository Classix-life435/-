"use client";

import * as React from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  ReservationStatusBadge,
  ChannelBadge,
} from "@/components/ui/status-badge";
import { reservations, rooms } from "@/lib/mock-data";
import { reservationStatusMeta } from "@/lib/status";
import type { Reservation } from "@/lib/types";
import { formatDate, formatYen, nights, cn } from "@/lib/utils";

const DAY = 86400000;

// ステータスごとのバー色
const barColor: Record<string, string> = {
  tentative: "bg-amber-400/90 hover:bg-amber-500",
  confirmed: "bg-brand-500/90 hover:bg-brand-600",
  checkedIn: "bg-emerald-500/90 hover:bg-emerald-600",
  checkedOut: "bg-slate-400/80 hover:bg-slate-500",
  cancelled: "bg-rose-300/70 line-through",
};

export default function CalendarPage() {
  const [start, setStart] = React.useState(() => new Date("2026-06-02"));
  const [span, setSpan] = React.useState(14);
  const [selected, setSelected] = React.useState<Reservation | null>(null);

  const days = Array.from({ length: span }, (_, i) => new Date(+start + i * DAY));
  const roomNumbers = Array.from(new Set(rooms.map((r) => r.number))).sort();

  // 各部屋の予約バー（表示範囲内）
  function barsFor(roomNumber: string) {
    return reservations
      .filter((r) => r.roomNumber === roomNumber && r.status !== "cancelled")
      .map((r) => {
        const ci = new Date(r.checkIn);
        const co = new Date(r.checkOut);
        const offset = Math.round((+ci - +start) / DAY);
        const len = Math.max(1, Math.round((+co - +ci) / DAY));
        const visStart = Math.max(0, offset);
        const visEnd = Math.min(span, offset + len);
        if (visEnd <= 0 || visStart >= span) return null;
        return { r, col: visStart, width: visEnd - visStart };
      })
      .filter(Boolean) as { r: Reservation; col: number; width: number }[];
  }

  function shift(dir: number) {
    setStart((s) => new Date(+s + dir * 7 * DAY));
  }

  const colW = 88; // px / 日

  return (
    <div>
      <PageHeader
        icon={<CalendarDays className="h-5 w-5" />}
        title="宿泊カレンダー"
        description="部屋ごとの宿泊スケジュールをタイムラインで確認できます"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 bg-white p-0.5">
              {[
                { v: 7, l: "週" },
                { v: 14, l: "2週" },
                { v: 31, l: "月" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => setSpan(o.v)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    span === o.v ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* 凡例 + ナビ */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => shift(-1)}>
            <ChevronLeft className="h-4 w-4" /> 前の週
          </Button>
          <span className="text-sm font-semibold text-slate-700">
            {formatDate(days[0].toISOString())} 〜 {formatDate(days[days.length - 1].toISOString())}
          </span>
          <Button variant="outline" size="sm" onClick={() => shift(1)}>
            次の週 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {(["confirmed", "checkedIn", "tentative", "checkedOut"] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={cn("h-3 w-5 rounded", barColor[k].split(" ")[0])} />
              {reservationStatusMeta[k].label}
            </span>
          ))}
        </div>
      </div>

      {/* タイムライン */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
        <div style={{ minWidth: 120 + span * colW }}>
          {/* ヘッダー行 */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <div className="sticky left-0 z-10 w-[120px] shrink-0 border-r border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
              部屋
            </div>
            {days.map((d, i) => {
              const wd = d.getDay();
              return (
                <div
                  key={i}
                  className={cn(
                    "shrink-0 border-r border-slate-100 py-2 text-center",
                    wd === 0 && "bg-rose-50",
                    wd === 6 && "bg-brand-50"
                  )}
                  style={{ width: colW }}
                >
                  <p className="text-[11px] text-slate-400">
                    {["日", "月", "火", "水", "木", "金", "土"][wd]}
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {d.getMonth() + 1}/{d.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 部屋行 */}
          {roomNumbers.map((rn) => {
            const room = rooms.find((r) => r.number === rn)!;
            const bars = barsFor(rn);
            return (
              <div key={rn} className="flex border-b border-slate-100">
                <div className="sticky left-0 z-10 flex w-[120px] shrink-0 flex-col justify-center border-r border-slate-200 bg-white px-3 py-3">
                  <span className="text-sm font-semibold text-slate-800">{rn}</span>
                  <span className="truncate text-[11px] text-slate-400">{room.type}</span>
                </div>
                <div className="relative flex-1" style={{ height: 56 }}>
                  {/* 背景グリッド */}
                  <div className="absolute inset-0 flex">
                    {days.map((d, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-full border-r border-slate-50",
                          d.getDay() === 0 && "bg-rose-50/40",
                          d.getDay() === 6 && "bg-brand-50/40"
                        )}
                        style={{ width: colW }}
                      />
                    ))}
                  </div>
                  {/* 予約バー */}
                  {bars.map(({ r, col, width }) => (
                    <button
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className={cn(
                        "absolute top-2 flex h-10 items-center gap-1 overflow-hidden rounded-lg px-2 text-left text-xs font-medium text-white shadow-sm transition-colors",
                        barColor[r.status]
                      )}
                      style={{ left: col * colW + 3, width: width * colW - 6 }}
                      title={`${r.guestName}（${formatDate(r.checkIn)}〜${formatDate(r.checkOut)}）`}
                    >
                      <span className="truncate">{r.guestName}</span>
                      <span className="ml-auto shrink-0 opacity-80">{r.guests}名</span>
                    </button>
                  ))}
                  {/* 空きセルクリックで新規（先頭の空き日を例示） */}
                  {bars.length === 0 && (
                    <button
                      onClick={() => alert(`${rn} 号室に新規予約を作成（モック）`)}
                      className="group absolute inset-0 flex items-center justify-center text-slate-300 hover:text-brand-500"
                    >
                      <Plus className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        ※ 予約バーをクリックすると詳細、空き行をクリックすると新規予約を作成できます（モック）。
      </p>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="予約詳細" description={selected?.id}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-slate-800">{selected.guestName}</p>
              <ReservationStatusBadge value={selected.status} />
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-800">
                {selected.roomNumber} 号室 ・ {selected.roomType}
              </p>
              <p className="mt-1 text-slate-600">
                {formatDate(selected.checkIn)} 〜 {formatDate(selected.checkOut)}（{nights(selected.checkIn, selected.checkOut)}泊）
              </p>
              <p className="mt-1 text-slate-600">
                {selected.guests}名 ・ {formatYen(selected.price)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ChannelBadge value={selected.channel} />
              <span className="text-xs text-slate-400">担当: {selected.staff}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
