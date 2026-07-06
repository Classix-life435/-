# RAGNIZE 教材ジェネレーター（本番アプリ）

教材の内容を入力すると、**台本 → スライド → 解説音声 → 動画 → Vimeoアップロード → LMS登録** までを自動化する Next.js アプリです。

## これは何か（正直な現状）

- フロント（生成UI）と、パイプラインの**オーケストレーション**、DBスキーマ、各サービスへの**接続コード**が入った、そのままデプロイして育てられる本番アプリです。
- **APIキーを入れた工程から順に本番稼働**します。キーが無い工程は自動でスキップ／モックになり、アプリ自体は動きます（何が本番接続で何が未接続かは結果画面の「排出」タブに表示）。

| 工程 | 実装 | 必要なもの |
|---|---|---|
| 台本・構成生成 | ✅ Claude API（未設定時はローカル生成） | `ANTHROPIC_API_KEY` |
| スライド生成 | 🔌 Canva Connect API（Autofill） | `CANVA_CONNECT_TOKEN` / `CANVA_BRAND_TEMPLATE_ID` |
| 解説音声(TTS) | 🔌 OpenAI音声（他社に差し替え可） | `OPENAI_API_KEY` |
| 動画合成 | 🔌 レンダーワーカーに委譲（Remotion/ffmpeg） | `RENDER_WORKER_URL` |
| Vimeoアップロード | ✅ Vimeo API（pull方式・限定公開） | `VIMEO_ACCESS_TOKEN` |
| LMS登録 | ✅ Supabase（programs/courses/lessons） | `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` |

## セットアップ

```bash
npm install
cp .env.example .env.local   # 値を埋める（持っているものだけでOK）
npm run dev                  # http://localhost:3000
```

Supabase を使う場合は `supabase/schema.sql` を実行してテーブルを作成します。

## デプロイ

- Vercel を推奨（Next.js App Router）。環境変数をVercelに設定してデプロイ。
- 動画合成は時間がかかるため、本番では `generation_jobs` を使って**キュー＋ワーカー**に分離することを推奨（Vercelの関数タイムアウト対策）。

## 動画の保護（Vimeo）

`VIMEO_ALLOWED_DOMAIN` に受講者サイトのドメインを設定すると、限定公開＋**そのドメインだけ埋め込み可**で作成します（有料講座の動画流出対策）。より強固にするなら Vimeo の上位プランや署名付き埋め込み、あるいはDRM対応サービスを検討してください。

## 構成

```
app/
  page.tsx                 入口（プログラム一覧を取得してUI表示）
  api/generate/route.ts    生成パイプライン実行
  api/publish/route.ts     LMSへ排出（下書き登録）
components/Generator.tsx    生成UI（入力→進捗→プレビュー→排出）
lib/
  pipeline.ts  台本→スライド→音声→動画→Vimeo のオーケストレーション
  llm.ts       台本・構成生成（Claude / ローカル）
  slides.ts    Canva Connect（Autofill）
  tts.ts       解説音声（OpenAI音声 ほか）
  video.ts     動画合成ワーカー呼び出し
  vimeo.ts     Vimeoアップロード（限定公開）
  supabase.ts  LMS DB（プログラム取得・レッスン登録）
supabase/schema.sql        DBスキーマ＋初期データ
```

## 次のステップ

1. `ANTHROPIC_API_KEY` と Supabase を入れて、**台本生成＋LMS排出**をまず本番稼働
2. Canva の**ブランドテンプレート**を作り、`CANVA_BRAND_TEMPLATE_ID` を設定（スライド自動生成）
3. TTS（音声）と 動画ワーカー（Remotion等）を接続して、動画までフル自動化
4. 受講者アプリ／管理画面（既存のRAGNIZE LMS）と同じDBを共有
