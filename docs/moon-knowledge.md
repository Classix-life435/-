# 月星座占い／マドモアゼル･ai 監修ナレッジ（MVP）

LINE登録済みユーザー向けの月星座占い・相性診断で、**一般的な占星術情報ではなく、許諾済み・監修済みのマドモアゼル･ai先生の知見だけ**を表示するための、ガバナンス優先の MVP 実装です。

> このリポジトリは静的サイト（Next.js static export → GitHub Pages）です。
> サーバー・DB・OCR・RAG・LINE Webhook を動かす基盤が無いため、本 MVP は
> **監修済みマスタを TS データとして持ち、承認済みのものだけを表示する**
> ナレッジ層に絞って実装しています（仕様書「MVPで最低限必要なこと」の方針）。

## 一番大事なルール

- **AI が「先生の知見」を勝手に創作しない。**
- 表示・生成に使ってよいのは `approvalStatus === "approved"` のデータだけ。
- `permissionStatus === "prohibited"` / `internal_only` の素材は公開表示しない。
- `quoteAllowed === false` の素材は原文引用しない。
- `summaryAllowed === true` の場合のみ要約・言い換えに使う。
- 承認済みデータが無い箇所は、一般論に逃げず「**現在準備中**」と表示する。
- 通常表示は「**マドモアゼル･ai監修ロジックに基づく診断**」。
  「先生がこう言っています」と断定するのは、出典が明確で `quoteAllowed` かつ
  `licensed`/`supervised` のときだけ。

> 出荷時、12 星座の診断文・相性は原則 `draft`（=準備中）の空テンプレートです。
> `aries`（月星座）と `aries × 恋愛` の上位3件だけ、**表示確認用の明示的な
> プレースホルダー**として `approved` にしてあります（先生固有の知見ではありません）。
> 本番投入前に、許諾済み・監修済みテキストへ差し替えてください。

## ファイル構成

| ファイル | 役割 | 仕様書のテーブル対応 |
| --- | --- | --- |
| `src/lib/moon/types.ts` | 型定義（DB スキーマ相当） | 全テーブル |
| `src/data/knowledgeSources.ts` | 出典・許諾マスタ | `astrology_knowledge_sources` / `knowledge_sources` |
| `src/data/moonSignKnowledge.ts` | 月星座別ナレッジ | `moon_sign_knowledge` / `moon_sign_master` |
| `src/data/moonCompatibilityMaster.ts` | 相性マスタ | `moon_compatibility_master` |
| `src/lib/moon/governance.ts` | 「表示してよいか」の判定（ガバナンスの単一入口） | — |
| `src/lib/moon/moonSign.ts` | 出生日時 → 月星座の計算 | — |
| `src/lib/moon/diagnosis.ts` | 診断文の組み立て（承認済みのみ・準備中フォールバック） | `generated_diagnosis_logs` |
| `src/lib/moon/logStore.ts` | 参照ナレッジIDのログ保存（MVP は localStorage） | `generated_diagnosis_logs` |
| `src/lib/moon/labels.ts` | 表示ラベル・注記・AI プロンプト制御 | — |
| `src/app/moon/page.tsx` | 診断フォーム＋結果表示（動作確認用） | — |

## 診断の処理フロー（diagnosis.ts）

仕様書「診断生成ルール」に対応：

1. ユーザーの月星座を計算（`calcMoonSign`）
2. 承認済み `moon_sign_knowledge` を取得
3. カテゴリ（恋愛/仕事/プライベート）ごとの承認済み `moon_compatibility_master` を取得
4. 承認済みデータだけで表示文を作る（無い箇所は「準備中」）
5. 参照した `knowledgeId` を `generated_diagnosis_logs` に保存
6. 承認済みデータが無い場合は該当箇所を「準備中」に

## 知見の追加・修正・承認の手順（運営／先生向け）

1. `src/data/knowledgeSources.ts` に出典を登録し、許諾状況を正しく設定する
   （`permissionStatus` / `quoteAllowed` / `summaryAllowed`）。許諾未確認の間は
   `permissionStatus: "prohibited"` のままにして、誤って表示されないようにする。
2. `src/data/moonSignKnowledge.ts` / `moonCompatibilityMaster.ts` の該当項目に
   監修済みの文面を記入し、`sourceId` を 1 の出典に紐付ける。
3. 監修者が内容を確認し、`approvalStatus` を `"approved"`、`approvedBy` /
   `approvedAt` を設定する。
4. これで初めて本番表示に反映される。未承認・空欄は自動的に「準備中」になる。

## 月星座の計算精度について

月は約 13°/日（2〜3 日で 1 星座）動くため、太陽星座と違い **出生時刻・出生地が必要**です。
`moonSign.ts` は Paul Schlyter の低精度公式を用い、誤差はおおむね 0.5° 以内
（既知の天体暦と照合済み：2000-01-01 00:00 UT で 217.3° / 参照 217.7°）。
星座の境界（カスプ）付近の出生では結果が前後し得るため、UI で注意を表示します。
高精度が必要になったら、Swiss Ephemeris などの天体暦に差し替える前提です。

## AI を使う場合のルール（labels.ts）

AI は「ゼロから知見を作る」のではなく、**承認済みナレッジを読みやすく整える**用途に限定します。
整形 AI を呼ぶ際は `buildAiSystemPrompt()` のガードレールを必ず前置きします
（先生本人として断定しない／承認済み以外を足さない／不安を煽らない／
月星座を「本当の性格」と言わない／相性を絶対視しない 等）。

## 本 MVP の範囲外（後続で別基盤が必要）

仕様書のうち、静的サイトでは動かせず、サーバー／DB 等の追加が前提になるもの：

- LINE 公式アカウント／LIFF ログイン、Webhook 返信、userId 連携
- 管理画面でのファイルアップロード・OCR・docx/PDF 本文抽出
- AI によるチャンク分割・分類・タグ付け・抽出
- RAG / Vector DB によるナレッジ検索
- 診断ログのサーバー保存（現状は端末ローカルの localStorage）

これらを実装する場合は、API Routes／別バックエンドと DB を新設し、本 MVP の
型定義（`types.ts`）とガバナンス判定（`governance.ts`）をそのまま再利用できます。
