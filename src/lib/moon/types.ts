// ============================================================
// 月星座占い / マドモアゼル･ai 監修ナレッジ — 型定義
// ------------------------------------------------------------
// 設計の中心は「ガバナンス」。AI が先生の知見を勝手に生成せず、
// 許諾・監修・出典・承認が管理されたナレッジだけを表示に使う。
//
//   - approvalStatus === "approved" のデータだけを本番表示に使う
//   - permissionStatus === "prohibited" の素材は絶対に使わない
//   - quoteAllowed === false の素材は原文引用しない
//   - summaryAllowed === true の場合のみ要約・言い換えに使う
//
// これらの型は将来 API レスポンス型 / DB スキーマとしても再利用できる。
// ============================================================

/** 12 星座キー（月星座も同じキーを使う） */
export type ZodiacKey =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "pisces"
  | "aquarius";

/** 相性カテゴリ */
export type CompatibilityCategory = "love" | "work" | "private";

// ---- 承認ステータス ----------------------------------------
// 本番表示は "approved" のみ。
export type ApprovalStatus =
  | "draft" // 下書き（運営が作成中）
  | "ai_extracted" // AI が許諾済みテキストから抽出した直後
  | "pending_review" // 監修者レビュー待ち
  | "approved" // 承認済み（本番表示可）
  | "rejected" // 却下
  | "prohibited"; // 表示・生成に使用禁止

// ---- 許諾ステータス ----------------------------------------
// "prohibited" は絶対に表示・生成へ使わない。
// 公開表示が許されるのは public_reference / licensed / supervised のみ。
export type PermissionStatus =
  | "public_reference" // 公開情報の参照（一般論レベル）
  | "licensed" // ライセンス許諾済み
  | "supervised" // 先生・監修者の監修済み
  | "internal_only" // 社内利用のみ（公開表示はしない）
  | "prohibited"; // 使用禁止

/** 出典の種類 */
export type SourceType =
  | "official_blog"
  | "book"
  | "lecture"
  | "youtube_transcript"
  | "interview"
  | "supervised_original"
  | "internal_memo";

// ============================================================
// astrology_knowledge_sources
//   出典・許諾を一元管理するマスタ。
// ============================================================
export interface KnowledgeSource {
  id: string;
  title: string;
  sourceType: SourceType;
  /** URL・書籍名・ページ番号・動画URL・タイムコード・資料名など */
  sourceReference: string;
  permissionStatus: PermissionStatus;
  /** 原文引用してよいか */
  quoteAllowed: boolean;
  /** 要約・言い換えに使ってよいか */
  summaryAllowed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// moon_sign_knowledge
//   月星座ごとの診断ナレッジ（欠損論ベース）。
// ============================================================
export interface MoonSignKnowledge {
  id: string;
  moonSign: ZodiacKey;
  themeTitle: string;
  shortDescription: string;
  detailedDescription: string;
  /** 月の欠損として現れやすいテーマ */
  deficiencyTheme: string;
  /** 無意識に求めやすい・しがみつきやすいパターン */
  attachmentPattern: string;
  /** 手放しのヒント */
  releaseAdvice: string;
  /** 対向の星座から学べること */
  oppositeSignAdvice: string;
  loveAdvice: string;
  workAdvice: string;
  privateAdvice: string;
  /** 参照した出典（KnowledgeSource.id） */
  sourceId: string;
  approvalStatus: ApprovalStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// moon_compatibility_master
//   月星座 × 月星座 の相性マスタ（恋愛/仕事/プライベート別）。
// ============================================================
export interface MoonCompatibility {
  id: string;
  baseMoonSign: ZodiacKey;
  targetMoonSign: ZodiacKey;
  category: CompatibilityCategory;
  /** ランキング順位（1 が最上位） */
  rank: number;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  caution: string;
  advice: string;
  sourceId: string;
  approvalStatus: ApprovalStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// generated_diagnosis_logs
//   どのナレッジを参照して診断文を生成したかを記録する。
//   （静的サイトの MVP では localStorage に保存。本番は API に送る）
// ============================================================
export interface GeneratedDiagnosisLog {
  id: string;
  /** LINE userId（MVP では端末ローカルの仮ID） */
  userId: string | null;
  moonProfileId: string | null;
  promptVersion: string;
  /** 参照した承認済みナレッジの id 群 */
  referencedKnowledgeIds: string[];
  generatedText: string;
  createdAt: string;
}
