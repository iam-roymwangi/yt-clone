-- Generic view counts table — tracks views for any content by id
create table if not exists public.view_counts (
  content_id text primary key,
  count bigint not null default 0
);

alter table public.view_counts enable row level security;

create policy "Anyone can read view counts"
  on public.view_counts for select using (true);

create policy "Anyone can upsert view counts"
  on public.view_counts for insert with check (true);

create policy "Anyone can update view counts"
  on public.view_counts for update using (true);
