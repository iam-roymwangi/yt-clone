"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

type GoogleDrivePlayerProps = {
  fileId: string;
  title: string;
  driveUrl: string;
  embedSrc: string;
  onModeChange?: (mode: "stream" | "embed") => void;
};

export default function GoogleDrivePlayer({
  title,
  driveUrl,
  embedSrc,
}: GoogleDrivePlayerProps) {
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
      <div className="flex justify-center">
        <Link
          href={driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-violet-300"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in Google Drive
        </Link>
      </div>
    </div>
  );
}
