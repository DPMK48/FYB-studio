import { NextResponse } from "next/server";
import { db } from "@/db";
import { materialOrders } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, items, amountPaid } = (await req.json()) as {
      email: string;
      items: any[];
      amountPaid: number;
    };

    if (!email || !items || items.length === 0 || !amountPaid) {
      return NextResponse.json(
        { error: "Email, items, and total amount are required." },
        { status: 400 },
      );
    }

    // Insert pending order in the database
    const [row] = await db
      .insert(materialOrders)
      .values({
        email: String(email).trim(),
        items,
        amountPaid,
        paymentStatus: "pending",
      })
      .returning({ id: materialOrders.id });

    return NextResponse.json({ id: row.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
