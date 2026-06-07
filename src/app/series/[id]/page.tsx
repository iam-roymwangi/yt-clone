import { notFound } from "next/navigation";
import { findSeriesWithEpisodes } from "@/lib/series-store";
import SeriesDetail from "./SeriesDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const s = await findSeriesWithEpisodes(params.id);
  if (!s) return { title: "Not found — Nexora" };
  return { title: `${s.title} — Nexora`, description: s.description || `Watch ${s.title}` };
}

export default async function SeriesPage({ params }: { params: { id: string } }) {
  const series = await findSeriesWithEpisodes(params.id);
  if (!series) notFound();
  return <SeriesDetail series={series} />;
}
