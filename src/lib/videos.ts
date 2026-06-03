import fs from "fs";
import path from "path";
import {
  driveEmbedUrl,
  driveThumbnailUrl,
  extractDriveFileId,
} from "@/lib/google-drive";

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

export type VideoCardData = {
  id: string;
  title: string;
  description: string;
  driveFileId: string;
  driveUrl: string;
  embedSrc: string;
  streamSrc: string;
  thumbnailSrc: string;
  durationSeconds: number | null;
  createdAt: string;
};

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

export function toVideoCardData(video: Video): VideoCardData {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    driveFileId: video.driveFileId,
    driveUrl: video.driveUrl,
    embedSrc: driveEmbedUrl(video.driveFileId),
    streamSrc: `/api/drive-stream/${video.driveFileId}`,
    thumbnailSrc: driveThumbnailUrl(video.driveFileId),
    durationSeconds: video.durationSeconds,
    createdAt: video.createdAt,
  };
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function getVideos(): Promise<Video[]> {
  return readVideosFile().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getVideoById(id: string): Promise<Video | null> {
  return readVideosFile().find((v) => v.id === id) ?? null;
}

export async function addVideo(input: {
  title: string;
  description?: string;
  driveUrl: string;
  durationSeconds?: number | null;
}): Promise<Video> {
  const fileId = extractDriveFileId(input.driveUrl);
  if (!fileId) {
    throw new Error("Invalid Google Drive link");
  }

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
