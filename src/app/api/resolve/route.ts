import { NextRequest, NextResponse } from "next/server";
import { getStreamUrlNode } from "@/lib/youtube-node";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v = searchParams.get("v");
  const itagParam = searchParams.get("itag");
  const itag = itagParam ? parseInt(itagParam, 10) : undefined;

  if (!v) {
    return new NextResponse("Missing video ID", { status: 400 });
  }

  if (itagParam && (isNaN(itag!) || itag! <= 0)) {
    return new NextResponse("Invalid itag", { status: 400 });
  }

  try {
    const stream = await getStreamUrlNode(v, itag);

    if (!stream) {
      return NextResponse.json({ error: "No suitable format found" }, { status: 404 });
    }

    return NextResponse.json({
      url: stream.url,
      mimeType: stream.mimeType,
    });
  } catch (error: unknown) {
    console.error("Resolve error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Stream resolution failed", details: message },
      { status: 500 }
    );
  }
}
