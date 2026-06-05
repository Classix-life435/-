# VoxaLink Workforce

**採用・入社・教育・労務・定着をひとつに束ねる、人財DXプラットフォームの統一管理画面**

人事部の担当者が、採用（01）→入社（02）→教育（03）→労務（04）→定着（05）までの
人財ライフサイクルを、ひとつのダッシュボードから横断的に管理できる
SaaS型の統一管理画面です。各モジュールのAIエージェントの稼働状況も一元的に確認できます。

> 株式会社RAGNIZE「VoxaLink Workforce」の製品構成（採用〜定着の5モジュール）を
> もとにした、簡易的な統一管理画面のUIデモです。

## 技術スタック

- **Next.js 14**（App Router）/ **TypeScript**
- **Tailwind CSS**（shadcn/ui スタイルの自作UIコンポーネント）
- **lucide-react**（アイコン）
- データは `src/lib/mock-data.ts` のモックデータ。
  型定義（`src/lib/types.ts`）はそのままAPIレスポンス型として再利用でき、API接続しやすい構造。

## 公開URL（GitHub Pages）

`main` にプッシュすると、GitHub Actions が自動でビルドし GitHub Pages に公開します。
公開先URL:

**https://classix-life435.github.io/-/**

> 初回はリポジトリの **Settings → Pages → Source** が「GitHub Actions」に
> なっている必要があります（ワークフローが自動で有効化を試みます）。
> Actions タブの「Deploy to GitHub Pages」完了後にURLが有効になります。

## セットアップ（ローカル）

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 静的書き出し（out/ に生成）
```

## 画面構成

| パス | 画面 | 内容 |
| --- | --- | --- |
| `/` | 統一ダッシュボード | 人財ライフサイクル（採用→定着）のパイプライン、主要KPI、横断アクティビティ、AIエージェント稼働状況、導入効果 |
| `/recruit` | 01 採用 | VoxaLink Entrance：応募者一覧・選考ステータス・AIマッチ度・AI面接 |
| `/onboarding` | 02 入社 | 電子契約：雇用契約／労働条件通知の作成・送付・署名状況 |
| `/learning` | 03 教育 | Jobルール365／LMS：研修の受講状況・進捗・期限管理 |
| `/hr` | 04 労務 | 就業規則AI／総務AI／人事AI：問い合わせ・タスクのAI一次対応状況 |
| `/retention` | 05 定着 | ナツメアイHR／社員相談AI／ハラスメント相談AI：エンゲージメント可視化・相談管理 |

## ディレクトリ構成

```
src/
  app/
    page.tsx            統一ダッシュボード
    recruit/            01 採用
    onboarding/         02 入社
    learning/           03 教育
    hr/                 04 労務
    retention/          05 定着
  components/
    layout/             サイドバー・ヘッダー
    ui/                 Card / Button / Badge / Input / Modal などの共通UI
    dashboard/          ダッシュボード用パーツ
    stage-icon.tsx      ステージ→アイコンのマッピング
    stage-page-header.tsx  各モジュール共通のヘッダー
  lib/
    types.ts            ドメイン型定義（API連携時の型として再利用可能）
    mock-data.ts        モックデータ
    status.ts           ステージ定義・ステータス → ラベル/色 のマッピング
    utils.ts            日付などのユーティリティ
```

## 設計のポイント

- **統一画面**：5モジュール（採用〜定着）を1つのナビゲーションと共通UIで束ね、
  ダッシュボードから各ステージの件数・状況を横断的に把握できる。
- **ステージ駆動の構成**：`src/lib/status.ts` の `STAGES` 定義（番号・色・製品名）が
  サイドバー・ダッシュボード・各モジュールヘッダーの単一の情報源（Single Source of Truth）。
- **AIエージェントの可視化**：各モジュールのAI（AI応募受付・就業規則AI 等）の
  稼働状況とAI一次対応率をダッシュボードに集約。

> 現時点ではすべてモックデータで動作します。各AI機能・各業務システムは API 接続前提の構成です。
