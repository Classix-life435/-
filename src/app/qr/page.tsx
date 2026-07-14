import {
  MessageCircleQuestion,
  CalendarCheck,
  TrendingDown,
  Globe,
  Info,
} from "lucide-react";
import { SummaryCard } from "@/components/qr/summary-card";
import { DropRateTable } from "@/components/qr/drop-rate-table";
import { Funnel } from "@/components/qr/funnel";
import {
  buildDashboardSummary,
  buildQuestionInsights,
  buildFunnel,
  formatPercent,
} from "@/lib/qr/compute";
import { QR_NOW, qrCurrentUser } from "@/lib/qr/mock-data";

export default function QrDashboardPage() {
  const summary = buildDashboardSummary();
  const insights = buildQuestionInsights();
  const funnel = buildFunnel();

  const month = QR_NOW.getMonth() + 1;
  const worst = insights[0];

  return (
    <div className="space-y-6">
      {/* 見出し */}
      <div>
        <p className="text-xs font-semibold text-teal-600">
          {month}月のレポート
        </p>
        <h1 className="mt-0.5 text-2xl font-bold text-slate-900">
          応募しなかった人は、何に迷って帰ったのか
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {qrCurrentUser.name} さん、離脱率の高い質問ほど「求人票を直すべき箇所」です。
        </p>
      </div>

      {/* 上部：サマリーカード（4枚） */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="今月の総質問数"
          value={summary.totalQuestions}
          unit="件"
          tone="navy"
          icon={<MessageCircleQuestion className="h-5 w-5" />}
          hint="AI質問対応は無料・無制限"
        />
        <SummaryCard
          label="面接まで進んだ数"
          value={summary.reachedInterview}
          unit="件"
          tone="teal"
          icon={<CalendarCheck className="h-5 w-5" />}
          hint={`面接成立 ${summary.interviewsSettled} 件（3ターン以上）`}
        />
        <SummaryCard
          label="全体離脱率"
          value={formatPercent(summary.overallDropRate)}
          tone="orange"
          icon={<TrendingDown className="h-5 w-5" />}
          hint="質問したのに面接へ進まなかった割合"
        />
        <SummaryCard
          label="外国人求職者の質問"
          value={summary.foreignQuestions}
          unit="件"
          tone="slate"
          icon={<Globe className="h-5 w-5" />}
          hint="多言語対応で取りこぼしを防げます"
        />
      </div>

      {/* 中央：離脱理由テーブル（主役） */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              離脱理由ランキング
            </h2>
            <p className="text-xs text-slate-500">
              離脱率の高い順。赤い行から手をつけてください。
            </p>
          </div>
        </div>

        {worst && (
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-inset ring-rose-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              いま最も取りこぼしているのは
              <span className="font-bold">「{worst.category}」</span>
              （離脱率 {formatPercent(worst.dropRate)}／{worst.jobCategory}）。
              {worst.needsMultilingual
                ? "外国人からの質問が来ているのに離脱率が高く、多言語対応で改善が見込めます。"
                : "求人票のこの項目を具体化するだけで応募が増える可能性があります。"}
            </p>
          </div>
        )}

        <DropRateTable insights={insights} />
      </section>

      {/* 下部：質問→面接ファネル */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-800">
            質問 → 面接ファネル
          </h2>
          <p className="text-xs text-slate-500">
            どこで人が減っているか。落差の大きい段が改善ポイントです。
          </p>
        </div>
        <Funnel stages={funnel} />
      </section>
    </div>
  );
}
