import Link from "next/link";

interface ChannelCardProps {
  channelId: string;
  title: string;
  thumbnail?: unknown;
}

function thumbnailUrl(thumbnail: unknown): string | null {
  if (!thumbnail) return null;
  if (Array.isArray(thumbnail) && thumbnail[0]?.url) {
    return thumbnail[0].url;
  }
  return null;
}

export default function ChannelCard({
  channelId,
  title,
  thumbnail,
}: ChannelCardProps) {
  const url = thumbnailUrl(thumbnail);

  return (
    <Link
      href={`/channel/${channelId}`}
      className="group flex items-center gap-4 rounded-xl bg-zinc-900 border border-zinc-800 p-4 hover:border-violet-500/50 transition-colors"
    >
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-zinc-800 shrink-0">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-violet-400 text-xl font-bold">
            {title.charAt(0)}
          </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-zinc-500">Channel</p>
      </div>
    </Link>
  );
}
