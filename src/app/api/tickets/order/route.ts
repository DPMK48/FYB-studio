import { NextResponse } from "next/server";
import { db } from "@/db";
import { ticketOrders } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, activityId, amountPaid } = (await req.json()) as {
      email: string;
      activityId: number;
      amountPaid: number;
    };

    if (!email || !activityId || !amountPaid) {
      return NextResponse.json(
        { error: "Email, activityId, and total amount are required." },
        { status: 400 },
      );
    }

    // Insert pending ticket order in the database
    const [row] = await db
      .insert(ticketOrders)
      .values({
        email: String(email).trim().toLowerCase(),
        activityId,
        amountPaid,
        paymentStatus: "pending",
      })
      .returning({ id: ticketOrders.id });

    return NextResponse.json({ id: row.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
