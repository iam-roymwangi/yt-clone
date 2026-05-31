"use client";

import { useEffect, useState } from "react";
import { Film } from "lucide-react";

type VideoThumbnailProps = {
  src: string;
  alt: string;
  posterSrc?: string | null;
  className?: string;
};

export default function VideoThumbnail({
  src,
  alt,
  posterSrc,
  className = "",
}: VideoThumbnailProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (posterSrc) return;

    let cancelled = false;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = src;

    const capture = () => {
      if (cancelled) return;
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) {
          setFailed(true);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setFailed(true);
          return;
        }
        ctx.drawImage(video, 0, 0, w, h);
        setDataUrl(canvas.toDataURL("image/jpeg", 0.8));
      } catch {
        setFailed(true);
      }
    };

    const onLoaded = () => {
      const t = Number.isFinite(video.duration)
        ? Math.min(3, Math.max(0.5, video.duration * 0.08))
        : 1;
      video.currentTime = t;
    };

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("seeked", capture);
    video.addEventListener("error", () => {
      if (!cancelled) setFailed(true);
    });

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("seeked", capture);
      video.src = "";
      video.load();
    };
  }, [src, posterSrc]);

  const imageSrc = posterSrc ?? dataUrl;

  if (imageSrc && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={alt}
        className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${className}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-violet-950/50 ${className}`}
    >
      {!failed && !posterSrc && (
        <div className="absolute inset-0 animate-pulse bg-zinc-800/40" />
      )}
      <Film className="relative h-10 w-10 text-zinc-600" />
    </div>
  );
}
