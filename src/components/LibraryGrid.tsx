"use client";

import { useState, useMemo } from "react";
import { Search, SortAsc, Clock, Film, ChevronLeft, ChevronRight, Clapperboard, Video } from "lucide-react";
import LocalVideoCard from "@/components/LocalVideoCard";
import { paginate, LIBRARY_PAGE_SIZE } from "@/lib/paginate";
import type { VideoCardData } from "@/lib/types";

type SortKey = "newest" | "oldest" | "title-az" | "title-za";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title-az", label: "Title A→Z" },
  { value: "title-za", label: "Title Z→A" },
];

function pageRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export default function LibraryGrid({ videos }: { videos: VideoCardData[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [category, setCategory] = useState<"all" | "video" | "movie">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...videos];
    if (category !== "all") {
      // treat missing category as "video" for legacy entries
      list = list.filter((v) => (v.category ?? "video") === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title-az":
          return a.title.localeCompare(b.title);
        case "title-za":
          return b.title.localeCompare(a.title);
      }
    });
    return list;
  }, [videos, query, sort, category]);

  const { items, currentPage, totalPages } = paginate(filtered, page, LIBRARY_PAGE_SIZE);

  const handleQuery = (v: string) => { setQuery(v); setPage(1); };
  const handleSort = (v: SortKey) => { setSort(v); setPage(1); };
  const handleCategory = (v: "all" | "video" | "movie") => { setCategory(v); setPage(1); };
  const goTo = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));
  const pages = pageRange(currentPage, totalPages);

  return (
    <>
      {/* Category filter chips */}
      <div className="mb-4 flex gap-2">
        {([
          { value: "all", label: "All", icon: null },
          { value: "video", label: "Videos", icon: <Video className="h-3.5 w-3.5" /> },
          { value: "movie", label: "Movies", icon: <Clapperboard className="h-3.5 w-3.5" /> },
        ] as const).map(({ value, label, icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleCategory(value)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              category === value
                ? "border-violet-500 bg-violet-600/20 text-violet-300"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Search + sort bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            placeholder="Search videos…"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 shrink-0 text-zinc-500" />
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value as SortKey)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1">
          <Film className="h-3.5 w-3.5 text-violet-400" />
          {filtered.length} video{filtered.length === 1 ? "" : "s"}
          {query && ` matching "${query}"`}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1">
          <Clock className="h-3.5 w-3.5 text-violet-400" />
          {SORT_OPTIONS.find((o) => o.value === sort)?.label}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-lg font-medium text-zinc-300">No videos found</p>
          <p className="mt-2 text-sm text-zinc-500">
            {query ? `No results for "${query}" — try a different search.` : "No videos yet."}
          </p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {items.map((video) => (
              <li key={video.id}>
                <LocalVideoCard video={video} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="mt-10 flex flex-col items-center gap-3" aria-label="Pagination">
              <p className="text-center text-sm text-zinc-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-zinc-700/60 bg-zinc-900/85 p-1.5 shadow-xl shadow-black/30 ring-1 ring-white/5 backdrop-blur-xl">
                <button
                  onClick={() => goTo(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {pages.map((p, i) =>
                  p === "ellipsis" ? (
                    <span key={`e-${i}`} className="flex h-9 w-8 items-center justify-center text-zinc-600">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goTo(p as number)}
                      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-sm font-medium transition ${
                        p === currentPage
                          ? "bg-violet-600 text-white shadow-md shadow-violet-900/30"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }`}
                      aria-current={p === currentPage ? "page" : undefined}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => goTo(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </>
  );
}
