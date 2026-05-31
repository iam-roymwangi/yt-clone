import VideoCard from "@/components/VideoCard";
import ChannelCard from "@/components/ChannelCard";
import BrandLogo from "@/components/BrandLogo";
import Pagination from "@/components/Pagination";
import { searchChannels, searchVideos } from "@/lib/search";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; cursor?: string; type?: string };
}) {
  const query = searchParams.q ?? "";
  const cursor = searchParams.cursor;
  const type = searchParams.type === "channel" ? "channel" : "video";

  let videos: Awaited<ReturnType<typeof searchVideos>>["items"] = [];
  let channels: Awaited<ReturnType<typeof searchChannels>>["items"] = [];
  let nextCursor: string | null = null;

  if (query) {
    try {
      if (type === "channel") {
        const res = await searchChannels(query, cursor);
        channels = res.items;
        nextCursor = res.nextCursor;
      } else {
        const res = await searchVideos(query, cursor);
        videos = res.items.filter((item) => item.type === "video");
        channels = res.items.filter((item) => item.type === "channel");
        nextCursor = res.nextCursor;
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  }

  const baseParams = new URLSearchParams({ q: query });
  if (type === "channel") baseParams.set("type", "channel");

  const prevHref = cursor
    ? (() => {
        const p = new URLSearchParams(baseParams);
        return `/search?${p}`;
      })()
    : null;

  const nextHref = nextCursor
    ? (() => {
        const p = new URLSearchParams(baseParams);
        p.set("cursor", nextCursor);
        return `/search?${p}`;
      })()
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-zinc-950/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center">
          <BrandLogo />
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
          YouTube search is temporarily unavailable. Browse the{" "}
          <a href="/library" className="font-medium text-violet-400 hover:text-violet-300">
            local library
          </a>{" "}
          instead.
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">
            Results for &quot;{query}&quot;
          </h2>
          <div className="flex gap-2 text-sm">
            <a
              href={`/search?${new URLSearchParams({ q: query }).toString()}`}
              className={`px-3 py-1 rounded-full border transition-colors ${
                type === "video"
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              Videos
            </a>
            <a
              href={`/search?${new URLSearchParams({ q: query, type: "channel" }).toString()}`}
              className={`px-3 py-1 rounded-full border transition-colors ${
                type === "channel"
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              Channels
            </a>
          </div>
        </div>

        {type === "channel" ? (
          channels.length === 0 ? (
            <p className="text-zinc-500">No channels found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {channels.map((c) => (
                <ChannelCard
                  key={c.id}
                  channelId={c.id}
                  title={c.title}
                  thumbnail={c.thumbnail}
                />
              ))}
            </div>
          )
        ) : (
          <>
            {channels.length > 0 && (
              <section className="mb-8">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">
                  Channels
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {channels.map((c) => (
                    <ChannelCard
                      key={c.id}
                      channelId={c.id}
                      title={c.title}
                      thumbnail={c.thumbnail}
                    />
                  ))}
                </div>
              </section>
            )}

            {videos.length === 0 ? (
              <p className="text-zinc-500">No videos found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos.map((v) => (
                  <VideoCard
                    key={v.id}
                    videoId={v.id}
                    title={v.title}
                    author={v.channelTitle ?? ""}
                    duration={v.length?.simpleText}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <Pagination
          prevHref={prevHref}
          nextHref={nextHref}
          label={cursor ? "Earlier results" : undefined}
        />
      </main>
    </div>
  );
}
