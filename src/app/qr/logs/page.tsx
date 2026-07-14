import { Suspense } from "react";
import { ConversationLogView } from "@/components/qr/conversation-log-view";

// useSearchParams を使うため Suspense 境界で包む（静的書き出し対応）
export default function QrLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-slate-400">
          読み込み中…
        </div>
      }
    >
      <ConversationLogView />
    </Suspense>
  );
}
