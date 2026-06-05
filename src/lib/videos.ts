import { driveEmbedUrl } from "@/lib/google-drive";
import type { Video } from "@/lib/videos-store";
import {
  createVideo,
  findVideoById,
  listVideos,
} from "@/lib/videos-store";
import type { VideoCardData } from "@/lib/types";

export type { Video } from "@/lib/videos-store";
export type { VideoCardData } from "@/lib/types";
export { formatDuration } from "@/lib/types";

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
