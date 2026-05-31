import LocalVideoCard from "@/components/LocalVideoCard";
import PageHeader from "@/components/PageHeader";
import { IslandPagination } from "@/components/Pagination";
import { getLocalVideos } from "@/lib/local-videos";
import { LIBRARY_PAGE_SIZE, libraryHref, paginate } from "@/lib/paginate";
import { HardDrive, Wifi } from "lucide-react";

export const metadata = {
  title: "Local Library — Nexora",
  description: "Watch videos hosted on Nexora's CDN — no proxy, no rate limits.",
};

export default function LibraryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const allVideos = getLocalVideos();
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
        title="Local library"
        description="Video requests coming soon!"
      />

      <div className="mb-8 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1">
          <HardDrive className="h-3.5 w-3.5 text-violet-400" />
          {totalItems} video{totalItems === 1 ? "" : "s"}
        </span>
      </div>

      {allVideos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-lg font-medium text-zinc-300">No videos yet</p>
          <p className="mt-2 text-sm text-zinc-500">
            Add <code className="text-violet-400">.mp4</code> files to{" "}
            <code className="text-zinc-400">public/videos/</code> and redeploy.
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
