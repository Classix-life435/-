import type { Metadata } from "next";
import { QrSidebar } from "@/components/qr/qr-sidebar";
import { QrHeader } from "@/components/qr/qr-header";

export const metadata: Metadata = {
  title: "QR Phone 面接｜採用ダッシュボード",
  description:
    "応募しなかった人が、何に迷って帰ったのか。離脱理由を一枚で可視化する採用担当者向けダッシュボード。",
};

// QR Phone 面接のシェル。非エンジニアの採用担当が使う、落ち着いた業務ツール。
export default function QrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <QrSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <QrHeader />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
