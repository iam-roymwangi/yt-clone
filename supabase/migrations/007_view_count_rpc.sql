-- Atomic increment function for view counts
create or replace function increment_view_count(content_id text)
returns bigint
language plpgsql
security definer
as $$
declare
  new_count bigint;
begin
  insert into public.view_counts (content_id, count)
  values (content_id, 1)
  on conflict (content_id)
  do update set count = public.view_counts.count + 1
  returning count into new_count;
  return new_count;
end;
$$;
