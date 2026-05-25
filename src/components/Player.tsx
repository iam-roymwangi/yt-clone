"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export type QualityOption = {
  itag: number;
  label: string;
  mimeType: string;
};

interface PlayerProps {
  videoId: string;
}

function streamSrc(videoId: string, itag: number) {
  return `/api/stream?v=${videoId}&itag=${itag}`;
}

export default function Player({ videoId }: PlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const [selectedItag, setSelectedItag] = useState<number | null>(null);
  const [loadingQualities, setLoadingQualities] = useState(true);

  const initPlayer = useCallback(
    (itag: number, mimeType: string, resumeTime?: number) => {
      if (!videoRef.current) return;

      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
      videoRef.current.innerHTML = "";

      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = videojs(videoElement, {
        controls: true,
        responsive: true,
        fluid: true,
        html5: {
          vhs: { overrideNative: true },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false,
        },
        sources: [{ src: streamSrc(videoId, itag), type: mimeType }],
      });

      if (resumeTime !== undefined && resumeTime > 0) {
        player.one("loadedmetadata", () => {
          player.currentTime(resumeTime);
        });
      }

      playerRef.current = player;
    },
    [videoId]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadQualities() {
      setLoadingQualities(true);
      setQualities([]);
      setSelectedItag(null);

      try {
        const res = await fetch(`/api/formats?v=${videoId}`);
        if (!res.ok) throw new Error("Failed to load qualities");
        const data = await res.json();
        if (cancelled) return;

        const list: QualityOption[] = data.qualities ?? [];
        setQualities(list);

        if (list.length > 0) {
          const best = list[0];
          setSelectedItag(best.itag);
          initPlayer(best.itag, best.mimeType);
        }
      } catch {
        if (!cancelled) setQualities([]);
      } finally {
        if (!cancelled) setLoadingQualities(false);
      }
    }

    loadQualities();

    return () => {
      cancelled = true;
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoId, initPlayer]);

  const handleQualityChange = (itag: number) => {
    const quality = qualities.find((q) => q.itag === itag);
    if (!quality || itag === selectedItag) return;

    const resumeTime = playerRef.current?.currentTime() ?? 0;
    setSelectedItag(itag);
    initPlayer(itag, quality.mimeType, resumeTime);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        data-vjs-player
        className="rounded-lg overflow-hidden shadow-lg bg-black"
      >
        <div ref={videoRef} />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5">
        <label
          htmlFor="quality-select"
          className="text-sm font-medium text-zinc-400 shrink-0"
        >
          Quality
        </label>
        {loadingQualities ? (
          <span className="text-sm text-zinc-500">Loading…</span>
        ) : qualities.length === 0 ? (
          <span className="text-sm text-zinc-500">Auto</span>
        ) : (
          <select
            id="quality-select"
            value={selectedItag ?? ""}
            onChange={(e) => handleQualityChange(Number(e.target.value))}
            className="flex-1 max-w-xs bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            {qualities.map((q) => (
              <option key={q.itag} value={q.itag}>
                {q.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
