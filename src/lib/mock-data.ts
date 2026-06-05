import type {
  Applicant,
  Contract,
  Enrollment,
  HrTask,
  Consultation,
  Activity,
  DashboardStats,
  HrUser,
} from "./types";

// 「現在日時」を固定してデモの再現性を担保
export const NOW = new Date("2026-06-05T10:00:00+09:00");
export const COMPANY_NAME = "株式会社RAGNIZE";
export const PLATFORM_NAME = "VoxaLink Workforce";

export const currentUser: HrUser = {
  name: "田中 美咲",
  role: "人事部 マネージャー",
  company: COMPANY_NAME,
};

// ============================================================
// 01 採用（VoxaLink Entrance）
// ============================================================
export const applicants: Applicant[] = [
  { id: "AP-2041", name: "佐藤 健一", position: "営業（中途）", source: "求人サイト", status: "interview", aiScore: 88, appliedAt: "2026-06-03T09:20:00+09:00", aiInterview: true },
  { id: "AP-2040", name: "鈴木 彩花", position: "Webエンジニア", source: "リファラル", status: "offer", aiScore: 92, appliedAt: "2026-06-01T14:10:00+09:00", aiInterview: true },
  { id: "AP-2039", name: "高橋 大輔", position: "カスタマーサポート", source: "自社サイト", status: "screening", aiScore: 74, appliedAt: "2026-06-04T11:05:00+09:00", aiInterview: false },
  { id: "AP-2038", name: "伊藤 さくら", position: "経理（中途）", source: "求人サイト", status: "applied", aiScore: 81, appliedAt: "2026-06-05T08:40:00+09:00", aiInterview: false },
  { id: "AP-2037", name: "渡辺 翔太", position: "営業（中途）", source: "エージェント", status: "interview", aiScore: 79, appliedAt: "2026-06-02T16:30:00+09:00", aiInterview: true },
  { id: "AP-2036", name: "山本 真央", position: "Webエンジニア", source: "求人サイト", status: "rejected", aiScore: 58, appliedAt: "2026-05-30T10:00:00+09:00", aiInterview: true },
];

// ============================================================
// 02 入社（電子契約）
// ============================================================
export const contracts: Contract[] = [
  { id: "CT-388", employeeName: "鈴木 彩花", type: "employment", status: "sent", sentAt: "2026-06-04T13:00:00+09:00", joinDate: "2026-07-01T00:00:00+09:00" },
  { id: "CT-387", employeeName: "鈴木 彩花", type: "conditions", status: "sent", sentAt: "2026-06-04T13:00:00+09:00", joinDate: "2026-07-01T00:00:00+09:00" },
  { id: "CT-386", employeeName: "中村 拓也", type: "employment", status: "signed", sentAt: "2026-06-02T10:30:00+09:00", joinDate: "2026-06-16T00:00:00+09:00" },
  { id: "CT-385", employeeName: "小林 ひかり", type: "employment", status: "completed", sentAt: "2026-05-28T09:00:00+09:00", joinDate: "2026-06-01T00:00:00+09:00" },
  { id: "CT-384", employeeName: "加藤 蓮", type: "conditions", status: "draft", sentAt: "2026-06-05T09:30:00+09:00", joinDate: "2026-07-01T00:00:00+09:00" },
];

// ============================================================
// 03 教育（Jobルール365 / LMS）
// ============================================================
export const enrollments: Enrollment[] = [
  { id: "EN-510", employeeName: "小林 ひかり", courseName: "新入社員オンボーディング", category: "業務ルール", status: "inProgress", progress: 60, dueDate: "2026-06-15T00:00:00+09:00" },
  { id: "EN-509", employeeName: "中村 拓也", courseName: "情報セキュリティ基礎", category: "コンプライアンス研修", status: "notStarted", progress: 0, dueDate: "2026-06-20T00:00:00+09:00" },
  { id: "EN-508", employeeName: "松本 結衣", courseName: "ハラスメント防止研修", category: "コンプライアンス研修", status: "completed", progress: 100, dueDate: "2026-06-10T00:00:00+09:00" },
  { id: "EN-507", employeeName: "井上 直樹", courseName: "Jobルール365：就業の基本", category: "業務ルール", status: "inProgress", progress: 35, dueDate: "2026-06-18T00:00:00+09:00" },
  { id: "EN-506", employeeName: "木村 莉子", courseName: "個人情報保護法 基礎", category: "コンプライアンス研修", status: "inProgress", progress: 80, dueDate: "2026-06-12T00:00:00+09:00" },
];

// ============================================================
// 04 労務（就業規則AI / 総務AI / 人事AI）
// ============================================================
export const hrTasks: HrTask[] = [
  { id: "HR-922", title: "有給休暇の繰越上限について確認したい", category: "rule", status: "done", aiHandled: true, requester: "井上 直樹", createdAt: "2026-06-05T09:15:00+09:00" },
  { id: "HR-921", title: "通勤手当の申請方法を教えてほしい", category: "general", status: "inProgress", aiHandled: true, requester: "松本 結衣", createdAt: "2026-06-05T08:50:00+09:00" },
  { id: "HR-920", title: "育児休業の取得条件と手続き", category: "personnel", status: "open", aiHandled: false, requester: "木村 莉子", createdAt: "2026-06-04T17:20:00+09:00" },
  { id: "HR-919", title: "リモートワーク規程の最新版を確認", category: "rule", status: "done", aiHandled: true, requester: "中村 拓也", createdAt: "2026-06-04T15:00:00+09:00" },
  { id: "HR-918", title: "備品（モニター）の購入申請", category: "general", status: "open", aiHandled: false, requester: "小林 ひかり", createdAt: "2026-06-04T11:40:00+09:00" },
];

// ============================================================
// 05 定着（ナツメアイHR / 社員相談AI / ハラスメント相談AI）
// ============================================================
export const consultations: Consultation[] = [
  { id: "RT-140", employeeName: "井上 直樹", type: "engagement", mood: "good", engagement: 82, summary: "業務にやりがいを感じている。新しい挑戦を希望。", createdAt: "2026-06-05T09:00:00+09:00" },
  { id: "RT-139", employeeName: "木村 莉子", type: "consult", mood: "risk", engagement: 48, summary: "業務量の偏りに不安。1on1でのフォローを推奨。", createdAt: "2026-06-04T18:10:00+09:00" },
  { id: "RT-138", employeeName: "（匿名）", type: "harassment", mood: "risk", engagement: 0, summary: "チーム内のコミュニケーションに関する相談。要面談。", createdAt: "2026-06-04T16:45:00+09:00" },
  { id: "RT-137", employeeName: "松本 結衣", type: "engagement", mood: "normal", engagement: 65, summary: "概ね良好。キャリアパスの相談あり。", createdAt: "2026-06-03T13:30:00+09:00" },
  { id: "RT-136", employeeName: "中村 拓也", type: "consult", mood: "good", engagement: 78, summary: "入社後の立ち上がりは順調。特段の懸念なし。", createdAt: "2026-06-02T10:15:00+09:00" },
];

// ============================================================
// 横断アクティビティ（統一フィード）
// ============================================================
export const activities: Activity[] = [
  { id: "AC-09", stage: "recruit", employeeName: "伊藤 さくら", message: "AI応募受付が新規応募を自動登録しました", at: "2026-06-05T08:40:00+09:00", aiHandled: true },
  { id: "AC-08", stage: "hr", employeeName: "井上 直樹", message: "就業規則AIが有給休暇の質問に回答しました", at: "2026-06-05T09:15:00+09:00", aiHandled: true },
  { id: "AC-07", stage: "retention", employeeName: "井上 直樹", message: "ナツメアイHRがエンゲージメント良好を検知", at: "2026-06-05T09:00:00+09:00", aiHandled: true },
  { id: "AC-06", stage: "onboarding", employeeName: "鈴木 彩花", message: "雇用契約・労働条件通知を電子送付しました", at: "2026-06-04T13:00:00+09:00", aiHandled: false },
  { id: "AC-05", stage: "retention", employeeName: "木村 莉子", message: "社員相談AIが要フォローを検知。1on1を推奨", at: "2026-06-04T18:10:00+09:00", aiHandled: true },
  { id: "AC-04", stage: "learning", employeeName: "松本 結衣", message: "ハラスメント防止研修を修了しました", at: "2026-06-04T17:30:00+09:00", aiHandled: false },
  { id: "AC-03", stage: "recruit", employeeName: "鈴木 彩花", message: "AI面接の結果、内定ステータスに更新", at: "2026-06-04T11:00:00+09:00", aiHandled: true },
  { id: "AC-02", stage: "hr", employeeName: "松本 結衣", message: "総務AIが通勤手当の申請方法を案内しました", at: "2026-06-05T08:50:00+09:00", aiHandled: true },
  { id: "AC-01", stage: "onboarding", employeeName: "中村 拓也", message: "雇用契約に電子署名が完了しました", at: "2026-06-02T10:31:00+09:00", aiHandled: false },
];

// ============================================================
// ダッシュボード集計（実データから算出 + 一部固定）
// ============================================================
export const dashboardStats: DashboardStats = {
  applicants: applicants.filter((a) => ["applied", "screening", "interview"].includes(a.status)).length,
  offers: applicants.filter((a) => a.status === "offer").length,
  onboarding: new Set(
    contracts.filter((c) => c.status !== "completed").map((c) => c.employeeName)
  ).size,
  learningInProgress: enrollments.filter((e) => e.status === "inProgress").length,
  openHrTasks: hrTasks.filter((t) => t.status !== "done").length,
  retentionRisk: consultations.filter((c) => c.mood === "risk").length,
  employees: 128,
  aiHandledToday: 34,
};

// 導入効果（PDF掲載の参考値）
export const impactStats = [
  { label: "業務時間削減", value: "約40", unit: "%" },
  { label: "採用工数削減", value: "約50", unit: "%" },
  { label: "社員満足度向上", value: "約30", unit: "%" },
];
