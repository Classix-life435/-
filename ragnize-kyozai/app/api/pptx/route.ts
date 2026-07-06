import { buildPptx, pptxFilename } from '@/lib/pptx';
import type { Script } from '@/lib/types';

// pptxgenjs は Node ランタイムが必要
export const runtime = 'nodejs';

/**
 * 台本（Script）を受け取り、PowerPoint(.pptx) をバイナリで返す。
 * フロントの「PowerPointをダウンロード」から呼ばれる。
 */
export async function POST(req: Request) {
  let script: Script;
  try {
    script = (await req.json()) as Script;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!script?.title || !Array.isArray(script?.segments)) {
    return new Response(JSON.stringify({ error: 'script.title と script.segments が必要です' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const buffer = await buildPptx(script);
    const filename = pptxFilename(script);
    // RFC 5987 でファイル名（日本語対応）
    const encoded = encodeURIComponent(filename);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="slides.pptx"; filename*=UTF-8''${encoded}`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (err: any) {
    console.error('[api/pptx] build error:', err);
    return new Response(
      JSON.stringify({ error: `PPTX生成に失敗しました: ${err?.message ?? err}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
