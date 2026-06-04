"use client";

import * as React from "react";
import { Users, Plus, Mail, Phone, Shield } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { StaffRoleBadge, WorkStatusBadge } from "@/components/ui/status-badge";
import { staffList as seed } from "@/lib/mock-data";
import { staffRoleMeta, workStatusMeta } from "@/lib/status";
import type { Staff, StaffRole, WorkStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const rolePerms: Record<StaffRole, string[]> = {
  admin: ["全機能", "スタッフ管理", "設定変更", "売上閲覧"],
  front: ["予約管理", "問い合わせ対応", "客室管理"],
  cleaning: ["清掃ステータス更新", "客室確認"],
  maintenance: ["メンテナンス登録", "客室確認"],
};

export default function StaffPage() {
  const [list, setList] = React.useState<Staff[]>(seed);
  const [creating, setCreating] = React.useState(false);

  function cycleWork(id: string) {
    const order: WorkStatus[] = ["working", "break", "off"];
    setList((p) =>
      p.map((s) =>
        s.id === id
          ? { ...s, workStatus: order[(order.indexOf(s.workStatus) + 1) % 3] }
          : s
      )
    );
  }

  return (
    <div>
      <PageHeader
        icon={<Users className="h-5 w-5" />}
        title="スタッフ管理"
        description="フロント・清掃・メンテナンス・管理者の権限と勤務状況を管理します"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> スタッフを登録
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">スタッフ</th>
                <th className="px-4 py-3 font-medium">役割</th>
                <th className="px-4 py-3 font-medium">連絡先</th>
                <th className="px-4 py-3 font-medium">対応中の問い合わせ</th>
                <th className="px-4 py-3 font-medium">権限</th>
                <th className="px-4 py-3 font-medium">勤務ステータス</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StaffRoleBadge value={s.role} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p className="flex items-center gap-1 text-xs"><Mail className="h-3 w-3 text-slate-400" /> {s.email}</p>
                    <p className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3 text-slate-400" /> {s.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold",
                        s.openInquiries > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {s.openInquiries}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {rolePerms[s.role].slice(0, 2).map((p) => (
                        <span key={p} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                          {p}
                        </span>
                      ))}
                      {rolePerms[s.role].length > 2 && (
                        <span className="text-[11px] text-slate-400">+{rolePerms[s.role].length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => cycleWork(s.id)} title="クリックで切替">
                      <WorkStatusBadge value={s.workStatus} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <Shield className="h-3.5 w-3.5" /> 役割に応じて操作できる機能（権限）が自動的に制御されます。
      </p>

      <StaffForm
        open={creating}
        onClose={() => setCreating(false)}
        onSave={(st) => {
          setList((p) => [st, ...p]);
          setCreating(false);
        }}
      />
    </div>
  );
}

function StaffForm({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (s: Staff) => void;
}) {
  const [f, setF] = React.useState({ name: "", role: "front", email: "", phone: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      side
      title="スタッフを登録"
      footer={
        <>
          <Button size="sm" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            size="sm"
            onClick={() =>
              onSave({
                id: `S-${Math.floor(10 + Math.random() * 90)}`,
                name: f.name || "新規スタッフ",
                role: f.role as StaffRole,
                email: f.email,
                phone: f.phone,
                openInquiries: 0,
                workStatus: "off",
              })
            }
          >
            登録する
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>スタッフ名</Label>
          <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="山田 太郎" />
        </div>
        <div>
          <Label>役割</Label>
          <Select value={f.role} onChange={(e) => set("role", e.target.value)}>
            {(Object.keys(staffRoleMeta) as StaffRole[]).map((k) => (
              <option key={k} value={k}>
                {staffRoleMeta[k].label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>メールアドレス</Label>
          <Input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="staff@hotel.example" />
        </div>
        <div>
          <Label>電話番号</Label>
          <Input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="045-000-0000" />
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          選択した役割に応じて、操作可能な機能（権限）が自動的に付与されます。
        </div>
      </div>
    </Modal>
  );
}
