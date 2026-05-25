import { NextRequest, NextResponse } from "next/server";
import { getStreamUrl, UPSTREAM_HEADERS } from "@/lib/youtube";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const maxDuration = 60;

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
    const range = req.headers.get("range");
    const stream = await getStreamUrl(v, itag);

    if (!stream) {
      return new NextResponse("No suitable format found", { status: 404 });
    }

    const headers: Record<string, string> = {
      "Content-Type": stream.mimeType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
    };

    const fetchHeaders: Record<string, string> = { ...UPSTREAM_HEADERS };
    if (range) {
      fetchHeaders.Range = range;
    }

    const response = await fetch(stream.url, { headers: fetchHeaders });

    if (!response.ok && response.status !== 206) {
      console.error("Upstream stream error:", response.status, v);
      return new NextResponse("Upstream stream failed", {
        status: response.status === 403 ? 502 : response.status,
      });
    }

    if (response.headers.get("content-length")) {
      headers["Content-Length"] = response.headers.get("content-length")!;
    }
    if (response.headers.get("content-range")) {
      headers["Content-Range"] = response.headers.get("content-range")!;
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (error: unknown) {
    console.error("Stream error:", error);
    return new NextResponse("Stream proxy failed", { status: 500 });
  }
}
