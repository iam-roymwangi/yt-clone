"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, PlaySquare } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Check if it's a direct youtube URL
    const match = query.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (match && match[1]) {
      router.push(`/watch?v=${match[1]}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-white">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <PlaySquare className="w-16 h-16 text-red-500" />
          <h1 className="text-4xl font-bold tracking-tight">Antitube</h1>
        </div>
        
        <p className="text-zinc-400 text-center text-lg max-w-md">
          Watch YouTube videos without direct client connections. Proxied through Vercel.
        </p>

        <form onSubmit={handleSearch} className="w-full relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or paste YouTube URL..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-12 pr-6 text-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-zinc-600"
          />
        </form>
      </div>
    </main>
  );
}
