import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  prevHref: string | null;
  nextHref: string | null;
  label?: string;
}

export default function Pagination({
  prevHref,
  nextHref,
  label,
}: PaginationProps) {
  if (!prevHref && !nextHref) return null;

  return (
    <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-zinc-800">
      {label && (
        <span className="text-sm text-zinc-500 hidden sm:inline">{label}</span>
      )}
      <div className="flex gap-3 ml-auto">
        {prevHref ? (
          <Link
            href={prevHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white hover:border-violet-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-600 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </span>
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-sm text-white hover:bg-violet-500 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-600 cursor-not-allowed">
            Next
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );
}
