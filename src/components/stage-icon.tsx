import {
  UserSearch,
  Handshake,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";
import type { StageId } from "@/lib/types";

/** ステージ（採用〜定着）→ アイコン */
export const stageIcons: Record<StageId, LucideIcon> = {
  recruit: UserSearch,
  onboarding: Handshake,
  learning: GraduationCap,
  hr: Briefcase,
  retention: HeartHandshake,
};

export function StageIcon({
  stage,
  className,
}: {
  stage: StageId;
  className?: string;
}) {
  const Icon = stageIcons[stage];
  return <Icon className={className} />;
}
