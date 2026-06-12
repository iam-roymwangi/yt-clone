"use client";

type GoogleDrivePlayerProps = {
  fileId: string;
  title: string;
  driveUrl: string;
  embedSrc: string;
  onModeChange?: (mode: "stream" | "embed") => void;
};

export default function GoogleDrivePlayer({
  title,
  embedSrc,
}: GoogleDrivePlayerProps) {
  return (
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
  );
}
