-- Run this entire file in Supabase Dashboard → SQL Editor → Run
-- Creates the videos table for Google Drive links

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  r2_key text not null unique,
  thumbnail_url text,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  uploaded_by uuid
);

create index if not exists videos_created_at_idx on public.videos (created_at desc);

alter table public.videos enable row level security;

drop policy if exists "Authenticated users can read videos" on public.videos;
drop policy if exists "Anyone can read videos" on public.videos;

create policy "Anyone can read videos"
  on public.videos for select
  using (true);

-- r2_key = Google Drive file ID
-- thumbnail_url = full Google Drive share link
