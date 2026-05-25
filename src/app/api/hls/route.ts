import { NextRequest, NextResponse } from "next/server";
import {
  getHlsManifestUrl,
  getHlsPlaylistForHeight,
  noCacheFetch,
  rewriteHlsManifest,
  UPSTREAM_HEADERS,
} from "@/lib/youtube";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v = searchParams.get("v");
  const heightParam = searchParams.get("height");

  if (!v) {
    return new NextResponse("Missing video ID", { status: 400 });
  }

  const proxyOrigin = getRequestOrigin(req);

  try {
    if (heightParam) {
      const height = parseInt(heightParam, 10);
      if (isNaN(height) || height <= 0) {
        return new NextResponse("Invalid height", { status: 400 });
      }

      const playlist = await getHlsPlaylistForHeight(v, height, proxyOrigin);
      if (!playlist) {
        return new NextResponse("HLS variant not found", { status: 404 });
      }

      return new NextResponse(playlist, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const manifestUrl = await getHlsManifestUrl(v);
    if (!manifestUrl) {
      return new NextResponse("No HLS manifest", { status: 404 });
    }

    const res = await noCacheFetch(manifestUrl, { headers: UPSTREAM_HEADERS });
    if (!res.ok) {
      return new NextResponse("Failed to fetch HLS manifest", {
        status: res.status,
      });
    }

    const body = rewriteHlsManifest(
      await res.text(),
      proxyOrigin,
      manifestUrl
    );

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: unknown) {
    console.error("HLS error:", error);
    return new NextResponse("HLS proxy failed", { status: 500 });
  }
}
