import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createSeries, listSeries } from "@/lib/series-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const series = await listSeries();
  return NextResponse.json(series);
}

export async function POST(req: NextRequest) {
  let body: { title?: string; description?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 400 });

  try {
    const series = await createSeries({ title: body.title, description: body.description });
    revalidatePath("/library");
    revalidatePath("/series");
    return NextResponse.json(series, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
