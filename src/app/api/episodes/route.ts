import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createEpisode } from "@/lib/series-store";
import { extractDriveFileId, isValidDriveUrl } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: {
    seriesId?: string; season?: number; episodeNumber?: number;
    title?: string; description?: string; driveUrl?: string; durationSeconds?: number | null;
  };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.seriesId?.trim()) return NextResponse.json({ error: "seriesId is required" }, { status: 400 });
  if (!body.title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!body.driveUrl?.trim()) return NextResponse.json({ error: "driveUrl is required" }, { status: 400 });
  if (!body.season || body.season < 1) return NextResponse.json({ error: "valid season is required" }, { status: 400 });
  if (!body.episodeNumber || body.episodeNumber < 1) return NextResponse.json({ error: "valid episodeNumber is required" }, { status: 400 });
  if (!isValidDriveUrl(body.driveUrl)) return NextResponse.json({ error: "Invalid Google Drive link" }, { status: 400 });

  const driveFileId = extractDriveFileId(body.driveUrl);
  if (!driveFileId) return NextResponse.json({ error: "Could not extract file ID" }, { status: 400 });

  try {
    const ep = await createEpisode({
      seriesId: body.seriesId, season: body.season, episodeNumber: body.episodeNumber,
      title: body.title, description: body.description, driveFileId, driveUrl: body.driveUrl,
      durationSeconds: body.durationSeconds,
    });
    revalidatePath(`/series/${body.seriesId}`);
    return NextResponse.json(ep, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
