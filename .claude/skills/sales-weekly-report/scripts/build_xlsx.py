#!/usr/bin/env python3
"""営業案件JSON -> Excel（案件一覧 + サマリ）

使い方:
    python3 build_xlsx.py deals.json 営業進捗_20260911.xlsx

入力JSONの形（詳細は SKILL.md「案件JSONの形」を参照）:
{
  "period": {"start": "2026-09-04 15:00", "end": "2026-09-11 15:00"},
  "generated_at": "2026-09-11 15:00",
  "deals": [ {...}, ... ]
}

金額が不明な案件は amount_yen を null にする。0 と null は意味が違う
（0 は「無償」、null は「Slackに書かれていない」）ので、ここでは区別して扱う。
"""

import json
import sys
from datetime import date, datetime

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

# 列定義: (見出し, JSONキー, 幅, 表示形式)
COLUMNS = [
    ("顧客名", "customer", 22, None),
    ("案件名", "deal", 26, None),
    ("フェーズ", "phase", 10, None),
    ("金額(円)", "amount_yen", 14, '¥#,##0;;"-"'),
    ("受注確度", "probability", 10, '0"%";;"-"'),
    ("加重金額(円)", None, 14, '¥#,##0;;"-"'),  # 数式列
    ("今週の動き", "this_week", 46, None),
    ("次のアクション", "next_action", 34, None),
    ("期日", "due", 12, None),
    ("担当", "owner", 12, None),
    ("リスク・滞り", "risk", 28, None),
    ("出典", "source", 34, None),
]

PHASE_ORDER = ["リード", "初回接触", "提案", "見積", "交渉", "受注", "失注", "保留"]

HEADER_FILL = PatternFill("solid", fgColor="1F3864")
HEADER_FONT = Font(color="FFFFFF", bold=True, size=11)
ALERT_FILL = PatternFill("solid", fgColor="FCE4E4")   # 期日超過・失注
WARN_FILL = PatternFill("solid", fgColor="FFF3CD")    # 期日が3日以内
WON_FILL = PatternFill("solid", fgColor="E5F3E5")     # 受注
THIN = Side(style="thin", color="D9D9D9")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)


def parse_due(value):
    """期日文字列を date にする。読めなければ None（空欄と同じ扱い）。"""
    if not value:
        return None
    text = str(value).strip().replace("/", "-")
    for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M", "%m-%d"):
        try:
            parsed = datetime.strptime(text, fmt)
        except ValueError:
            continue
        if fmt == "%m-%d":
            parsed = parsed.replace(year=date.today().year)
        return parsed.date()
    return None


def row_fill(deal, today):
    """行の背景色。目で見て一瞬で「触るべき案件」が分かるのが目的。"""
    phase = (deal.get("phase") or "").strip()
    if phase == "受注":
        return WON_FILL
    if phase == "失注":
        return ALERT_FILL
    due = parse_due(deal.get("due"))
    if due:
        remaining = (due - today).days
        if remaining < 0:
            return ALERT_FILL
        if remaining <= 3:
            return WARN_FILL
    return None


def write_deals_sheet(ws, deals, today):
    ws.freeze_panes = "A2"
    for col_index, (header, _key, width, _fmt) in enumerate(COLUMNS, start=1):
        cell = ws.cell(row=1, column=col_index, value=header)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(vertical="center", horizontal="center")
        cell.border = BORDER
        ws.column_dimensions[get_column_letter(col_index)].width = width
    ws.row_dimensions[1].height = 24

    for offset, deal in enumerate(deals):
        row = offset + 2
        fill = row_fill(deal, today)
        for col_index, (header, key, _width, fmt) in enumerate(COLUMNS, start=1):
            if header == "加重金額(円)":
                # 金額と確度の両方がある行だけ計算する。片方でも欠けたら空欄のまま。
                value = (
                    f"=IF(OR(D{row}=\"\",E{row}=\"\"),\"\",D{row}*E{row}/100)"
                    if deal.get("amount_yen") is not None and deal.get("probability") is not None
                    else None
                )
            else:
                value = deal.get(key)
                if value == "":
                    value = None
            cell = ws.cell(row=row, column=col_index, value=value)
            cell.border = BORDER
            cell.alignment = Alignment(
                vertical="top",
                wrap_text=header in ("今週の動き", "次のアクション", "リスク・滞り"),
            )
            if fmt:
                cell.number_format = fmt
            if fill:
                cell.fill = fill
        ws.row_dimensions[row].height = 34

    last_row = max(len(deals) + 1, 2)
    ws.auto_filter.ref = f"A1:{get_column_letter(len(COLUMNS))}{last_row}"


def write_summary_sheet(ws, deals, period, generated_at):
    ws.column_dimensions["A"].width = 18
    for letter in "BCD":
        ws.column_dimensions[letter].width = 16

    ws["A1"] = "営業進捗サマリ"
    ws["A1"].font = Font(bold=True, size=14)
    ws["A2"] = "集計期間"
    ws["B2"] = f"{period.get('start', '')} 〜 {period.get('end', '')}"
    ws["A3"] = "作成日時"
    ws["B3"] = generated_at
    ws["A4"] = "案件数"
    ws["B4"] = len(deals)

    header_row = 6
    for col_index, header in enumerate(["フェーズ", "件数", "金額合計(円)", "加重金額(円)"], start=1):
        cell = ws.cell(row=header_row, column=col_index, value=header)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center")
        cell.border = BORDER

    # PHASE_ORDER にない表記が来ても落とさず末尾に足す（現場の言い回しは揺れる）。
    phases = list(PHASE_ORDER)
    for deal in deals:
        phase = (deal.get("phase") or "未分類").strip()
        if phase not in phases:
            phases.append(phase)

    row = header_row + 1
    total_amount = 0
    total_weighted = 0.0
    for phase in phases:
        members = [d for d in deals if (d.get("phase") or "未分類").strip() == phase]
        if not members:
            continue
        amount = sum(d["amount_yen"] for d in members if d.get("amount_yen") is not None)
        weighted = sum(
            d["amount_yen"] * d["probability"] / 100
            for d in members
            if d.get("amount_yen") is not None and d.get("probability") is not None
        )
        # 失注は「今いくらのパイプラインがあるか」ではないので合計から外す。
        # 行としては残す（その週に何を失ったかは会議で必要な情報）。
        if phase != "失注":
            total_amount += amount
            total_weighted += weighted
        values = [phase, len(members), amount or None, round(weighted) or None]
        for col_index, value in enumerate(values, start=1):
            cell = ws.cell(row=row, column=col_index, value=value)
            cell.border = BORDER
            if col_index >= 3:
                cell.number_format = '¥#,##0;;"-"'
        row += 1

    open_count = len([d for d in deals if (d.get("phase") or "").strip() != "失注"])
    total_row = ["合計（失注除く）", open_count, total_amount or None, round(total_weighted) or None]
    for col_index, value in enumerate(total_row, start=1):
        cell = ws.cell(row=row, column=col_index, value=value)
        cell.font = Font(bold=True)
        cell.border = BORDER
        if col_index >= 3:
            cell.number_format = '¥#,##0;;"-"'

    note_row = row + 2
    ws.cell(row=note_row, column=1, value="※ 金額・確度はSlackに明記があったものだけを集計しています（空欄＝未記載）。")
    ws.cell(row=note_row + 1, column=1, value="※ 加重金額 = 金額 × 受注確度。両方が埋まっている案件のみ。")


def main():
    if len(sys.argv) != 3:
        print("usage: build_xlsx.py <deals.json> <output.xlsx>", file=sys.stderr)
        return 1

    with open(sys.argv[1], encoding="utf-8") as handle:
        data = json.load(handle)

    deals = data.get("deals", [])
    period = data.get("period", {})
    generated_at = data.get("generated_at", datetime.now().strftime("%Y-%m-%d %H:%M"))

    # フェーズ順 → 加重金額の大きい順。上から読めば優先度順になる並び。
    def sort_key(deal):
        phase = (deal.get("phase") or "").strip()
        rank = PHASE_ORDER.index(phase) if phase in PHASE_ORDER else len(PHASE_ORDER)
        amount = deal.get("amount_yen") or 0
        probability = deal.get("probability") or 0
        return (rank, -(amount * probability / 100), -(amount))

    deals = sorted(deals, key=sort_key)

    workbook = Workbook()
    summary = workbook.active
    summary.title = "サマリ"
    detail = workbook.create_sheet("案件一覧")

    write_summary_sheet(summary, deals, period, generated_at)
    write_deals_sheet(detail, deals, date.today())

    workbook.save(sys.argv[2])
    print(f"wrote {sys.argv[2]} ({len(deals)} deals)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
