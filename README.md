# Hotel Voice Concierge

**予約・問い合わせ・音声案内をひとつにまとめるホテルフロントAI管理システム**

ホテルのフロントスタッフが、電話予約・宿泊管理・宿泊客からの問い合わせ対応・
音声AI案内をひとつの管理画面で操作できる、販売を見据えたSaaS型管理画面です。

## 技術スタック

- **Next.js 14**（App Router）/ **TypeScript**
- **Tailwind CSS**（shadcn/ui スタイルの自作UIコンポーネント）
- **lucide-react**（アイコン）
- データは `src/lib/mock-data.ts` のモックデータ。
  型定義（`src/lib/types.ts`）はそのままAPIレスポンス型として再利用でき、API接続しやすい構造。

## セットアップ

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 本番ビルド
```

## 画面構成

| パス | 画面 | 内容 |
| --- | --- | --- |
| `/` | ダッシュボード | 本日の業務状況、各種KPIカード、緊急問い合わせ、AI音声ステータス、直近の予約/問い合わせ |
| `/reservations` | 電話予約スケジューリング | 予約一覧・検索/絞り込み・新規登録フォーム・詳細パネル・チェックイン/アウト/キャンセル |
| `/calendar` | 宿泊カレンダー | 部屋×日付のタイムライン。予約バーをステータス色で表示 |
| `/inquiries` | 問い合わせ対応 | ステータス/優先度/カテゴリ管理、担当割当、AI回答確認、人間対応切替、対応メモ |
| `/voice-ai` | 音声AIログ | STT変換テキスト・AI回答・TTS再生（モック）・会話ログ・エスカレーション |
| `/knowledge` | ナレッジ管理 | 回答文・音声案内用テキスト・公開/非公開・AI利用ON/OFF・音声プレビュー |
| `/rooms` | 客室管理 | 客室ステータス（空室/宿泊中/清掃中ほか）、清掃・メンテナンス更新 |
| `/staff` | スタッフ管理 | 役割・権限・勤務ステータス・対応中問い合わせ件数 |
| `/settings` | 設定 | ホテル情報、外部連携（Twilio/STT/TTS/LLM/PMS/Stripe/LINE/Slack）、多言語音声案内 |

## ディレクトリ構成

```
src/
  app/                  各画面（App Router）
  components/
    layout/             サイドバー・ヘッダー
    ui/                 Card / Button / Badge / Input / Modal などの共通UI
    dashboard/          ダッシュボード用パーツ
  lib/
    types.ts            ドメイン型定義（API連携時の型として再利用可能）
    mock-data.ts        モックデータ
    status.ts           ステータス → ラベル/色 のマッピング
    utils.ts            日付・通貨などのユーティリティ
```

## 将来拡張を想定した設計

- 電話システム（Twilio）/ STT / TTS / LLM API / ホテル内ナレッジDB への接続を前提とした構造
- PMS・予約サイト（OTA）連携、Stripe決済連携
- 多言語音声案内（日本語・英語・中国語・韓国語）
- LINE・客室QRコードからの問い合わせ受付、Slack/LINE WORKS通知
- 管理者/スタッフの権限分離、複数ホテル管理

> 現時点ではすべてモックデータで動作します。STT/TTS/LLM等は API 接続前提のモック実装です。
