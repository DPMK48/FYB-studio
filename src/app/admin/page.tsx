import { redirect } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import { isAdmin } from "@/lib/adminAuth";
import { db } from "@/db";
import { students, activities, materialOrders } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const [allStudents, allActivities, allMaterialOrders] = await Promise.all([
    db.select({
      id: students.id,
      fullName: students.fullName,
      nickname: students.nickname,
      email: students.email,
      matricNumber: students.matricNumber,
      department: students.department,
      favoriteQuote: students.favoriteQuote,
      hobbies: students.hobbies,
      skillset: students.skillset,
      toughestSemester: students.toughestSemester,
      mostDifficultCourse: students.mostDifficultCourse,
      favoriteCourse: students.favoriteCourse,
      messageToFamily: students.messageToFamily,
      socialIg: students.socialIg,
      socialFb: students.socialFb,
      dateOfBirth: students.dateOfBirth,
      stateOfOrigin: students.stateOfOrigin,
      relationshipStatus: students.relationshipStatus,
      paymentStatus: students.paymentStatus,
      paymentReference: students.paymentReference,
      amountPaid: students.amountPaid,
      downloadedByAdmin: students.downloadedByAdmin,
      sharedWithStudent: students.sharedWithStudent,
      createdAt: students.createdAt,
      updatedAt: students.updatedAt,
      hasPhoto: sql<boolean>`CASE WHEN ${students.photoUrl} IS NOT NULL AND ${students.photoUrl} != '' THEN true ELSE false END`,
    }).from(students).orderBy(desc(students.createdAt)),
    db.select().from(activities).orderBy(desc(activities.createdAt)),
    db.select().from(materialOrders).orderBy(desc(materialOrders.createdAt)),
  ]);


  const paid = allStudents.filter((s) => s.paymentStatus === "paid");
  const downloaded = paid.filter((s) => s.downloadedByAdmin);
  const shared = paid.filter((s) => s.sharedWithStudent);

  return (
    <div>
      <SiteNav />
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#009444]">
              Admin
            </p>
            <h1 className="font-display text-4xl sm:text-5xl">
              FYB Control Room
            </h1>
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              formAction="/api/admin/logout"
              className="rounded-full border-2 border-black px-5 py-2 font-display text-xs uppercase tracking-wider"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Profiles" value={allStudents.length} />
          <StatCard label="Paid Flyers" value={paid.length} accent />
          <StatCard label="Downloaded" value={downloaded.length} />
          <StatCard label="Shared with Students" value={shared.length} />
        </div>

        <AdminDashboard
          initialStudents={allStudents}
          initialActivities={allActivities}
          initialMaterialOrders={allMaterialOrders}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-[#009444]/40 bg-[#009444]/10"
          : "border-black/10 bg-white"
      }`}
    >
      <div className="text-xs font-bold uppercase tracking-widest text-black/60">
        {label}
      </div>
      <div className="mt-1 font-display text-4xl">{value}</div>
    </div>
  );
}
