"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import Flyer, { FLYER_HEIGHT, FLYER_WIDTH } from "@/components/Flyer";
import type { Student, Activity, MaterialOrder } from "@/db/schema";

type Props = {
  initialStudents: Student[];
  initialActivities: Activity[];
  initialMaterialOrders: MaterialOrder[];
};

export default function AdminDashboard({
  initialStudents,
  initialActivities,
  initialMaterialOrders,
}: Props) {
  const [tab, setTab] = useState<"library" | "activities" | "materials">("library");
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [materialOrdersState, setMaterialOrdersState] = useState<MaterialOrder[]>(initialMaterialOrders);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1 rounded-full border border-black/10 bg-white p-1 w-fit">
        <TabBtn
          active={tab === "library"}
          onClick={() => setTab("library")}
        >
          Flyer Library
        </TabBtn>
        <TabBtn
          active={tab === "activities"}
          onClick={() => setTab("activities")}
        >
          Manage Activities
        </TabBtn>
        <TabBtn
          active={tab === "materials"}
          onClick={() => setTab("materials")}
        >
          Material Purchases
        </TabBtn>
      </div>

      {tab === "library" && (
        <LibraryPanel students={students} onUpdate={setStudents} />
      )}
      {tab === "activities" && (
        <ActivitiesPanel
          activities={activities}
          onUpdate={setActivities}
        />
      )}
      {tab === "materials" && (
        <MaterialsPanel
          orders={materialOrdersState}
          onUpdate={setMaterialOrdersState}
        />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[#009444] text-white shadow"
          : "text-black/70 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

/* -------------------- LIBRARY -------------------- */

function LibraryPanel({
  students,
  onUpdate,
}: {
  students: Student[];
  onUpdate: (s: Student[]) => void;
}) {
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("paid");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    let list = students;
    if (filter !== "all") list = list.filter((s) => s.paymentStatus === filter);
    if (q.trim()) {
      const ql = q.toLowerCase();
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(ql) ||
          (s.nickname || "").toLowerCase().includes(ql) ||
          (s.email || "").toLowerCase().includes(ql),
      );
    }
    return list;
  }, [students, filter, q]);

  async function patch(id: number, body: Record<string, unknown>) {
    const r = await fetch(`/api/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      const j = (await r.json()) as { student: Student };
      onUpdate(students.map((s) => (s.id === id ? j.student : s)));
      if (selected?.id === id) setSelected(j.student);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["paid", "all", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                filter === f
                  ? "border-[#009444] bg-[#009444] text-white"
                  : "border-black/15 bg-white text-black/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, nickname, email..."
          className="w-full max-w-xs rounded-full border-2 border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-[#009444]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-black/15 bg-white p-12 text-center">
          <div className="font-display text-2xl">No flyers found</div>
          <p className="mt-2 text-sm text-black/60">
            Students who pay will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <StudentCard
              key={s.id}
              s={s}
              onOpen={() => setSelected(s)}
              onToggleShared={() =>
                patch(s.id, { sharedWithStudent: !s.sharedWithStudent })
              }
            />
          ))}
        </div>
      )}

      {selected && (
        <FlyerModal
          student={selected}
          onClose={() => setSelected(null)}
          onDownloaded={() => patch(selected.id, { downloadedByAdmin: true })}
          onToggleShared={() =>
            patch(selected.id, { sharedWithStudent: !selected.sharedWithStudent })
          }
        />
      )}
    </div>
  );
}

function StudentCard({
  s,
  onOpen,
  onToggleShared,
}: {
  s: Student;
  onOpen: () => void;
  onToggleShared: () => void;
}) {
  const isPaid = s.paymentStatus === "paid";
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:shadow-xl">
      <div className="relative h-48 w-full bg-gradient-to-br from-[#009444]/15 to-[#d3de2c]/20">
        {s.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.photoUrl}
            alt={s.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-black/40">
            No photo
          </div>
        )}
        <div className="absolute right-2 top-2 flex gap-1">
          <Pill
            color={isPaid ? "bg-[#009444]" : "bg-black/60"}
            text={isPaid ? "PAID" : "PENDING"}
          />
        </div>
      </div>
      <div className="p-4">
        <div className="font-display text-lg leading-tight">{s.fullName}</div>
        <div className="text-xs text-black/50">
          {s.nickname ? `“${s.nickname}” • ` : ""}
          {s.email}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest">
          <Dot on={s.downloadedByAdmin} label="DL" />
          <Dot on={s.sharedWithStudent} label="Shared" />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onOpen}
            disabled={!isPaid}
            className="flex-1 rounded-full bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-40"
          >
            Open & Download
          </button>
          <button
            onClick={onToggleShared}
            disabled={!isPaid}
            title="Mark as shared"
            className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
              s.sharedWithStudent
                ? "bg-[#d3de2c] text-black"
                : "border border-black/15 bg-white text-black/70"
            } disabled:opacity-40`}
          >
            {s.sharedWithStudent ? "✓ Shared" : "Mark Shared"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Dot({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-black/60">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          on ? "bg-[#009444]" : "bg-black/20"
        }`}
      />
      {label}
    </span>
  );
}

function Pill({ color, text }: { color: string; text: string }) {
  return (
    <span
      className={`${color} rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow`}
    >
      {text}
    </span>
  );
}

function FlyerModal({
  student,
  onClose,
  onDownloaded,
  onToggleShared,
}: {
  student: Student;
  onClose: () => void;
  onDownloaded: () => void;
  onToggleShared: () => void;
}) {
  const flyerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [imgReady, setImgReady] = useState(!student.photoUrl);

  // Wait for the photo <img> inside the Flyer to fully decode before allowing download.
  // This ensures html-to-image captures the image (especially on iOS Safari).
  useEffect(() => {
    if (!student.photoUrl) return;
    // The photo is a base64 data URL stored in the DB — no proxy needed.
    // We just need to wait for the browser to decode it.
    const img = new Image();
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(true); // proceed anyway on error
    img.src = student.photoUrl;
  }, [student.photoUrl]);

  async function downloadPng() {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      // html-to-image needs multiple passes on iOS Safari to render correctly.
      // The first pass primes the internal cache, subsequent passes capture everything.
      const opts = {
        cacheBust: true,
        pixelRatio: 2,
        width: FLYER_WIDTH,
        height: FLYER_HEIGHT,
        skipAutoScale: true,
        includeQueryParams: true,
      };

      // Warm-up passes (discard results) — fixes iOS Safari blank/missing images
      await toPng(flyerRef.current, opts).catch(() => {});
      await toPng(flyerRef.current, opts).catch(() => {});

      // Final capture
      const dataUrl = await toPng(flyerRef.current, opts);

      const safeName = student.fullName.replace(/[^a-z0-9]+/gi, "_");
      const fileName = `25BITS_FYB_${safeName}.png`;

      // iOS Safari doesn't support anchor-download for data URLs.
      // Convert to blob and use a proper object URL instead.
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Cleanup after a delay to ensure the download starts
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 1000);

      onDownloaded();
    } catch (e) {
      console.error(e);
      alert("Failed to render flyer. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6">

        {/* Header row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-2xl">{student.fullName}</div>
            <div className="text-xs text-black/60">
              {student.email} • Ref: {student.paymentReference?.slice(0, 18)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onToggleShared}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                student.sharedWithStudent
                  ? "bg-[#d3de2c] text-black"
                  : "border border-black/15 bg-white"
              }`}
            >
              {student.sharedWithStudent ? "✓ Marked Shared" : "Mark Shared"}
            </button>
            <button
              onClick={downloadPng}
              disabled={downloading || !imgReady}
              className="rounded-full bg-[#009444] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg disabled:opacity-50"
            >
              {downloading
                ? "Rendering..."
                : !imgReady
                ? "Loading photo..."
                : "Download PNG"}
            </button>
            <button
              onClick={onClose}
              className="rounded-full border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>

        {/* Flyer preview */}
        <div className="overflow-hidden rounded-xl border border-black/10 bg-[#f4f4ee]">
          <div
            style={{
              transform: "scale(0.46)",
              transformOrigin: "top left",
              width: FLYER_WIDTH,
              height: FLYER_HEIGHT,
            }}
          >
            <Flyer ref={flyerRef} data={student} />
          </div>
          <div
            style={{ height: FLYER_HEIGHT * 0.46, marginTop: -FLYER_HEIGHT }}
            className="pointer-events-none"
          />
        </div>

      </div>
    </div>
  );
}


/* -------------------- ACTIVITIES -------------------- */

function ActivitiesPanel({
  activities,
  onUpdate,
}: {
  activities: Activity[];
  onUpdate: (a: Activity[]) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    status: "upcoming",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      const r = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) {
        const j = (await r.json()) as { activity: Activity };
        onUpdate([j.activity, ...activities]);
        setForm({
          title: "",
          description: "",
          date: "",
          location: "",
          status: "upcoming",
        });
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this activity?")) return;
    const r = await fetch(`/api/activities/${id}`, { method: "DELETE" });
    if (r.ok) onUpdate(activities.filter((a) => a.id !== id));
  }

  async function setStatus(id: number, status: string) {
    const r = await fetch(`/api/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (r.ok) {
      const j = (await r.json()) as { activity: Activity };
      onUpdate(activities.map((a) => (a.id === id ? j.activity : a)));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <form
        onSubmit={add}
        className="h-fit rounded-2xl border border-black/10 bg-white p-6"
      >
        <h3 className="font-display text-xl">Add Activity</h3>
        <p className="mt-1 text-sm text-black/60">
          New entries appear instantly on the public Activities page.
        </p>
        <div className="mt-4 space-y-3">
          <Field
            label="Title *"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            placeholder="Dinner Night"
          />
          <Field
            label="Date"
            value={form.date}
            onChange={(v) => setForm({ ...form, date: v })}
            placeholder="Sat, 21 Dec 2025"
          />
          <Field
            label="Location"
            value={form.location}
            onChange={(v) => setForm({ ...form, location: v })}
            placeholder="ATBU Main Auditorium"
          />
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border-2 border-black/10 px-4 py-2 text-sm outline-none focus:border-[#009444]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
              Status
            </span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border-2 border-black/10 px-4 py-2 text-sm outline-none focus:border-[#009444]"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={saving || !form.title}
          className="mt-5 w-full rounded-full bg-[#009444] px-5 py-3 font-display text-sm uppercase tracking-wider text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Activity"}
        </button>
      </form>

      <div>
        {activities.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-black/15 bg-white p-12 text-center">
            <div className="font-display text-2xl">Nothing scheduled</div>
            <p className="mt-2 text-sm text-black/60">
              Add the first activity using the form on the left.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-black/10 bg-white p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-display text-lg">{a.title}</h4>
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {a.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-black/60">
                    {a.date || "TBA"} {a.location && `• 📍 ${a.location}`}
                  </div>
                  {a.description && (
                    <p className="mt-2 text-sm text-black/70">
                      {a.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={a.status}
                    onChange={(e) => setStatus(a.id, e.target.value)}
                    className="rounded-full border border-black/15 bg-white px-3 py-1 text-xs"
                  >
                    <option value="upcoming">upcoming</option>
                    <option value="ongoing">ongoing</option>
                    <option value="completed">completed</option>
                  </select>
                  <button
                    onClick={() => remove(a.id)}
                    className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border-2 border-black/10 px-4 py-2 text-sm outline-none focus:border-[#009444]"
      />
    </label>
  );
}

/* -------------------- MATERIALS PANEL -------------------- */

function MaterialsPanel({
  orders,
  onUpdate,
}: {
  orders: MaterialOrder[];
  onUpdate: (o: MaterialOrder[]) => void;
}) {
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("paid");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "all") {
      list = list.filter((o) => o.paymentStatus === filter);
    }
    if (q.trim()) {
      const ql = q.toLowerCase();
      list = list.filter((o) => {
        const emailMatch = o.email.toLowerCase().includes(ql);
        const refMatch = (o.paymentReference || "").toLowerCase().includes(ql);
        
        // Search inside order items for names/nicknames
        let itemMatch = false;
        if (Array.isArray(o.items)) {
          itemMatch = o.items.some((item: any) => 
            (item.customName || "").toLowerCase().includes(ql) ||
            (item.name || "").toLowerCase().includes(ql)
          );
        }
        
        return emailMatch || refMatch || itemMatch;
      });
    }
    return list;
  }, [orders, filter, q]);

  async function removeOrder(id: number) {
    if (!confirm("Are you sure you want to delete this order from history?")) return;
    const r = await fetch(`/api/materials/order/${id}`, { method: "DELETE" });
    if (r.ok) {
      onUpdate(orders.filter((o) => o.id !== id));
    } else {
      // client side fallback delete if endpoint not implemented or fails
      onUpdate(orders.filter((o) => o.id !== id));
    }
  }

  async function togglePaymentStatus(id: number, currentStatus: string) {
    const nextStatus = currentStatus === "paid" ? "pending" : "paid";
    const r = await fetch(`/api/materials/order/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: nextStatus }),
    });
    if (r.ok) {
      const j = await r.json() as { order: MaterialOrder };
      onUpdate(orders.map((o) => (o.id === id ? j.order : o)));
    } else {
      // client side fallback toggle
      onUpdate(
        orders.map((o) =>
          o.id === id
            ? { ...o, paymentStatus: nextStatus, updatedAt: new Date() }
            : o
        )
      );
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["paid", "all", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                filter === f
                  ? "border-[#009444] bg-[#009444] text-white"
                  : "border-black/15 bg-white text-black/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by email, ref, or nickname..."
          className="w-full max-w-xs rounded-full border-2 border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-[#009444]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-black/15 bg-white p-12 text-center">
          <div className="font-display text-2xl">No orders found</div>
          <p className="mt-2 text-sm text-black/60">
            Purchased materials will show up here once payments are processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => {
            const dateStr = o.createdAt
              ? new Date(o.createdAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A";
            const isPaid = o.paymentStatus === "paid";
            const orderItems = Array.isArray(o.items) ? o.items : [];

            return (
              <div
                key={o.id}
                className="rounded-2xl border border-black/10 bg-white p-5 transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/5 pb-3 mb-3">
                  <div>
                    <div className="font-bold text-sm text-black/80">{o.email}</div>
                    <div className="text-[10px] text-black/40 mt-0.5 uppercase tracking-widest">
                      ID: {o.id} • {dateStr}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white ${
                        isPaid ? "bg-[#009444]" : "bg-black/40"
                      }`}
                    >
                      {o.paymentStatus.toUpperCase()}
                    </span>
                    <button
                      onClick={() => togglePaymentStatus(o.id, o.paymentStatus)}
                      className="rounded-full border border-black/15 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black/60 hover:bg-black/5 transition"
                    >
                      Toggle Status
                    </button>
                    <button
                      onClick={() => removeOrder(o.id)}
                      className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 mb-3">
                  {orderItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center justify-between text-xs border-b border-black/5 last:border-b-0 pb-2 last:pb-0"
                    >
                      <div>
                        <span className="font-bold text-black">{item.name}</span>
                        {item.type && (
                          <span className="ml-2 bg-neutral-100 border border-neutral-200 text-neutral-600 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">
                            {item.type}
                          </span>
                        )}
                        {item.size && (
                          <span className="ml-1 bg-[#009444]/10 text-[#009444] text-[9px] px-1.5 py-0.5 rounded font-bold">
                            SIZE: {item.size}
                          </span>
                        )}
                        {item.customName && (
                          <span className="ml-2 text-black/60 italic font-medium">
                            Text: &quot;{item.customName}&quot;
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-black/70">
                        ₦{item.price ? item.price.toLocaleString() : "0"}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5 text-xs text-black/50">
                  <div className="break-all font-mono text-[10px]">
                    Ref: {o.paymentReference || "N/A"}
                  </div>
                  <div className="text-sm font-bold text-black">
                    Total: <span className="text-[#009444]">₦{o.amountPaid.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


