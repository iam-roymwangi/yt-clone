-- Google Drive mode: public read, inserts via service role from API

drop policy if exists "Authenticated users can read videos" on public.videos;

create policy "Anyone can read videos"
  on public.videos for select
  using (true);

-- r2_key stores drive_file_id; thumbnail_url stores the share link (drive_url)
