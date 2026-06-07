import fs from "fs";
import path from "path";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/service";

const SERIES_FILE = path.join(process.cwd(), "src/data/series.json");

export type Series = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  createdAt: string;
};

export type Episode = {
  id: string;
  seriesId: string;
  season: number;
  episodeNumber: number;
  title: string;
  description: string;
  driveFileId: string;
  driveUrl: string;
  durationSeconds: number | null;
  createdAt: string;
};

export type SeriesWithEpisodes = Series & { episodes: Episode[] };

// ─── helpers ────────────────────────────────────────────────────────────────

function isVercel() {
  return process.env.VERCEL === "1";
}

function shouldUseJson() {
  return !isSupabaseConfigured() && !isVercel();
}

type JsonStore = { series: Series[]; episodes: Episode[] };

function readJson(): JsonStore {
  try {
    const raw = fs.readFileSync(SERIES_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<JsonStore>;
    return { series: parsed.series ?? [], episodes: parsed.episodes ?? [] };
  } catch {
    return { series: [], episodes: [] };
  }
}

function writeJson(store: JsonStore) {
  fs.writeFileSync(SERIES_FILE, JSON.stringify(store, null, 2) + "\n", "utf-8");
}

// ─── Supabase ────────────────────────────────────────────────────────────────

type SeriesRow = { id: string; title: string; description: string; thumbnail_url: string | null; created_at: string };
type EpisodeRow = {
  id: string; series_id: string; season: number; episode_number: number;
  title: string; description: string; drive_file_id: string; drive_url: string;
  duration_seconds: number | null; created_at: string;
};

function rowToSeries(r: SeriesRow): Series {
  return { id: r.id, title: r.title, description: r.description ?? "", thumbnailUrl: r.thumbnail_url, createdAt: r.created_at };
}

function rowToEpisode(r: EpisodeRow): Episode {
  return {
    id: r.id, seriesId: r.series_id, season: r.season, episodeNumber: r.episode_number,
    title: r.title, description: r.description ?? "", driveFileId: r.drive_file_id,
    driveUrl: r.drive_url, durationSeconds: r.duration_seconds, createdAt: r.created_at,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function listSeries(): Promise<Series[]> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data, error } = await sb.from("series").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToSeries);
  }
  if (shouldUseJson()) return readJson().series.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return [];
}

export async function findSeriesById(id: string): Promise<Series | null> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data, error } = await sb.from("series").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? rowToSeries(data) : null;
  }
  if (shouldUseJson()) return readJson().series.find((s) => s.id === id) ?? null;
  return null;
}

export async function findSeriesWithEpisodes(id: string): Promise<SeriesWithEpisodes | null> {
  const series = await findSeriesById(id);
  if (!series) return null;
  const episodes = await listEpisodesForSeries(id);
  return { ...series, episodes };
}

export async function createSeries(input: { title: string; description?: string }): Promise<Series> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data, error } = await sb.from("series")
      .insert({ title: input.title.trim(), description: input.description?.trim() ?? "" })
      .select("*").single();
    if (error) throw error;
    return rowToSeries(data);
  }
  if (shouldUseJson()) {
    const store = readJson();
    const s: Series = { id: crypto.randomUUID(), title: input.title.trim(), description: input.description?.trim() ?? "", thumbnailUrl: null, createdAt: new Date().toISOString() };
    store.series.push(s);
    writeJson(store);
    return s;
  }
  throw new Error("Storage not configured");
}

export async function updateSeries(id: string, input: { title?: string; description?: string }): Promise<Series> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.title = input.title.trim();
    if (input.description !== undefined) patch.description = input.description.trim();
    const { data, error } = await sb.from("series").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return rowToSeries(data);
  }
  if (shouldUseJson()) {
    const store = readJson();
    const idx = store.series.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Series not found");
    if (input.title !== undefined) store.series[idx].title = input.title.trim();
    if (input.description !== undefined) store.series[idx].description = input.description.trim();
    writeJson(store);
    return store.series[idx];
  }
  throw new Error("Storage not configured");
}

export async function deleteSeries(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { error } = await sb.from("series").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  if (shouldUseJson()) {
    const store = readJson();
    store.series = store.series.filter((s) => s.id !== id);
    store.episodes = store.episodes.filter((e) => e.seriesId !== id);
    writeJson(store);
    return;
  }
  throw new Error("Storage not configured");
}

export async function listEpisodesForSeries(seriesId: string): Promise<Episode[]> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data, error } = await sb.from("episodes").select("*")
      .eq("series_id", seriesId).order("season").order("episode_number");
    if (error) throw error;
    return (data ?? []).map(rowToEpisode);
  }
  if (shouldUseJson()) {
    return readJson().episodes
      .filter((e) => e.seriesId === seriesId)
      .sort((a, b) => a.season - b.season || a.episodeNumber - b.episodeNumber);
  }
  return [];
}

export async function findEpisodeById(id: string): Promise<Episode | null> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data, error } = await sb.from("episodes").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? rowToEpisode(data) : null;
  }
  if (shouldUseJson()) return readJson().episodes.find((e) => e.id === id) ?? null;
  return null;
}

export async function createEpisode(input: {
  seriesId: string; season: number; episodeNumber: number;
  title: string; description?: string; driveFileId: string; driveUrl: string;
  durationSeconds?: number | null;
}): Promise<Episode> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data, error } = await sb.from("episodes").insert({
      series_id: input.seriesId, season: input.season, episode_number: input.episodeNumber,
      title: input.title.trim(), description: input.description?.trim() ?? "",
      drive_file_id: input.driveFileId, drive_url: input.driveUrl,
      duration_seconds: input.durationSeconds ?? null,
    }).select("*").single();
    if (error) {
      if (error.code === "23505") throw new Error(`Episode S${input.season}E${input.episodeNumber} already exists in this series.`);
      throw error;
    }
    return rowToEpisode(data);
  }
  if (shouldUseJson()) {
    const store = readJson();
    const clash = store.episodes.find((e) => e.seriesId === input.seriesId && e.season === input.season && e.episodeNumber === input.episodeNumber);
    if (clash) throw new Error(`Episode S${input.season}E${input.episodeNumber} already exists.`);
    const ep: Episode = {
      id: crypto.randomUUID(), seriesId: input.seriesId, season: input.season,
      episodeNumber: input.episodeNumber, title: input.title.trim(),
      description: input.description?.trim() ?? "", driveFileId: input.driveFileId,
      driveUrl: input.driveUrl, durationSeconds: input.durationSeconds ?? null,
      createdAt: new Date().toISOString(),
    };
    store.episodes.push(ep);
    writeJson(store);
    return ep;
  }
  throw new Error("Storage not configured");
}

export async function updateEpisode(id: string, input: {
  title?: string; description?: string; driveUrl?: string;
  driveFileId?: string; season?: number; episodeNumber?: number;
  durationSeconds?: number | null;
}): Promise<Episode> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.title = input.title.trim();
    if (input.description !== undefined) patch.description = input.description.trim();
    if (input.driveUrl !== undefined) patch.drive_url = input.driveUrl;
    if (input.driveFileId !== undefined) patch.drive_file_id = input.driveFileId;
    if (input.season !== undefined) patch.season = input.season;
    if (input.episodeNumber !== undefined) patch.episode_number = input.episodeNumber;
    if (input.durationSeconds !== undefined) patch.duration_seconds = input.durationSeconds;
    const { data, error } = await sb.from("episodes").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return rowToEpisode(data);
  }
  if (shouldUseJson()) {
    const store = readJson();
    const idx = store.episodes.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Episode not found");
    const ep = store.episodes[idx];
    if (input.title !== undefined) ep.title = input.title.trim();
    if (input.description !== undefined) ep.description = input.description.trim();
    if (input.driveUrl !== undefined) ep.driveUrl = input.driveUrl;
    if (input.driveFileId !== undefined) ep.driveFileId = input.driveFileId;
    if (input.season !== undefined) ep.season = input.season;
    if (input.episodeNumber !== undefined) ep.episodeNumber = input.episodeNumber;
    if (input.durationSeconds !== undefined) ep.durationSeconds = input.durationSeconds;
    writeJson(store);
    return ep;
  }
  throw new Error("Storage not configured");
}

export async function deleteEpisode(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { error } = await sb.from("episodes").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  if (shouldUseJson()) {
    const store = readJson();
    store.episodes = store.episodes.filter((e) => e.id !== id);
    writeJson(store);
    return;
  }
  throw new Error("Storage not configured");
}
