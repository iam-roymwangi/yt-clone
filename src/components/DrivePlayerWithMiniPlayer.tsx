"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const [mode, setMode] = useState<"stream" | "embed">("stream");
  const modeRef = useRef<"stream" | "embed">("stream");

  const handleModeChange = useCallback((newMode: "stream" | "embed") => {
    setMode(newMode);
    modeRef.current = newMode;
  }, []);

  const videoMeta = useRef<MiniPlayerVideo>({ fileId, title, driveUrl, embedSrc, libraryId, mode: "stream" });

  // Keep meta in sync
  useEffect(() => {
    videoMeta.current = { fileId, title, driveUrl, embedSrc, libraryId, mode };
  }, [fileId, title, driveUrl, embedSrc, libraryId, mode]);

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
      onModeChange={handleModeChange}
    />
  );
}
