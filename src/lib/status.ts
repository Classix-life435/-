import type {
  ReservationStatus,
  ReservationChannel,
  PaymentMethod,
  InquiryStatus,
  Priority,
  InquiryCategory,
  RoomStatus,
  StaffRole,
  WorkStatus,
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

export const reservationStatusMeta: Record<ReservationStatus, Meta> = {
  tentative: { label: "仮予約", tone: "amber" },
  confirmed: { label: "確定", tone: "blue" },
  checkedIn: { label: "チェックイン済み", tone: "green" },
  checkedOut: { label: "チェックアウト済み", tone: "slate" },
  cancelled: { label: "キャンセル", tone: "red" },
};

export const channelMeta: Record<ReservationChannel, Meta> = {
  phone: { label: "電話", tone: "sky" },
  web: { label: "Web", tone: "violet" },
  agency: { label: "旅行代理店", tone: "amber" },
  walkIn: { label: "直接来館", tone: "green" },
  other: { label: "その他", tone: "slate" },
};

export const paymentMeta: Record<PaymentMethod, Meta> = {
  cash: { label: "現金", tone: "slate" },
  credit: { label: "クレジット", tone: "blue" },
  onsite: { label: "現地払い", tone: "amber" },
  prepaid: { label: "事前決済", tone: "green" },
  invoice: { label: "請求書", tone: "violet" },
};

export const inquiryStatusMeta: Record<InquiryStatus, Meta> = {
  open: { label: "未対応", tone: "red" },
  inProgress: { label: "対応中", tone: "amber" },
  needsStaff: { label: "スタッフ確認必要", tone: "violet" },
  resolved: { label: "対応済み", tone: "green" },
};

export const priorityMeta: Record<Priority, Meta> = {
  low: { label: "低", tone: "slate" },
  medium: { label: "中", tone: "blue" },
  high: { label: "高", tone: "amber" },
  urgent: { label: "緊急", tone: "red" },
};

export const categoryMeta: Record<InquiryCategory, Meta> = {
  facility: { label: "客室設備", tone: "blue" },
  amenity: { label: "アメニティ", tone: "sky" },
  cleaning: { label: "清掃", tone: "violet" },
  wifi: { label: "Wi-Fi", tone: "blue" },
  breakfast: { label: "朝食", tone: "amber" },
  parking: { label: "駐車場", tone: "slate" },
  checkInOut: { label: "チェックイン/アウト", tone: "green" },
  nearby: { label: "周辺施設", tone: "sky" },
  trouble: { label: "トラブル対応", tone: "red" },
  emergency: { label: "緊急対応", tone: "red" },
  roomService: { label: "ルームサービス", tone: "violet" },
};

export const roomStatusMeta: Record<RoomStatus, Meta> = {
  vacant: { label: "空室", tone: "green" },
  occupied: { label: "宿泊中", tone: "blue" },
  cleaning: { label: "清掃中", tone: "amber" },
  cleaned: { label: "清掃完了", tone: "sky" },
  maintenance: { label: "メンテナンス中", tone: "violet" },
  outOfService: { label: "利用停止", tone: "red" },
};

export const staffRoleMeta: Record<StaffRole, Meta> = {
  admin: { label: "管理者", tone: "violet" },
  front: { label: "フロント", tone: "blue" },
  cleaning: { label: "清掃", tone: "sky" },
  maintenance: { label: "メンテナンス", tone: "amber" },
};

export const workStatusMeta: Record<WorkStatus, Meta> = {
  working: { label: "勤務中", tone: "green" },
  break: { label: "休憩中", tone: "amber" },
  off: { label: "退勤", tone: "slate" },
};
