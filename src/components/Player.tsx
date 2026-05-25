"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export type QualityOption = {
  itag: number;
  label: string;
  mimeType: string;
  stream: "progressive" | "hls";
  height?: number;
};

interface PlayerProps {
  videoId: string;
}

function qualityKey(q: QualityOption) {
  return `${q.stream}-${q.stream === "hls" ? q.height : q.itag}`;
}

function streamSrc(videoId: string, quality: QualityOption) {
  if (quality.stream === "hls" && quality.height) {
    return `/api/hls?v=${videoId}&height=${quality.height}`;
  }
  return `/api/stream?v=${videoId}&itag=${quality.itag}`;
}

function pickDefaultQuality(list: QualityOption[]): QualityOption {
  return (
    list.find((q) => q.stream === "progressive") ??
    list.find((q) => q.label === "360p") ??
    list[0]
  );
}

export default function Player({ videoId }: PlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
  const qualitiesRef = useRef<QualityOption[]>([]);
  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [loadingQualities, setLoadingQualities] = useState(true);

  const initPlayer = useCallback(
    (quality: QualityOption, resumeTime?: number) => {
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
        sources: [
          {
            src: streamSrc(videoId, quality),
            type: quality.mimeType,
          },
        ],
      });

      if (resumeTime !== undefined && resumeTime > 0) {
        player.one("loadedmetadata", () => {
          player.currentTime(resumeTime);
        });
      }

      player.one("error", () => {
        const list = qualitiesRef.current;
        const fallback = list.find((q) => q.stream === "progressive");
        if (fallback && qualityKey(fallback) !== qualityKey(quality)) {
          setSelectedKey(qualityKey(fallback));
          initPlayer(fallback, player.currentTime());
        }
      });

      playerRef.current = player;
    },
    [videoId]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadQualities() {
      setLoadingQualities(true);
      setQualities([]);
      setSelectedKey(null);

      try {
        const res = await fetch(`/api/formats?v=${videoId}`);
        if (!res.ok) throw new Error("Failed to load qualities");
        const data = await res.json();
        if (cancelled) return;

        const list: QualityOption[] = data.qualities ?? [];
        qualitiesRef.current = list;
        setQualities(list);

        if (list.length > 0) {
          const best = pickDefaultQuality(list);
          setSelectedKey(qualityKey(best));
          initPlayer(best);
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

  const handleQualityChange = (key: string) => {
    const quality = qualities.find((q) => qualityKey(q) === key);
    if (!quality || key === selectedKey) return;

    const resumeTime = playerRef.current?.currentTime() ?? 0;
    setSelectedKey(key);
    initPlayer(quality, resumeTime);
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
            value={selectedKey ?? ""}
            onChange={(e) => handleQualityChange(e.target.value)}
            className="flex-1 max-w-xs bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            {qualities.map((q) => (
              <option key={qualityKey(q)} value={qualityKey(q)}>
                {q.label}
                {q.stream === "hls" ? " (HLS)" : " (MP4)"}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
