"use client";

import { useEffect, useRef, useState } from "react";
import { X, Maximize2, GripHorizontal } from "lucide-react";
import Link from "next/link";
import { useMiniPlayer } from "@/components/MiniPlayerContext";

export default function MiniPlayer() {
  const { video, dismiss } = useMiniPlayer();

  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  // Reset position when a new video appears
  useEffect(() => {
    if (video) setPos(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.fileId]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragState.current) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      const el = containerRef.current;
      if (!el) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const newX = Math.max(0, Math.min(window.innerWidth - w, dragState.current.origX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - h, dragState.current.origY + dy));
      setPos({ x: newX, y: newY });
    };
    const onMouseUp = () => { dragState.current = null; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Touch support
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragState.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragState.current.startX;
      const dy = touch.clientY - dragState.current.startY;
      const el = containerRef.current;
      if (!el) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const newX = Math.max(0, Math.min(window.innerWidth - w, dragState.current.origX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - h, dragState.current.origY + dy));
      setPos({ x: newX, y: newY });
      e.preventDefault();
    };
    const onTouchEnd = () => { dragState.current = null; };

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    dragState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      origX: rect.left,
      origY: rect.top,
    };
  };

  if (!video) return null;

  const style: React.CSSProperties = pos
    ? { position: "fixed", left: pos.x, top: pos.y, bottom: "auto", right: "auto" }
    : { position: "fixed", bottom: "7rem", right: "1rem" };

  return (
    <div
      ref={containerRef}
      style={style}
      className="z-[9999] w-72 sm:w-80 rounded-xl overflow-hidden shadow-2xl border border-zinc-700 bg-zinc-900 select-none"
    >
      {/* Drag handle */}
      <div
        className="flex items-center justify-between bg-zinc-800 px-3 py-1.5 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="h-4 w-4 shrink-0 text-zinc-500" />
          <span className="truncate text-xs font-medium text-zinc-300">{video.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <Link
            href={`/library/${video.libraryId}`}
            onClick={dismiss}
            className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-700"
            title="Open full player"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-700"
            aria-label="Close mini player"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Video */}
      <div className="relative aspect-video bg-black">
        {video.mode === "embed" ? (
          <iframe
            src={video.embedSrc}
            title={video.title}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <video
            className="h-full w-full object-contain"
            src={`/api/drive-stream/${video.fileId}`}
            autoPlay
            controls
            playsInline
          />
        )}
      </div>
    </div>
  );
}
