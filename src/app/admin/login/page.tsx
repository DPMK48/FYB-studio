"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Invalid password");
      }
      router.push("/admin");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <SiteNav />
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-10">
        <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#009444]">
            Restricted area
          </p>
          <h1 className="mt-1 font-display text-3xl">Admin Login</h1>
          <p className="mt-2 text-sm text-black/60">
            Enter the admin password to access the flyer library and manage
            activities.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full rounded-lg border-2 border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[#009444]"
              autoFocus
            />
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#009444] px-7 py-3 font-display text-sm uppercase tracking-wider text-white shadow-lg shadow-[#009444]/30 transition hover:bg-[#157a2c] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Enter Admin"}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}
