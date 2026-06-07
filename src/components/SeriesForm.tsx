"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Tv2, Plus, Loader2, ChevronDown } from "lucide-react";

type SeriesOption = { id: string; title: string };

export default function SeriesForm() {
  const router = useRouter();

  // Tab: new series or add episode
  const [tab, setTab] = useState<"new-series" | "add-episode">("new-series");

  // New series state
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesDesc, setSeriesDesc] = useState("");
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [seriesError, setSeriesError] = useState<string | null>(null);

  // Add episode state
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([]);
  const [seriesId, setSeriesId] = useState("");
  const [season, setSeason] = useState("1");
  const [epNumber, setEpNumber] = useState("1");
  const [epTitle, setEpTitle] = useState("");
  const [epDesc, setEpDesc] = useState("");
  const [epUrl, setEpUrl] = useState("");
  const [epLoading, setEpLoading] = useState(false);
  const [epError, setEpError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/series").then((r) => r.json()).then(setSeriesList).catch(() => {});
  }, []);

  async function handleNewSeries(e: FormEvent) {
    e.preventDefault();
    setSeriesError(null);
    setSeriesLoading(true);
    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: seriesTitle, description: seriesDesc }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push(`/series/${data.id}`);
    } catch (err) {
      setSeriesError(err instanceof Error ? err.message : "Failed");
      setSeriesLoading(false);
    }
  }

  async function handleAddEpisode(e: FormEvent) {
    e.preventDefault();
    setEpError(null);
    setEpLoading(true);
    try {
      const res = await fetch("/api/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId, season: Number(season), episodeNumber: Number(epNumber),
          title: epTitle, description: epDesc, driveUrl: epUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed");
      // Reset episode fields, keep series/season for batch uploading
      setEpTitle(""); setEpDesc(""); setEpUrl("");
      setEpNumber(String(Number(epNumber) + 1));
      router.refresh();
    } catch (err) {
      setEpError(err instanceof Error ? err.message : "Failed");
      setEpLoading(false);
    } finally {
      setEpLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Tv2 className="h-5 w-5 text-violet-400" />
        <h2 className="text-lg font-semibold">Series</h2>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
        {([
          { key: "new-series", label: "New series" },
          { key: "add-episode", label: "Add episode" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === key ? "bg-violet-600 text-white shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "new-series" ? (
        <form onSubmit={handleNewSeries} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-zinc-400">Series title</span>
            <input type="text" required value={seriesTitle} onChange={(e) => setSeriesTitle(e.target.value)}
              disabled={seriesLoading} placeholder="e.g. Breaking Bad"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-violet-500"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-zinc-400">Description</span>
            <textarea value={seriesDesc} onChange={(e) => setSeriesDesc(e.target.value)}
              disabled={seriesLoading} rows={3} placeholder="Optional description"
              className="resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-violet-500"
            />
          </label>
          {seriesError && <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">{seriesError}</p>}
          <button type="submit" disabled={!seriesTitle.trim() || seriesLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
            {seriesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create series
          </button>
        </form>
      ) : (
        <form onSubmit={handleAddEpisode} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-zinc-400">Series</span>
            <div className="relative">
              <select value={seriesId} onChange={(e) => setSeriesId(e.target.value)} required disabled={epLoading}
                className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-violet-500">
                <option value="">Select a series…</option>
                {seriesList.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-zinc-400">Season</span>
              <input type="number" min={1} required value={season} onChange={(e) => setSeason(e.target.value)}
                disabled={epLoading}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-violet-500"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-zinc-400">Episode #</span>
              <input type="number" min={1} required value={epNumber} onChange={(e) => setEpNumber(e.target.value)}
                disabled={epLoading}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-violet-500"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-zinc-400">Episode title</span>
            <input type="text" required value={epTitle} onChange={(e) => setEpTitle(e.target.value)}
              disabled={epLoading} placeholder="Episode title"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-violet-500"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-zinc-400">Google Drive link</span>
            <input type="url" required value={epUrl} onChange={(e) => setEpUrl(e.target.value)}
              disabled={epLoading} placeholder="https://drive.google.com/file/d/…/view"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-violet-500"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-zinc-400">Description</span>
            <textarea value={epDesc} onChange={(e) => setEpDesc(e.target.value)}
              disabled={epLoading} rows={2} placeholder="Optional"
              className="resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-violet-500"
            />
          </label>

          {epError && <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">{epError}</p>}

          <button type="submit" disabled={!seriesId || !epTitle.trim() || !epUrl.trim() || epLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
            {epLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add episode
          </button>
        </form>
      )}
    </div>
  );
}
