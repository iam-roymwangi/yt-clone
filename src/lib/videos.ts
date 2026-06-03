import { driveEmbedUrl } from "@/lib/google-drive";
import type { Video } from "@/lib/videos-store";
import {
  createVideo,
  findVideoById,
  listVideos,
} from "@/lib/videos-store";

export type { Video } from "@/lib/videos-store";

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

export function toVideoCardData(video: Video): VideoCardData {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    driveFileId: video.driveFileId,
    driveUrl: video.driveUrl,
    embedSrc: driveEmbedUrl(video.driveFileId),
    streamSrc: `/api/drive-stream/${video.driveFileId}`,
    thumbnailSrc: `/api/drive-thumbnail/${video.driveFileId}`,
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
  return listVideos();
}

export async function getVideoById(id: string): Promise<Video | null> {
  return findVideoById(id);
}

export async function addVideo(input: {
  title: string;
  description?: string;
  driveUrl: string;
  durationSeconds?: number | null;
}): Promise<Video> {
  return createVideo(input);
}
