import { NextRequest, NextResponse } from "next/server";
import { UPSTREAM_HEADERS } from "@/lib/youtube";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");

  if (!target) {
    return new NextResponse("Missing url", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  const allowed =
    parsed.hostname.endsWith("googlevideo.com") ||
    parsed.hostname.endsWith("youtube.com") ||
    parsed.hostname.endsWith("googleusercontent.com") ||
    parsed.hostname.endsWith("ytimg.com") ||
    parsed.hostname === "youtu.be";

  if (!allowed) {
    return new NextResponse("Forbidden host", { status: 403 });
  }

  try {
    const range = req.headers.get("range");
    const headers: Record<string, string> = { ...UPSTREAM_HEADERS };
    if (range) headers.Range = range;

    const response = await fetch(target, {
      headers,
      cache: "no-store",
      redirect: "follow",
    });

    const resHeaders: Record<string, string> = {
      "Cache-Control": "no-store",
    };

    const contentType = response.headers.get("content-type");
    if (contentType) resHeaders["Content-Type"] = contentType;

    const contentLength = response.headers.get("content-length");
    if (contentLength) resHeaders["Content-Length"] = contentLength;

    const contentRange = response.headers.get("content-range");
    if (contentRange) resHeaders["Content-Range"] = contentRange;

    return new NextResponse(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (error: unknown) {
    console.error("Proxy error:", error);
    return new NextResponse("Proxy failed", { status: 500 });
  }
}
