import { Sparkles, Bot } from "lucide-react";
import { StagePageHeader } from "@/components/stage-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicantStatusBadge } from "@/components/ui/status-badge";
import { applicants } from "@/lib/mock-data";
import { applicantStatusMeta } from "@/lib/status";
import { formatDateTime } from "@/lib/utils";
import type { ApplicantStatus } from "@/lib/types";

const order: ApplicantStatus[] = ["applied", "screening", "interview", "offer", "rejected"];

export default function RecruitPage() {
  const counts = order.map((st) => ({
    st,
    label: applicantStatusMeta[st].label,
    n: applicants.filter((a) => a.status === st).length,
  }));

  return (
    <div>
      <StagePageHeader stage="recruit" />

      {/* 選考ステータス別サマリー */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {counts.map((c) => (
          <div key={c.st} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-slate-800">{c.n}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>応募者一覧</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-5 py-2 font-medium">応募者</th>
                  <th className="px-3 py-2 font-medium">応募職種</th>
                  <th className="px-3 py-2 font-medium">経路</th>
                  <th className="px-3 py-2 font-medium">AIマッチ度</th>
                  <th className="px-3 py-2 font-medium">ステータス</th>
                  <th className="px-5 py-2 font-medium">応募日時</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{a.name}</span>
                        {a.aiInterview && (
                          <span title="AI面接 実施済み" className="text-emerald-500">
                            <Bot className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{a.id}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{a.position}</td>
                    <td className="px-3 py-3 text-slate-600">{a.source}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${a.aiScore}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{a.aiScore}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <ApplicantStatusBadge value={a.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDateTime(a.appliedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600">
        <Sparkles className="h-3.5 w-3.5" />
        AI応募受付が24時間365日、応募対応を自動化。AIマッチ度で選考を効率化します。
      </p>
    </div>
  );
}
