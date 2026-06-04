"use client";

import * as React from "react";
import {
  BookOpen,
  Search,
  Plus,
  Volume2,
  Eye,
  EyeOff,
  Bot,
  Pencil,
  UserCog,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge, PriorityBadge } from "@/components/ui/status-badge";
import { knowledgeBase as seed } from "@/lib/mock-data";
import { categoryMeta, priorityMeta } from "@/lib/status";
import type { Knowledge, InquiryCategory, Priority } from "@/lib/types";

export default function KnowledgePage() {
  const [list, setList] = React.useState<Knowledge[]>(seed);
  const [q, setQ] = React.useState("");
  const [catF, setCatF] = React.useState("all");
  const [editing, setEditing] = React.useState<Knowledge | null>(null);
  const [creating, setCreating] = React.useState(false);

  const filtered = list.filter((k) => {
    if (catF !== "all" && k.category !== catF) return false;
    if (q) {
      const t = `${k.title}${k.answer}${k.phrases.join("")}`;
      if (!t.toLowerCase().includes(q.toLowerCase())) return false;
    }
    return true;
  });

  function update(id: string, patch: Partial<Knowledge>) {
    setList((p) => p.map((k) => (k.id === id ? { ...k, ...patch } : k)));
  }
  function save(k: Knowledge) {
    setList((p) => {
      const exists = p.some((x) => x.id === k.id);
      return exists ? p.map((x) => (x.id === k.id ? k : x)) : [k, ...p];
    });
    setEditing(null);
    setCreating(false);
  }
  function remove(id: string) {
    setList((p) => p.filter((k) => k.id !== id));
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        icon={<BookOpen className="h-5 w-5" />}
        title="ナレッジ管理"
        description="よくある問い合わせの回答とAI音声案内用テキストを管理します"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> ナレッジを追加
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="w-64 pl-9" placeholder="キーワード・言い回しで検索" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select className="w-40" value={catF} onChange={(e) => setCatF(e.target.value)}>
          <option value="all">全カテゴリ</option>
          {(Object.keys(categoryMeta) as (keyof typeof categoryMeta)[]).map((k) => (
            <option key={k} value={k}>
              {categoryMeta[k].label}
            </option>
          ))}
        </Select>
        <span className="ml-auto text-sm text-slate-400">{filtered.length} 件</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((k) => (
          <div key={k.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-800">{k.title}</h3>
              <div className="flex shrink-0 gap-1">
                {k.published ? (
                  <Badge tone="green"><Eye className="h-3 w-3" /> 公開</Badge>
                ) : (
                  <Badge tone="slate"><EyeOff className="h-3 w-3" /> 非公開</Badge>
                )}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <CategoryBadge value={k.category} />
              <PriorityBadge value={k.priority} />
              {k.useForAi && <Badge tone="blue"><Bot className="h-3 w-3" /> AI回答に使用</Badge>}
              {k.needsStaff && <Badge tone="violet"><UserCog className="h-3 w-3" /> スタッフ対応</Badge>}
            </div>

            <p className="mt-3 text-sm text-slate-600 line-clamp-2">{k.answer}</p>

            <div className="mt-3 rounded-xl bg-brand-50/60 p-2.5">
              <p className="flex items-center gap-1 text-[11px] font-semibold text-brand-700">
                <Volume2 className="h-3 w-3" /> 音声案内用
              </p>
              <p className="mt-0.5 text-xs text-slate-600">{k.voiceAnswer}</p>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {k.phrases.slice(0, 4).map((p) => (
                <span key={p} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                  {p}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">
                更新 {k.updatedAt} ・ {k.author}
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => update(k.id, { published: !k.published })}>
                  {k.published ? "非公開に" : "公開する"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(k)}>
                  <Pencil className="h-3.5 w-3.5" /> 編集
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <KnowledgeForm
        open={creating || !!editing}
        initial={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSave={save}
        onDelete={editing ? () => remove(editing.id) : undefined}
      />
    </div>
  );
}

function KnowledgeForm({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  initial: Knowledge | null;
  onClose: () => void;
  onSave: (k: Knowledge) => void;
  onDelete?: () => void;
}) {
  const blank: Knowledge = {
    id: `KB-${Math.floor(10 + Math.random() * 90)}`,
    title: "",
    category: "facility",
    phrases: [],
    answer: "",
    voiceAnswer: "",
    handling: "",
    needsStaff: false,
    priority: "low",
    published: true,
    useForAi: true,
    updatedAt: "2026-06-04",
    author: "鈴木 美咲",
  };
  const [f, setF] = React.useState<Knowledge>(initial ?? blank);
  const [phraseStr, setPhraseStr] = React.useState("");

  React.useEffect(() => {
    const base = initial ?? blank;
    setF(base);
    setPhraseStr(base.phrases.join("、"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open]);

  const set = <K extends keyof Knowledge>(k: K, v: Knowledge[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      side
      title={initial ? "ナレッジを編集" : "ナレッジを追加"}
      footer={
        <>
          {onDelete && (
            <Button size="sm" variant="danger" onClick={onDelete} className="mr-auto">
              削除
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            size="sm"
            onClick={() =>
              onSave({
                ...f,
                phrases: phraseStr.split(/[、,]/).map((s) => s.trim()).filter(Boolean),
                updatedAt: "2026-06-04",
              })
            }
          >
            保存する
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>質問タイトル</Label>
          <Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="電気のスイッチはどこですか？" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>カテゴリ</Label>
            <Select value={f.category} onChange={(e) => set("category", e.target.value as InquiryCategory)}>
              {(Object.keys(categoryMeta) as InquiryCategory[]).map((k) => (
                <option key={k} value={k}>
                  {categoryMeta[k].label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>優先度</Label>
            <Select value={f.priority} onChange={(e) => set("priority", e.target.value as Priority)}>
              {(Object.keys(priorityMeta) as Priority[]).map((k) => (
                <option key={k} value={k}>
                  {priorityMeta[k].label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label>想定される言い回し（、区切り）</Label>
          <Input value={phraseStr} onChange={(e) => setPhraseStr(e.target.value)} placeholder="電気どこ、照明のつけ方、スイッチ" />
        </div>
        <div>
          <Label>回答文</Label>
          <Textarea rows={3} value={f.answer} onChange={(e) => set("answer", e.target.value)} />
        </div>
        <div>
          <Label>音声案内用の短い回答</Label>
          <Textarea rows={2} value={f.voiceAnswer} onChange={(e) => set("voiceAnswer", e.target.value)} />
          {f.voiceAnswer && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-brand-50 p-2 text-xs text-brand-700">
              <Volume2 className="h-3.5 w-3.5" />
              <span className="flex-1">{f.voiceAnswer}</span>
              <button
                type="button"
                onClick={() => alert("音声案内をプレビュー再生（モック）")}
                className="rounded bg-brand-600 px-2 py-0.5 text-white"
              >
                試聴
              </button>
            </div>
          )}
        </div>
        <div>
          <Label>対応方法</Label>
          <Input value={f.handling} onChange={(e) => set("handling", e.target.value)} placeholder="AI音声案内で完結。再質問時はフロント対応。" />
        </div>
        <div className="space-y-2 rounded-xl bg-slate-50 p-3">
          <label className="flex items-center justify-between text-sm text-slate-700">
            AI回答に使用する
            <input type="checkbox" checked={f.useForAi} onChange={(e) => set("useForAi", e.target.checked)} className="accent-brand-600" />
          </label>
          <label className="flex items-center justify-between text-sm text-slate-700">
            スタッフ対応が必要
            <input type="checkbox" checked={f.needsStaff} onChange={(e) => set("needsStaff", e.target.checked)} className="accent-brand-600" />
          </label>
          <label className="flex items-center justify-between text-sm text-slate-700">
            公開する
            <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} className="accent-brand-600" />
          </label>
        </div>
      </div>
    </Modal>
  );
}
