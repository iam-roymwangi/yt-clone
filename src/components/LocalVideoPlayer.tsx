"use client";

import { useCallback, useRef, useState } from "react";
import { Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react";

type LocalVideoPlayerProps = {
  src: string;
  title: string;
  onError?: () => void;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LocalVideoPlayer({ src, title, onError }: LocalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }, []);

  const seek = useCallback(
    (value: number) => {
      const el = videoRef.current;
      if (!el || !duration) return;
      el.currentTime = (value / 100) * duration;
    },
    [duration]
  );

  const enterFullscreen = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) void el.requestFullscreen();
    else if ("webkitEnterFullscreen" in el) {
      (el as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
    }
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div className="group relative w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-zinc-800">
      <div className="relative aspect-video w-full bg-zinc-900">
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          src={src}
          title={title}
          playsInline
          preload="metadata"
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onProgress={(e) => {
            const el = e.currentTarget;
            if (el.buffered.length > 0) {
              setBuffered(el.buffered.end(el.buffered.length - 1));
            }
          }}
          onError={() => onError?.()}
        />

        {!playing && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
            aria-label="Play"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-600/90 text-white shadow-lg ring-4 ring-violet-500/30 transition-transform hover:scale-105 sm:h-20 sm:w-20">
              <Play className="ml-1 h-8 w-8 fill-current sm:h-10 sm:w-10" />
            </span>
          </button>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-3 pt-10 opacity-100 transition-opacity sm:px-4">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
          className="local-video-progress relative z-10 mb-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-700"
          style={
            {
              "--buffer": `${bufferProgress}%`,
              "--progress": `${progress}%`,
            } as React.CSSProperties
          }
          aria-label="Seek"
        />

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="rounded-md p-1.5 text-white hover:bg-white/10"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="rounded-md p-1.5 text-white hover:bg-white/10"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>

          <span className="min-w-0 flex-1 truncate text-xs text-zinc-300 sm:text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={enterFullscreen}
            className="rounded-md p-1.5 text-white hover:bg-white/10"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
