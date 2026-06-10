"use client";

import { useEffect, useRef } from "react";
import { useMiniPlayer, type MiniPlayerVideo } from "@/components/MiniPlayerContext";
import GoogleDrivePlayer from "@/components/GoogleDrivePlayer";

type Props = {
  fileId: string;
  title: string;
  driveUrl: string;
  embedSrc: string;
  libraryId: string;
};

export default function DrivePlayerWithMiniPlayer({
  fileId,
  title,
  driveUrl,
  embedSrc,
  libraryId,
}: Props) {
  const { setVideo, dismiss } = useMiniPlayer();
  const videoMeta = useRef<MiniPlayerVideo>({ fileId, title, driveUrl, embedSrc, libraryId, mode: "embed" });

  // Keep meta in sync
  useEffect(() => {
    videoMeta.current = { fileId, title, driveUrl, embedSrc, libraryId, mode: "embed" };
  }, [fileId, title, driveUrl, embedSrc, libraryId]);

  useEffect(() => {
    dismiss();
    return () => {
      setVideo(videoMeta.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GoogleDrivePlayer
      fileId={fileId}
      title={title}
      driveUrl={driveUrl}
      embedSrc={embedSrc}
    />
  );
}
