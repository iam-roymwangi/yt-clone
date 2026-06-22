import Link from "next/link";
import { Tv2 } from "lucide-react";
import type { Series } from "@/lib/series-store";

export type SeriesCardData = Series & { episodeCount: number; seasonCount: number };

export default function SeriesCard({ series }: { series: SeriesCardData }) {
  return (
    <Link
      href={`/series/${series.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 transition hover:border-violet-500/40 hover:bg-zinc-900 hover:shadow-md hover:shadow-violet-950/20"
    >
      <div className="relative flex aspect-video w-full items-center justify-center bg-zinc-800">
        <div className="flex flex-col items-center gap-2 text-zinc-600 group-hover:text-zinc-500 transition">
          <Tv2 className="h-8 w-8" />
        </div>
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1 py-0.5 text-[9px] font-medium text-zinc-200 backdrop-blur-sm">
          Series
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2">
        <h2 className="line-clamp-2 text-xs font-semibold leading-snug text-white group-hover:text-violet-200">
          {series.title}
        </h2>
        {series.description && (
          <p className="line-clamp-1 text-[10px] text-zinc-500">{series.description}</p>
        )}
        <p className="mt-auto text-[10px] text-zinc-500">
          {series.seasonCount} season{series.seasonCount !== 1 ? "s" : ""} · {series.episodeCount} ep{series.episodeCount !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
