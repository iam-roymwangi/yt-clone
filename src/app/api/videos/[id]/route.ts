import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidDriveUrl } from "@/lib/google-drive";
import { updateVideo, deleteVideo } from "@/lib/videos";

export const dynamic = "force-dynamic";

function isAdminAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_session")?.value;
  return token === process.env.ADMIN_PASSWORD;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    description?: string;
    driveUrl?: string;
    durationSeconds?: number | null;
    category?: "video" | "movie" | "podcast" | "mixtape";
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.driveUrl && !isValidDriveUrl(body.driveUrl)) {
    return NextResponse.json({ error: "Invalid Google Drive link" }, { status: 400 });
  }

  try {
    const video = await updateVideo(params.id, body);
    revalidatePath("/library", "layout");
    revalidatePath("/admin");
    return NextResponse.json(video);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteVideo(params.id);
    revalidatePath("/library", "layout");
    revalidatePath("/admin");
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
