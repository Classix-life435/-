"use client";

import * as React from "react";
import {
  MessageSquareText,
  Search,
  Bot,
  UserCog,
  CheckCircle2,
  AlertTriangle,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import {
  InquiryStatusBadge,
  PriorityBadge,
  CategoryBadge,
} from "@/components/ui/status-badge";
import { inquiries as seed, staffList } from "@/lib/mock-data";
import { inquiryStatusMeta, categoryMeta, priorityMeta } from "@/lib/status";
import type { Inquiry, InquiryStatus, Priority } from "@/lib/types";
import { formatDateTime, cn } from "@/lib/utils";

export default function InquiriesPage() {
  const [list, setList] = React.useState<Inquiry[]>(seed);
  const [q, setQ] = React.useState("");
  const [statusF, setStatusF] = React.useState("all");
  const [catF, setCatF] = React.useState("all");
  const [roomF, setRoomF] = React.useState("");
  const [selected, setSelected] = React.useState<Inquiry | null>(null);

  const filtered = list.filter((i) => {
    if (statusF !== "all" && i.status !== statusF) return false;
    if (catF !== "all" && i.category !== catF) return false;
    if (roomF && !i.roomNumber.includes(roomF)) return false;
    if (q && !(`${i.guestName}${i.content}${i.id}`.toLowerCase().includes(q.toLowerCase())))
      return false;
    return true;
  });

  function update(id: string, patch: Partial<Inquiry>) {
    setList((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setSelected((s) => (s && s.id === id ? { ...s, ...patch } : s));
  }

  const tabs: { v: string; l: string }[] = [
    { v: "all", l: "すべて" },
    { v: "open", l: "未対応" },
    { v: "inProgress", l: "対応中" },
    { v: "needsStaff", l: "要確認" },
    { v: "resolved", l: "対応済み" },
  ];

  return (
    <div>
      <PageHeader
        icon={<MessageSquareText className="h-5 w-5" />}
        title="宿泊客問い合わせ対応"
        description="客室・電話・音声AIから届いた問い合わせを管理します"
      />

      {/* タブ + 検索 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {tabs.map((t) => {
            const n =
              t.v === "all" ? list.length : list.filter((i) => i.status === t.v).length;
            return (
              <button
                key={t.v}
                onClick={() => setStatusF(t.v)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  statusF === t.v ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {t.l} <span className={cn("ml-1", statusF === t.v ? "opacity-90" : "text-slate-400")}>{n}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="w-48 pl-9" placeholder="キーワード検索" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Input className="w-28" placeholder="部屋番号" value={roomF} onChange={(e) => setRoomF(e.target.value)} />
          <Select className="w-36" value={catF} onChange={(e) => setCatF(e.target.value)}>
            <option value="all">全カテゴリ</option>
            {(Object.keys(categoryMeta) as (keyof typeof categoryMeta)[]).map((k) => (
              <option key={k} value={k}>
                {categoryMeta[k].label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* 一覧 */}
      <div className="space-y-3">
        {filtered.map((i) => {
          const urgent = i.priority === "urgent" && i.status !== "resolved";
          return (
            <button
              key={i.id}
              onClick={() => setSelected(i)}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-card transition-all hover:shadow-soft",
                urgent ? "border-rose-300 ring-1 ring-rose-200" : "border-slate-200"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                  urgent ? "bg-rose-100 text-rose-700" : "bg-brand-50 text-brand-700"
                )}
              >
                {i.roomNumber}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800">{i.guestName}</span>
                  <CategoryBadge value={i.category} />
                  {i.aiHandled && (
                    <Badge tone="blue">
                      <Bot className="h-3 w-3" /> AI対応済み
                    </Badge>
                  )}
                  {i.needsHuman && i.status !== "resolved" && (
                    <Badge tone="violet">
                      <UserCog className="h-3 w-3" /> 人間対応
                    </Badge>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-slate-600">{i.content}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDateTime(i.createdAt)}
                  {i.assignee && ` ・ 担当: ${i.assignee}`}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <PriorityBadge value={i.priority} />
                <InquiryStatusBadge value={i.status} />
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
            条件に一致する問い合わせがありません
          </div>
        )}
      </div>

      {/* 詳細モーダル */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="問い合わせ詳細"
        description={selected?.id}
        side
        footer={
          selected && (
            <>
              <Button variant="outline" size="sm" onClick={() => update(selected.id, { status: "inProgress" })}>
                対応中にする
              </Button>
              <Button size="sm" onClick={() => update(selected.id, { status: "resolved" })}>
                <CheckCircle2 className="h-4 w-4" /> 対応完了
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            {selected.priority === "urgent" && selected.status !== "resolved" && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                <AlertTriangle className="h-4 w-4" /> 緊急対応が必要です
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-slate-800">{selected.guestName}</p>
                <p className="text-sm text-slate-500">{selected.roomNumber} 号室</p>
              </div>
              <CategoryBadge value={selected.category} />
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">問い合わせ内容</p>
              <p className="mt-1 text-sm text-slate-800">{selected.content}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDateTime(selected.createdAt)}</p>
            </div>

            {selected.aiHandled && selected.aiAnswer && (
              <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
                  <Bot className="h-3.5 w-3.5" /> AIコンシェルジュの一次回答
                </p>
                <p className="mt-1 text-sm text-slate-700">{selected.aiAnswer}</p>
              </div>
            )}

            {/* ステータス・優先度・担当 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>対応ステータス</Label>
                <Select
                  value={selected.status}
                  onChange={(e) => update(selected.id, { status: e.target.value as InquiryStatus })}
                >
                  {(Object.keys(inquiryStatusMeta) as InquiryStatus[]).map((k) => (
                    <option key={k} value={k}>
                      {inquiryStatusMeta[k].label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>優先度</Label>
                <Select
                  value={selected.priority}
                  onChange={(e) => update(selected.id, { priority: e.target.value as Priority })}
                >
                  {(Object.keys(priorityMeta) as Priority[]).map((k) => (
                    <option key={k} value={k}>
                      {priorityMeta[k].label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="col-span-2">
                <Label>担当者を割り当て</Label>
                <Select
                  value={selected.assignee ?? ""}
                  onChange={(e) => update(selected.id, { assignee: e.target.value, status: "inProgress" })}
                >
                  <option value="">未割り当て</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {!selected.needsHuman ? (
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => update(selected.id, { needsHuman: true, status: "needsStaff" })}
              >
                <UserCog className="h-4 w-4" /> 人間対応に切り替える
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700">
                <UserCog className="h-3.5 w-3.5" /> このお問い合わせはスタッフ対応に切り替わっています
              </div>
            )}

            <MemoEditor
              value={selected.memo ?? ""}
              onSave={(v) => update(selected.id, { memo: v })}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

function MemoEditor({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => setV(value), [value]);
  return (
    <div>
      <Label>対応メモ</Label>
      <Textarea rows={3} value={v} onChange={(e) => setV(e.target.value)} placeholder="対応内容を記録..." />
      <Button size="sm" variant="outline" className="mt-2" onClick={() => onSave(v)}>
        <Send className="h-3.5 w-3.5" /> メモを保存
      </Button>
    </div>
  );
}
