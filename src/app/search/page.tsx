import * as ytSearch from "youtube-search-api";
import Link from "next/link";
import { Search, PlaySquare } from "lucide-react";
import VideoCard from "@/components/VideoCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const query = searchParams.q;

  let videos: any[] = [];
  if (query) {
    try {
      const res = await ytSearch.GetListByKeyword(query, false, 20);
      videos = res.items.filter((item: any) => item.type === "video");
    } catch (err) {
      console.error("Search failed:", err);
    }
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
              defaultValue={query}
              placeholder="Search..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-zinc-600"
            />
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-6">Results for &quot;{query}&quot;</h2>
        
        {videos.length === 0 ? (
          <p className="text-zinc-500">No results found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                videoId={v.id}
                title={v.title}
                author={v.channelTitle}
                duration={v.length?.simpleText}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
