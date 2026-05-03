import { NextRequest, NextResponse } from "next/server";
import { videoInfo } from "youtube-ext";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v = searchParams.get("v");

  if (!v) {
    return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
  }

  try {
    const info = await videoInfo(v);

    return NextResponse.json({
      title: info.title,
      description: info.description,
      author: info.channel?.name || "Unknown Author",
      viewCount: info.views,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch video info", details: error.message },
      { status: 500 }
    );
  }
}
