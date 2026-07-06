import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Program, PublishInput, PublishResult } from './types';

/**
 * LMS DB（Supabase）。programs / courses / lessons を扱う。
 * サーバー専用（SERVICE_ROLE_KEY を使う）。クライアントに import しないこと。
 */
function getClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** プログラム一覧を取得（入口ページ用）。未設定なら空配列。 */
export async function listPrograms(): Promise<Program[]> {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client
    .from('programs')
    .select('id, name, description')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('[supabase] listPrograms error:', error.message);
    return [];
  }
  return (data ?? []) as Program[];
}

/**
 * 生成した教材を LMS に「下書き」登録する。
 * course を作成（または既存を再利用）し、その配下に lesson を追加。
 */
export async function publishToLms(input: PublishInput): Promise<PublishResult> {
  const client = getClient();
  if (!client) {
    return {
      status: 'skipped',
      live: false,
      detail: 'Supabase 未設定のため排出をスキップ',
    };
  }

  try {
    // 1) コースを取得 or 作成（同一プログラム内で同名なら再利用）
    let courseId: string | undefined;
    const { data: existing } = await client
      .from('courses')
      .select('id')
      .eq('program_id', input.programId)
      .eq('title', input.courseTitle)
      .maybeSingle();

    if (existing?.id) {
      courseId = existing.id as string;
    } else {
      const { data: course, error: courseErr } = await client
        .from('courses')
        .insert({
          program_id: input.programId,
          title: input.courseTitle,
          status: 'draft',
        })
        .select('id')
        .single();
      if (courseErr) throw courseErr;
      courseId = course.id as string;
    }

    // 2) レッスンを追加
    const { data: lesson, error: lessonErr } = await client
      .from('lessons')
      .insert({
        course_id: courseId,
        title: input.lessonTitle,
        video_url: input.videoUrl ?? null,
        body: input.scriptText ?? null,
        status: 'draft',
      })
      .select('id')
      .single();
    if (lessonErr) throw lessonErr;

    return {
      status: 'ok',
      live: true,
      courseId,
      lessonId: lesson.id as string,
      detail: '下書きとしてコース／レッスンを登録しました',
    };
  } catch (err: any) {
    return {
      status: 'error',
      live: true,
      detail: `LMS 排出 失敗: ${err?.message ?? err}`,
    };
  }
}
