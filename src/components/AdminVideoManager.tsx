"use client";

import { useState } from "react";
import {
  Pencil, Trash2, Loader2, Clapperboard, Video,
  CheckCircle2, LogOut,
} from "lucide-react";
import type { VideoCardData } from "@/lib/types";
import Image from "next/image";

type EditState = {
  id: string;
  title: string;
  description: string;
  driveUrl: string;
  category: "video" | "movie";
};

export default function AdminVideoManager({
  initialVideos,
}: {
  initialVideos: VideoCardData[];
}) {
  const [videos, setVideos] = useState<VideoCardData[]>(initialVideos);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  async function handleLogout() {
    setLogoutLoading(true);
    await fetch("/api/admin-auth", { method: "DELETE" });
    window.location.reload();
  }

  function startEdit(v: VideoCardData) {
    setEditing({ id: v.id, title: v.title, description: v.description, driveUrl: v.driveUrl, category: v.category });
    setError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setError(null);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/videos/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editing.title,
          description: editing.description,
          driveUrl: editing.driveUrl,
          category: editing.category,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      setVideos((prev) =>
        prev.map((v) =>
          v.id === editing.id
            ? {
                ...v,
                title: editing.title,
                description: editing.description,
                driveUrl: editing.driveUrl,
                category: editing.category,
                thumbnailSrc: `/api/drive-thumbnail/${data.driveFileId || v.driveFileId}`,
              }
            : v
        )
      );
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete");
      }
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {videos.length} video{videos.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-white"
        >
          {logoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Sign out
        </button>
      </div>

      {/* Video list */}
      {videos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-zinc-400">No videos yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {videos.map((v) => (
            <div key={v.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
              {editing?.id === v.id ? (
                <div className="flex flex-col gap-3 p-4">
                  <input
                    type="text"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    disabled={saving}
                    placeholder="Title"
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
                  />
                  <input
                    type="url"
                    value={editing.driveUrl}
                    onChange={(e) => setEditing({ ...editing, driveUrl: e.target.value })}
                    disabled={saving}
                    placeholder="Google Drive link"
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
                  />
                  <textarea
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    disabled={saving}
                    placeholder="Description"
                    rows={2}
                    className="resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
                  />
                  <div className="flex gap-2">
                    {(["video", "movie"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditing({ ...editing, category: c })}
                        disabled={saving}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          editing.category === c
                            ? "border-violet-500 bg-violet-600/20 text-violet-300"
                            : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                        }`}
                      >
                        {c === "movie" ? <Clapperboard className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </button>
                    ))}
                  </div>
                  {error && (
                    <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                      {error}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving || !editing.title || !editing.driveUrl}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3">
                  <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                    <Image
                      src={v.thumbnailSrc}
                      alt={v.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{v.title}</p>
                    {v.description && (
                      <p className="mt-0.5 truncate text-xs text-zinc-500">{v.description}</p>
                    )}
                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        v.category === "movie"
                          ? "bg-amber-900/30 text-amber-400"
                          : "bg-violet-900/30 text-violet-400"
                      }`}
                    >
                      {v.category === "movie" ? <Clapperboard className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                      {v.category === "movie" ? "Movie" : "Video"}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button
                      onClick={() => startEdit(v)}
                      className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition hover:border-red-700 hover:text-red-400 disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === v.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
