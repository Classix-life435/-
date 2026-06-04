"use client";

import * as React from "react";
import {
  Phone,
  Plus,
  Search,
  Filter,
  CalendarCheck,
  LogIn,
  LogOut,
  XCircle,
  Pencil,
  Mail,
  CreditCard,
  Users2,
  StickyNote,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  ReservationStatusBadge,
  ChannelBadge,
  PaymentBadge,
} from "@/components/ui/status-badge";
import { reservations as seed } from "@/lib/mock-data";
import { reservationStatusMeta } from "@/lib/status";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { formatDate, formatYen, nights } from "@/lib/utils";

const ROOM_TYPES = [
  "シングル",
  "スタンダードツイン",
  "スタンダードダブル",
  "デラックスツイン",
  "デラックスキング",
  "ファミリースイート",
  "コーナースイート",
  "デイユース",
];

export default function ReservationsPage() {
  const [list, setList] = React.useState<Reservation[]>(seed);
  const [q, setQ] = React.useState("");
  const [statusF, setStatusF] = React.useState<string>("all");
  const [typeF, setTypeF] = React.useState<string>("all");
  const [dateF, setDateF] = React.useState<string>("");
  const [selected, setSelected] = React.useState<Reservation | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);

  const filtered = list.filter((r) => {
    if (statusF !== "all" && r.status !== statusF) return false;
    if (typeF !== "all" && r.roomType !== typeF) return false;
    if (dateF && !(r.checkIn <= dateF && r.checkOut >= dateF)) return false;
    if (q) {
      const t = `${r.guestName}${r.guestNameKana ?? ""}${r.phone}${r.roomNumber}${r.id}`;
      if (!t.toLowerCase().includes(q.toLowerCase())) return false;
    }
    return true;
  });

  function setStatus(id: string, status: ReservationStatus) {
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  }

  function addReservation(r: Reservation) {
    setList((prev) => [r, ...prev]);
    setFormOpen(false);
  }

  const counts = (Object.keys(reservationStatusMeta) as ReservationStatus[]).map(
    (k) => ({ k, n: list.filter((r) => r.status === k).length })
  );

  return (
    <div>
      <PageHeader
        icon={<Phone className="h-5 w-5" />}
        title="電話予約スケジューリング"
        description="電話・Web・代理店からの予約を一元管理します"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> 新規予約登録
          </Button>
        }
      />

      {/* ステータス別サマリー */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {counts.map(({ k, n }) => (
          <button
            key={k}
            onClick={() => setStatusF(statusF === k ? "all" : k)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              statusF === k ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <p className="text-xs text-slate-500">{reservationStatusMeta[k].label}</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{n}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* 検索・絞り込み */}
        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card lg:sticky lg:top-20 lg:self-start">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="h-4 w-4 text-brand-500" /> 検索・絞り込み
          </div>
          <div>
            <Label>キーワード</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="氏名・電話・部屋番号"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>予約ステータス</Label>
            <Select value={statusF} onChange={(e) => setStatusF(e.target.value)}>
              <option value="all">すべて</option>
              {(Object.keys(reservationStatusMeta) as ReservationStatus[]).map((k) => (
                <option key={k} value={k}>
                  {reservationStatusMeta[k].label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>部屋タイプ</Label>
            <Select value={typeF} onChange={(e) => setTypeF(e.target.value)}>
              <option value="all">すべて</option>
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>宿泊日で絞り込み</Label>
            <Input type="date" value={dateF} onChange={(e) => setDateF(e.target.value)} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              setQ("");
              setStatusF("all");
              setTypeF("all");
              setDateF("");
            }}
          >
            条件をクリア
          </Button>
        </aside>

        {/* 予約一覧テーブル */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-700">
              予約一覧 <span className="text-slate-400">（{filtered.length}件）</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">予約者 / ID</th>
                  <th className="px-4 py-3 font-medium">宿泊期間</th>
                  <th className="px-4 py-3 font-medium">部屋</th>
                  <th className="px-4 py-3 font-medium">人数</th>
                  <th className="px-4 py-3 font-medium">料金</th>
                  <th className="px-4 py-3 font-medium">経路</th>
                  <th className="px-4 py-3 font-medium">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="cursor-pointer border-b border-slate-50 transition-colors hover:bg-brand-50/40"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{r.guestName}</p>
                      <p className="text-xs text-slate-400">{r.id}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{formatDate(r.checkIn)}</p>
                      <p className="text-xs text-slate-400">
                        〜 {formatDate(r.checkOut)}（{nights(r.checkIn, r.checkOut)}泊）
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{r.roomNumber}</p>
                      <p className="text-xs text-slate-400">{r.roomType}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.guests}名
                      <span className="block text-xs text-slate-400">
                        大人{r.adults}・子{r.children}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{formatYen(r.price)}</td>
                    <td className="px-4 py-3">
                      <ChannelBadge value={r.channel} />
                    </td>
                    <td className="px-4 py-3">
                      <ReservationStatusBadge value={r.status} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                      条件に一致する予約がありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 予約詳細 サイドパネル */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        side
        title="予約詳細"
        description={selected?.id}
        footer={
          selected && (
            <>
              {selected.status === "confirmed" && (
                <Button size="sm" onClick={() => setStatus(selected.id, "checkedIn")}>
                  <LogIn className="h-4 w-4" /> チェックイン
                </Button>
              )}
              {selected.status === "tentative" && (
                <Button size="sm" onClick={() => setStatus(selected.id, "confirmed")}>
                  <CalendarCheck className="h-4 w-4" /> 確定にする
                </Button>
              )}
              {selected.status === "checkedIn" && (
                <Button size="sm" onClick={() => setStatus(selected.id, "checkedOut")}>
                  <LogOut className="h-4 w-4" /> チェックアウト
                </Button>
              )}
              {selected.status !== "cancelled" && selected.status !== "checkedOut" && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setStatus(selected.id, "cancelled")}
                >
                  <XCircle className="h-4 w-4" /> キャンセル
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-slate-800">{selected.guestName}</p>
                {selected.guestNameKana && (
                  <p className="text-xs text-slate-400">{selected.guestNameKana}</p>
                )}
              </div>
              <ReservationStatusBadge value={selected.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Info icon={<Phone className="h-4 w-4" />} label="電話番号" value={selected.phone} />
              <Info icon={<Mail className="h-4 w-4" />} label="メール" value={selected.email} />
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">宿泊期間</p>
              <p className="mt-1 font-semibold text-slate-800">
                {formatDate(selected.checkIn)} 〜 {formatDate(selected.checkOut)}
              </p>
              <p className="text-xs text-slate-500">{nights(selected.checkIn, selected.checkOut)}泊</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Info label="部屋タイプ" value={selected.roomType} />
              <Info label="部屋番号" value={selected.roomNumber} />
              <Info icon={<Users2 className="h-4 w-4" />} label="宿泊人数" value={`${selected.guests}名（大人${selected.adults}・子ども${selected.children}）`} />
              <Info icon={<CreditCard className="h-4 w-4" />} label="料金" value={formatYen(selected.price)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">支払い方法</p>
                <PaymentBadge value={selected.payment} />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">予約経路</p>
                <ChannelBadge value={selected.channel} />
              </div>
            </div>

            <Info label="受付担当者" value={selected.staff} />

            {selected.note && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                  <StickyNote className="h-3.5 w-3.5" /> 備考
                </p>
                <p className="mt-1 text-sm text-amber-900">{selected.note}</p>
              </div>
            )}

            <Button variant="outline" size="sm" className="w-full">
              <Pencil className="h-4 w-4" /> この予約を編集
            </Button>
          </div>
        )}
      </Modal>

      <NewReservationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={addReservation}
        roomTypes={ROOM_TYPES}
      />
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function NewReservationForm({
  open,
  onClose,
  onSubmit,
  roomTypes,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (r: Reservation) => void;
  roomTypes: string[];
}) {
  const [f, setF] = React.useState({
    guestName: "",
    phone: "",
    email: "",
    checkIn: "",
    checkOut: "",
    roomType: roomTypes[1],
    roomNumber: "",
    adults: 2,
    children: 0,
    price: 0,
    payment: "credit",
    status: "confirmed",
    channel: "phone",
    staff: "鈴木 美咲",
    note: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r: Reservation = {
      id: `RSV-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: f.guestName || "（未入力）",
      phone: f.phone,
      email: f.email,
      checkIn: f.checkIn || "2026-06-04",
      checkOut: f.checkOut || "2026-06-05",
      roomType: f.roomType,
      roomNumber: f.roomNumber || "—",
      guests: Number(f.adults) + Number(f.children),
      adults: Number(f.adults),
      children: Number(f.children),
      price: Number(f.price),
      payment: f.payment as Reservation["payment"],
      status: f.status as ReservationStatus,
      channel: f.channel as Reservation["channel"],
      staff: f.staff,
      note: f.note,
      createdAt: new Date().toISOString(),
    };
    onSubmit(r);
  }

  const set = (k: string, v: string | number) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      side
      title="新規予約登録"
      description="電話で受けた予約を登録します"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            キャンセル
          </Button>
          <Button size="sm" type="submit" form="rsv-form">
            <Plus className="h-4 w-4" /> 登録する
          </Button>
        </>
      }
    >
      <form id="rsv-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>予約者名</Label>
            <Input value={f.guestName} onChange={(e) => set("guestName", e.target.value)} placeholder="山田 太郎" />
          </div>
          <div>
            <Label>電話番号</Label>
            <Input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="090-0000-0000" />
          </div>
          <div>
            <Label>メールアドレス</Label>
            <Input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="guest@example.com" />
          </div>
          <div>
            <Label>宿泊開始日</Label>
            <Input type="date" value={f.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
          </div>
          <div>
            <Label>宿泊終了日</Label>
            <Input type="date" value={f.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
          </div>
          <div>
            <Label>部屋タイプ</Label>
            <Select value={f.roomType} onChange={(e) => set("roomType", e.target.value)}>
              {roomTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>部屋番号</Label>
            <Input value={f.roomNumber} onChange={(e) => set("roomNumber", e.target.value)} placeholder="302" />
          </div>
          <div>
            <Label>大人人数</Label>
            <Input type="number" min={0} value={f.adults} onChange={(e) => set("adults", Number(e.target.value))} />
          </div>
          <div>
            <Label>子ども人数</Label>
            <Input type="number" min={0} value={f.children} onChange={(e) => set("children", Number(e.target.value))} />
          </div>
          <div>
            <Label>料金（円）</Label>
            <Input type="number" min={0} value={f.price} onChange={(e) => set("price", Number(e.target.value))} placeholder="28000" />
          </div>
          <div>
            <Label>支払い方法</Label>
            <Select value={f.payment} onChange={(e) => set("payment", e.target.value)}>
              <option value="credit">クレジット</option>
              <option value="cash">現金</option>
              <option value="onsite">現地払い</option>
              <option value="prepaid">事前決済</option>
              <option value="invoice">請求書</option>
            </Select>
          </div>
          <div>
            <Label>予約ステータス</Label>
            <Select value={f.status} onChange={(e) => set("status", e.target.value)}>
              <option value="tentative">仮予約</option>
              <option value="confirmed">確定</option>
            </Select>
          </div>
          <div>
            <Label>予約経路</Label>
            <Select value={f.channel} onChange={(e) => set("channel", e.target.value)}>
              <option value="phone">電話</option>
              <option value="web">Web</option>
              <option value="agency">旅行代理店</option>
              <option value="walkIn">直接来館</option>
              <option value="other">その他</option>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>受付担当者</Label>
            <Input value={f.staff} onChange={(e) => set("staff", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>備考</Label>
            <Textarea rows={3} value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="高層階希望 など" />
          </div>
        </div>
      </form>
    </Modal>
  );
}
