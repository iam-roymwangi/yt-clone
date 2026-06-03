import Link from "next/link";
import { notFound } from "next/navigation";
import GoogleDrivePlayer from "@/components/GoogleDrivePlayer";
import LocalVideoCard from "@/components/LocalVideoCard";
import PageHeader from "@/components/PageHeader";
import { getVideoById, getVideos, toVideoCardData } from "@/lib/videos";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const video = await getVideoById(params.id);
  if (!video) return { title: "Not found — Nexora" };
  return {
    title: `${video.title} — Nexora Library`,
    description: video.description || `Watch ${video.title}.`,
  };
}

export default async function LibraryWatchPage({
  params,
}: {
  params: { id: string };
}) {
  const video = await getVideoById(params.id);
  if (!video) notFound();

  const card = toVideoCardData(video);
  const others = (await getVideos())
    .filter((v) => v.id !== video.id)
    .slice(0, 4)
    .map(toVideoCardData);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <GoogleDrivePlayer
            fileId={video.driveFileId}
            title={card.title}
            driveUrl={video.driveUrl}
            embedSrc={card.embedSrc}
          />
          <h1 className="mt-5 text-xl font-bold leading-snug sm:text-2xl">
            {video.title}
          </h1>
          {video.description && (
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {video.description}
            </p>
          )}
        </div>

        <aside>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            More in library
          </h2>
          {others.length === 0 ? (
            <p className="text-sm text-zinc-600">No other videos.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {others.map((v) => (
                <li key={v.id}>
                  <LocalVideoCard video={v} />
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/library"
            className="mt-6 inline-block text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            ← Back to library
          </Link>
        </aside>
      </div>
    </main>
  );
}
