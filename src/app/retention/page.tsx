import { Sparkles } from "lucide-react";
import { StagePageHeader } from "@/components/stage-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsultTypeBadge, MoodBadge } from "@/components/ui/status-badge";
import { consultations } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

export default function RetentionPage() {
  const scored = consultations.filter((c) => c.type !== "harassment");
  const avg = scored.length
    ? Math.round(scored.reduce((sum, c) => sum + c.engagement, 0) / scored.length)
    : 0;
  const risk = consultations.filter((c) => c.mood === "risk").length;
  const harassment = consultations.filter((c) => c.type === "harassment").length;

  return (
    <div>
      <StagePageHeader stage="retention" />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
          <p className="text-2xl font-bold text-slate-800">{avg}</p>
          <p className="text-xs text-slate-500">平均エンゲージメント</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center shadow-card">
          <p className="text-2xl font-bold text-rose-600">{risk}</p>
          <p className="text-xs text-rose-700">要フォロー</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
          <p className="text-2xl font-bold text-slate-800">{harassment}</p>
          <p className="text-xs text-slate-500">ハラスメント相談</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>社員エンゲージメント / 相談</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-5 py-2 font-medium">社員</th>
                  <th className="px-3 py-2 font-medium">種別</th>
                  <th className="px-3 py-2 font-medium">状態</th>
                  <th className="px-3 py-2 font-medium">スコア</th>
                  <th className="px-3 py-2 font-medium">AI要約</th>
                  <th className="px-5 py-2 font-medium">日時</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{c.employeeName}</td>
                    <td className="px-3 py-3">
                      <ConsultTypeBadge value={c.type} />
                    </td>
                    <td className="px-3 py-3">
                      <MoodBadge value={c.mood} />
                    </td>
                    <td className="px-3 py-3">
                      {c.type === "harassment" ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${c.engagement >= 60 ? "bg-emerald-500" : "bg-rose-500"}`}
                              style={{ width: `${c.engagement}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{c.engagement}</span>
                        </div>
                      )}
                    </td>
                    <td className="max-w-xs px-3 py-3 text-xs text-slate-500">{c.summary}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDateTime(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-rose-600">
        <Sparkles className="h-3.5 w-3.5" />
        ナツメアイHRがエンゲージメントを可視化。社員相談AI・ハラスメント相談AIが日々の不安をサポートします。
      </p>
    </div>
  );
}
