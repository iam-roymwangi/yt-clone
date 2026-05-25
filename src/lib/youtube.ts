import type { Innertube } from "youtubei.js";

export type StreamResult = {
  url: string;
  mimeType: string;
};

export type VideoQuality = {
  itag: number;
  label: string;
  mimeType: string;
  stream: "progressive" | "hls";
  height?: number;
};

export type VideoMetadata = {
  title: string;
  description: string;
  author: string;
  viewCount: number;
};

type GlobalYoutube = typeof globalThis & {
  __innertubePromise?: Promise<Innertube>;
  __videoInfoCache?: Map<string, Promise<InnertubeVideoInfo>>;
};

type InnertubeVideoInfo = Awaited<
  ReturnType<Innertube["getInfo"]>
>;

const UPSTREAM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://www.youtube.com/",
  Origin: "https://www.youtube.com",
};

export { UPSTREAM_HEADERS };

/** Prevent Next.js from caching YouTube's multi-MB player script. */
export function noCacheFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const { next: _next, ...rest } = init ?? {};
  return fetch(input, {
    ...rest,
    cache: "no-store",
  });
}

function pickCombinedFormat(
  formats: Array<{
    itag?: number;
    url?: string;
    mimeType?: string;
    audioQuality?: string;
    height?: number;
    qualityLabel?: string;
  }>
) {
  const withUrl = formats.filter((f) => f.url?.startsWith("https://"));
  const combined = withUrl
    .filter((f) => f.mimeType?.includes("video/mp4") && f.audioQuality)
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
  if (combined[0]) return combined[0];

  const mp4 = withUrl
    .filter((f) => f.mimeType?.includes("video/mp4"))
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
  return mp4[0];
}

function dedupeQualities(qualities: VideoQuality[]): VideoQuality[] {
  const seen = new Set<string>();
  return qualities.filter((q) => {
    const key = `${q.stream}-${q.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getInnertube(): Promise<Innertube> {
  const g = globalThis as GlobalYoutube;
  if (!g.__innertubePromise) {
    g.__innertubePromise = (async () => {
      const { Innertube, Platform } = await import("youtubei.js");
      Platform.shim.eval = async (data: { output: string }) =>
        new Function(data.output)();
      Platform.shim.fetch = noCacheFetch;
      return Innertube.create({ fetch: noCacheFetch });
    })();
  }
  return g.__innertubePromise;
}

export async function getCachedVideoInfo(
  videoId: string
): Promise<InnertubeVideoInfo> {
  const g = globalThis as GlobalYoutube;
  if (!g.__videoInfoCache) {
    g.__videoInfoCache = new Map();
  }

  let cached = g.__videoInfoCache.get(videoId);
  if (!cached) {
    const yt = await getInnertube();
    cached = yt.getInfo(videoId);
    g.__videoInfoCache.set(videoId, cached);
    cached.finally(() => {
      setTimeout(() => g.__videoInfoCache?.delete(videoId), 60_000);
    });
  }
  return cached;
}

function qualitiesFromCombinedFormats(
  formats: Array<{
    itag: number;
    has_video?: boolean;
    has_audio?: boolean;
    height?: number;
    quality_label?: string;
    mime_type?: string;
  }>
): VideoQuality[] {
  return formats
    .filter((f) => f.has_video && f.has_audio)
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    .map((f) => ({
      itag: f.itag,
      label: f.quality_label || (f.height ? `${f.height}p` : `itag ${f.itag}`),
      mimeType: f.mime_type?.split(";")[0] ?? "video/mp4",
      stream: "progressive" as const,
      height: f.height,
    }));
}

async function parseHlsQualities(
  manifestUrl: string
): Promise<VideoQuality[]> {
  const res = await noCacheFetch(manifestUrl, { headers: UPSTREAM_HEADERS });
  if (!res.ok) return [];

  const text = await res.text();
  const lines = text.split("\n");
  const qualities: VideoQuality[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("#EXT-X-STREAM-INF:")) continue;

    const heightMatch = line.match(/RESOLUTION=\d+x(\d+)/);
    const height = heightMatch ? parseInt(heightMatch[1], 10) : 0;
    if (!height) continue;

    qualities.push({
      itag: 10000 + height,
      label: `${height}p`,
      mimeType: "application/x-mpegURL",
      stream: "hls",
      height,
    });
  }

  return dedupeQualities(
    qualities.sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
  );
}

async function getQualitiesFromYoutubei(
  videoId: string
): Promise<VideoQuality[]> {
  const info = await getCachedVideoInfo(videoId);
  const streaming = info.streaming_data;
  if (!streaming) return [];

  const allFormats = [
    ...(streaming.formats ?? []),
    ...(streaming.adaptive_formats ?? []),
  ];

  const progressive = dedupeQualities(qualitiesFromCombinedFormats(allFormats));

  if (streaming.hls_manifest_url) {
    const hls = await parseHlsQualities(streaming.hls_manifest_url);
    if (hls.length > 0) {
      return [...hls, ...progressive.filter(
        (p) => !hls.some((h) => h.label === p.label)
      )];
    }
  }

  return progressive;
}

async function getQualitiesFromYoutubeExt(
  videoId: string
): Promise<VideoQuality[]> {
  const { videoInfo, getFormats } = await import("youtube-ext");
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
  const ytdl = await import("@distube/ytdl-core");
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

export async function getVideoQualities(
  videoId: string
): Promise<VideoQuality[]> {
  const attempts = [
    getQualitiesFromYoutubei,
    getQualitiesFromYoutubeExt,
    getQualitiesFromYtdl,
  ];

  for (const attempt of attempts) {
    try {
      const qualities = await attempt(videoId);
      if (qualities.length > 0) return qualities;
    } catch (err) {
      console.error(`Quality resolver failed (${attempt.name}):`, err);
    }
  }

  return [];
}

export async function getHlsManifestUrl(
  videoId: string
): Promise<string | null> {
  try {
    const info = await getCachedVideoInfo(videoId);
    return info.streaming_data?.hls_manifest_url ?? null;
  } catch {
    return null;
  }
}

export function rewriteHlsManifest(
  body: string,
  proxyOrigin: string,
  baseUrl?: string
): string {
  return body
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;

      let absolute = trimmed;
      if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        if (!baseUrl) return line;
        try {
          absolute = new URL(trimmed, baseUrl).href;
        } catch {
          return line;
        }
      }

      return `${proxyOrigin}/api/proxy?url=${encodeURIComponent(absolute)}`;
    })
    .join("\n");
}

export async function getHlsPlaylistForHeight(
  videoId: string,
  height: number,
  proxyOrigin: string
): Promise<string | null> {
  const manifestUrl = await getHlsManifestUrl(videoId);
  if (!manifestUrl) return null;

  const res = await noCacheFetch(manifestUrl, { headers: UPSTREAM_HEADERS });
  if (!res.ok) return null;

  const master = await res.text();
  const lines = master.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("#EXT-X-STREAM-INF:")) continue;

    const heightMatch = line.match(/RESOLUTION=\d+x(\d+)/);
    const variantHeight = heightMatch ? parseInt(heightMatch[1], 10) : 0;
    if (variantHeight !== height) continue;

    const variantUrl = lines[i + 1]?.trim();
    if (!variantUrl?.startsWith("http")) continue;

    const variantRes = await noCacheFetch(variantUrl, {
      headers: UPSTREAM_HEADERS,
    });
    if (!variantRes.ok) return null;

    const variantBody = await variantRes.text();
    return rewriteHlsManifest(variantBody, proxyOrigin, variantUrl);
  }

  return null;
}

async function getStreamUrlFromYoutubei(
  videoId: string,
  itag?: number
): Promise<StreamResult | null> {
  const yt = await getInnertube();
  const info = await getCachedVideoInfo(videoId);
  const format = itag
    ? info.chooseFormat({ itag })
    : (info.chooseFormat({ type: "video+audio", quality: "best" }) ??
      info.chooseFormat({ type: "video+audio", quality: "bestefficiency" }));

  if (!format) return null;

  const url = await format.decipher(yt.session.player);
  if (!url) return null;

  return {
    url,
    mimeType: format.mime_type?.split(";")[0] ?? "video/mp4",
  };
}

async function getStreamUrlFromYoutubeExt(
  videoId: string,
  itag?: number
): Promise<StreamResult | null> {
  const { videoInfo, getFormats } = await import("youtube-ext");
  const info = await videoInfo(videoId);
  const formats = await getFormats(info.stream, { evaluator: "eval" });

  const format = itag
    ? formats.find((f) => f.itag === itag && f.url)
    : pickCombinedFormat(formats);

  if (!format?.url) return null;

  return {
    url: format.url,
    mimeType: format.mimeType?.split(";")[0] ?? "video/mp4",
  };
}

async function getStreamUrlFromYtdl(
  videoId: string,
  itag?: number
): Promise<StreamResult | null> {
  const ytdl = await import("@distube/ytdl-core");
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

  return {
    url: format.url,
    mimeType: format.mimeType?.split(";")[0] ?? "video/mp4",
  };
}

export async function getStreamUrl(
  videoId: string,
  itag?: number
): Promise<StreamResult | null> {
  const attempts = [
    () => getStreamUrlFromYoutubei(videoId, itag),
    () => getStreamUrlFromYoutubeExt(videoId, itag),
    () => getStreamUrlFromYtdl(videoId, itag),
  ];

  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result) return result;
    } catch (err) {
      console.error("Stream resolver failed:", err);
    }
  }

  return null;
}

export async function getVideoMetadata(
  videoId: string
): Promise<VideoMetadata> {
  try {
    const info = await getCachedVideoInfo(videoId);
    return {
      title: info.basic_info.title ?? "Unknown",
      description: info.basic_info.short_description ?? "",
      author: info.basic_info.author ?? "Unknown Author",
      viewCount: Number(info.basic_info.view_count) || 0,
    };
  } catch {
    const { videoInfo } = await import("youtube-ext");
    const info = await videoInfo(videoId);
    const views = info.views?.text?.replace(/\D/g, "") ?? "0";
    return {
      title: info.title,
      description: info.description,
      author: info.channel?.name ?? "Unknown Author",
      viewCount: parseInt(views, 10) || 0,
    };
  }
}
