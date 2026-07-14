import {
  CreditCard,
  Receipt,
  Infinity as InfinityIcon,
  Check,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildBilling, formatYen, formatPercent } from "@/lib/qr/compute";
import { account, FREE_QUOTA, PLAN_UNIT_PRICE } from "@/lib/qr/mock-data";
import type { Plan } from "@/lib/qr/types";

const planMeta: Record<
  Plan,
  { label: string; price: string; note: string; unit: number }
> = {
  free: {
    label: "Free",
    price: "¥0",
    note: `面接成立 ${FREE_QUOTA}回まで無料`,
    unit: PLAN_UNIT_PRICE.standard,
  },
  standard: {
    label: "Standard",
    price: "¥300 / 面接",
    note: "小〜中規模の採用に",
    unit: PLAN_UNIT_PRICE.standard,
  },
  business: {
    label: "Business",
    price: "¥200 / 面接",
    note: "面接が多い企業ほどお得",
    unit: PLAN_UNIT_PRICE.business,
  },
};

export default function QrBillingPage() {
  const b = buildBilling();
  const current = account.plan;
  const savingWithBusiness = b.standardCost - b.businessCost;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">利用状況・課金</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          課金対象は「面接成立（3ターン以上の対話）」のみ。AIの質問対応は無料・無制限です。
        </p>
      </div>

      {/* 現在のプラン & 今月の請求 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-300">現在のプラン</p>
            <CreditCard className="h-5 w-5 text-teal-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-teal-300">
            {planMeta[current].label}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {planMeta[current].price}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              今月の面接成立回数
            </p>
            <Receipt className="h-5 w-5 text-teal-600" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {b.interviewsThisMonth}
            <span className="ml-1 text-sm font-medium text-slate-400">回</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            3ターン以上の対話＝課金対象
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">概算請求額</p>
            <span className="text-xs font-medium text-slate-400">
              {formatYen(b.unitPrice)} × {b.billableCount}
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-orange-600">
            {formatYen(b.estimatedAmount)}
          </p>
          <p className="mt-1 text-xs text-slate-400">今月分（税抜・概算）</p>
        </div>
      </div>

      {/* Free 無料枠の消化バー（Freeプランのとき／仕組みの説明として常時掲載） */}
      <FreeQuota
        used={b.freeQuotaUsed}
        remaining={b.freeQuotaRemaining}
        quota={b.freeQuota}
        isCurrent={current === "free"}
      />

      {/* Business アップグレード提案 */}
      <div
        className={cn(
          "rounded-2xl border p-5 shadow-card",
          b.suggestBusiness
            ? "border-orange-300 bg-orange-50"
            : "border-slate-200 bg-white"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              b.suggestBusiness
                ? "bg-orange-500 text-white"
                : "bg-teal-50 text-teal-600"
            )}
          >
            {b.suggestBusiness ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">
              {b.suggestBusiness
                ? "Businessプランの方が安くなります"
                : "プラン最適化"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              現在の面接成立 {b.interviewsThisMonth}回の場合、
              Standardは {formatYen(b.standardCost)}、
              Businessは {formatYen(b.businessCost)}。
              {b.suggestBusiness ? (
                <>
                  {" "}
                  Businessに切り替えると月{" "}
                  <span className="font-bold text-orange-700">
                    {formatYen(savingWithBusiness)}
                  </span>{" "}
                  お得です。
                </>
              ) : (
                <>
                  {" "}
                  面接成立が月{" "}
                  <span className="font-semibold">
                    {b.businessBreakeven}回
                  </span>{" "}
                  に近づくとBusiness（¥200/回）が割安になります。現在はStandardが最適です。
                </>
              )}
            </p>
          </div>
          {b.suggestBusiness && (
            <button className="shrink-0 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
              Businessへ変更
            </button>
          )}
        </div>
      </div>

      {/* プラン比較 */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-slate-700">プラン比較</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(planMeta) as Plan[]).map((p) => (
            <PlanCard key={p} plan={p} current={current} />
          ))}
        </div>
      </section>

      {/* 料金の仕組み */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="mb-3 text-sm font-bold text-slate-700">料金の仕組み</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <InfinityIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span>
              <span className="font-semibold text-slate-800">
                AIの質問対応は無料・無制限。
              </span>
              質問が何件増えても請求額には影響しません。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span>
              <span className="font-semibold text-slate-800">
                課金対象は面接成立（3ターン以上の対話）のみ。
              </span>
              1〜2ターンで離脱した会話は課金されません。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span>
              面接単価：Standard {formatYen(PLAN_UNIT_PRICE.standard)}／回、
              Business {formatYen(PLAN_UNIT_PRICE.business)}／回。
              Freeは {FREE_QUOTA}回まで無料、31回目から課金が始まります。
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function FreeQuota({
  used,
  remaining,
  quota,
  isCurrent,
}: {
  used: number;
  remaining: number;
  quota: number;
  isCurrent: boolean;
}) {
  const pct = Math.min((used / quota) * 100, 100);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-800">
            Free 無料枠（面接成立 {quota}回）
            {!isCurrent && (
              <span className="ml-2 text-[11px] font-medium text-slate-400">
                ※Freeプランの仕組み
              </span>
            )}
          </p>
          <p className="text-xs text-slate-400">
            31回目から課金が始まります（超過分 {formatYen(PLAN_UNIT_PRICE.standard)}／回）
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {isCurrent ? (
            <>
              残り <span className="text-teal-600">{remaining}</span> 回
            </>
          ) : (
            <span className="text-slate-400">{quota}回まで無料</span>
          )}
        </p>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 100 ? "bg-orange-500" : "bg-teal-500"
          )}
          style={{ width: `${isCurrent ? pct : 0}%` }}
        />
      </div>
    </div>
  );
}

function PlanCard({ plan, current }: { plan: Plan; current: Plan }) {
  const m = planMeta[plan];
  const active = plan === current;
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-card",
        active
          ? "border-teal-400 bg-teal-50/40 ring-1 ring-inset ring-teal-200"
          : "border-slate-200 bg-white"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-slate-800">{m.label}</p>
        {active && (
          <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[11px] font-semibold text-white">
            利用中
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        {m.price}
      </p>
      <p className="mt-1 text-xs text-slate-500">{m.note}</p>
    </div>
  );
}
