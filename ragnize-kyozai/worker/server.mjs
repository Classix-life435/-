// RAGNIZE 動画合成ワーカー（Express）
// アプリの lib/video.ts が RENDER_WORKER_URL に対して叩く HTTP 契約を実装する。
//
//   POST /            body: { script, slides, audio }
//   res:              { url, durationSec }
//
// 合成済み MP4 は OUTPUT_DIR に保存し、/videos/<id>.mp4 で配信する。
// 本番では S3 / Supabase Storage 等へアップロードして、その公開URLを返すこと
// （Vimeo は pull 方式でその公開URLを取得するため、到達可能なURLが必要）。

import express from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import { renderJob } from './render.mjs';

const app = express();
app.use(express.json({ limit: '64mb' })); // 音声を data URL で受ける場合に備えて大きめ

const PORT = process.env.PORT || 4000;
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(process.cwd(), 'output');
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;

app.use('/videos', express.static(OUTPUT_DIR));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/', async (req, res) => {
  const { script } = req.body || {};
  if (!script?.title || !Array.isArray(script?.segments)) {
    return res.status(400).json({ error: 'script.title と script.segments が必要です' });
  }

  const id = crypto.randomUUID();
  const outFile = path.join(OUTPUT_DIR, `${id}.mp4`);

  try {
    const { durationSec } = await renderJob(req.body, outFile);
    return res.json({
      url: `${PUBLIC_BASE}/videos/${id}.mp4`,
      durationSec,
    });
  } catch (err) {
    console.error('[worker] render failed:', err);
    return res.status(500).json({ error: `動画合成に失敗しました: ${err?.message ?? err}` });
  }
});

app.listen(PORT, () => {
  console.log(`RAGNIZE render worker listening on ${PORT}`);
  console.log(`  output: ${OUTPUT_DIR}`);
  console.log(`  public: ${PUBLIC_BASE}/videos/<id>.mp4`);
});
