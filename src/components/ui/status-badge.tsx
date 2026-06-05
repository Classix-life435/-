import { Badge } from "./badge";
import {
  applicantStatusMeta,
  contractStatusMeta,
  contractTypeMeta,
  courseStatusMeta,
  taskStatusMeta,
  hrCategoryMeta,
  consultTypeMeta,
  moodMeta,
} from "@/lib/status";
import type {
  ApplicantStatus,
  ContractStatus,
  ContractType,
  CourseStatus,
  TaskStatus,
  HrCategory,
  ConsultType,
  Mood,
} from "@/lib/types";

export function ApplicantStatusBadge({ value }: { value: ApplicantStatus }) {
  const m = applicantStatusMeta[value];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}
export function ContractStatusBadge({ value }: { value: ContractStatus }) {
  const m = contractStatusMeta[value];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}
export function ContractTypeBadge({ value }: { value: ContractType }) {
  const m = contractTypeMeta[value];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
export function CourseStatusBadge({ value }: { value: CourseStatus }) {
  const m = courseStatusMeta[value];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}
export function TaskStatusBadge({ value }: { value: TaskStatus }) {
  const m = taskStatusMeta[value];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}
export function HrCategoryBadge({ value }: { value: HrCategory }) {
  const m = hrCategoryMeta[value];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
export function ConsultTypeBadge({ value }: { value: ConsultType }) {
  const m = consultTypeMeta[value];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
export function MoodBadge({ value }: { value: Mood }) {
  const m = moodMeta[value];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}
