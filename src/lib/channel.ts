import { getInnertube } from "@/lib/youtube";

export type ChannelVideo = {
  id: string;
  title: string;
  author: string;
  duration?: string;
  thumbnail?: string;
};

export type ChannelVideosResult = {
  channelId: string;
  channelName: string;
  videos: ChannelVideo[];
  page: number;
  hasMore: boolean;
};

function mapVideo(item: {
  id?: string;
  video_id?: string;
  title?: { toString?: () => string; text?: string } | string;
  author?: { name?: string; toString?: () => string };
  duration?: { text?: string; toString?: () => string } | string;
  thumbnails?: { url?: string }[];
  best_thumbnail?: { url?: string };
}): ChannelVideo | null {
  const id = item.video_id ?? item.id;
  if (!id) return null;

  const title =
    typeof item.title === "string"
      ? item.title
      : item.title?.toString?.() ?? item.title?.text ?? "Untitled";

  const author = item.author?.name ?? item.author?.toString?.() ?? "Unknown";

  let duration: string | undefined;
  if (typeof item.duration === "string") {
    duration = item.duration;
  } else if (item.duration) {
    duration = item.duration.text ?? item.duration.toString?.();
  }

  const thumbnail =
    item.best_thumbnail?.url ?? item.thumbnails?.[0]?.url;

  return { id, title, author, duration, thumbnail };
}

export async function getChannelVideos(
  channelId: string,
  page = 0
): Promise<ChannelVideosResult> {
  const yt = await getInnertube();
  const channel = await yt.getChannel(channelId);
  const header = channel.header as
    | { author?: { name?: string }; title?: { toString?: () => string } }
    | undefined;
  const channelName =
    header?.author?.name ??
    header?.title?.toString?.() ??
    "Channel";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let feed: any = channel.has_videos ? await channel.getVideos() : channel;

  for (let i = 0; i < page; i++) {
    if (!feed.has_continuation) {
      return {
        channelId,
        channelName,
        videos: [],
        page,
        hasMore: false,
      };
    }
    feed = await feed.getContinuation();
  }

  const videos = (feed.videos as Parameters<typeof mapVideo>[0][])
    .map((v) => mapVideo(v))
    .filter((v): v is ChannelVideo => v !== null);

  return {
    channelId,
    channelName,
    videos,
    page,
    hasMore: feed.has_continuation,
  };
}

export function parseChannelId(input: string): string | null {
  const channelMatch = input.match(
    /youtube\.com\/channel\/(UC[\w-]{20,})/
  );
  if (channelMatch) return channelMatch[1];

  const handleMatch = input.match(/youtube\.com\/@([\w.-]+)/);
  if (handleMatch) return `@${handleMatch[1]}`;

  return null;
}
