"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CheckCircle2, Clapperboard, Link2, Loader2, Video } from "lucide-react";

export default function DriveVideoForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [category, setCategory] = useState<"video" | "movie">("video");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          driveUrl,
          category,
        }),
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to add video");
      }

      setTitle("");
      setDescription("");
      setDriveUrl("");

      router.push(`/library/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add video");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-violet-400" />
        <h2 className="text-lg font-semibold">Add Google Drive video</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-400">Google Drive link</span>
          <input
            type="url"
            required
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            disabled={loading}
            placeholder="https://drive.google.com/file/d/…/view?usp=sharing"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-violet-500"
          />
          <span className="text-xs text-zinc-600">
            Set sharing to &quot;Anyone with the link&quot; on Google Drive.
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-400">Title</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-violet-500"
            placeholder="Video title"
          />
        </label>

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-400">Category</span>
          <div className="flex gap-2">
            {(["video", "movie"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  category === c
                    ? "border-violet-500 bg-violet-600/20 text-violet-300"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
                }`}
              >
                {c === "movie" ? (
                  <Clapperboard className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-400">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={3}
            className="resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 outline-none focus:border-violet-500"
            placeholder="Optional description"
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading && (
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding video…
          </p>
        )}

        <button
          type="submit"
          disabled={!title.trim() || !driveUrl.trim() || loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Link2 className="h-4 w-4" />
          Add to library
        </button>
      </form>
    </div>
  );
}
