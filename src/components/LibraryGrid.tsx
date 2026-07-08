"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search, SortAsc, Clock, Film,
  ChevronLeft, ChevronRight, Clapperboard, Video, Tv2, Mic2, Music2,
} from "lucide-react";
import LocalVideoCard from "@/components/LocalVideoCard";
import SeriesCard, { type SeriesCardData } from "@/components/SeriesCard";
import { paginate, LIBRARY_PAGE_SIZE } from "@/lib/paginate";
import type { VideoCardData } from "@/lib/types";

type SortKey = "newest" | "oldest" | "title-az" | "title-za";
type CategoryFilter = "all" | "video" | "movie" | "podcast" | "mixtape" | "series";

const VALID_SORTS: SortKey[] = ["newest", "oldest", "title-az", "title-za"];
const VALID_CATEGORIES: CategoryFilter[] = ["all", "video", "movie", "podcast", "mixtape", "series"];

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
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

type Item =
  | ({ kind: "video" } & VideoCardData)
  | ({ kind: "series" } & SeriesCardData);

export default function LibraryGrid({
  videos,
  seriesList,
}: {
  videos: VideoCardData[];
  seriesList: SeriesCardData[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read state from URL, with defaults
  const query = searchParams.get("q") ?? "";
  const [localQuery, setLocalQuery] = useState(query);

  // Sync input field value when query parameter in URL changes
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);
  const sort: SortKey = (VALID_SORTS.includes(searchParams.get("sort") as SortKey)
    ? searchParams.get("sort")
    : "newest") as SortKey;
  const category: CategoryFilter = (VALID_CATEGORIES.includes(searchParams.get("category") as CategoryFilter)
    ? searchParams.get("category")
    : "all") as CategoryFilter;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  // Build a new URL with updated params, resetting page unless explicitly set
  const buildUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  const handleQuery = (v: string) =>
    router.replace(buildUrl({ q: v || null, page: null }), { scroll: false });
  const handleSort = (v: SortKey) =>
    router.replace(buildUrl({ sort: v === "newest" ? null : v, page: null }), { scroll: false });
  const handleCategory = (v: CategoryFilter) =>
    router.replace(buildUrl({ category: v === "all" ? null : v, page: null }), { scroll: false });
  const goTo = (p: number) =>
    router.replace(buildUrl({ page: p === 1 ? null : String(p) }), { scroll: false });

  const allItems = useMemo<Item[]>(
    () => [
      ...videos.map((v) => ({ kind: "video" as const, ...v })),
      ...seriesList.map((s) => ({ kind: "series" as const, ...s })),
    ],
    [videos, seriesList]
  );

  const filtered = useMemo(() => {
    let list = [...allItems];
    if (category === "series") {
      list = list.filter((i) => i.kind === "series");
    } else if (category !== "all") {
      list = list.filter((i) => i.kind === "video" && (i.category ?? "video") === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title-az": return a.title.localeCompare(b.title);
        case "title-za": return b.title.localeCompare(a.title);
      }
    });
    return list;
  }, [allItems, query, sort, category]);

  const clampedPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / LIBRARY_PAGE_SIZE)));
  const { items, currentPage, totalPages } = paginate(filtered, clampedPage, LIBRARY_PAGE_SIZE);
  const pages = pageRange(currentPage, totalPages);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { value: "all", label: "All", icon: null },
            { value: "video", label: "Videos", icon: <Video className="h-3.5 w-3.5" /> },
            { value: "movie", label: "Movies", icon: <Clapperboard className="h-3.5 w-3.5" /> },
            { value: "podcast", label: "Podcasts", icon: <Mic2 className="h-3.5 w-3.5" /> },
            { value: "mixtape", label: "Mixtapes", icon: <Music2 className="h-3.5 w-3.5" /> },
            { value: "series", label: "Series", icon: <Tv2 className="h-3.5 w-3.5" /> },
          ] as const
        ).map(({ value, label, icon }) => (
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
            {icon}{label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery(localQuery);
          }}
          className="relative flex-1"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-9 pr-24 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500 active:scale-95 shadow-md shadow-violet-900/20"
          >
            Search
          </button>
        </form>
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 shrink-0 text-zinc-500" />
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value as SortKey)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-violet-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1">
          <Film className="h-3.5 w-3.5 text-violet-400" />
          {filtered.length} item{filtered.length === 1 ? "" : "s"}
          {query && ` matching "${query}"`}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1">
          <Clock className="h-3.5 w-3.5 text-violet-400" />
          {SORT_OPTIONS.find((o) => o.value === sort)?.label}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-lg font-medium text-zinc-300">Nothing found</p>
          <p className="mt-2 text-sm text-zinc-500">
            {query ? `No results for "${query}".` : "Nothing here yet."}
          </p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-4">
            {items.map((item) => (
              <li key={item.id}>
                {item.kind === "series" ? (
                  <SeriesCard series={item} />
                ) : (
                  <LocalVideoCard video={item} />
                )}
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
