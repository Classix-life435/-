// スライドHTMLの生成 → Playwright でPNG化 → ffmpeg で MP4 合成
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const W = 1280;
const H = 720;
const FPS = 30;

/**
 * 1シーン分のスライドHTMLを組み立てる。
 * kind: 'title' | 'segment' | 'outro'
 */
function slideHtml(scene) {
  const bullets = (scene.bullets || [])
    .map((b) => `<li>${escapeHtml(b)}</li>`)
    .join('');
  const numberBadge =
    scene.index != null ? `<div class="num">${String(scene.index).padStart(2, '0')}</div>` : '';

  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<style>
  * { margin:0; box-sizing:border-box; }
  html,body { width:${W}px; height:${H}px; }
  body {
    font-family: system-ui, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
    background:#FFFFFF; color:#1B2540; padding:64px 72px; position:relative;
  }
  .accent { position:absolute; left:0; bottom:0; width:100%; height:14px; background:#5B8CFF; }
  .num { color:#5B8CFF; font-size:34px; font-weight:800; margin-bottom:8px; }
  h1 { font-size:${scene.kind === 'title' ? 58 : 40}px; font-weight:800; line-height:1.25; }
  .sub { color:#4A5568; font-size:22px; margin-top:20px; }
  .hr { height:2px; background:#E2E8F0; margin:22px 0 26px; }
  ul { list-style:none; padding:0; }
  li { font-size:26px; line-height:1.6; margin:0 0 14px; padding-left:34px; position:relative; }
  li::before { content:'▸'; color:#5B8CFF; position:absolute; left:0; }
  .center { display:flex; flex-direction:column; justify-content:center; height:100%; }
</style></head>
<body>
  ${scene.kind === 'title'
      ? `<div class="center"><h1>${escapeHtml(scene.heading)}</h1><div class="sub">RAGNIZE 教材</div></div>`
      : `${numberBadge}<h1>${escapeHtml(scene.heading)}</h1><div class="hr"></div><ul>${bullets}</ul>`}
  <div class="accent"></div>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/** data URL / http URL を一時mp3として書き出す（無ければ null） */
async function materializeAudio(url, dir, i) {
  if (!url) return null;
  const file = path.join(dir, `audio_${i}.mp3`);
  if (url.startsWith('data:')) {
    const base64 = url.split(',')[1] ?? '';
    await writeFile(file, Buffer.from(base64, 'base64'));
    return file;
  }
  const res = await fetch(url);
  if (!res.ok) return null;
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${err.slice(-500)}`))));
  });
}

/** 日本語ナレーションの尺見積り（音声が無いシーン用）: 約6文字/秒、最低3秒 */
function estimateSec(text) {
  return Math.max(3, Math.round((text || '').length / 6));
}

/**
 * 動画合成の本体。
 * @param {{script:object, audio?:{segmentUrls?:string[]}}} job
 * @param {string} outFile 出力MP4パス
 * @returns {{durationSec:number}}
 */
export async function renderJob(job, outFile) {
  const { script, audio } = job;
  const audioUrls = audio?.segmentUrls ?? [];

  // シーン列: [タイトル, 各セグメント, まとめ]（tts.ts の parts と同じ並び）
  const scenes = [
    { kind: 'title', heading: script.title, narration: script.intro },
    ...script.segments.map((s, i) => ({
      kind: 'segment',
      index: i + 1,
      heading: s.heading,
      bullets: s.bullets,
      narration: s.narration,
    })),
    { kind: 'outro', index: null, heading: 'まとめ', bullets: [], narration: script.outro },
  ];

  const work = await mkdtemp(path.join(tmpdir(), 'ragnize-render-'));
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  let totalSec = 0;
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    const clips = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const png = path.join(work, `slide_${i}.png`);
      await page.setContent(slideHtml(scene), { waitUntil: 'load' });
      await page.screenshot({ path: png });

      const audioFile = await materializeAudio(audioUrls[i], work, i);
      const clip = path.join(work, `clip_${i}.mp4`);

      if (audioFile) {
        // 静止画＋音声 → 音声尺に合わせたクリップ
        await runFfmpeg([
          '-y', '-loop', '1', '-i', png, '-i', audioFile,
          '-c:v', 'libx264', '-tune', 'stillimage', '-pix_fmt', 'yuv420p',
          '-c:a', 'aac', '-b:a', '128k', '-r', String(FPS), '-shortest', clip,
        ]);
        totalSec += await probeDuration(audioFile);
      } else {
        // 音声なし → 見積り尺の無音クリップ
        const dur = estimateSec(scene.narration);
        await runFfmpeg([
          '-y', '-loop', '1', '-i', png, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
          '-c:v', 'libx264', '-tune', 'stillimage', '-pix_fmt', 'yuv420p',
          '-c:a', 'aac', '-b:a', '128k', '-r', String(FPS), '-t', String(dur), clip,
        ]);
        totalSec += dur;
      }
      clips.push(clip);
    }

    // 連結（concat demuxer）
    const listFile = path.join(work, 'list.txt');
    await writeFile(listFile, clips.map((c) => `file '${c}'`).join('\n'));
    await mkdir(path.dirname(outFile), { recursive: true });
    await runFfmpeg([
      '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', outFile,
    ]);

    return { durationSec: Math.round(totalSec) };
  } finally {
    await browser.close();
    await rm(work, { recursive: true, force: true }).catch(() => {});
  }
}

/** ffprobe 代わりに ffmpeg で尺取得（失敗時は0） */
function probeDuration(file) {
  return new Promise((resolve) => {
    const p = spawn(FFMPEG, ['-i', file], { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', () => {
      const m = err.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
      if (!m) return resolve(0);
      resolve(Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]));
    });
    p.on('error', () => resolve(0));
  });
}

// スライドPNGのみ生成（テスト・デバッグ用）
export async function renderSlidesOnly(script, outDir) {
  const scenes = [
    { kind: 'title', heading: script.title },
    ...script.segments.map((s, i) => ({ kind: 'segment', index: i + 1, heading: s.heading, bullets: s.bullets })),
    { kind: 'outro', heading: 'まとめ', bullets: [] },
  ];
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    const files = [];
    for (let i = 0; i < scenes.length; i++) {
      const png = path.join(outDir, `slide_${i}.png`);
      await page.setContent(slideHtml(scenes[i]), { waitUntil: 'load' });
      await page.screenshot({ path: png });
      files.push(png);
    }
    return files;
  } finally {
    await browser.close();
  }
}
