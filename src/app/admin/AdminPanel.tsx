"use client";

import { useState } from "react";
import AdminLogin from "@/components/AdminLogin";
import AdminVideoManager from "@/components/AdminVideoManager";
import AdminSeriesManager from "@/components/AdminSeriesManager";
import type { VideoCardData } from "@/lib/types";
import type { Series, Episode } from "@/lib/series-store";

type SeriesWithEps = Series & { episodes: Episode[] };

export default function AdminPanel({
  authenticated,
  initialVideos,
  initialSeries,
}: {
  authenticated: boolean;
  initialVideos: VideoCardData[];
  initialSeries: SeriesWithEps[];
}) {
  const [loggedIn, setLoggedIn] = useState(authenticated);
  const [tab, setTab] = useState<"videos" | "series">("videos");

  if (!loggedIn) {
    return <AdminLogin onSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
        {([
          { key: "videos", label: "Videos & Movies" },
          { key: "series", label: "Series" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === key ? "bg-violet-600 text-white shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "videos" ? (
        <AdminVideoManager initialVideos={initialVideos} />
      ) : (
        <AdminSeriesManager initialSeries={initialSeries} />
      )}
    </div>
  );
}
