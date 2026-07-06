import PptxGenJS from 'pptxgenjs';
import type { Script } from './types';

/**
 * 台本（Script）から PowerPoint（.pptx）を生成する。
 * APIキー不要でサーバー側で完結する（Canva を使わない／使えない場合の標準スライド出力）。
 *
 * 構成:
 *   - タイトルスライド（導入ナレーションをノートに）
 *   - セグメントごとに1枚（見出し＋要点。ナレーションはスピーカーノート）
 *   - まとめスライド
 */
export async function buildPptx(script: Script): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 16:9
  pptx.author = 'RAGNIZE 教材ジェネレーター';
  pptx.title = script.title;

  const BG = 'FFFFFF';
  const PRIMARY = '1B2540';
  const ACCENT = '5B8CFF';
  const MUTED = '4A5568';

  // ── タイトルスライド ─────────────────────────────
  const title = pptx.addSlide();
  title.background = { color: BG };
  title.addShape('rect', { x: 0, y: 5.9, w: '100%', h: 0.25, fill: { color: ACCENT } });
  title.addText(script.title, {
    x: 0.6,
    y: 2.1,
    w: 12.1,
    h: 1.6,
    fontSize: 40,
    bold: true,
    color: PRIMARY,
    align: 'left',
  });
  title.addText('RAGNIZE 教材', {
    x: 0.6,
    y: 3.7,
    w: 12.1,
    h: 0.6,
    fontSize: 18,
    color: MUTED,
  });
  if (script.intro) title.addNotes(script.intro);

  // ── 本編スライド ────────────────────────────────
  script.segments.forEach((seg, i) => {
    const slide = pptx.addSlide();
    slide.background = { color: BG };

    // ページ番号アクセント
    slide.addText(String(i + 1).padStart(2, '0'), {
      x: 0.6,
      y: 0.4,
      w: 1.2,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: ACCENT,
    });

    // 見出し
    slide.addText(seg.heading, {
      x: 1.7,
      y: 0.4,
      w: 11.0,
      h: 0.9,
      fontSize: 28,
      bold: true,
      color: PRIMARY,
      valign: 'middle',
    });

    // 区切り線
    slide.addShape('line', {
      x: 0.6,
      y: 1.45,
      w: 12.1,
      h: 0,
      line: { color: 'E2E8F0', width: 1 },
    });

    // 要点（箇条書き）
    if (seg.bullets.length > 0) {
      slide.addText(
        seg.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
        {
          x: 0.9,
          y: 1.8,
          w: 11.5,
          h: 4.8,
          fontSize: 20,
          color: PRIMARY,
          valign: 'top',
          lineSpacingMultiple: 1.3,
        },
      );
    }

    // ナレーションはスピーカーノートへ（TTS原稿と共有）
    if (seg.narration) slide.addNotes(seg.narration);
  });

  // ── まとめスライド ─────────────────────────────
  const outro = pptx.addSlide();
  outro.background = { color: BG };
  outro.addText('まとめ', {
    x: 0.6,
    y: 0.6,
    w: 12.1,
    h: 0.9,
    fontSize: 28,
    bold: true,
    color: PRIMARY,
  });
  outro.addText(script.outro || 'ここまでの内容を振り返りましょう。', {
    x: 0.9,
    y: 2.0,
    w: 11.5,
    h: 3.5,
    fontSize: 22,
    color: MUTED,
    valign: 'top',
    lineSpacingMultiple: 1.4,
  });
  if (script.outro) outro.addNotes(script.outro);

  const out = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
  return out;
}

/** ダウンロード用の安全なファイル名（.pptx） */
export function pptxFilename(script: Script): string {
  const base = (script.title || 'kyozai')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 60);
  return `${base || 'kyozai'}.pptx`;
}
