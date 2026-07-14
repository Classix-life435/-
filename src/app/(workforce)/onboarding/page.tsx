import { Sparkles } from "lucide-react";
import { StagePageHeader } from "@/components/stage-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractStatusBadge, ContractTypeBadge } from "@/components/ui/status-badge";
import { contracts } from "@/lib/mock-data";
import { contractStatusMeta } from "@/lib/status";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { ContractStatus } from "@/lib/types";

const order: ContractStatus[] = ["draft", "sent", "signed", "completed"];

export default function OnboardingPage() {
  const counts = order.map((st) => ({
    st,
    label: contractStatusMeta[st].label,
    n: contracts.filter((c) => c.status === st).length,
  }));

  return (
    <div>
      <StagePageHeader stage="onboarding" />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map((c) => (
          <div key={c.st} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-slate-800">{c.n}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>電子契約一覧</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-5 py-2 font-medium">対象者</th>
                  <th className="px-3 py-2 font-medium">書類種別</th>
                  <th className="px-3 py-2 font-medium">入社予定日</th>
                  <th className="px-3 py-2 font-medium">ステータス</th>
                  <th className="px-5 py-2 font-medium">送付日時</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <span className="font-semibold text-slate-800">{c.employeeName}</span>
                      <span className="block text-xs text-slate-400">{c.id}</span>
                    </td>
                    <td className="px-3 py-3">
                      <ContractTypeBadge value={c.type} />
                    </td>
                    <td className="px-3 py-3 text-slate-600">{formatDate(c.joinDate)}</td>
                    <td className="px-3 py-3">
                      <ContractStatusBadge value={c.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDateTime(c.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-brand-600">
        <Sparkles className="h-3.5 w-3.5" />
        雇用契約・労働条件通知をオンラインで完結。入社手続きをスムーズに支援します。
      </p>
    </div>
  );
}
