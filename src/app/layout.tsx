import type { Metadata } from "next";
import "./globals.css";

// ルートレイアウトは html/body のみを担当する薄い層。
// 各プロダクト（VoxaLink Workforce / QR Phone 面接）は
// それぞれのルートグループで独自のシェル（レイアウト）を持つ。
export const metadata: Metadata = {
  title: "VoxaLink Workforce｜人財DXプラットフォーム",
  description:
    "採用・入社・教育・労務・定着までをひとつに束ねる、人事部のためのAI人財DX管理プラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
