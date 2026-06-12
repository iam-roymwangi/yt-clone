import { driveEmbedUrl } from "@/lib/google-drive";
import type { Video } from "@/lib/videos-store";
import {
  createVideo,
  findVideoById,
  listVideos,
  updateVideo,
  deleteVideo,
} from "@/lib/videos-store";
import type { VideoCardData } from "@/lib/types";

export type { Video } from "@/lib/videos-store";
export type { VideoCardData } from "@/lib/types";
export { formatDuration } from "@/lib/types";
export { updateVideo, deleteVideo } from "@/lib/videos-store";

export function toVideoCardData(video: Video, viewCount = 0): VideoCardData {
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
    category: video.category,
    viewCount,
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
  category?: "video" | "movie" | "podcast" | "mixtape";
}): Promise<Video> {
  return createVideo(input);
}
