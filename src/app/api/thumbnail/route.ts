import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v = searchParams.get("v");

  if (!v) {
    return new NextResponse("Missing video ID", { status: 400 });
  }

  try {
    const thumbnailUrl = `https://img.youtube.com/vi/${v}/maxresdefault.jpg`;
    const response = await fetch(thumbnailUrl);

    if (!response.ok) {
      // Fallback to hqdefault if maxresdefault doesn't exist
      const fallbackUrl = `https://img.youtube.com/vi/${v}/hqdefault.jpg`;
      const fallbackResponse = await fetch(fallbackUrl);
      
      if (!fallbackResponse.ok) {
        return new NextResponse("Thumbnail not found", { status: 404 });
      }

      return new NextResponse(fallbackResponse.body, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
        },
      });
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error: any) {
    return new NextResponse("Failed to fetch thumbnail", { status: 500 });
  }
}
