"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Play, Tv2 } from "lucide-react";
import type { SeriesWithEpisodes, Episode } from "@/lib/series-store";
import { formatDuration } from "@/lib/types";
import Image from "next/image";

export default function SeriesDetail({ series }: { series: SeriesWithEpisodes }) {
  const seasons = useMemo(() => {
    const nums = Array.from(new Set(series.episodes.map((e) => e.season))).sort((a, b) => a - b);
    return nums;
  }, [series.episodes]);

  const [activeSeason, setActiveSeason] = useState<number>(seasons[0] ?? 1);

  const seasonEpisodes = useMemo(
    () => series.episodes.filter((e) => e.season === activeSeason).sort((a, b) => a.episodeNumber - b.episodeNumber),
    [series.episodes, activeSeason]
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-violet-400 mb-2">
          <Tv2 className="h-4 w-4" />
          Series
        </div>
        <h1 className="text-3xl font-bold text-white">{series.title}</h1>
        {series.description && (
          <p className="mt-2 text-zinc-400 leading-relaxed max-w-2xl">{series.description}</p>
        )}
        <p className="mt-3 text-sm text-zinc-600">
          {seasons.length} season{seasons.length !== 1 ? "s" : ""} · {series.episodes.length} episode{series.episodes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Season tabs */}
      {seasons.length > 0 ? (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {seasons.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSeason(s)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  activeSeason === s
                    ? "border-violet-500 bg-violet-600/20 text-violet-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
                }`}
              >
                Season {s}
              </button>
            ))}
          </div>

          {/* Episodes grid */}
          <div className="flex flex-col gap-3">
            {seasonEpisodes.map((ep) => (
              <EpisodeRow key={ep.id} episode={ep} seriesTitle={series.title} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-zinc-400">No episodes yet.</p>
        </div>
      )}

      <Link href="/" className="mt-8 inline-block text-sm font-medium text-violet-400 hover:text-violet-300">
        ← Back to library
      </Link>
    </main>
  );
}

function EpisodeRow({ episode, seriesTitle }: { episode: Episode; seriesTitle: string }) {
  const duration = formatDuration(episode.durationSeconds);
  return (
    <Link
      href={`/series/${episode.seriesId}/episode/${episode.id}`}
      className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 transition hover:border-violet-500/40 hover:bg-zinc-900"
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800 sm:h-20 sm:w-36">
        <Image
          src={`/api/drive-thumbnail/${episode.driveFileId}`}
          alt={episode.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600/90 shadow-lg">
            <Play className="ml-0.5 h-4 w-4 fill-current text-white" />
          </span>
        </div>
        {duration && (
          <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-zinc-200">
            {duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-zinc-500 mb-0.5">
          E{episode.episodeNumber}
        </p>
        <p className="truncate font-semibold text-white group-hover:text-violet-200 sm:text-lg">
          {episode.title}
        </p>
        {episode.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 sm:text-sm">{episode.description}</p>
        )}
      </div>
    </Link>
  );
}
