import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    amount: number;
    currency: string;
    reference: string;
  };
};

export async function POST(req: Request) {
  try {
    const { studentId, reference, amount } = (await req.json()) as {
      studentId: number;
      reference: string;
      amount: number;
    };
    if (!studentId || !reference) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    let verified = false;

    if (secret && !reference.startsWith("demo_")) {
      // Real verification with Paystack
      const r = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${secret}`,
          },
        },
      );
      const j = (await r.json()) as PaystackVerifyResponse;
      verified =
        Boolean(j.status) &&
        j.data?.status === "success" &&
        j.data?.amount === amount * 100;
      if (!verified) {
        return NextResponse.json(
          { error: "Payment not verified", details: j.message },
          { status: 400 },
        );
      }
    } else {
      // Demo / no-secret mode: trust the client reference for testing.
      verified = true;
    }

    await db
      .update(students)
      .set({
        paymentStatus: "paid",
        paymentReference: reference,
        amountPaid: amount,
        updatedAt: new Date(),
      })
      .where(eq(students.id, studentId));

    return NextResponse.json({ ok: true, verified });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
