import { NextRequest, NextResponse } from "next/server";
import { isValidDriveUrl } from "@/lib/google-drive";
import { addVideo, getVideos } from "@/lib/videos";

export const dynamic = "force-dynamic";

export async function GET() {
  const videos = await getVideos();
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  let body: {
    title?: string;
    description?: string;
    driveUrl?: string;
    durationSeconds?: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, description, driveUrl, durationSeconds } = body;

  if (!title?.trim() || !driveUrl?.trim()) {
    return NextResponse.json(
      { error: "title and driveUrl are required" },
      { status: 400 }
    );
  }

  if (!isValidDriveUrl(driveUrl)) {
    return NextResponse.json(
      {
        error:
          "Invalid Google Drive link. Use a share link like https://drive.google.com/file/d/…/view",
      },
      { status: 400 }
    );
  }

  try {
    const video = await addVideo({
      title,
      description,
      driveUrl,
      durationSeconds,
    });
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Add video error:", error);
    return NextResponse.json({ error: "Failed to add video" }, { status: 500 });
  }
}
