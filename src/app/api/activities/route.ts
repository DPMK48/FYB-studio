import { NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { isAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const [row] = await db
    .insert(activities)
    .values({
      title: String(body.title),
      description: body.description || null,
      date: body.date || null,
      location: body.location || null,
      status: body.status || "upcoming",
      imageUrl: body.imageUrl || null,
      price: body.price !== undefined ? Number(body.price) : 0,
    })
    .returning();
  return NextResponse.json({ activity: row });
}
