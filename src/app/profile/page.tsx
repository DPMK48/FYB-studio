"use client";

import { useMemo, useRef, useState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import Flyer, { FLYER_HEIGHT, FLYER_WIDTH, type FlyerData } from "@/components/Flyer";

type FormState = FlyerData & {
  email: string;
  matricNumber: string;
};

// Paystack inline JS types (loose)
declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

const AMOUNT_NAIRA = 400;

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    nickname: "",
    email: "",
    matricNumber: "",
    photoUrl: "",
    favoriteQuote: "",
    hobbies: "",
    skillset: "",
    toughestSemester: "",
    mostDifficultCourse: "",
    favoriteCourse: "",
    messageToFamily: "",
    socialIg: "",
    socialFb: "",
    dateOfBirth: "",
    stateOfOrigin: "",
    relationshipStatus: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
  const demoMode = !publicKey;

  const onPhoto = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm((f) => ({ ...f, photoUrl: (e.target?.result as string) || "" }));
    };
    reader.readAsDataURL(file);
  };

  const canProceed = useMemo(() => {
    return Boolean(
      (form.fullName ?? "").trim() &&
        form.email.trim() &&
        form.photoUrl &&
        form.favoriteQuote &&
        form.nickname,
    );
  }, [form]);

  async function createDraft(): Promise<number | null> {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to save profile");
      }
      const j = await res.json();
      return j.id as number;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      setError(msg);
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyAndRedirect(id: number, reference: string) {
    setPaying(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: id, reference, amount: AMOUNT_NAIRA }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Payment verification failed");
      }
      router.push(`/preview/${id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Verification failed";
      setError(msg);
      setPaying(false);
    }
  }

  async function handlePay() {
    if (!canProceed) {
      setError("Please fill the required fields (with *)");
      return;
    }
    const id = await createDraft();
    if (!id) return;

    if (demoMode) {
      // Simulated payment for demo when no key is configured.
      const reference = `demo_${Date.now()}_${id}`;
      await verifyAndRedirect(id, reference);
      return;
    }
    if (!window.PaystackPop) {
      setError("Payment SDK still loading. Try again in a moment.");
      return;
    }
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: form.email,
      amount: AMOUNT_NAIRA * 100, // kobo
      currency: "NGN",
      ref: `fyb_${Date.now()}_${id}`,
      metadata: { studentId: id, fullName: form.fullName },
      callback: (response) => {
        // Paystack callback fires outside React, kick off async work
        void verifyAndRedirect(id, response.reference);
      },
      onClose: () => {
        setPaying(false);
      },
    });
    setPaying(true);
    handler.openIframe();
  }

  return (
    <div >
      <SiteNav />
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#009444]">
            Step {step} of 2
          </p>
          <h1 className="font-display text-4xl sm:text-5xl">
            {step === 1 ? "Build Your FYB Profile" : "Confirm & Pay ₦400"}
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_480px]">
          {/* FORM */}
          <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
            {step === 1 ? (
              <>
                <Section title="Identity">
                  <Row>
                    <Input
                      label="Full Name *"
                      value={form.fullName || ""}
                      onChange={(v) => setForm({ ...form, fullName: v })}
                      placeholder="Sadiq Abubakar"
                    />
                    <Input
                      label="Nickname *"
                      value={form.nickname || ""}
                      onChange={(v) => setForm({ ...form, nickname: v })}
                      placeholder="ABS"
                    />
                  </Row>
                  <Row>
                    <Input
                      label="Email *"
                      type="email"
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                      placeholder="you@example.com"
                    />
                    <Input
                      label="Matric Number"
                      value={form.matricNumber}
                      onChange={(v) => setForm({ ...form, matricNumber: v })}
                      placeholder="12345678"
                    />
                  </Row>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-black/70">
                      Profile Photo *
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="rounded-lg border-2 border-dashed border-black/30 px-5 py-3 text-sm font-semibold transition hover:border-[#009444] hover:bg-[#009444]/5"
                      >
                        {form.photoUrl ? "Change Photo" : "Upload Photo"}
                      </button>
                      {form.photoUrl && (
                        <img
                          src={form.photoUrl}
                          alt="preview"
                          className="h-16 w-16 rounded-lg border-2 border-[#] object-cover"
                        />
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          onPhoto(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </div>
                </Section>

                <Section title="Personal">
                  <Row>
                    <Input
                      label="Date of Birth"
                      value={form.dateOfBirth || ""}
                      onChange={(v) => setForm({ ...form, dateOfBirth: v })}
                      placeholder="1st Jan"
                    />
                    <Input
                      label="State of Origin"
                      value={form.stateOfOrigin || ""}
                      onChange={(v) => setForm({ ...form, stateOfOrigin: v })}
                      placeholder="Plateau"
                    />
                  </Row>
                  <Input
                    label="Relationship Status"
                    value={form.relationshipStatus || ""}
                    onChange={(v) =>
                      setForm({ ...form, relationshipStatus: v })
                    }
                    placeholder="Single / Taken / Happily married with 3 kids"
                  />
                </Section>

                <Section title="Quote & Story">
                  <Textarea
                    label="Favorite Quote *"
                    value={form.favoriteQuote || ""}
                    onChange={(v) => setForm({ ...form, favoriteQuote: v })}
                    placeholder="Do you."
                  />
                  <Row>
                    <Input
                      label="Hobbies"
                      value={form.hobbies || ""}
                      onChange={(v) => setForm({ ...form, hobbies: v })}
                      placeholder="Designing, Reading"
                    />
                    <Input
                      label="Skillset"
                      value={form.skillset || ""}
                      onChange={(v) => setForm({ ...form, skillset: v })}
                      placeholder="Reading, Coding, Traveling, Designing, Cooking"
                    />
                  </Row>
                </Section>

                <Section title="Academic">
                  <Row>
                    <Input
                      label="Toughest Semester"
                      value={form.toughestSemester || ""}
                      onChange={(v) =>
                        setForm({ ...form, toughestSemester: v })
                      }
                      placeholder="1st Sem. 300 Level"
                    />
                    <Input
                      label="Most Difficult Course"
                      value={form.mostDifficultCourse || ""}
                      onChange={(v) =>
                        setForm({ ...form, mostDifficultCourse: v })
                      }
                      placeholder="EE 413"
                    />
                  </Row>
                  <Input
                    label="Favorite Course"
                    value={form.favoriteCourse || ""}
                    onChange={(v) => setForm({ ...form, favoriteCourse: v })}
                    placeholder="CS 111"
                  />
                </Section>

                <Section title="Message & Socials">
                  <Textarea
                    label="Message to the 25BITS Family"
                    value={form.messageToFamily || ""}
                    onChange={(v) => setForm({ ...form, messageToFamily: v })}
                    placeholder="Don't Give Up! The Journey is the Reward."
                  />
                  <Row>
                    <Input
                      label="IG / X / TikTok handle"
                      value={form.socialIg || ""}
                      onChange={(v) => setForm({ ...form, socialIg: v })}
                      placeholder="Sadiq_"
                    />
                    <Input
                      label="Facebook / LinkedIn"
                      value={form.socialFb || ""}
                      onChange={(v) => setForm({ ...form, socialFb: v })}
                      placeholder="Sadiq Abubakar"
                    />
                  </Row>
                </Section>

                {error && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      if (!canProceed) {
                        setError(
                          "Please complete required fields: name, nickname, email, photo, favorite quote.",
                        );
                        return;
                      }
                      setError(null);
                      setStep(2);
                    }}
                    className="rounded-full bg-[#009444] px-7 py-3 font-display text-sm uppercase tracking-wider text-white shadow-lg shadow-[#009444]/30 transition hover:bg-[#157a2c]"
                  >
                    Continue → Review
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div className="rounded-xl border border-black/10 bg-[#f4f4ee] p-5">
                  <h3 className="font-display text-xl">Review your details</h3>
                  <p className="mt-1 text-sm text-black/60">
                    The flyer preview on the right reflects exactly what will
                    be generated.
                  </p>
                </div>

                <div className="mt-5 rounded-xl border border-[#009444]/30 bg-[#009444]/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-[#009444]">
                        Amount Due
                      </div>
                      <div className="font-display text-3xl text-black">
                        ₦{AMOUNT_NAIRA.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right text-xs text-black/60">
                      <div>Secure payment via</div>
                      <div className="font-display text-base text-black">
                        Paystack
                      </div>
                    </div>
                  </div>
                  {demoMode && (
                    <div className="mt-4 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-900">
                      <strong>Demo mode:</strong> No{" "}
                      <code>NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</code> set. Payment
                      will be simulated for testing.
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex justify-between gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="rounded-full border-2 border-black px-6 py-3 font-display text-sm uppercase tracking-wider"
                  >
                    ← Edit
                  </button>
                  <button
                    onClick={handlePay}
                    disabled={paying || submitting}
                    className="rounded-full bg-[#009444] px-7 py-3 font-display text-sm uppercase tracking-wider text-white shadow-lg shadow-[#009444]/30 transition hover:bg-[#157a2c] disabled:opacity-50"
                  >
                    {paying || submitting
                      ? "Processing..."
                      : `Pay ₦${AMOUNT_NAIRA} & Generate Flyer`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LIVE PREVIEW */}
          <div className="w-full max-w-full overflow-hidden">
            <div className="lg:sticky lg:top-24">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-black/60">
                  Live Preview
                </div>
                <span className="rounded-full bg-[#d3de2c] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                  Auto-updating
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">
                <FlyerPreview form={form} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlyerPreview({ form }: { form: FlyerData }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.getBoundingClientRect().width / FLYER_WIDTH);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        maxWidth: "100%",
        contain: "layout",
        minHeight: scale === 0 ? 200 : undefined,
      }}
    >
      {scale > 0 && (
        <>
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: FLYER_WIDTH,
              height: FLYER_HEIGHT,
              pointerEvents: "none",
            }}
          >
            <Flyer data={form} watermark />
          </div>
          <div style={{ height: FLYER_HEIGHT * scale, marginTop: -FLYER_HEIGHT }} />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h3 className="mb-3 font-display text-lg text-black/90">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border-2 border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#009444]"
      />
    </label>
  );
}

function Textarea({
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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border-2 border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#009444]"
      />
    </label>
  );
}


