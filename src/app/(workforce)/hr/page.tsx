import { Sparkles, Bot } from "lucide-react";
import { StagePageHeader } from "@/components/stage-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusBadge, HrCategoryBadge } from "@/components/ui/status-badge";
import { hrTasks } from "@/lib/mock-data";
import { taskStatusMeta } from "@/lib/status";
import { formatDateTime } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types";

const order: TaskStatus[] = ["open", "inProgress", "done"];

export default function HrPage() {
  const counts = order.map((st) => ({
    st,
    label: taskStatusMeta[st].label,
    n: hrTasks.filter((t) => t.status === st).length,
  }));
  const aiRate = Math.round(
    (hrTasks.filter((t) => t.aiHandled).length / hrTasks.length) * 100
  );

  return (
    <div>
      <StagePageHeader stage="hr" />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map((c) => (
          <div key={c.st} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-slate-800">{c.n}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center shadow-card">
          <p className="text-2xl font-bold text-amber-600">{aiRate}%</p>
          <p className="text-xs text-amber-700">AI一次対応率</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>労務・人事の問い合わせ / タスク</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-5 py-2 font-medium">内容</th>
                  <th className="px-3 py-2 font-medium">区分</th>
                  <th className="px-3 py-2 font-medium">起票者</th>
                  <th className="px-3 py-2 font-medium">AI対応</th>
                  <th className="px-3 py-2 font-medium">ステータス</th>
                  <th className="px-5 py-2 font-medium">起票日時</th>
                </tr>
              </thead>
              <tbody>
                {hrTasks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <span className="font-semibold text-slate-800">{t.title}</span>
                      <span className="block text-xs text-slate-400">{t.id}</span>
                    </td>
                    <td className="px-3 py-3">
                      <HrCategoryBadge value={t.category} />
                    </td>
                    <td className="px-3 py-3 text-slate-600">{t.requester}</td>
                    <td className="px-3 py-3">
                      {t.aiHandled ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <Bot className="h-3.5 w-3.5" /> 回答済み
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">未</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <TaskStatusBadge value={t.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDateTime(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
        <Sparkles className="h-3.5 w-3.5" />
        就業規則AI・総務AI・人事AIが問い合わせに即時回答。人事・労務業務を効率化します。
      </p>
    </div>
  );
}
