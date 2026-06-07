import { NextRequest, NextResponse } from "next/server";
import { incrementViewCount, getViewCount } from "@/lib/view-counts";

export const dynamic = "force-dynamic";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const count = await incrementViewCount(params.id);
  return NextResponse.json({ count });
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const count = await getViewCount(params.id);
  return NextResponse.json({ count });
}
