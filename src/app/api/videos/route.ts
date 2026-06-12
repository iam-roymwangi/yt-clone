import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isValidDriveUrl } from "@/lib/google-drive";
import { getStorageMode } from "@/lib/videos-store";
import { addVideo, getVideos } from "@/lib/videos";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const videos = await getVideos();
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  if (getStorageMode() === "unconfigured") {
    return NextResponse.json(
      {
        error:
          "Production storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel, then redeploy.",
      },
      { status: 503 }
    );
  }

  let body: {
    title?: string;
    description?: string;
    driveUrl?: string;
    durationSeconds?: number;
    category?: "video" | "movie" | "podcast" | "mixtape";
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, description, driveUrl, durationSeconds, category } = body;

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
      category: (["video", "movie", "podcast", "mixtape"].includes(category ?? "") ? category : "video") as "video" | "movie" | "podcast" | "mixtape",
    });

    revalidatePath("/library", "layout");
    revalidatePath("/admin");

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Add video error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to add video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
