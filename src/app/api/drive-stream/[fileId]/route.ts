import { NextRequest, NextResponse } from "next/server";
import { DRIVE_USER_AGENT, resolveDriveDownloadUrl } from "@/lib/drive-stream";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params;
  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return new NextResponse("Invalid file ID", { status: 400 });
  }

  try {
    const downloadUrl = await resolveDriveDownloadUrl(fileId);
    const range = req.headers.get("range");

    const upstream = await fetch(downloadUrl, {
      headers: {
        "User-Agent": DRIVE_USER_AGENT,
        ...(range ? { Range: range } : {}),
      },
      redirect: "follow",
    });

    if (!upstream.ok && upstream.status !== 206) {
      console.error("Drive upstream error:", upstream.status, fileId);
      return new NextResponse("Failed to fetch from Google Drive", {
        status: upstream.status === 403 ? 502 : upstream.status,
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": upstream.headers.get("content-type") ?? "video/mp4",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    };

    const contentLength = upstream.headers.get("content-length");
    const contentRange = upstream.headers.get("content-range");
    if (contentLength) headers["Content-Length"] = contentLength;
    if (contentRange) headers["Content-Range"] = contentRange;

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error("Drive stream error:", error);
    return new NextResponse("Stream failed", { status: 500 });
  }
}
