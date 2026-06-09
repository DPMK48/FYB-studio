import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("Webhook Error: PAYSTACK_SECRET_KEY is not configured.");
      return NextResponse.json({ error: "Secret key not configured" }, { status: 500 });
    }

    const bodyText = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      console.warn("Webhook Warning: Missing x-paystack-signature header.");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Verify signature to ensure the request came from Paystack
    const hash = crypto
      .createHmac("sha512", secret)
      .update(bodyText)
      .digest("hex");

    if (hash !== signature) {
      console.warn("Webhook Warning: Invalid signature verification failed.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);

    // Only process charge.success events
    if (payload.event === "charge.success") {
      const data = payload.data;
      const reference = data.reference;
      const amount = data.amount / 100; // Paystack sends amount in kobo

      // Retrieve student ID from metadata
      let studentId = data.metadata?.studentId || data.metadata?.student_id;

      // Robust fallback: Extract student ID from reference (format: fyb_{timestamp}_{studentId})
      if (!studentId && reference) {
        const parts = reference.split("_");
        const lastPart = parts[parts.length - 1];
        const parsedId = Number(lastPart);
        if (!isNaN(parsedId) && parsedId > 0) {
          studentId = parsedId;
        }
      }

      if (!studentId) {
        console.warn(`Webhook Warning: Could not resolve studentId for reference: ${reference}`);
        return NextResponse.json({ error: "Could not resolve student" }, { status: 400 });
      }

      // Check if student exists first
      const studentRows = await db
        .select()
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);

      if (studentRows.length === 0) {
        console.warn(`Webhook Warning: Student with ID ${studentId} not found in database.`);
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }

      // Update the payment status in database
      await db
        .update(students)
        .set({
          paymentStatus: "paid",
          paymentReference: reference,
          amountPaid: amount,
          updatedAt: new Date(),
        })
        .where(eq(students.id, studentId));

      console.log(`Webhook Success: Payment verified and updated for Student ID: ${studentId}, Ref: ${reference}`);
    }

    return NextResponse.json({ status: "success" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Webhook exception occurred:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
