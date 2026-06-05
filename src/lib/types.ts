// ============================================================
// VoxaLink Workforce - ドメイン型定義
// 採用・入社・教育・労務・定着 を1つに束ねる人財DXプラットフォーム。
// API 連携時はこの型をそのままレスポンス型として再利用できる。
// ============================================================

/** 従業員ライフサイクルの5ステージ（PDFの 01〜05 に対応） */
export type StageId =
  | "recruit" // 01 採用
  | "onboarding" // 02 入社
  | "learning" // 03 教育
  | "hr" // 04 労務
  | "retention"; // 05 定着

// ---- 01 採用（VoxaLink Entrance） ----
export type ApplicantStatus =
  | "applied" // 応募受付
  | "screening" // 書類選考
  | "interview" // 面接
  | "offer" // 内定
  | "rejected"; // 見送り

export interface Applicant {
  id: string;
  name: string;
  position: string; // 応募職種
  source: string; // 応募経路
  status: ApplicantStatus;
  aiScore: number; // AIマッチ度 0-100
  appliedAt: string; // ISO
  aiInterview: boolean; // AI面接実施済み
}

// ---- 02 入社（電子契約） ----
export type ContractStatus =
  | "draft" // 作成中
  | "sent" // 送付済み（署名待ち）
  | "signed" // 署名済み
  | "completed"; // 完了

export type ContractType = "employment" | "conditions"; // 雇用契約 / 労働条件通知

export interface Contract {
  id: string;
  employeeName: string;
  type: ContractType;
  status: ContractStatus;
  sentAt: string; // ISO
  joinDate: string; // 入社予定日 ISO
}

// ---- 03 教育（Jobルール365 / LMS） ----
export type CourseStatus = "notStarted" | "inProgress" | "completed";

export interface Enrollment {
  id: string;
  employeeName: string;
  courseName: string;
  category: string; // 例: コンプライアンス研修 / 業務ルール
  status: CourseStatus;
  progress: number; // 0-100
  dueDate: string; // ISO
}

// ---- 04 労務（就業規則AI / 総務AI / 人事AI） ----
export type TaskStatus = "open" | "inProgress" | "done";
export type HrCategory = "rule" | "general" | "personnel"; // 就業規則 / 総務 / 人事

export interface HrTask {
  id: string;
  title: string;
  category: HrCategory;
  status: TaskStatus;
  aiHandled: boolean; // AIが一次回答済み
  requester: string; // 起票者
  createdAt: string; // ISO
}

// ---- 05 定着（ナツメアイHR / 社員相談AI / ハラスメント相談AI） ----
export type ConsultType = "engagement" | "consult" | "harassment";
export type Mood = "good" | "normal" | "risk"; // 良好 / 普通 / 要フォロー

export interface Consultation {
  id: string;
  employeeName: string;
  type: ConsultType;
  mood: Mood;
  engagement: number; // エンゲージメントスコア 0-100
  summary: string; // AI要約
  createdAt: string; // ISO
}

// ---- 横断アクティビティ（統一フィード用） ----
export interface Activity {
  id: string;
  stage: StageId;
  employeeName: string;
  message: string;
  at: string; // ISO
  aiHandled: boolean;
}

// ---- ダッシュボード集計 ----
export interface DashboardStats {
  applicants: number; // 選考中の応募者
  offers: number; // 内定者
  onboarding: number; // 入社手続き中
  learningInProgress: number; // 受講中
  openHrTasks: number; // 未対応の労務タスク
  retentionRisk: number; // 要フォロー社員
  employees: number; // 在籍者数
  aiHandledToday: number; // 本日AIが対応した件数
}

// ---- ログインユーザー（人事担当者） ----
export interface HrUser {
  name: string;
  role: string;
  company: string;
}
