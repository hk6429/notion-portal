import { NextResponse } from "next/server";
import { computeGroups, getSidebarItem } from "@/lib/grouping";

export const revalidate = 300;

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/sidebar/[key]">
) {
  const { key } = await ctx.params;
  const item = getSidebarItem(key);
  if (!item || item.kind !== "grouped") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  try {
    const groups = await computeGroups(item);
    return NextResponse.json({ groups });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
