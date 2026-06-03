-- Supabase Storage bucket for videos (private — access via API proxy)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  false,
  5368709120, -- 5 GB
  array['video/mp4', 'video/webm', 'video/ogg', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Service role uploads via signed URLs from API routes.
-- Authenticated users read through the Next.js proxy, not directly from storage.
