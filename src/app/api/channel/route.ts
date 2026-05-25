import { NextRequest, NextResponse } from "next/server";
import { getChannelVideos } from "@/lib/channel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const pageParam = searchParams.get("page");

  if (!id) {
    return NextResponse.json({ error: "Missing channel ID" }, { status: 400 });
  }

  const page = pageParam ? Math.max(0, parseInt(pageParam, 10)) : 0;

  try {
    const result = await getChannelVideos(id, page);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to load channel", details: message },
      { status: 500 }
    );
  }
}
