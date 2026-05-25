import { Suspense } from "react";
import Player from "@/components/Player";
import BrandLogo from "@/components/BrandLogo";
import SearchInput from "@/components/SearchInput";
import { getVideoMetadata } from "@/lib/youtube";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

async function VideoDetails({ id }: { id: string }) {
  try {
    const info = await getVideoMetadata(id);

    return (
      <div className="mt-4 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">{info.title}</h1>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span className="font-semibold text-white">{info.author}</span>
          <span>
            {new Intl.NumberFormat("en-US").format(info.viewCount)} views
          </span>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 mt-2">
          <p className="text-sm text-zinc-200 whitespace-pre-wrap font-sans">
            {info.description}
          </p>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="mt-4 text-red-500">Failed to load video details.</div>
    );
  }
}

export default function WatchPage({
  searchParams,
}: {
  searchParams: { v: string };
}) {
  const videoId = searchParams.v;

  if (!videoId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        No video ID provided.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <BrandLogo />

          <SearchInput size="sm" placeholder="Search..." />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Player videoId={videoId} />
          <Suspense
            fallback={
              <div className="mt-4 h-32 bg-zinc-900 animate-pulse rounded-xl" />
            }
          >
            <VideoDetails id={videoId} />
          </Suspense>
        </div>
        <div className="hidden lg:block">
          <div className="bg-zinc-900/50 rounded-xl p-6 text-center text-zinc-500">
            Up next (coming soon)
          </div>
        </div>
      </main>
    </div>
  );
}
