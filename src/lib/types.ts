// ============================================================
// Hotel Voice Concierge - ドメイン型定義
// API 連携時はこの型をそのままレスポンス型として再利用できる。
// ============================================================

// ---- 予約 ----
export type ReservationStatus =
  | "tentative" // 仮予約
  | "confirmed" // 確定
  | "checkedIn" // チェックイン済み
  | "checkedOut" // チェックアウト済み
  | "cancelled"; // キャンセル

export type ReservationChannel =
  | "phone" // 電話
  | "web" // Web
  | "agency" // 旅行代理店
  | "walkIn" // 直接来館
  | "other"; // その他

export type PaymentMethod = "cash" | "credit" | "onsite" | "prepaid" | "invoice";

export interface Reservation {
  id: string;
  guestName: string;
  guestNameKana?: string;
  phone: string;
  email: string;
  checkIn: string; // ISO
  checkOut: string; // ISO
  roomType: string;
  roomNumber: string;
  guests: number;
  adults: number;
  children: number;
  price: number;
  payment: PaymentMethod;
  status: ReservationStatus;
  channel: ReservationChannel;
  staff: string; // 受付担当者
  note?: string;
  createdAt: string;
}

// ---- 問い合わせ ----
export type InquiryStatus =
  | "open" // 未対応
  | "inProgress" // 対応中
  | "needsStaff" // スタッフ確認必要
  | "resolved"; // 対応済み

export type Priority = "low" | "medium" | "high" | "urgent";

export type InquiryCategory =
  | "facility" // 客室設備
  | "amenity" // アメニティ
  | "cleaning" // 清掃
  | "wifi" // Wi-Fi
  | "breakfast" // 朝食
  | "parking" // 駐車場
  | "checkInOut" // チェックイン/アウト
  | "nearby" // 周辺施設
  | "trouble" // トラブル対応
  | "emergency" // 緊急対応
  | "roomService"; // ルームサービス

export interface Inquiry {
  id: string;
  guestName: string;
  roomNumber: string;
  content: string;
  category: InquiryCategory;
  status: InquiryStatus;
  priority: Priority;
  createdAt: string;
  assignee?: string;
  aiHandled: boolean; // AI が一次対応済みか
  needsHuman: boolean; // 人間対応が必要か
  aiAnswer?: string;
  memo?: string;
}

// ---- 音声 AI ログ ----
export type VoiceStatus = "completed" | "playing" | "escalated" | "transcribing";

export interface VoiceLog {
  id: string;
  guestName: string;
  roomNumber: string;
  sttText: string; // STT 変換テキスト
  category: InquiryCategory;
  aiAnswer: string; // AI 回答文
  ttsStatus: "played" | "pending" | "failed";
  status: VoiceStatus;
  needsStaff: boolean;
  startedAt: string;
  endedAt?: string;
  escalationReason?: string;
  durationSec: number;
  transcript: { role: "guest" | "ai" | "staff"; text: string; at: string }[];
}

// ---- ナレッジ ----
export interface Knowledge {
  id: string;
  title: string;
  category: InquiryCategory;
  phrases: string[]; // 想定される言い回し
  answer: string; // 回答文
  voiceAnswer: string; // 音声案内用の短い回答
  handling: string; // 対応方法
  needsStaff: boolean;
  priority: Priority;
  published: boolean;
  useForAi: boolean;
  updatedAt: string;
  author: string;
}

// ---- 客室 ----
export type RoomStatus =
  | "vacant" // 空室
  | "occupied" // 宿泊中
  | "cleaning" // 清掃中
  | "cleaned" // 清掃完了
  | "maintenance" // メンテナンス中
  | "outOfService"; // 利用停止

export interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  guestName?: string;
  status: RoomStatus;
  price: number;
  amenitiesOk: boolean;
  maintenanceNote?: string;
}

// ---- スタッフ ----
export type StaffRole = "admin" | "front" | "cleaning" | "maintenance";
export type WorkStatus = "working" | "break" | "off";

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  openInquiries: number;
  workStatus: WorkStatus;
}
