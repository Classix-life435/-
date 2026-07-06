-- RAGNIZE 教材ジェネレーター — LMS スキーマ（programs / courses / lessons）
-- 既存の RAGNIZE LMS と同じDBを共有する想定。テーブルが未作成の環境向けに用意。
--
-- 実行: Supabase の SQL Editor に貼り付けて実行、または
--   psql "$SUPABASE_DB_URL" -f supabase/schema.sql

create extension if not exists "pgcrypto";

-- プログラム（研修プログラム＝コースの束）
create table if not exists programs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- コース（プログラム配下）
create table if not exists courses (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references programs (id) on delete cascade,
  title       text not null,
  status      text not null default 'draft',  -- draft | published
  created_at  timestamptz not null default now()
);

create index if not exists courses_program_id_idx on courses (program_id);

-- レッスン（コース配下＝1本の教材動画）
create table if not exists lessons (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses (id) on delete cascade,
  title       text not null,
  body        text,                          -- 台本本文
  video_url   text,                          -- Vimeo 埋め込みURL/リンク
  status      text not null default 'draft', -- draft | published
  position    int  not null default 0,       -- 並び順
  created_at  timestamptz not null default now()
);

create index if not exists lessons_course_id_idx on lessons (course_id);

-- （任意）動画合成などの長尺工程をキュー分離する場合のジョブ表
create table if not exists generation_jobs (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null,                 -- 'video' など
  status      text not null default 'queued',-- queued | running | done | failed
  payload     jsonb,                         -- 入力（台本・スライド・音声URL等）
  result      jsonb,                         -- 出力（動画URL等）
  error       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists generation_jobs_status_idx on generation_jobs (status);

-- 初期データ（デモ用プログラム）
insert into programs (name, description)
select '新入社員研修', '入社時に受講する基礎プログラム'
where not exists (select 1 from programs);
