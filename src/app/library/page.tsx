import LocalVideoCard from "@/components/LocalVideoCard";
import PageHeader from "@/components/PageHeader";
import { IslandPagination } from "@/components/Pagination";
import { getVideos, toVideoCardData } from "@/lib/videos";
import { LIBRARY_PAGE_SIZE, libraryHref, paginate } from "@/lib/paginate";
import { Film, Link2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Library — Nexora",
  description: "Watch videos from Google Drive links.",
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const allVideos = (await getVideos()).map(toVideoCardData);
  const requestedPage = Math.max(
    1,
    parseInt(searchParams.page ?? "1", 10) || 1
  );
  const { items: videos, currentPage, totalPages, totalItems } = paginate(
    allVideos,
    requestedPage,
    LIBRARY_PAGE_SIZE
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Video library"
        description="Watch videos hosted on Google Drive — no sign-in required."
      />

      <div className="mb-8 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1">
          <Film className="h-3.5 w-3.5 text-violet-400" />
          {totalItems} video{totalItems === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1">
          <Link2 className="h-3.5 w-3.5 text-violet-400" />
          Google Drive
        </span>
      </div>

      {allVideos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-lg font-medium text-zinc-300">No videos yet</p>
          <p className="mt-2 text-sm text-zinc-500">
            Add a Google Drive link on the{" "}
            <Link href="/admin" className="text-violet-400 hover:text-violet-300">
              add video page
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {videos.map((video) => (
              <li key={video.id}>
                <LocalVideoCard video={video} />
              </li>
            ))}
          </ul>

          <IslandPagination
            currentPage={currentPage}
            totalPages={totalPages}
            makeHref={libraryHref}
            label={`Page ${currentPage} of ${totalPages}`}
          />
        </>
      )}
    </main>
  );
}
