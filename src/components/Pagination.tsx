import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  prevHref: string | null;
  nextHref: string | null;
  label?: string;
}

interface IslandPaginationProps {
  currentPage: number;
  totalPages: number;
  makeHref: (page: number) => string;
  label?: string;
}

function pageRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function IslandPagination({
  currentPage,
  totalPages,
  makeHref,
  label,
}: IslandPaginationProps) {
  if (totalPages <= 1) return null;

  const prevHref = currentPage > 1 ? makeHref(currentPage - 1) : null;
  const nextHref = currentPage < totalPages ? makeHref(currentPage + 1) : null;
  const pages = pageRange(currentPage, totalPages);

  return (
    <nav
      className="mt-10 flex flex-col items-center gap-3"
      aria-label="Pagination"
    >
      {label && (
        <p className="text-center text-sm text-zinc-500">{label}</p>
      )}
      <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-zinc-700/60 bg-zinc-900/85 p-1.5 shadow-xl shadow-black/30 ring-1 ring-white/5 backdrop-blur-xl sm:gap-1">
        {prevHref ? (
          <Link
            href={prevHref}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span
            className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full text-zinc-600"
            aria-hidden
          >
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-9 w-8 items-center justify-center text-zinc-600"
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={makeHref(p)}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-sm font-medium transition ${
                p === currentPage
                  ? "bg-violet-600 text-white shadow-md shadow-violet-900/30"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </Link>
          )
        )}

        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span
            className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full text-zinc-600"
            aria-hidden
          >
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}

export default function Pagination({
  prevHref,
  nextHref,
  label,
}: PaginationProps) {
  if (!prevHref && !nextHref) return null;

  return (
    <div className="mt-8 flex items-center justify-between gap-4 border-t border-zinc-800 pt-6">
      {label && (
        <span className="hidden text-sm text-zinc-500 sm:inline">{label}</span>
      )}
      <div className="ml-auto flex gap-3">
        {prevHref ? (
          <Link
            href={prevHref}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white transition-colors hover:border-violet-500"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-600">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white transition-colors hover:bg-violet-500"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-600">
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}
