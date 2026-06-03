"use client";

import { useState } from "react";
import { Film } from "lucide-react";

type VideoThumbnailProps = {
  alt: string;
  posterSrc: string;
  className?: string;
};

export default function VideoThumbnail({
  alt,
  posterSrc,
  className = "",
}: VideoThumbnailProps) {
  const [failed, setFailed] = useState(false);

  if (posterSrc && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={posterSrc}
        alt={alt}
        className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${className}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-violet-950/50 ${className}`}
    >
      <Film className="relative h-10 w-10 text-zinc-600" />
    </div>
  );
}
