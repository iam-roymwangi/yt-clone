"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Play, Tv2, ChevronDown, ChevronUp } from "lucide-react";
import type { Episode, Series } from "@/lib/series-store";
import { formatDuration } from "@/lib/types";
import DrivePlayerWithMiniPlayer from "@/components/DrivePlayerWithMiniPlayer";
import ViewCounter from "@/components/ViewCounter";
import Image from "next/image";

type Props = {
  episode: Episode;
  series: Series;
  seasonEpisodes: Episode[];
  nextEpisode: Episode | null;
  allSeasons: number[];
  initialViewCount: number;
};

export default function EpisodePlayer({ episode, series, seasonEpisodes, nextEpisode, allSeasons, initialViewCount }: Props) {
  const router = useRouter();
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  const displayedEpisodes = showAllEpisodes ? seasonEpisodes : seasonEpisodes.slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/" className="hover:text-white">Library</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/series/${series.id}`} className="hover:text-white">{series.title}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-300">S{episode.season} E{episode.episodeNumber}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Player column */}
        <div className="lg:col-span-2">
          <DrivePlayerWithMiniPlayer
            fileId={episode.driveFileId}
            title={episode.title}
            driveUrl={episode.driveUrl}
            embedSrc={`https://drive.google.com/file/d/${episode.driveFileId}/preview`}
            libraryId={episode.id}
          />

          {/* Episode info */}
          <div className="mt-4">
            <div className="flex items-center gap-2 text-xs font-medium text-violet-400 mb-1">
              <Tv2 className="h-3.5 w-3.5" />
              {series.title} · Season {episode.season}, Episode {episode.episodeNumber}
            </div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">{episode.title}</h1>
            <div className="mt-2">
              <ViewCounter contentId={episode.id} initialCount={initialViewCount} />
            </div>
            {episode.description && (
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{episode.description}</p>
            )}
          </div>

          {/* Next episode CTA */}
          {nextEpisode && (
            <button
              onClick={() => router.push(`/series/${series.id}/episode/${nextEpisode.id}`)}
              className="mt-5 flex w-full items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-900/60 p-3 text-left transition hover:border-violet-500/50 hover:bg-zinc-900 sm:p-4 group"
            >
              <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800 sm:h-16 sm:w-28">
                <Image
                  src={`/api/drive-thumbnail/${nextEpisode.driveFileId}`}
                  alt={nextEpisode.title}
                  fill className="object-cover" unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-500">Up next · E{nextEpisode.episodeNumber}</p>
                <p className="truncate text-sm font-semibold text-white group-hover:text-violet-200">
                  {nextEpisode.title}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 group-hover:bg-violet-500 transition">
                  <Play className="ml-0.5 h-4 w-4 fill-current text-white" />
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Sidebar — season episode list */}
        <aside className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">
              Season {episode.season}
            </h2>
            {allSeasons.length > 1 && (
              <Link
                href={`/series/${series.id}`}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                All seasons
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {displayedEpisodes.map((ep) => {
              const isActive = ep.id === episode.id;
              const dur = formatDuration(ep.durationSeconds);
              return (
                <Link
                  key={ep.id}
                  href={`/series/${series.id}/episode/${ep.id}`}
                  className={`group flex items-center gap-3 rounded-xl border p-2.5 transition ${
                    isActive
                      ? "border-violet-500/60 bg-violet-600/10"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                    <Image
                      src={`/api/drive-thumbnail/${ep.driveFileId}`}
                      alt={ep.title} fill className="object-cover" unoptimized
                    />
                    {!isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                        <Play className="h-4 w-4 fill-current text-white" />
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-violet-600/40">
                        <Play className="h-4 w-4 fill-current text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-medium mb-0.5 ${isActive ? "text-violet-400" : "text-zinc-500"}`}>
                      E{ep.episodeNumber}
                    </p>
                    <p className={`truncate text-xs font-medium ${isActive ? "text-violet-200" : "text-zinc-300 group-hover:text-white"}`}>
                      {ep.title}
                    </p>
                    {dur && <p className="mt-0.5 text-[10px] text-zinc-600">{dur}</p>}
                  </div>
                </Link>
              );
            })}
          </div>

          {seasonEpisodes.length > 6 && (
            <button
              onClick={() => setShowAllEpisodes((s) => !s)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 py-2 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-white"
            >
              {showAllEpisodes ? (
                <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
              ) : (
                <><ChevronDown className="h-3.5 w-3.5" /> {seasonEpisodes.length - 6} more episodes</>
              )}
            </button>
          )}
        </aside>
      </div>
    </main>
  );
}
