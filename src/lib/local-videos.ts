import fs from "fs";
import path from "path";

const VIDEOS_DIR = path.join(process.cwd(), "public", "videos");
const THUMBNAILS_DIR = path.join(VIDEOS_DIR, "thumbnails");
const VIDEO_EXT = /\.(mp4|webm|ogg)$/i;
const THUMB_EXT = /\.(jpg|jpeg|webp|png)$/i;

export type LocalVideo = {
  /** URL-safe id (encoded filename) */
  id: string;
  filename: string;
  title: string;
  /** Static path served from Vercel CDN — no API proxy */
  src: string;
  /** Optional static poster in public/videos/thumbnails */
  posterSrc: string | null;
};

function findPosterSrc(filename: string): string | null {
  if (!fs.existsSync(THUMBNAILS_DIR)) return null;

  const base = filename.replace(/\.[^.]+$/i, "");
  const files = fs.readdirSync(THUMBNAILS_DIR);

  for (const thumb of files) {
    if (!THUMB_EXT.test(thumb)) continue;
    const thumbBase = thumb.replace(/\.[^.]+$/i, "");
    if (thumbBase === base) {
      return `/videos/thumbnails/${encodeURIComponent(thumb)}`;
    }
  }
  return null;
}

export function videoSrc(filename: string): string {
  return `/videos/${encodeURIComponent(filename)}`;
}

export function humanizeFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/i, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*\(\d+p\)\s*$/i, "")
    .trim();
}

export function getLocalVideos(): LocalVideo[] {
  if (!fs.existsSync(VIDEOS_DIR)) return [];

  return fs
    .readdirSync(VIDEOS_DIR)
    .filter((name) => VIDEO_EXT.test(name) && !name.startsWith("."))
    .sort((a, b) => a.localeCompare(b))
    .map((filename) => ({
      id: encodeURIComponent(filename),
      filename,
      title: humanizeFilename(filename),
      src: videoSrc(filename),
      posterSrc: findPosterSrc(filename),
    }));
}

export function getLocalVideoById(id: string): LocalVideo | undefined {
  const decoded = decodeURIComponent(id);
  return getLocalVideos().find((v) => v.filename === decoded);
}
