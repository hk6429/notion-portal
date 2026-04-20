import { NextResponse } from "next/server";
import { fetchChildren } from "@/lib/notion";

export const revalidate = 300;

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/page/[id]/children">
) {
  const { id } = await ctx.params;
  try {
    const blocks = await fetchChildren(id);
    const children = blocks
      .filter(
        (b: any) => b.type === "child_page" || b.type === "child_database"
      )
      .map((b: any) => ({
        id: b.id.replace(/-/g, ""),
        title:
          b.type === "child_page"
            ? b.child_page?.title || "未命名"
            : b.child_database?.title || "未命名資料庫",
        type: b.type === "child_page" ? "page" : "database",
      }));
    return NextResponse.json({ children });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
