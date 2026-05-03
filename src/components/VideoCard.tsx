import Link from "next/link";
import Image from "next/image";

interface VideoCardProps {
  videoId: string;
  title: string;
  author: string;
  duration?: string;
  views?: number;
}

export default function VideoCard({ videoId, title, author, duration, views }: VideoCardProps) {
  return (
    <Link href={`/watch?v=${videoId}`} className="group flex flex-col gap-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-800">
        <Image
          src={`/api/thumbnail?v=${videoId}`}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {duration}
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <h3 className="line-clamp-2 text-sm font-semibold text-white leading-tight">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-400">{author}</p>
        {views && (
          <p className="text-xs text-gray-500">
            {new Intl.NumberFormat('en-US', { notation: "compact" }).format(views)} views
          </p>
        )}
      </div>
    </Link>
  );
}
