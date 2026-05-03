import { NextRequest, NextResponse } from "next/server";
import { videoInfo } from "youtube-ext";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v = searchParams.get("v");

  if (!v) {
    return new NextResponse("Missing video ID", { status: 400 });
  }

  try {
    const range = req.headers.get("range");

    const info = await videoInfo(v);
    
    // Find highest quality with both audio and video, fallback to video-only
    let format = info.stream?.formats?.find(f => f.hasVideo && f.hasAudio);
    if (!format) {
      // Find the best combined format, usually 360p or 720p if available
      // youtube-ext might not correctly label hasAudio sometimes, try to find a standard mp4
      format = info.stream?.formats?.find(f => f.mimeType?.includes('video/mp4') && f.audioQuality);
    }
    if (!format) {
      // Fallback to highest quality video
      format = info.stream?.formats?.find(f => f.hasVideo);
    }

    if (!format || !format.url) {
      return new NextResponse("No suitable format found", { status: 404 });
    }

    const headers: Record<string, string> = {
      "Content-Type": format.mimeType?.split(';')[0] || "video/mp4",
      "Accept-Ranges": "bytes",
    };

    const fetchHeaders: any = {};
    if (range) {
      fetchHeaders.Range = range;
    }

    // Proxy the stream using native fetch
    const response = await fetch(format.url, { headers: fetchHeaders });
    
    // Pass along necessary response headers
    if (response.headers.get("content-length")) {
      headers["Content-Length"] = response.headers.get("content-length")!;
    }
    if (response.headers.get("content-range")) {
      headers["Content-Range"] = response.headers.get("content-range")!;
    }

    return new NextResponse(response.body, { 
      status: response.status,
      headers 
    });
  } catch (error: any) {
    console.error("Stream error:", error);
    return new NextResponse("Stream proxy failed", { status: 500 });
  }
}

