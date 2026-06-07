-- Series table
create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create index if not exists series_created_at_idx on public.series (created_at desc);

alter table public.series enable row level security;

create policy "Anyone can read series"
  on public.series for select using (true);

-- Episodes table
create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  season int not null default 1,
  episode_number int not null,
  title text not null,
  description text not null default '',
  drive_file_id text not null,
  drive_url text not null,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  unique(series_id, season, episode_number)
);

create index if not exists episodes_series_id_idx on public.episodes (series_id, season, episode_number);

alter table public.episodes enable row level security;

create policy "Anyone can read episodes"
  on public.episodes for select using (true);
