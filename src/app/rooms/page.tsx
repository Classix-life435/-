"use client";

import * as React from "react";
import { BedDouble, Wrench, Sparkles, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { RoomStatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { rooms as seed } from "@/lib/mock-data";
import { roomStatusMeta } from "@/lib/status";
import type { Room, RoomStatus } from "@/lib/types";
import { formatYen, cn } from "@/lib/utils";

const accent: Record<RoomStatus, string> = {
  vacant: "border-l-emerald-400",
  occupied: "border-l-brand-400",
  cleaning: "border-l-amber-400",
  cleaned: "border-l-sky-400",
  maintenance: "border-l-violet-400",
  outOfService: "border-l-rose-400",
};

export default function RoomsPage() {
  const [list, setList] = React.useState<Room[]>(seed);
  const [statusF, setStatusF] = React.useState("all");
  const [typeF, setTypeF] = React.useState("all");

  const types = Array.from(new Set(list.map((r) => r.type)));
  const filtered = list.filter((r) => {
    if (statusF !== "all" && r.status !== statusF) return false;
    if (typeF !== "all" && r.type !== typeF) return false;
    return true;
  });

  function setStatus(id: string, status: RoomStatus) {
    setList((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  const summary = (Object.keys(roomStatusMeta) as RoomStatus[]).map((k) => ({
    k,
    n: list.filter((r) => r.status === k).length,
  }));

  return (
    <div>
      <PageHeader
        icon={<BedDouble className="h-5 w-5" />}
        title="客室管理"
        description="客室のステータス・清掃・メンテナンス状況を管理します"
      />

      <div className="mb-5 grid grid-cols-3 gap-3 md:grid-cols-6">
        {summary.map(({ k, n }) => (
          <button
            key={k}
            onClick={() => setStatusF(statusF === k ? "all" : k)}
            className={cn(
              "rounded-xl border p-3 text-left transition-colors",
              statusF === k ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"
            )}
          >
            <RoomStatusBadge value={k} />
            <p className="mt-2 text-xl font-bold text-slate-800">{n}</p>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <Select className="w-44" value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="all">すべてのステータス</option>
          {(Object.keys(roomStatusMeta) as RoomStatus[]).map((k) => (
            <option key={k} value={k}>
              {roomStatusMeta[k].label}
            </option>
          ))}
        </Select>
        <Select className="w-48" value={typeF} onChange={(e) => setTypeF(e.target.value)}>
          <option value="all">すべての部屋タイプ</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Button size="sm" variant="ghost" onClick={() => setStatusF("vacant")}>
          空室のみ
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setStatusF("cleaning")}>
          清掃待ちのみ
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className={cn(
              "rounded-2xl border border-l-4 border-slate-200 bg-white p-4 shadow-card",
              accent[r.status]
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{r.number}</p>
                <p className="text-xs text-slate-500">{r.type}・定員{r.capacity}名</p>
              </div>
              <RoomStatusBadge value={r.status} />
            </div>

            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">料金</span>
                <span className="font-medium text-slate-700">{formatYen(r.price)}/泊</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">宿泊ゲスト</span>
                <span className="font-medium text-slate-700">{r.guestName ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">備品状況</span>
                {r.amenitiesOk ? (
                  <Badge tone="green">補充済み</Badge>
                ) : (
                  <Badge tone="amber">要補充</Badge>
                )}
              </div>
            </div>

            {r.maintenanceNote && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-violet-50 p-2 text-xs text-violet-700">
                <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {r.maintenanceNote}
              </div>
            )}

            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="mb-1.5 text-[11px] font-medium text-slate-400">ステータスを変更</p>
              <div className="flex flex-wrap gap-1.5">
                {r.status !== "cleaning" && (
                  <Button size="sm" variant="secondary" onClick={() => setStatus(r.id, "cleaning")}>
                    <Sparkles className="h-3.5 w-3.5" /> 清掃中
                  </Button>
                )}
                {r.status === "cleaning" && (
                  <Button size="sm" variant="secondary" onClick={() => setStatus(r.id, "cleaned")}>
                    清掃完了
                  </Button>
                )}
                {r.status !== "vacant" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "vacant")}>
                    空室に
                  </Button>
                )}
                {r.status !== "maintenance" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "maintenance")}>
                    <Wrench className="h-3.5 w-3.5" /> 整備
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
