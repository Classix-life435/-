import { Sparkles } from "lucide-react";
import { StagePageHeader } from "@/components/stage-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseStatusBadge } from "@/components/ui/status-badge";
import { enrollments } from "@/lib/mock-data";
import { courseStatusMeta } from "@/lib/status";
import { formatDate } from "@/lib/utils";
import type { CourseStatus } from "@/lib/types";

const order: CourseStatus[] = ["notStarted", "inProgress", "completed"];

export default function LearningPage() {
  const counts = order.map((st) => ({
    st,
    label: courseStatusMeta[st].label,
    n: enrollments.filter((e) => e.status === st).length,
  }));

  return (
    <div>
      <StagePageHeader stage="learning" />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {counts.map((c) => (
          <div key={c.st} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-slate-800">{c.n}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>受講状況一覧</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-5 py-2 font-medium">受講者</th>
                  <th className="px-3 py-2 font-medium">コース</th>
                  <th className="px-3 py-2 font-medium">区分</th>
                  <th className="px-3 py-2 font-medium">進捗</th>
                  <th className="px-3 py-2 font-medium">ステータス</th>
                  <th className="px-5 py-2 font-medium">期限</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{e.employeeName}</td>
                    <td className="px-3 py-3 text-slate-600">{e.courseName}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{e.category}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-violet-500" style={{ width: `${e.progress}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{e.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <CourseStatusBadge value={e.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDate(e.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-violet-600">
        <Sparkles className="h-3.5 w-3.5" />
        Jobルール365 / LMS で学習管理を一元化。仕事のルールや研修をいつでも学べます。
      </p>
    </div>
  );
}
