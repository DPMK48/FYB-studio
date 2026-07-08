import { NextResponse } from "next/server";
import { db } from "@/db";
import { ticketOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = Number(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await db.delete(ticketOrders).where(eq(ticketOrders.id, orderId));
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = Number(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = (await req.json()) as { paymentStatus?: string };
    if (!body.paymentStatus) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const [updated] = await db
      .update(ticketOrders)
      .set({
        paymentStatus: body.paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(ticketOrders.id, orderId))
      .returning();

    return NextResponse.json({ order: updated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
