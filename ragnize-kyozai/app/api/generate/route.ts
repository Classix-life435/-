import { NextResponse } from 'next/server';
import { runPipeline } from '@/lib/pipeline';
import type { GenerateInput } from '@/lib/types';

// 動画合成まで含めると時間がかかるため、実行時間を長めに確保。
// Vercel では長尺工程はワーカーへ分離するのが本筋（README 参照）。
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: Request) {
  let input: GenerateInput;
  try {
    input = (await req.json()) as GenerateInput;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!input?.title?.trim() || !input?.content?.trim()) {
    return NextResponse.json(
      { error: 'title と content は必須です' },
      { status: 400 },
    );
  }

  try {
    const result = await runPipeline({
      title: input.title.trim(),
      content: input.content.trim(),
      targetMinutes: input.targetMinutes,
      audience: input.audience,
      programId: input.programId,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[api/generate] pipeline error:', err);
    return NextResponse.json(
      { error: `生成に失敗しました: ${err?.message ?? err}` },
      { status: 500 },
    );
  }
}
