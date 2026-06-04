"use client";

import * as React from "react";
import {
  Settings as SettingsIcon,
  Phone,
  Mic,
  Volume2,
  Bot,
  Database,
  CreditCard,
  Languages,
  MessageSquare,
  Bell,
  Building2,
  Plug,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HOTEL_NAME } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface Integration {
  icon: React.ElementType;
  name: string;
  desc: string;
  connected: boolean;
  planned?: boolean;
}

const integrations: Integration[] = [
  { icon: Phone, name: "電話システム / Twilio", desc: "着信を自動でAI音声応答へ接続", connected: true },
  { icon: Mic, name: "STT API（音声認識）", desc: "宿泊客の音声をテキスト化", connected: true },
  { icon: Volume2, name: "TTS API（音声合成）", desc: "AI回答を自然な音声で案内", connected: true },
  { icon: Bot, name: "LLM API（生成AI）", desc: "問い合わせ分類・回答生成", connected: true },
  { icon: Database, name: "PMS / 予約サイト連携", desc: "宿泊管理システム・OTAと予約同期", connected: false, planned: true },
  { icon: CreditCard, name: "Stripe 決済連携", desc: "事前決済・オンライン精算", connected: false, planned: true },
  { icon: MessageSquare, name: "LINE / 客室QRコード", desc: "チャットからの問い合わせ受付", connected: false, planned: true },
  { icon: Bell, name: "Slack / LINE WORKS 通知", desc: "清掃・緊急対応をスタッフへ通知", connected: false, planned: true },
];

const languages = [
  { code: "ja", label: "日本語", on: true },
  { code: "en", label: "English", on: true },
  { code: "zh", label: "中文", on: false },
  { code: "ko", label: "한국어", on: false },
];

export default function SettingsPage() {
  const [langs, setLangs] = React.useState(languages);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<SettingsIcon className="h-5 w-5" />}
        title="設定"
        description="ホテル情報・外部連携・多言語対応を設定します"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ホテル情報 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-600" /> ホテル情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>ホテル名</Label>
              <Input defaultValue={HOTEL_NAME} />
            </div>
            <div>
              <Label>チェックイン時間</Label>
              <Input defaultValue="15:00" />
            </div>
            <div>
              <Label>チェックアウト時間</Label>
              <Input defaultValue="11:00" />
            </div>
            <div>
              <Label>代表電話</Label>
              <Input defaultValue="045-111-0000" />
            </div>
          </CardContent>
        </Card>

        {/* 外部連携 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5 text-brand-600" /> 外部サービス連携
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {integrations.map((it) => (
                <div
                  key={it.name}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      it.connected ? "bg-brand-50 text-brand-600" : "bg-slate-100 text-slate-400"
                    )}
                  >
                    <it.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">{it.name}</p>
                    </div>
                    <p className="text-xs text-slate-500">{it.desc}</p>
                    <div className="mt-1.5">
                      {it.connected ? (
                        <Badge tone="green" dot>連携中</Badge>
                      ) : it.planned ? (
                        <Badge tone="amber">近日対応予定</Badge>
                      ) : (
                        <Badge tone="slate">未連携</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              ※ 各連携はAPIキーを登録するだけで有効化できる構成です。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 多言語 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-brand-600" /> 多言語音声案内
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-slate-500">
            有効にした言語で、AI音声コンシェルジュが宿泊客に自動応答します。
          </p>
          <div className="flex flex-wrap gap-3">
            {langs.map((l, idx) => (
              <button
                key={l.code}
                onClick={() =>
                  setLangs((p) => p.map((x, i) => (i === idx ? { ...x, on: !x.on } : x)))
                }
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                  l.on
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    l.on ? "bg-emerald-500" : "bg-slate-300"
                  )}
                />
                {l.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
