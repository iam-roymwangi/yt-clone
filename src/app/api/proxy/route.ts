import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
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
    const fetchHeaders = new Headers();
    if (range) {
      fetchHeaders.set("Range", range);
    }
    fetchHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36");
    fetchHeaders.set("Referer", "https://www.youtube.com/");
    fetchHeaders.set("Origin", "https://www.youtube.com");

    const response = await fetch(target, {
      headers: fetchHeaders,
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
