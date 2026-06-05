import type {
  StageId,
  ApplicantStatus,
  ContractStatus,
  ContractType,
  CourseStatus,
  TaskStatus,
  HrCategory,
  ConsultType,
  Mood,
} from "./types";

export type BadgeTone =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "slate"
  | "violet"
  | "sky";

interface Meta {
  label: string;
  tone: BadgeTone;
}

// ============================================================
// ステージ（採用〜定着）のメタ情報
// Tailwind はクラス名を静的に解決するため、色は完全なクラス名で持つ。
// ============================================================
export interface StageMeta {
  id: StageId;
  no: string; // "01"
  label: string; // 採用
  en: string; // Recruit
  description: string;
  href: string;
  tone: BadgeTone;
  /** アクセント色（テキスト・アイコン用） */
  text: string;
  /** 淡い背景（アイコンチップ用） */
  chip: string;
  /** 進捗バー等の塗り色 */
  fill: string;
  /** 主な製品・AIエージェント（PDF掲載） */
  products: string[];
}

export const STAGES: StageMeta[] = [
  {
    id: "recruit",
    no: "01",
    label: "採用",
    en: "Recruit",
    description: "最適な人材との出会いをAIがサポート",
    href: "/recruit",
    tone: "green",
    text: "text-emerald-600",
    chip: "bg-emerald-50 text-emerald-600",
    fill: "bg-emerald-500",
    products: ["VoxaLink Entrance", "AI応募受付", "AI履歴書作成", "AI面接"],
  },
  {
    id: "onboarding",
    no: "02",
    label: "入社",
    en: "Onboarding",
    description: "スムーズな入社手続きで新しい一歩を支援",
    href: "/onboarding",
    tone: "blue",
    text: "text-brand-600",
    chip: "bg-brand-50 text-brand-600",
    fill: "bg-brand-500",
    products: ["電子契約", "雇用契約", "労働条件通知"],
  },
  {
    id: "learning",
    no: "03",
    label: "教育",
    en: "Learning",
    description: "学びを継続し、成長する組織へ",
    href: "/learning",
    tone: "violet",
    text: "text-violet-600",
    chip: "bg-violet-50 text-violet-600",
    fill: "bg-violet-500",
    products: ["Jobルール365", "コンプライアンス研修", "LMS"],
  },
  {
    id: "hr",
    no: "04",
    label: "労務",
    en: "HR",
    description: "人事・労務業務をAIで効率化",
    href: "/hr",
    tone: "amber",
    text: "text-amber-600",
    chip: "bg-amber-50 text-amber-600",
    fill: "bg-amber-500",
    products: ["就業規則AI", "総務AI", "人事AI"],
  },
  {
    id: "retention",
    no: "05",
    label: "定着",
    en: "Retention",
    description: "働きやすい環境をつくり、定着・活躍を支援",
    href: "/retention",
    tone: "red",
    text: "text-rose-600",
    chip: "bg-rose-50 text-rose-600",
    fill: "bg-rose-500",
    products: ["ナツメアイHR", "社員相談AI", "ハラスメント相談AI"],
  },
];

export const stageById: Record<StageId, StageMeta> = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<StageId, StageMeta>
);

// ---- 01 採用 ----
export const applicantStatusMeta: Record<ApplicantStatus, Meta> = {
  applied: { label: "応募受付", tone: "sky" },
  screening: { label: "書類選考", tone: "blue" },
  interview: { label: "面接", tone: "amber" },
  offer: { label: "内定", tone: "green" },
  rejected: { label: "見送り", tone: "slate" },
};

// ---- 02 入社 ----
export const contractStatusMeta: Record<ContractStatus, Meta> = {
  draft: { label: "作成中", tone: "slate" },
  sent: { label: "署名待ち", tone: "amber" },
  signed: { label: "署名済み", tone: "blue" },
  completed: { label: "完了", tone: "green" },
};

export const contractTypeMeta: Record<ContractType, Meta> = {
  employment: { label: "雇用契約", tone: "blue" },
  conditions: { label: "労働条件通知", tone: "violet" },
};

// ---- 03 教育 ----
export const courseStatusMeta: Record<CourseStatus, Meta> = {
  notStarted: { label: "未受講", tone: "slate" },
  inProgress: { label: "受講中", tone: "amber" },
  completed: { label: "修了", tone: "green" },
};

// ---- 04 労務 ----
export const taskStatusMeta: Record<TaskStatus, Meta> = {
  open: { label: "未対応", tone: "red" },
  inProgress: { label: "対応中", tone: "amber" },
  done: { label: "完了", tone: "green" },
};

export const hrCategoryMeta: Record<HrCategory, Meta> = {
  rule: { label: "就業規則", tone: "blue" },
  general: { label: "総務", tone: "sky" },
  personnel: { label: "人事", tone: "violet" },
};

// ---- 05 定着 ----
export const consultTypeMeta: Record<ConsultType, Meta> = {
  engagement: { label: "エンゲージメント", tone: "green" },
  consult: { label: "社員相談", tone: "sky" },
  harassment: { label: "ハラスメント相談", tone: "red" },
};

export const moodMeta: Record<Mood, Meta> = {
  good: { label: "良好", tone: "green" },
  normal: { label: "普通", tone: "slate" },
  risk: { label: "要フォロー", tone: "red" },
};
