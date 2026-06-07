import { cookies } from "next/headers";
import { getVideos, toVideoCardData } from "@/lib/videos";
import { listSeries, listEpisodesForSeries } from "@/lib/series-store";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Nexora",
};

function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_session")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!adminPassword && token === adminPassword;
}

export default async function AdminPage() {
  const authenticated = isAuthenticated();

  const [videos, seriesWithEps] = authenticated
    ? await Promise.all([
        getVideos().then((v) => v.map(toVideoCardData)),
        (async () => {
          const series = await listSeries();
          return Promise.all(
            series.map(async (s) => {
              const episodes = await listEpisodesForSeries(s.id);
              return { ...s, episodes };
            })
          );
        })(),
      ])
    : [[], []];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin</h1>
        {authenticated && (
          <p className="mt-1 text-sm text-zinc-500">Manage your video library.</p>
        )}
      </div>
      <AdminPanel authenticated={authenticated} initialVideos={videos} initialSeries={seriesWithEps} />
    </main>
  );
}
