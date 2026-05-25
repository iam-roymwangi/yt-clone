import * as ytdl from "@distube/ytdl-core";
import { videoInfo, getFormats } from "youtube-ext";
import {
  StreamResult,
  VideoQuality,
  getCachedVideoInfo,
  getStreamUrl as getStreamUrlEdge,
  getVideoQualities as getVideoQualitiesEdge,
  dedupeQualities,
  pickCombinedFormat,
} from "./youtube";

async function getQualitiesFromYoutubeExt(
  videoId: string
): Promise<VideoQuality[]> {
  const info = await videoInfo(videoId);
  const formats = await getFormats(info.stream, { evaluator: "eval" });

  const qualities = formats
    .filter((f) => f.mimeType?.includes("video/mp4") && f.audioQuality && f.itag)
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    .map((f) => ({
      itag: f.itag!,
      label: f.qualityLabel || (f.height ? `${f.height}p` : `itag ${f.itag}`),
      mimeType: f.mimeType?.split(";")[0] ?? "video/mp4",
      stream: "progressive" as const,
      height: f.height,
    }));

  return dedupeQualities(qualities);
}

async function getQualitiesFromYtdl(
  videoId: string
): Promise<VideoQuality[]> {
  const info = await ytdl.default.getInfo(videoId);

  const qualities = info.formats
    .filter((f) => f.hasVideo && f.hasAudio && f.itag)
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    .map((f) => ({
      itag: f.itag,
      label:
        f.qualityLabel || (f.height ? `${f.height}p` : `itag ${f.itag}`),
      mimeType: f.mimeType?.split(";")[0] ?? "video/mp4",
      stream: "progressive" as const,
      height: f.height,
    }));

  return dedupeQualities(qualities);
}

export async function getVideoQualitiesNode(
  videoId: string
): Promise<VideoQuality[]> {
  const edgeQualities = await getVideoQualitiesEdge(videoId);
  if (edgeQualities.length > 0) return edgeQualities;

  const attempts = [
    { name: "youtube-ext", fn: getQualitiesFromYoutubeExt },
    { name: "ytdl", fn: getQualitiesFromYtdl },
  ];

  for (const attempt of attempts) {
    try {
      const qualities = await attempt.fn(videoId);
      if (qualities.length > 0) return qualities;
    } catch (err) {
      console.error(`Quality resolver failed (${attempt.name}):`, err);
    }
  }

  return [];
}

async function getStreamUrlFromYoutubeExt(
  videoId: string,
  itag?: number
): Promise<StreamResult | null> {
  const info = await videoInfo(videoId);
  const formats = await getFormats(info.stream, { evaluator: "eval" });

  const format = itag
    ? formats.find((f) => f.itag === itag && f.url)
    : pickCombinedFormat(formats);

  if (!format?.url) return null;

  let url = format.url;
  if (!url.includes("alr=")) {
    url += (url.includes("?") ? "&" : "?") + "alr=yes";
  }

  return {
    url,
    mimeType: format.mimeType?.split(";")[0] ?? "video/mp4",
  };
}

async function getStreamUrlFromYtdl(
  videoId: string,
  itag?: number
): Promise<StreamResult | null> {
  const info = await ytdl.default.getInfo(videoId);

  const format = itag
    ? info.formats.find((f) => f.itag === itag && f.url)
    : (ytdl.default.chooseFormat(info.formats, {
        quality: "highest",
        filter: "audioandvideo",
      }) ??
      ytdl.default.chooseFormat(info.formats, {
        quality: "lowest",
        filter: "audioandvideo",
      }));

  if (!format?.url) return null;

  let url = format.url;
  if (!url.includes("alr=")) {
    url += (url.includes("?") ? "&" : "?") + "alr=yes";
  }

  return {
    url,
    mimeType: format.mimeType?.split(";")[0] ?? "video/mp4",
  };
}

export async function getStreamUrlNode(
  videoId: string,
  itag?: number
): Promise<StreamResult | null> {
  // First try Edge-compatible (youtubei)
  const edgeStream = await getStreamUrlEdge(videoId, itag);
  if (edgeStream) return edgeStream;

  const attempts = [
    { name: "youtube-ext", fn: () => getStreamUrlFromYoutubeExt(videoId, itag) },
    { name: "ytdl", fn: () => getStreamUrlFromYtdl(videoId, itag) },
  ];

  for (const attempt of attempts) {
    try {
      console.log(`[getStreamUrlNode] Trying resolver: ${attempt.name}`);
      const result = await attempt.fn();
      if (result) {
        console.log(`[getStreamUrlNode] Resolver ${attempt.name} succeeded!`);
        return result;
      }
    } catch (err) {
      console.error(`[getStreamUrlNode] Resolver ${attempt.name} failed:`, err);
    }
  }

  return null;
}
