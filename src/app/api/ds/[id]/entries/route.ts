import { NextResponse } from "next/server";
import { queryDataSource, extractEntryTitle } from "@/lib/notion";

export const revalidate = 300;

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/ds/[id]/entries">
) {
  const { id } = await ctx.params;
  try {
    const entries = await queryDataSource(id);
    const data = entries.map((entry: any) => ({
      id: entry.id.replace(/-/g, ""),
      title: extractEntryTitle(entry),
      icon: entry.icon?.emoji,
    }));
    return NextResponse.json({ entries: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
