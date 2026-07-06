# RAGNIZE 動画合成ワーカー

スライド＋ナレーション音声から MP4 を合成する、独立デプロイの HTTP ワーカーです。
本体アプリ（`../`）の `lib/video.ts` が `RENDER_WORKER_URL` に対してこのワーカーを叩きます。

Vercel の関数タイムアウトを避けるため、動画合成は**必ず本体とは別プロセス**で行う設計です。

## 仕組み

1. 台本の各シーン（タイトル → 各セグメント → まとめ）を HTML で組み、**Playwright（Chromium）でPNG化**
2. 各シーンのPNGと**ナレーション音声（mp3）を ffmpeg で結合**してクリップ化
   （音声が無いシーンは尺を見積もって無音クリップ）
3. 全クリップを **concat して1本の MP4** に
4. 出力を配信し、`{ url, durationSec }` を返す

## HTTP 契約

```
POST /
  body: { script, slides, audio }
    - script.segments[].{ heading, bullets, narration }
    - audio.segmentUrls: string[]  … [導入, 各セグメント, まとめ] の順（data URL / http URL）
  res:  { url, durationSec }

GET /health → { ok: true }
GET /videos/<id>.mp4 → 合成済み動画
```

## 前提

- **Node.js 18+**
- **ffmpeg 本体**（libx264 / aac エンコーダ必須）。`FFMPEG_PATH` で明示指定可。
  ※ Playwright 同梱の ffmpeg は VP8/webm のみで H.264/AAC 非対応のため使えません。
- Playwright の Chromium（`npx playwright install chromium`。既に導入済みなら
  `PLAYWRIGHT_BROWSERS_PATH` を参照）

## 起動

```bash
cd worker
npm install
# ffmpeg がPATHにあればそのまま。無ければ FFMPEG_PATH を指定。
FFMPEG_PATH=/usr/bin/ffmpeg PORT=4000 npm start
```

本体アプリ側の `.env.local` に、このワーカーのURLを設定：

```
RENDER_WORKER_URL=http://localhost:4000
```

## 環境変数

| 変数 | 既定 | 説明 |
|---|---|---|
| `PORT` | `4000` | 待受ポート |
| `FFMPEG_PATH` | `ffmpeg` | ffmpeg 実行ファイル |
| `CHROMIUM_PATH` | （自動） | Chromium 実行ファイルを明示指定（Playwright の同梱版と別のChromiumを使う場合） |
| `OUTPUT_DIR` | `./output` | MP4 の保存先 |
| `PUBLIC_BASE_URL` | `http://localhost:PORT` | 返却URLのベース。Vimeo は pull 方式でこのURLを取得するため**外部から到達可能なURL**にすること |

## 本番化のポイント

- 出力は **S3 / Supabase Storage 等へアップロード**し、その公開URLを返す（Vimeo pull 用）。
- 長尺・多本数なら本体の `generation_jobs` テーブル（`../supabase/schema.sql`）で
  **キュー化**し、このワーカーをジョブ消費側にする。
- Chromium/ffmpeg 入りの Docker イメージ（例: `mcr.microsoft.com/playwright`）での運用を推奨。
