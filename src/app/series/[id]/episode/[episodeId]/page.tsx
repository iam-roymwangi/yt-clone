import { notFound } from "next/navigation";
import { findEpisodeById, findSeriesWithEpisodes } from "@/lib/series-store";
import { getViewCount } from "@/lib/view-counts";
import EpisodePlayer from "./EpisodePlayer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string; episodeId: string } }) {
  const ep = await findEpisodeById(params.episodeId);
  if (!ep) return { title: "Not found — Nexora" };
  return { title: `${ep.title} — Nexora`, description: ep.description || `Watch ${ep.title}` };
}

export default async function EpisodeWatchPage({ params }: { params: { id: string; episodeId: string } }) {
  const [episode, series] = await Promise.all([
    findEpisodeById(params.episodeId),
    findSeriesWithEpisodes(params.id),
  ]);

  if (!episode || !series) notFound();

  const initialViewCount = await getViewCount(params.episodeId);
  const seasonEpisodes = series.episodes
    .filter((e) => e.season === episode.season)
    .sort((a, b) => a.episodeNumber - b.episodeNumber);

  const currentIndex = seasonEpisodes.findIndex((e) => e.id === episode.id);
  const nextEpisode = seasonEpisodes[currentIndex + 1] ?? null;
  const allSeasons = Array.from(new Set(series.episodes.map((e) => e.season))).sort((a, b) => a - b);

  return (
    <EpisodePlayer
      episode={episode}
      series={series}
      seasonEpisodes={seasonEpisodes}
      nextEpisode={nextEpisode}
      allSeasons={allSeasons}
      initialViewCount={initialViewCount}
    />
  );
}
