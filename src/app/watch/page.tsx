import { Suspense } from "react";
import Link from "next/link";
import { PlaySquare, Search } from "lucide-react";
import Player from "@/components/Player";

async function VideoDetails({ id }: { id: string }) {
  // Fetch from our proxy (which we deploy to the same origin, so we can fetch it absolute, but during server component render we can just use the absolute URL or a helper. Actually, since this is a server component, we need the absolute URL. Let's construct it from headers or just hardcode for MVP if needed, but it's better to fetch from ytdl directly here since it's a server component and not blocked by CORS. Wait, the prompt says proxy through API route for metadata to avoid client-side calls. Doing it in a Server Component natively avoids client-side calls!)
  // Since we want to use the proxy or just fetch directly here. I will just fetch directly here using ytdl to avoid absolute URL issues in server components.
  
  const { videoInfo } = require('youtube-ext');
  
  try {
    const info = await videoInfo(id);

    return (
      <div className="mt-4 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white">{info.title}</h1>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span className="font-semibold text-white">{info.channel?.name || "Unknown Author"}</span>
          <span>{new Intl.NumberFormat('en-US').format(info.views || 0)} views</span>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 mt-2">
          <p className="text-sm text-zinc-200 whitespace-pre-wrap font-sans">
            {info.description}
          </p>
        </div>
      </div>
    );
  } catch (error) {
    return <div className="mt-4 text-red-500">Failed to load video details.</div>;
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
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <PlaySquare className="w-8 h-8 text-red-500" />
            <span className="text-xl font-bold tracking-tight hidden sm:block">Antitube</span>
          </Link>
          
          <form action="/search" method="GET" className="flex-1 max-w-2xl relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-zinc-500" />
            </div>
            <input
              type="text"
              name="q"
              placeholder="Search..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-zinc-600"
            />
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Player videoId={videoId} />
          <Suspense fallback={<div className="mt-4 h-32 bg-zinc-900 animate-pulse rounded-xl"></div>}>
            <VideoDetails id={videoId} />
          </Suspense>
        </div>
        <div className="hidden lg:block">
          {/* Related videos could go here, omitting for MVP simplicity */}
          <div className="bg-zinc-900/50 rounded-xl p-6 text-center text-zinc-500">
            Up next section (Placeholder)
          </div>
        </div>
      </main>
    </div>
  );
}
