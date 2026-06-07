import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findSeriesWithEpisodes, updateSeries, deleteSeries } from "@/lib/series-store";

export const dynamic = "force-dynamic";

function isAdmin() {
  const pw = process.env.ADMIN_PASSWORD;
  return !!pw && cookies().get("admin_session")?.value === pw;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const data = await findSeriesWithEpisodes(params.id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { title?: string; description?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  try {
    const s = await updateSeries(params.id, body);
    revalidatePath("/library"); revalidatePath(`/series/${params.id}`);
    return NextResponse.json(s);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await deleteSeries(params.id);
    revalidatePath("/library"); revalidatePath("/admin");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
