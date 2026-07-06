import { NextResponse } from 'next/server';
import { publishToLms } from '@/lib/supabase';
import type { PublishInput } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let input: PublishInput;
  try {
    input = (await req.json()) as PublishInput;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!input?.programId || !input?.courseTitle?.trim() || !input?.lessonTitle?.trim()) {
    return NextResponse.json(
      { error: 'programId / courseTitle / lessonTitle は必須です' },
      { status: 400 },
    );
  }

  const result = await publishToLms(input);
  const httpStatus = result.status === 'error' ? 500 : 200;
  return NextResponse.json(result, { status: httpStatus });
}
