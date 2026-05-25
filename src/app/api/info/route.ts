import { NextRequest, NextResponse } from "next/server";
import { getVideoMetadataNode } from "@/lib/youtube-node";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v = searchParams.get("v");

  if (!v) {
    return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
  }

  try {
    const metadata = await getVideoMetadataNode(v);
    return NextResponse.json(metadata);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch video info", details: message },
      { status: 500 }
    );
  }
}
