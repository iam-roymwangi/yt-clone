"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import LocalVideoPlayer from "@/components/LocalVideoPlayer";

type GoogleDrivePlayerProps = {
  fileId: string;
  title: string;
  driveUrl: string;
  embedSrc: string;
  onModeChange?: (mode: "stream" | "embed") => void;
};

export default function GoogleDrivePlayer({
  fileId,
  title,
  driveUrl,
  embedSrc,
  onModeChange,
}: GoogleDrivePlayerProps) {
  const streamSrc = `/api/drive-stream/${fileId}`;
  const [useEmbed, setUseEmbed] = useState(false);
  const [streamFailed, setStreamFailed] = useState(false);

  const switchToEmbed = () => {
    setUseEmbed(true);
    onModeChange?.("embed");
  };

  const switchToStream = () => {
    setUseEmbed(false);
    onModeChange?.("stream");
  };

  const handleStreamFailed = () => {
    setStreamFailed(true);
    onModeChange?.("embed");
  };

  if (useEmbed || streamFailed) {
    return (
      <div className="space-y-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-zinc-800">
          <iframe
            src={embedSrc}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="text-center text-xs text-zinc-500">
          If you see &quot;still being processed&quot;, open the file in Drive or try the
          direct player again.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {!streamFailed && (
            <button
              type="button"
              onClick={switchToStream}
              className="text-sm text-violet-400 hover:text-violet-300"
            >
              Try direct player
            </button>
          )}
          <Link
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Google Drive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DriveVideoWithFallback
        streamSrc={streamSrc}
        title={title}
        onFailed={handleStreamFailed}
      />
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        <button
          type="button"
          onClick={switchToEmbed}
          className="text-zinc-500 hover:text-violet-300"
        >
          Use Google Drive player instead
        </button>
        <Link
          href={driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-violet-300"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in Drive
        </Link>
      </div>
    </div>
  );
}

function DriveVideoWithFallback({
  streamSrc,
  title,
  onFailed,
}: {
  streamSrc: string;
  title: string;
  onFailed: () => void;
}) {
  return (
    <div
      onErrorCapture={(e) => {
        const target = e.target;
        if (target instanceof HTMLVideoElement) {
          onFailed();
        }
      }}
    >
      <LocalVideoPlayer src={streamSrc} title={title} onError={onFailed} />
    </div>
  );
}
