import { NextRequest, NextResponse } from "next/server";
import { getStreamUrlNode } from "@/lib/youtube-node";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const UPSTREAM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://www.youtube.com/",
  Origin: "https://www.youtube.com",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v = searchParams.get("v");
  const itag = searchParams.get("itag");

  if (!v) {
    return new NextResponse("Missing video ID", { status: 400 });
  }

  try {
    let streamUrl: string | null = null;
    let mimeType = "video/mp4";

    const resolved = await getStreamUrlNode(v, itag ? parseInt(itag, 10) : undefined);
    if (resolved && resolved.url) {
      streamUrl = resolved.url;
      mimeType = resolved.mimeType;
    }

    if (!streamUrl) {
      return new NextResponse("No stream URL resolved", { status: 404 });
    }

    const range = req.headers.get("range");
    const headers: Record<string, string> = {
      "Content-Type": mimeType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
    };

    const fetchHeaders: Record<string, string> = { ...UPSTREAM_HEADERS };
    if (range) {
      fetchHeaders.Range = range;
    }

    const response = await fetch(streamUrl, { headers: fetchHeaders, cache: "no-store" });

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
