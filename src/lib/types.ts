// Shared types safe to import in both server and client components

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
  category: "video" | "movie";
  viewCount: number;
};

export function formatDuration(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
