import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findEpisodeById, updateEpisode, deleteEpisode } from "@/lib/series-store";
import { extractDriveFileId, isValidDriveUrl } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

function isAdmin() {
  const pw = process.env.ADMIN_PASSWORD;
  return !!pw && cookies().get("admin_session")?.value === pw;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { title?: string; description?: string; driveUrl?: string; season?: number; episodeNumber?: number; durationSeconds?: number | null };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (body.driveUrl && !isValidDriveUrl(body.driveUrl)) return NextResponse.json({ error: "Invalid Google Drive link" }, { status: 400 });

  const patch: Parameters<typeof updateEpisode>[1] = { ...body };
  if (body.driveUrl) patch.driveFileId = extractDriveFileId(body.driveUrl) ?? undefined;

  try {
    const ep = await updateEpisode(params.id, patch);
    revalidatePath(`/series/${ep.seriesId}`);
    return NextResponse.json(ep);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const ep = await findEpisodeById(params.id);
    await deleteEpisode(params.id);
    if (ep) revalidatePath(`/series/${ep.seriesId}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
