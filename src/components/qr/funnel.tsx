"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import type { FunnelStage } from "@/lib/qr/compute";
import { formatPercent } from "@/lib/qr/compute";

const stageColor: Record<FunnelStage["key"], string> = {
  question: "#1e293b", // slate-800（ネイビー基調）
  deepened: "#14b8a6", // teal-500
  interview: "#0d9488", // teal-600
};

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.count || 1;
  const data = stages.map((s) => ({
    ...s,
    name: s.label,
    pct: s.count / top,
  }));

  return (
    <div>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 56, left: 8, bottom: 0 }}
            barCategoryGap="28%"
          >
            <XAxis type="number" hide domain={[0, top]} />
            <YAxis
              type="category"
              dataKey="name"
              width={116}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#334155", fontSize: 13, fontWeight: 600 }}
            />
            <Bar dataKey="count" radius={[4, 4, 4, 4]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.key} fill={stageColor[d.key]} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                formatter={(v: number) => `${v}件`}
                style={{ fill: "#0f172a", fontSize: 13, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 各段の補足 + 全体比 */}
      <div className="mt-1 grid grid-cols-3 gap-2 text-center">
        {data.map((s) => (
          <div key={s.key}>
            <p className="text-[11px] font-medium text-slate-500">
              {s.sublabel}
            </p>
            <p className="text-xs font-semibold text-teal-600">
              全体の {formatPercent(s.pct)}
            </p>
          </div>
        ))}
      </div>

      {/* 「疑問は解消したのに面接に進まず帰った」層を明示 */}
      <FunnelInsight stages={stages} />
    </div>
  );
}

function FunnelInsight({ stages }: { stages: FunnelStage[] }) {
  const deepened = stages.find((s) => s.key === "deepened")?.count ?? 0;
  const interview = stages.find((s) => s.key === "interview")?.count ?? 0;
  const resolvedButLeft = Math.max(deepened - interview, 0);
  if (resolvedButLeft <= 0) return null;
  const rate = deepened > 0 ? resolvedButLeft / deepened : 0;

  return (
    <div className="mt-4 rounded-xl bg-orange-50 px-4 py-3 ring-1 ring-inset ring-orange-200">
      <p className="text-sm text-orange-800">
        <span className="font-bold">{resolvedButLeft}人</span>
        （深く対話した人の {formatPercent(rate)}）が
        <span className="font-bold">疑問は解消したのに面接へ進まず</span>
        帰っています。求人条件そのものの見直し余地があります。
      </p>
    </div>
  );
}
