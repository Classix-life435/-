import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoxaLink Workforce｜人財DXプラットフォーム",
  description:
    "採用・入社・教育・労務・定着までをひとつに束ねる、人事部のためのAI人財DX管理プラットフォーム",
};

// ルートレイアウトは html/body のみを定義する。
// 画面ごとのナビゲーション等は各ルートグループのレイアウトで持つ。
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
