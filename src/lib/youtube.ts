import type { Innertube } from "youtubei.js";

export type StreamResult = {
  url: string;
  mimeType: string;
};

export type VideoQuality = {
  itag: number;
  label: string;
  mimeType: string;
};

export type VideoMetadata = {
  title: string;
  description: string;
  author: string;
  viewCount: number;
};

type GlobalInnertube = typeof globalThis & {
  __innertubePromise?: Promise<Innertube>;
};

const UPSTREAM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://www.youtube.com/",
  Origin: "https://www.youtube.com",
};

export { UPSTREAM_HEADERS };

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
    if (seen.has(q.label)) return false;
    seen.add(q.label);
    return true;
  });
}

async function getInnertube(): Promise<Innertube> {
  const g = globalThis as GlobalInnertube;
  if (!g.__innertubePromise) {
    g.__innertubePromise = (async () => {
      const { Innertube, Platform } = await import("youtubei.js");
      Platform.shim.eval = async (data: { output: string }) =>
        new Function(data.output)();
      return Innertube.create();
    })();
  }
  return g.__innertubePromise;
}

async function getQualitiesFromYoutubei(
  videoId: string
): Promise<VideoQuality[]> {
  const yt = await getInnertube();
  const info = await yt.getInfo(videoId);
  const formats = (info.streaming_data?.formats ?? []).filter(
    (f) => f.has_video && f.has_audio
  );

  const qualities = formats
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    .map((f) => ({
      itag: f.itag,
      label: f.quality_label || (f.height ? `${f.height}p` : `itag ${f.itag}`),
      mimeType: f.mime_type?.split(";")[0] ?? "video/mp4",
    }));

  return dedupeQualities(qualities);
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

async function getStreamUrlFromYoutubei(
  videoId: string,
  itag?: number
): Promise<StreamResult | null> {
  const yt = await getInnertube();
  const info = await yt.getInfo(videoId);
  const format = itag
    ? info.chooseFormat({ itag })
    : (info.chooseFormat({ type: "video+audio", quality: "bestefficiency" }) ??
      info.chooseFormat({ type: "video+audio", quality: "best" }));

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
    const yt = await getInnertube();
    const info = await yt.getInfo(videoId);
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
