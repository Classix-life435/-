import { stageIcons } from "@/components/stage-icon";
import { stageById } from "@/lib/status";
import type { StageId } from "@/lib/types";

/** 各モジュール画面の共通ヘッダー（ステージ色のヒーロー + 製品タグ） */
export function StagePageHeader({ stage }: { stage: StageId }) {
  const meta = stageById[stage];
  const Icon = stageIcons[stage];

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.chip}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">{meta.no}</span>
            <h1 className="text-xl font-bold text-slate-800">{meta.label}</h1>
            <span className="text-xs font-medium text-slate-400">{meta.en}</span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{meta.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {meta.products.map((p) => (
              <span
                key={p}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ring-slate-200 ${meta.chip}`}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
