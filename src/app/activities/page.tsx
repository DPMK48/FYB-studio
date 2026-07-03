import SiteNav from "@/components/SiteNav";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { desc } from "drizzle-orm";
import Footer from "@/components/Footer";

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
          <div className="rounded-2xl border-2 border-dashed border-black/15 bg-white p-12 text-center">
            <div className="font-display text-2xl">No activities yet</div>
            <p className="mt-2 text-sm text-black/60">
              The admin hasn&apos;t added any activities. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {all.map((a) => (
              <div
                key={a.id}
                className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:border-[#009444]/50 hover:shadow-xl"
              >
                <div
                  className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#009444]/10 transition group-hover:scale-125"
                />
                <div className="relative">
                  <div className="mb-3 flex items-center justify-between">
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-black/50">
                      {a.date || "TBA"}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl leading-tight">
                    {a.title}
                  </h3>
                  {a.location && (
                    <div className="mt-1 text-xs text-black/60">
                      📍 {a.location}
                    </div>
                  )}
                  {a.description && (
                    <p className="mt-3 text-sm text-black/70">
                      {a.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    upcoming: "bg-[#009444]/15 text-[#157a2c] border-[#009444]/40",
    ongoing: "bg-[#d3de2c]/30 text-black border-[#d3de2c]",
    completed: "bg-black/5 text-black/60 border-black/15",
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        map[status] || map.upcoming
      }`}
    >
      {status}
    </span>
  );
}
