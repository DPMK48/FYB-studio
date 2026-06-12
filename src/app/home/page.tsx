import Link from "next/link";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { desc } from "drizzle-orm";
import MaterialsSection from "@/components/MaterialsSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const upcoming = await db
    .select()
    .from(activities)
    .orderBy(desc(activities.createdAt))
    .limit(4);

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-black/5">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -right-32 -top-20 h-96 w-96 rounded-full bg-[#009444]/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-[#d3de2c]/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#009444]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#009444]">
              <span className="h-2 w-2 rounded-full bg-[#009444]" />
              Beyond Binary • 25BITS Studio
            </span>
            <h1 className="font-display text-4xl leading-[0.95] text-black sm:text-4xl md:text-5xl lg:text-6xl"> 
              YOUR FYB
              <br />
              <span className="text-[#009444]">PROFILE</span>,
              <br />
              IMMORTALIZED.
            </h1>
            <p className="mt-6 max-w-md text-sm text-black/70 sm:text-base">
              Fill in your details, upload your best shot, and walk away with a
              custom &quot;Profile of the Day&quot; flyer designed for the
              25BITS family — Faculty of Computing, ATBU.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="rounded-full bg-[#009444] px-6 py-3 font-display text-xs uppercase tracking-wider text-white shadow-lg shadow-[#009444]/30 transition hover:bg-[#157a2c] sm:px-7 sm:py-3.5 sm:text-sm"
              >
                Create My Flyer — ₦400
              </Link>
              <Link
                href="/activities"
                className="rounded-full border-2 border-black px-6 py-3 font-display text-xs uppercase tracking-wider text-black transition hover:bg-black hover:text-white sm:px-7 sm:py-3.5 sm:text-sm"
              >
                FYB Activities
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4">
              <Stat n="25BITS" l="Class" />
              <Stat n="2025" l="FYB Year" />
              <Stat n="₦400" l="Per Flyer" />
            </div>
          </div>

          {/* Preview card */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-72 w-72 rotate-6 rounded-3xl bg-[#d3de2c]/20 blur-2xl" />
            </div>
            <div className="relative w-full max-w-sm rotate-6 transition-all duration-700 hover:rotate-3 animate-float-slow">
              <Image
                src="/Hometemplate.jpeg"
                alt="FYB Template Preview"
                width={400}
                height={600}
                className="rounded-2xl border-[6px] border-black shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-black/5 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-12 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#009444] sm:text-xs">
              In 3 simple steps
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-5xl">
              How It Works
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Step
              n="01"
              title="Fill Your Profile"
              body="Enter your name, nickname, hobbies, skillset, favourite quote, photo and more."
            />
            <Step
              n="02"
              title="Pay ₦400 via Paystack"
              body="Secure one-time payment. Instantly unlocks your custom flyer preview."
            />
            <Step
              n="03"
              title="Admin Sends Your Flyer"
              body="The class admin downloads your HD flyer and shares it in the group."
            />
          </div>
        </div>
      </section>

      {/* FYB MATERIALS */}
      <MaterialsSection />

      {/* ACTIVITIES PREVIEW */}
      <section className="bg-[#0c0c0c] py-20 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#d3de2c] sm:text-xs">
                What&apos;s next
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl">
                FYB Activities
              </h2>
            </div>
            <Link
              href="/activities"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition hover:bg-white/10"
            >
              See all →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
              No activities have been posted yet. Admin will list them soon.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {upcoming.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[#009444]/50"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-white/50">
                      {a.date || "TBA"}
                    </span>
                  </div>
                  <div className="font-display text-xl">{a.title}</div>
                  {a.location && (
                    <div className="mt-1 text-xs text-white/60">
                      📍 {a.location}
                    </div>
                  )}
                  {a.description && (
                    <p className="mt-3 line-clamp-3 text-sm text-white/70">
                      {a.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#f4f4ee] py-10">
        <div className="mx-auto max-w-7xl px-5 text-center text-sm text-black/60">
          © 2025 25BITS FYB Studio • Faculty of Computing, ATBU, Bauchi State.
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-xl text-black sm:text-2xl">{n}</div>
      <div className="text-[10px] uppercase tracking-widest text-black/50 sm:text-xs">
        {l}
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 transition hover:border-[#009444]/50 hover:shadow-lg sm:p-7">
      <div className="font-display text-4xl text-[#009444] sm:text-5xl">{n}</div>
      <div className="mt-3 font-display text-lg sm:text-xl">{title}</div>
      <p className="mt-2 text-sm text-black/70">{body}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    upcoming: "bg-[#009444]/20 text-[#7be898] border-[#009444]/40",
    ongoing: "bg-[#d3de2c]/15 text-[#d3de2c] border-[#d3de2c]/40",
    completed: "bg-white/10 text-white/60 border-white/20",
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
