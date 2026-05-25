"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const videoMatch = query.match(
      /(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (videoMatch?.[1]) {
      router.push(`/watch?v=${videoMatch[1]}`);
      return;
    }

    const channelMatch = query.match(
      /youtube\.com\/channel\/(UC[\w-]{20,})/
    );
    if (channelMatch?.[1]) {
      router.push(`/channel/${channelMatch[1]}`);
      return;
    }

    const handleMatch = query.match(/youtube\.com\/@([\w.-]+)/);
    if (handleMatch?.[1]) {
      router.push(`/channel/@${handleMatch[1]}`);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-white">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <BrandLogo size="lg" link={false} alwaysShowText />

        <p className="text-zinc-400 text-center text-lg max-w-md">
          Stream your favorite videos through Nexora!
        </p>

        <form onSubmit={handleSearch} className="w-full relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or paste YouTube URL..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-12 pr-6 text-lg outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-zinc-600"
          />
        </form>
      </div>
    </main>
  );
}
