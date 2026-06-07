-- Add category field to videos table
alter table public.videos
  add column if not exists category text not null default 'video'
  check (category in ('video', 'movie'));
