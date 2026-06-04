import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind クラスを安全に結合するユーティリティ */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 数値を日本円表記に整形 */
export function formatYen(value: number): string {
  return `¥${value.toLocaleString("ja-JP")}`;
}

/** ISO 日付文字列を「6月10日(火)」形式に整形 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日(${w})`;
}

/** ISO 日時を「6/4 14:30」形式に整形 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

/** 2つの日付の宿泊数(泊)を算出 */
export function nights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}
