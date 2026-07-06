import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RAGNIZE 教材ジェネレーター',
  description: '台本→スライド→音声→動画→Vimeo→LMS を自動化する教材生成アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
