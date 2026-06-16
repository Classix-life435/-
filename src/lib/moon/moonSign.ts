// ============================================================
// lib/moon/moonSign.ts
// ------------------------------------------------------------
// 出生日時から「月星座」を計算する（MVP・低精度近似）。
//
// 月は約 13°/日（2〜3 日で 1 星座）動くため、太陽星座と違い
// 「日付だけ」では決まらず、出生時刻・出生地（タイムゾーン）が要る。
//
// ここでは Paul Schlyter の低精度公式で月の黄経を求める。
// 誤差はおおむね数分角〜0.5° 程度で、星座の境界（カスプ）付近の
// 出生でなければ実用上の星座判定には十分。本番で高精度が要る場合は
// 専用の天体暦（Swiss Ephemeris 等）に差し替える前提。
// ============================================================

import type { ZodiacKey } from "@/lib/moon/types";
import { ZODIAC_ORDER } from "@/data/moonSignKnowledge";

const DEG = Math.PI / 180;

function rev(x: number): number {
  return ((x % 360) + 360) % 360;
}

/** 月の黄経（度, 0–360）を Schlyter の低精度公式で求める */
function moonEclipticLongitude(date: Date): number {
  // Schlyter の day number d = JD - 2451543.5。
  // Unix エポック(1970-01-01)からの通日に直すと d = unixDays - 10956.0。
  const d = date.getTime() / 86400000 - 10956.0;

  // ---- 月の軌道要素 ----
  const N = 125.1228 - 0.0529538083 * d; // 昇交点
  const i = 5.1454; // 軌道傾斜
  const w = rev(318.0634 + 0.1643573223 * d); // 近地点引数
  const e = 0.054900; // 離心率
  let M = rev(115.3654 + 13.0649929509 * d); // 平均近点角

  // ---- 太陽の要素（摂動計算に使う） ----
  const ws = 282.9404 + 4.70935e-5 * d;
  const Ms = rev(356.047 + 0.9856002585 * d);

  // ---- 離心近点角 E（反復） ----
  let E = M + (180 / Math.PI) * e * Math.sin(M * DEG) * (1 + e * Math.cos(M * DEG));
  for (let n = 0; n < 5; n++) {
    E = E - (E - (180 / Math.PI) * e * Math.sin(E * DEG) - M) /
      (1 - e * Math.cos(E * DEG));
  }

  // ---- 軌道平面上の位置 ----
  const xv = Math.cos(E * DEG) - e;
  const yv = Math.sqrt(1 - e * e) * Math.sin(E * DEG);
  const v = rev(Math.atan2(yv, xv) / DEG); // 真近点角
  const r = Math.sqrt(xv * xv + yv * yv);

  // ---- 黄道座標へ ----
  const xh =
    r *
    (Math.cos(N * DEG) * Math.cos((v + w) * DEG) -
      Math.sin(N * DEG) * Math.sin((v + w) * DEG) * Math.cos(i * DEG));
  const yh =
    r *
    (Math.sin(N * DEG) * Math.cos((v + w) * DEG) +
      Math.cos(N * DEG) * Math.sin((v + w) * DEG) * Math.cos(i * DEG));
  let lon = rev(Math.atan2(yh, xh) / DEG);

  // ---- 主要な摂動補正（経度） ----
  const Lm = rev(N + w + M); // 月の平均黄経
  const Ls = rev(ws + Ms); // 太陽の平均黄経
  const Dm = rev(Lm - Ls); // 月の平均離角
  const F = rev(Lm - N); // 緯度引数

  lon +=
    -1.274 * Math.sin((M - 2 * Dm) * DEG) +
    0.658 * Math.sin(2 * Dm * DEG) +
    -0.186 * Math.sin(Ms * DEG) +
    -0.059 * Math.sin((2 * M - 2 * Dm) * DEG) +
    -0.057 * Math.sin((M - 2 * Dm + Ms) * DEG) +
    0.053 * Math.sin((M + 2 * Dm) * DEG) +
    0.046 * Math.sin((2 * Dm - Ms) * DEG) +
    0.041 * Math.sin((M - Ms) * DEG) +
    -0.035 * Math.sin(Dm * DEG) +
    -0.031 * Math.sin((M + Ms) * DEG) +
    -0.015 * Math.sin((2 * F - 2 * Dm) * DEG) +
    0.011 * Math.sin((M - 4 * Dm) * DEG);

  return rev(lon);
}

export interface MoonSignResult {
  moonSign: ZodiacKey;
  /** 月の黄経（度） */
  longitude: number;
  /** 星座内の度数（0–30） */
  degreeInSign: number;
  /** カスプ（境界 ±1.5°）付近で精度に注意が必要か */
  nearCusp: boolean;
}

/**
 * 出生日時（UTC 換算済みの Date）から月星座を計算する。
 *
 * @param date 出生日時。タイムゾーンを織り込んだ Date を渡すこと。
 *             時刻不明なら出生地正午などの代表値を入れる（精度は落ちる）。
 */
export function calcMoonSign(date: Date): MoonSignResult {
  const lon = moonEclipticLongitude(date);
  const index = Math.floor(lon / 30) % 12;
  const degreeInSign = lon - index * 30;
  const nearCusp = degreeInSign < 1.5 || degreeInSign > 28.5;
  return {
    moonSign: ZODIAC_ORDER[index],
    longitude: lon,
    degreeInSign,
    nearCusp,
  };
}

/**
 * 入力（生年月日・時刻・タイムゾーン）から Date を組み立てる補助。
 * @param dateStr "YYYY-MM-DD"
 * @param timeStr "HH:mm"（未入力なら正午を仮定）
 * @param tzOffsetMinutes 出生地のUTCオフセット（分）。日本なら +540。
 */
export function buildBirthDate(
  dateStr: string,
  timeStr: string | null,
  tzOffsetMinutes: number
): Date | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!dm) return null;
  const year = Number(dm[1]);
  const month = Number(dm[2]);
  const day = Number(dm[3]);

  let hh = 12;
  let mm = 0;
  if (timeStr) {
    const tm = /^(\d{1,2}):(\d{2})$/.exec(timeStr);
    if (tm) {
      hh = Number(tm[1]);
      mm = Number(tm[2]);
    }
  }

  // ローカル(出生地)時刻を UTC に変換: UTC = local - offset
  const utcMs = Date.UTC(year, month - 1, day, hh, mm) - tzOffsetMinutes * 60000;
  const d = new Date(utcMs);
  return isNaN(d.getTime()) ? null : d;
}
