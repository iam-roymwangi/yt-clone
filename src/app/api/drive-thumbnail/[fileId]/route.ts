import { NextRequest, NextResponse } from "next/server";
import { DRIVE_USER_AGENT } from "@/lib/drive-stream";
import { driveThumbnailUrl } from "@/lib/google-drive";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params;
  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return new NextResponse("Invalid file ID", { status: 400 });
  }

  const candidates = [
    driveThumbnailUrl(fileId, 640),
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
    `https://lh3.googleusercontent.com/d/${fileId}=w400-h300`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": DRIVE_USER_AGENT },
        redirect: "follow",
      });

      const type = res.headers.get("content-type") ?? "";
      if (
        res.ok &&
        type.startsWith("image/") &&
        res.body &&
        (res.headers.get("content-length") === null ||
          Number(res.headers.get("content-length")) > 1000)
      ) {
        return new NextResponse(res.body, {
          status: 200,
          headers: {
            "Content-Type": type,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    } catch {
      continue;
    }
  }

  return new NextResponse("Thumbnail not found", { status: 404 });
}
