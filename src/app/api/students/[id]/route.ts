import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const sid = Number(id);
  if (!sid) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const [row] = await db
    .select()
    .from(students)
    .where(eq(students.id, sid))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ student: row });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const sid = Number(id);
  if (!sid) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const body = (await req.json()) as Record<string, unknown>;
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.downloadedByAdmin === "boolean")
    update.downloadedByAdmin = body.downloadedByAdmin;
  if (typeof body.sharedWithStudent === "boolean")
    update.sharedWithStudent = body.sharedWithStudent;
  const [row] = await db
    .update(students)
    .set(update)
    .where(eq(students.id, sid))
    .returning();
  return NextResponse.json({ student: row });
}

