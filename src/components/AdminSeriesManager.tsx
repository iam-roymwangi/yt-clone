"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Loader2, CheckCircle2, Tv2, ChevronDown, ChevronUp } from "lucide-react";
import type { Series, Episode } from "@/lib/series-store";

type SeriesWithEps = Series & { episodes: Episode[] };

export default function AdminSeriesManager({ initialSeries }: { initialSeries: SeriesWithEps[] }) {
  const [list, setList] = useState(initialSeries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingEpId, setDeletingEpId] = useState<string | null>(null);

  function startEdit(s: SeriesWithEps) {
    setEditingId(s.id); setEditTitle(s.title); setEditDesc(s.description); setError(null);
  }

  async function handleSave(id: string) {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/series/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDesc }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setList((prev) => prev.map((s) => s.id === id ? { ...s, title: editTitle, description: editDesc } : s));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setSaving(false); }
  }

  async function handleDeleteSeries(id: string) {
    if (!confirm("Delete this series and all its episodes? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/series/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed");
      setList((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally { setDeletingId(null); }
  }

  async function handleDeleteEpisode(seriesId: string, epId: string) {
    if (!confirm("Delete this episode?")) return;
    setDeletingEpId(epId);
    try {
      const res = await fetch(`/api/episodes/${epId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed");
      setList((prev) => prev.map((s) => s.id === seriesId ? { ...s, episodes: s.episodes.filter((e) => e.id !== epId) } : s));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally { setDeletingEpId(null); }
  }

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-12 text-center">
        <p className="text-zinc-400 text-sm">No series yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {list.map((s) => (
        <div key={s.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          {editingId === s.id ? (
            <div className="flex flex-col gap-3 p-4">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} disabled={saving}
                placeholder="Title"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500" />
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} disabled={saving}
                placeholder="Description" rows={2}
                className="resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500" />
              {error && <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">{error}</p>}
              <div className="flex gap-2">
                <button onClick={() => handleSave(s.id)} disabled={saving || !editTitle}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save
                </button>
                <button onClick={() => setEditingId(null)} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-900/30">
                  <Tv2 className="h-5 w-5 text-violet-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{s.title}</p>
                  <p className="text-xs text-zinc-500">{s.episodes.length} episode{s.episodes.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:border-zinc-500 hover:text-white transition" title="Episodes">
                    {expandedId === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button onClick={() => startEdit(s)}
                    className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:border-zinc-500 hover:text-white transition" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteSeries(s.id)} disabled={deletingId === s.id}
                    className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:border-red-700 hover:text-red-400 disabled:opacity-50 transition" title="Delete">
                    {deletingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {expandedId === s.id && (
                <div className="border-t border-zinc-800 px-3 pb-3 pt-2">
                  {s.episodes.length === 0 ? (
                    <p className="py-2 text-xs text-zinc-600">No episodes.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {s.episodes
                        .sort((a, b) => a.season - b.season || a.episodeNumber - b.episodeNumber)
                        .map((ep) => (
                          <div key={ep.id} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
                            <span className="text-xs font-medium text-zinc-500 w-14 flex-shrink-0">S{ep.season}E{ep.episodeNumber}</span>
                            <span className="min-w-0 flex-1 truncate text-xs text-zinc-300">{ep.title}</span>
                            <Link href={`/series/${s.id}/episode/${ep.id}`}
                              className="flex-shrink-0 text-xs text-violet-400 hover:text-violet-300" target="_blank">
                              View
                            </Link>
                            <button onClick={() => handleDeleteEpisode(s.id, ep.id)} disabled={deletingEpId === ep.id}
                              className="flex-shrink-0 text-zinc-600 hover:text-red-400 disabled:opacity-50 transition">
                              {deletingEpId === ep.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
