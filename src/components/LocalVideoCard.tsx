import Link from "next/link";
import { Play } from "lucide-react";
import type { VideoCardData } from "@/lib/videos";
import { formatDuration } from "@/lib/videos";
import VideoThumbnail from "@/components/VideoThumbnail";

export default function LocalVideoCard({ video }: { video: VideoCardData }) {
  const durationLabel = formatDuration(video.durationSeconds);

  return (
    <Link
      href={`/library/${video.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition hover:border-violet-500/40 hover:bg-zinc-900 hover:shadow-lg hover:shadow-violet-950/20"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        <VideoThumbnail
          alt={video.title}
          posterSrc={video.thumbnailSrc}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 transition group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/90 text-white shadow-lg ring-4 ring-black/20">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </div>
        {durationLabel && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-zinc-200 backdrop-blur-sm">
            {durationLabel}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-violet-200 sm:text-base">
          {video.title}
        </h2>
        <p className="mt-auto text-xs text-zinc-500">Google Drive</p>
      </div>
    </Link>
  );
}
