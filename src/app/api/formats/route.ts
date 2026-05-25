import { NextRequest, NextResponse } from "next/server";
import { getVideoQualities } from "@/lib/youtube";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v = searchParams.get("v");

  if (!v) {
    return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
  }

  try {
    const qualities = await getVideoQualities(v);
    return NextResponse.json({ qualities });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch qualities", details: message },
      { status: 500 }
    );
  }
}
