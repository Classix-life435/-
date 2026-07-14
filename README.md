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

---

## QR Phone 面接（採用担当向けダッシュボード）

採用ページに常駐するAI窓口「QR Phone 面接」の、**採用担当者（非エンジニア）向け管理画面**です。
売りは面接機能そのものではなく、**「応募しなかった人が、何に迷って帰ったのか」を一枚で可視化する**こと。
この画面を見た瞬間に「求人票のどこを直すべきか」が分かることをゴールにしています。

VoxaLink Workforce とは独立したプロダクトのため、`/qr` 以下に**専用のシェル（ネイビー基調＋
ティール／オレンジ）** を持ちます。ヘッダー右の「Workforce」からいつでも人財DX側へ戻れます。

### 画面構成

| パス | 画面 | 内容 |
| --- | --- | --- |
| `/qr` | ダッシュボード（本体） | サマリーカード4枚／**離脱理由ランキング**（ソート・赤強調・クリック遷移・多言語ヒント）／質問→面接ファネル |
| `/qr/logs` | 会話ログ一覧・詳細 | 面接成立(3ターン以上)と離脱を区別、会話の中身とA-CQSスコア、職種／言語／期間フィルタ |
| `/qr/billing` | 利用状況・課金 | 現在プラン、今月の面接成立回数と概算請求額、Free無料枠バー、Businessアップグレード提案 |

### 数字の定義

- **面接成立＝3ターン以上の対話**。これだけが課金対象（1〜2ターンの離脱は課金しない）
- **離脱率＝1 −（面接へ進んだ数 ÷ 質問した数）**
- **AIの質問対応は無料・無制限**（質問が増えても請求額に影響しない）
- 面接単価：Standard ¥300／回、Business ¥200／回、Free は30回まで無料

### ディレクトリ

```
src/
  app/
    (workforce)/        VoxaLink Workforce（既存アプリ・専用レイアウト）
    qr/
      layout.tsx        QR Phone 面接 専用シェル
      page.tsx          ダッシュボード（画面1）
      logs/page.tsx     会話ログ（画面2）
      billing/page.tsx  利用状況・課金（画面3）
  components/qr/        QR Phone 専用UI（離脱テーブル・ファネル・A-CQS 等）
  lib/qr/
    types.ts            ドメイン型（API連携時の型として再利用可能）
    mock-data.ts        モックデータ（10カテゴリ・数十件の会話）
    compute.ts          集計ロジック（離脱率・ファネル・課金の定義を一元化）
```

> データは `src/lib/qr/mock-data.ts` のモック。型（`src/lib/qr/types.ts`）を
> そのままAPIレスポンス型として差し替えられる構造です。
