import { NextRequest, NextResponse } from "next/server";
import { searchChannels, searchVideos } from "@/lib/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type") ?? "video";
  const cursor = searchParams.get("cursor");

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const result =
      type === "channel"
        ? await searchChannels(q, cursor)
        : await searchVideos(q, cursor);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Search failed", details: message },
      { status: 500 }
    );
  }
}
