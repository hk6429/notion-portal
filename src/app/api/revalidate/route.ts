import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));

  if (body?.verification_token) {
    console.log("[NOTION_WEBHOOK_VERIFICATION_TOKEN]", body.verification_token);
    return NextResponse.json({ verification_token: body.verification_token });
  }

  const headerToken = req.headers.get("x-webhook-secret");
  const querySecret = new URL(req.url).searchParams.get("secret");
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret || (headerToken !== secret && querySecret !== secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  revalidatePath("/", "layout");

  return NextResponse.json({
    revalidated: true,
    at: new Date().toISOString(),
    type: body?.type ?? "manual",
  });
}

export async function GET(req: Request) {
  const querySecret = new URL(req.url).searchParams.get("secret");
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || querySecret !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
