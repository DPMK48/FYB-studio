import { NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const aid = Number(id);
  const body = (await req.json()) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (typeof body.title === "string") update.title = body.title;
  if (typeof body.description === "string") update.description = body.description;
  if (typeof body.date === "string") update.date = body.date;
  if (typeof body.location === "string") update.location = body.location;
  if (typeof body.status === "string") update.status = body.status;
  const [row] = await db
    .update(activities)
    .set(update)
    .where(eq(activities.id, aid))
    .returning();
  return NextResponse.json({ activity: row });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const aid = Number(id);
  await db.delete(activities).where(eq(activities.id, aid));
  return NextResponse.json({ ok: true });
}
