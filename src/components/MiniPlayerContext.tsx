"use client";

import { createContext, useContext, useState, useCallback } from "react";

export type MiniPlayerVideo = {
  fileId: string;
  title: string;
  driveUrl: string;
  embedSrc: string;
  libraryId: string;
  mode: "stream" | "embed";
};

type MiniPlayerContextValue = {
  video: MiniPlayerVideo | null;
  setVideo: (v: MiniPlayerVideo | null) => void;
  dismiss: () => void;
};

const MiniPlayerContext = createContext<MiniPlayerContextValue>({
  video: null,
  setVideo: () => {},
  dismiss: () => {},
});

export function MiniPlayerProvider({ children }: { children: React.ReactNode }) {
  const [video, setVideoState] = useState<MiniPlayerVideo | null>(null);

  const setVideo = useCallback((v: MiniPlayerVideo | null) => {
    setVideoState(v);
  }, []);

  const dismiss = useCallback(() => setVideoState(null), []);

  return (
    <MiniPlayerContext.Provider value={{ video, setVideo, dismiss }}>
      {children}
    </MiniPlayerContext.Provider>
  );
}

export function useMiniPlayer() {
  return useContext(MiniPlayerContext);
}
