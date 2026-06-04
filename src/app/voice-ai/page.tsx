"use client";

import * as React from "react";
import {
  AudioLines,
  Search,
  Mic,
  Bot,
  Play,
  Pause,
  UserCog,
  AlertTriangle,
  Volume2,
  Loader2,
  ArrowRightLeft,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/ui/status-badge";
import { voiceLogs as seed } from "@/lib/mock-data";
import { categoryMeta } from "@/lib/status";
import type { VoiceLog } from "@/lib/types";
import { formatDateTime, cn } from "@/lib/utils";

const statusMeta: Record<VoiceLog["status"], { label: string; tone: any }> = {
  completed: { label: "対応完了", tone: "green" },
  playing: { label: "再生中", tone: "blue" },
  escalated: { label: "スタッフ対応へ", tone: "red" },
  transcribing: { label: "文字起こし中", tone: "amber" },
};

export default function VoiceAiPage() {
  const [list] = React.useState<VoiceLog[]>(seed);
  const [q, setQ] = React.useState("");
  const [catF, setCatF] = React.useState("all");
  const [roomF, setRoomF] = React.useState("");
  const [unresolved, setUnresolved] = React.useState(false);
  const [selected, setSelected] = React.useState<VoiceLog | null>(null);

  const filtered = list.filter((v) => {
    if (catF !== "all" && v.category !== catF) return false;
    if (roomF && !v.roomNumber.includes(roomF)) return false;
    if (unresolved && !v.needsStaff) return false;
    if (q && !`${v.guestName}${v.sttText}${v.id}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        icon={<AudioLines className="h-5 w-5" />}
        title="TTS / STT 音声AI対応ログ"
        description="音声問い合わせの文字起こし・AI回答・音声案内の履歴を管理します"
      />

      {/* フロー説明バナー */}
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-medium text-slate-600 shadow-card">
        {[
          { icon: Mic, label: "① 音声入力" },
          { icon: ArrowRightLeft, label: "② STT文字起こし" },
          { icon: Bot, label: "③ AI分類・回答生成" },
          { icon: Volume2, label: "④ TTS音声案内" },
          { icon: UserCog, label: "⑤ 必要時スタッフへ" },
        ].map((s, i, arr) => (
          <React.Fragment key={i}>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-brand-700">
              <s.icon className="h-3.5 w-3.5" /> {s.label}
            </span>
            {i < arr.length - 1 && <span className="text-slate-300">→</span>}
          </React.Fragment>
        ))}
      </div>

      {/* 検索 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="w-56 pl-9" placeholder="会話ログを検索" value={q} onChange={(e) => setQ(e.target.value)} />
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
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <input type="checkbox" checked={unresolved} onChange={(e) => setUnresolved(e.target.checked)} className="accent-brand-600" />
          未解決のみ
        </label>
      </div>

      {/* 一覧 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelected(v)}
            className={cn(
              "rounded-2xl border bg-white p-4 text-left shadow-card transition-all hover:shadow-soft",
              v.needsStaff ? "border-rose-200" : "border-slate-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                  {v.roomNumber}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{v.guestName}</p>
                  <p className="text-[11px] text-slate-400">{v.id} ・ {formatDateTime(v.startedAt)}</p>
                </div>
              </div>
              <Badge tone={statusMeta[v.status].tone}>
                {v.status === "transcribing" && <Loader2 className="h-3 w-3 animate-spin" />}
                {statusMeta[v.status].label}
              </Badge>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2">
                <Mic className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                {v.status === "transcribing" ? (
                  <span className="flex items-center gap-1.5 text-sm italic text-amber-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> 音声を変換中...
                  </span>
                ) : (
                  <p className="text-sm text-slate-700">{v.sttText}</p>
                )}
              </div>
              <div className="flex items-start gap-2">
                <Bot className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <p className="text-sm text-slate-500 line-clamp-2">{v.aiAnswer}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <CategoryBadge value={v.category} />
              <span className="flex items-center gap-1 text-xs text-slate-400">
                {v.ttsStatus === "played" ? (
                  <><Volume2 className="h-3.5 w-3.5 text-emerald-500" /> TTS再生済み</>
                ) : (
                  <><Volume2 className="h-3.5 w-3.5" /> TTS待機</>
                )}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 詳細 */}
      <Modal open={!!selected} onClose={() => setSelected(null)} side title="会話ログ詳細" description={selected?.id}>
        {selected && <VoiceDetail log={selected} />}
      </Modal>
    </div>
  );
}

function VoiceDetail({ log }: { log: VoiceLog }) {
  return (
    <div className="space-y-5">
      {log.needsStaff && (
        <div className="rounded-xl bg-rose-50 p-3 ring-1 ring-inset ring-rose-200">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-rose-700">
            <AlertTriangle className="h-4 w-4" /> スタッフ対応へエスカレーション
          </p>
          {log.escalationReason && (
            <p className="mt-1 text-sm text-rose-900">{log.escalationReason}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-slate-800">{log.guestName}</p>
          <p className="text-sm text-slate-500">{log.roomNumber} 号室</p>
        </div>
        <CategoryBadge value={log.category} />
      </div>

      {/* STT */}
      <div>
        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Mic className="h-3.5 w-3.5" /> STT 変換テキスト
        </p>
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-800">{log.sttText}</div>
      </div>

      {/* AI回答 + TTS */}
      <div>
        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand-700">
          <Bot className="h-3.5 w-3.5" /> AI回答文
        </p>
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-3 text-sm text-slate-800">
          {log.aiAnswer}
        </div>
        <TtsPlayer durationSec={Math.max(6, Math.round(log.aiAnswer.length / 6))} played={log.ttsStatus === "played"} />
      </div>

      {/* 会話ログ */}
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-500">会話ログ</p>
        <div className="space-y-2">
          {log.transcript.map((t, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2",
                t.role === "guest" ? "justify-start" : "justify-end"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                  t.role === "guest"
                    ? "bg-slate-100 text-slate-800"
                    : t.role === "ai"
                    ? "bg-brand-600 text-white"
                    : "bg-violet-100 text-violet-800"
                )}
              >
                <p className="mb-0.5 text-[10px] opacity-70">
                  {t.role === "guest" ? "宿泊客" : t.role === "ai" ? "AI" : "スタッフ"} ・ {t.at}
                </p>
                {t.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-400">会話開始</p>
          <p className="font-medium text-slate-700">{formatDateTime(log.startedAt)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">所要時間</p>
          <p className="font-medium text-slate-700">{log.durationSec} 秒</p>
        </div>
      </div>

      {!log.needsStaff && (
        <Button variant="secondary" size="sm" className="w-full">
          <UserCog className="h-4 w-4" /> スタッフ対応に切り替える
        </Button>
      )}
    </div>
  );
}

/** TTS再生のモックプレイヤー */
function TtsPlayer({ durationSec, played }: { durationSec: number; played: boolean }) {
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(played ? 100 : 0);

  React.useEffect(() => {
    if (!playing) return;
    const start = (progress / 100) * durationSec;
    let cur = start;
    const id = setInterval(() => {
      cur += 0.1;
      const p = Math.min(100, (cur / durationSec) * 100);
      setProgress(p);
      if (p >= 100) {
        setPlaying(false);
        clearInterval(id);
      }
    }, 100);
    return () => clearInterval(id);
  }, [playing, durationSec, progress]);

  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
      <button
        onClick={() => {
          if (progress >= 100) setProgress(0);
          setPlaying((p) => !p);
        }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700"
        aria-label="TTS再生"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
      </button>
      <div className="flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
          <Volume2 className="h-3 w-3" /> TTS音声案内 ・ {durationSec}秒
          {playing && <span className="text-brand-600">（再生中...）</span>}
        </p>
      </div>
    </div>
  );
}
