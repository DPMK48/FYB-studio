import SiteNav from "@/components/SiteNav";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { desc } from "drizzle-orm";
import Footer from "@/components/Footer";
import ActivityCardClient from "@/components/ActivityCardClient";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const all = await db
    .select()
    .from(activities)
    .orderBy(desc(activities.createdAt));

  return (
    <div>
      <SiteNav />
      <section className="relative overflow-hidden border-b border-black/5 bg-[#0c0c0c] py-16 text-white">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#d3de2c]">
            What&apos;s on the calendar
          </p>
          <h1 className="mt-2 font-display text-5xl sm:text-6xl">
            FYB <span className="text-[#009444]">Activities</span>
          </h1>
          <p className="mt-3 max-w-xl text-white/70">
            All official events and milestones for the 25BITS Class of 2025 —
            curated by your FYB coordinators.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        {all.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-black/15 bg-white p-12 text-center text-black">
            <div className="font-display text-2xl">No activities yet</div>
            <p className="mt-2 text-sm text-black/60">
              The admin hasn&apos;t added any activities. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {all.map((a) => (
              <ActivityCardClient key={a.id} activity={a} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
