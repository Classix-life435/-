import { Badge } from "./badge";
import {
  reservationStatusMeta,
  channelMeta,
  paymentMeta,
  inquiryStatusMeta,
  priorityMeta,
  categoryMeta,
  roomStatusMeta,
  staffRoleMeta,
  workStatusMeta,
} from "@/lib/status";
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
} from "@/lib/types";

export function ReservationStatusBadge({ value }: { value: ReservationStatus }) {
  const m = reservationStatusMeta[value];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}
export function ChannelBadge({ value }: { value: ReservationChannel }) {
  const m = channelMeta[value];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
export function PaymentBadge({ value }: { value: PaymentMethod }) {
  const m = paymentMeta[value];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
export function InquiryStatusBadge({ value }: { value: InquiryStatus }) {
  const m = inquiryStatusMeta[value];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}
export function PriorityBadge({ value }: { value: Priority }) {
  const m = priorityMeta[value];
  return <Badge tone={m.tone}>優先度: {m.label}</Badge>;
}
export function CategoryBadge({ value }: { value: InquiryCategory }) {
  const m = categoryMeta[value];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
export function RoomStatusBadge({ value }: { value: RoomStatus }) {
  const m = roomStatusMeta[value];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}
export function StaffRoleBadge({ value }: { value: StaffRole }) {
  const m = staffRoleMeta[value];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
export function WorkStatusBadge({ value }: { value: WorkStatus }) {
  const m = workStatusMeta[value];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}
