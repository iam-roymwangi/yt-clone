import fs from "fs";
import path from "path";
import { extractDriveFileId } from "@/lib/google-drive";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/service";

const VIDEOS_FILE = path.join(process.cwd(), "src/data/videos.json");

export type Video = {
  id: string;
  title: string;
  description: string;
  driveUrl: string;
  driveFileId: string;
  durationSeconds: number | null;
  createdAt: string;
};

function isVercel(): boolean {
  return process.env.VERCEL === "1";
}

function shouldUseJsonFile(): boolean {
  return !isSupabaseConfigured() && !isVercel();
}

type DbRow = {
  id: string;
  title: string;
  description: string;
  r2_key: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  created_at: string;
};

function rowToVideo(row: DbRow): Video {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    driveFileId: row.r2_key,
    driveUrl: row.thumbnail_url ?? "",
    durationSeconds: row.duration_seconds,
    createdAt: row.created_at,
  };
}

function readVideosFile(): Video[] {
  try {
    const raw = fs.readFileSync(VIDEOS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Video[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeVideosFile(videos: Video[]) {
  fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2) + "\n", "utf-8");
}

function sortVideos(videos: Video[]): Video[] {
  return videos.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function isMissingTableError(error: { code?: string }): boolean {
  return error.code === "PGRST205";
}

const MISSING_TABLE_MSG =
  "The videos table is missing. Open Supabase → SQL Editor, run supabase/setup.sql, then try again.";

function listFromJsonFallback(): Video[] {
  return sortVideos(readVideosFile());
}

async function getVideosFromSupabase(): Promise<Video[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, description, r2_key, thumbnail_url, duration_seconds, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      console.warn("[videos]", MISSING_TABLE_MSG);
      if (!isVercel()) return listFromJsonFallback();
      return [];
    }
    throw error;
  }
  return (data ?? []).map(rowToVideo);
}

async function getVideoByIdFromSupabase(id: string): Promise<Video | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, description, r2_key, thumbnail_url, duration_seconds, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      if (!isVercel()) {
        return readVideosFile().find((v) => v.id === id) ?? null;
      }
      return null;
    }
    throw error;
  }
  return data ? rowToVideo(data) : null;
}

async function addVideoToSupabase(input: {
  title: string;
  description?: string;
  driveUrl: string;
  durationSeconds?: number | null;
}): Promise<Video> {
  const fileId = extractDriveFileId(input.driveUrl);
  if (!fileId) throw new Error("Invalid Google Drive link");

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("videos")
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      r2_key: fileId,
      thumbnail_url: input.driveUrl.trim(),
      duration_seconds: input.durationSeconds ?? null,
      uploaded_by: null,
    })
    .select("id, title, description, r2_key, thumbnail_url, duration_seconds, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This Google Drive video is already in the library.");
    }
    if (isMissingTableError(error)) {
      throw new Error(MISSING_TABLE_MSG);
    }
    throw error;
  }
  return rowToVideo(data);
}

export function getStorageMode(): "supabase" | "json" | "unconfigured" {
  if (isSupabaseConfigured()) return "supabase";
  if (shouldUseJsonFile()) return "json";
  return "unconfigured";
}

export async function listVideos(): Promise<Video[]> {
  if (isSupabaseConfigured()) {
    return getVideosFromSupabase();
  }
  if (shouldUseJsonFile()) {
    return listFromJsonFallback();
  }
  return [];
}

export async function findVideoById(id: string): Promise<Video | null> {
  if (isSupabaseConfigured()) {
    return getVideoByIdFromSupabase(id);
  }
  if (shouldUseJsonFile()) {
    return readVideosFile().find((v) => v.id === id) ?? null;
  }
  return null;
}

export async function createVideo(input: {
  title: string;
  description?: string;
  driveUrl: string;
  durationSeconds?: number | null;
}): Promise<Video> {
  if (isSupabaseConfigured()) {
    return addVideoToSupabase(input);
  }

  if (shouldUseJsonFile()) {
    const fileId = extractDriveFileId(input.driveUrl);
    if (!fileId) throw new Error("Invalid Google Drive link");

    const video: Video = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      driveUrl: input.driveUrl.trim(),
      driveFileId: fileId,
      durationSeconds: input.durationSeconds ?? null,
      createdAt: new Date().toISOString(),
    };

    const videos = readVideosFile();
    videos.push(video);
    writeVideosFile(videos);
    return video;
  }

  throw new Error(
    "Video storage is not configured for production. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables."
  );
}
