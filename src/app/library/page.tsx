import PageHeader from "@/components/PageHeader";
import LibraryGrid from "@/components/LibraryGrid";
import { getVideos, toVideoCardData } from "@/lib/videos";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata = {
  title: "Library — Nexora",
  description: "Watch videos from Google Drive links.",
};

export default async function LibraryPage() {
  const allVideos = (await getVideos()).map(toVideoCardData);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Video library"
        description="Watch and upload videos using Google Drive Links."
      />

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
        <LibraryGrid videos={allVideos} />
      )}
    </main>
  );
}
