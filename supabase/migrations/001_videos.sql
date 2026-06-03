-- Nexora video library schema

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  r2_key text not null unique,
  thumbnail_url text,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  uploaded_by uuid references auth.users (id) on delete set null
);

create table public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  progress_seconds integer not null default 0,
  watched_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create index videos_created_at_idx on public.videos (created_at desc);
create index watch_history_user_id_idx on public.watch_history (user_id);

alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.watch_history enable row level security;

-- Profiles: users can read their own row
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Videos: authenticated users can read all videos
create policy "Authenticated users can read videos"
  on public.videos for select
  to authenticated
  using (true);

-- Videos: admins can insert/update/delete
create policy "Admins can insert videos"
  on public.videos for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can update videos"
  on public.videos for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can delete videos"
  on public.videos for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Watch history: users manage their own rows
create policy "Users can read own watch history"
  on public.watch_history for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own watch history"
  on public.watch_history for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own watch history"
  on public.watch_history for update
  to authenticated
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, is_admin)
  values (new.id, false);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
