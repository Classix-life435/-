import Generator from '@/components/Generator';
import { listPrograms, isSupabaseConfigured } from '@/lib/supabase';

// 環境変数を読むためリクエスト毎に評価
export const dynamic = 'force-dynamic';

export default async function Page() {
  const programs = await listPrograms();
  const supabaseReady = isSupabaseConfigured();

  return (
    <div className="container">
      <div className="header">
        <h1>RAGNIZE 教材ジェネレーター</h1>
        <p>教材内容を入力 → 台本・スライド・音声・動画・Vimeo・LMS登録までを自動化</p>
      </div>

      {!supabaseReady && (
        <div className="notice">
          Supabase が未設定です。プログラム一覧の取得と LMS 排出はスキップされます（
          <code>NEXT_PUBLIC_SUPABASE_URL</code> / <code>SUPABASE_SERVICE_ROLE_KEY</code> を設定）。
          台本生成など他の工程はそのまま動作します。
        </div>
      )}

      <Generator programs={programs} />
    </div>
  );
}
