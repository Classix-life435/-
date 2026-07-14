import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

// VoxaLink Workforce（人財DXプラットフォーム）のシェル。
// サイドバー＋ヘッダーを持つ既存アプリのレイアウト。
export default function WorkforceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
