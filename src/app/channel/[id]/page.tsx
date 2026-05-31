import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import VideoCard from "@/components/VideoCard";
import Pagination from "@/components/Pagination";
import { getChannelVideos } from "@/lib/channel";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ChannelPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const channelId = decodeURIComponent(params.id);
  const page = searchParams.page
    ? Math.max(0, parseInt(searchParams.page, 10))
    : 0;

  let data: Awaited<ReturnType<typeof getChannelVideos>> | null = null;
  let error = false;

  try {
    data = await getChannelVideos(channelId, page);
  } catch (err) {
    console.error("Channel load failed:", err);
    error = true;
  }

  const prevHref =
    page > 0
      ? `/channel/${encodeURIComponent(channelId)}?page=${page - 1}`
      : null;

  const nextHref =
    data?.hasMore
      ? `/channel/${encodeURIComponent(channelId)}?page=${page + 1}`
      : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-zinc-950/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center">
          <BrandLogo />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {error ? (
          <p className="text-red-400">Failed to load channel.</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">
              {data?.channelName ?? "Channel"}
            </h1>
            <p className="text-zinc-500 text-sm mb-6">
              Page {page + 1}
            </p>

            {data?.videos.length === 0 ? (
              <p className="text-zinc-500">No videos on this page.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data?.videos.map((v) => (
                  <VideoCard
                    key={v.id}
                    videoId={v.id}
                    title={v.title}
                    author={v.author}
                    duration={v.duration}
                  />
                ))}
              </div>
            )}

            <Pagination
              prevHref={prevHref}
              nextHref={nextHref}
              label={`Page ${page + 1}`}
            />
          </>
        )}
      </main>
    </div>
  );
}
