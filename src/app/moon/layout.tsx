import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "月星座占い｜マドモアゼル･ai監修ロジックに基づく診断",
  description:
    "許諾済み・監修済みの知見をもとに構成された月星座診断（MVP）。承認済みナレッジのみを表示します。",
};

// 月星座占いは workforce 管理画面とは独立した、最小限のレイアウトで表示する。
export default function MoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">{children}</div>
    </div>
  );
}
