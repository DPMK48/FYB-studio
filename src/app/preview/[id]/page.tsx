import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import Flyer, { FLYER_HEIGHT, FLYER_WIDTH } from "@/components/Flyer";
import FlyerPreview from "@/components/FlyerPreview";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studentId = Number(id);
  if (!studentId) notFound();

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!student) notFound();

  const isPaid = student.paymentStatus === "paid";

  return (
    <div>
      <SiteNav />
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#009444]">
              {isPaid ? "Payment confirmed" : "Awaiting payment"}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl">
              Your Flyer Preview
            </h1>
            <p className="mt-2 text-sm text-black/60">
              {isPaid
                ? "Your flyer has been generated and sent to the admin library. The class admin will share the HD copy with you shortly."
                : "Complete payment to unlock your preview."}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/profile"
              className="rounded-full border-2 border-black px-5 py-2.5 font-display text-xs uppercase tracking-wider"
            >
              Make Another
            </Link>
            <Link
              href="/activities"
              className="rounded-full bg-[#009444] px-5 py-2.5 font-display text-xs uppercase tracking-wider text-white"
            >
              View Activities
            </Link>
          </div>
        </div>

        {isPaid ? (
          <div className="rounded-2xl border-4 border-[#009444]/30 bg-white p-2 shadow-2xl sm:p-4">
            <FlyerPreview data={student} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black px-5 py-4 text-white">
              <div>
                <div className="font-display text-lg">
                  🔒 Download disabled for students
                </div>
                <div className="text-xs text-white/70">
                  Only the FYB admin can download the HD flyer and share it
                  in the class goup.
                </div>
              </div>
              <div className="text-xs uppercase tracking-widest text-[#d3de2c]">
                Ref: {student.paymentReference?.slice(0, 18) || "—"}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-black/20 bg-white p-10 text-center">
            <h3 className="font-display text-2xl">Payment Required</h3>
            <p className="mt-2 text-black/60">
              Your profile draft exists but payment was not completed.
            </p>
            <Link
              href="/profile"
              className="mt-5 inline-block rounded-full bg-[#009444] px-7 py-3 font-display text-sm uppercase tracking-wider text-white"
            >
              Go to checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
