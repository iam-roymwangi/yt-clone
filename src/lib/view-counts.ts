import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/service";

// In-memory fallback for local JSON mode
const memStore = new Map<string, number>();

export async function incrementViewCount(contentId: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    // Upsert: insert with count=1 or increment existing
    const { data, error } = await sb.rpc("increment_view_count", { content_id: contentId });
    if (error) {
      // RPC might not exist yet — fall back to manual upsert
      const { data: upserted, error: upsertErr } = await sb
        .from("view_counts")
        .upsert({ content_id: contentId, count: 1 }, { onConflict: "content_id" })
        .select("count")
        .single();
      if (upsertErr) return 0;
      return (upserted?.count as number) ?? 1;
    }
    return (data as number) ?? 1;
  }
  const next = (memStore.get(contentId) ?? 0) + 1;
  memStore.set(contentId, next);
  return next;
}

export async function getViewCount(contentId: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("view_counts")
      .select("count")
      .eq("content_id", contentId)
      .maybeSingle();
    return (data?.count as number) ?? 0;
  }
  return memStore.get(contentId) ?? 0;
}

export async function getViewCounts(contentIds: string[]): Promise<Record<string, number>> {
  if (contentIds.length === 0) return {};
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("view_counts")
      .select("content_id, count")
      .in("content_id", contentIds);
    const result: Record<string, number> = {};
    for (const row of data ?? []) result[row.content_id] = row.count;
    return result;
  }
  const result: Record<string, number> = {};
  for (const id of contentIds) result[id] = memStore.get(id) ?? 0;
  return result;
}

export function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toString();
}
