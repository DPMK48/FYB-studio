/* eslint-disable react-hooks/purity */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { Activity } from "@/db/schema";

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

type Props = {
  activity: Activity;
};

export default function ActivityCardClient({ activity }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [reference, setReference] = useState("");

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
  const demoMode = !publicKey;

  async function handleProceed() {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      // Create pending ticket order
      const res = await fetch("/api/tickets/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          activityId: activity.id,
          amountPaid: activity.price,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to initiate ticket order.");
      }

      const orderData = await res.json();
      const orderId = orderData.id;

      if (demoMode) {
        // Simulating Paystack payment in Demo Mode
        const mockRef = `demo_ticket_${Date.now()}_${orderId}`;
        await verifyPayment(orderId, mockRef);
        return;
      }

      if (!window.PaystackPop) {
        throw new Error("Paystack SDK not loaded. Please try again.");
      }

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: email.trim(),
        amount: activity.price * 100, // Paystack amount is in kobo
        currency: "NGN",
        ref: `ticket_${Date.now()}_${orderId}`,
        metadata: { ticketOrderId: orderId, email: email.trim() },
        callback: (response) => {
          void verifyPayment(orderId, response.reference);
        },
        onClose: () => {
          setPaying(false);
        },
      });

      setPaying(true);
      handler.openIframe();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An error occurred.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyPayment(orderId: number, refStr: string) {
    setPaying(true);
    try {
      const res = await fetch("/api/payments/verify-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reference: refStr,
          amount: activity.price,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Payment verification failed.");
      }

      setTicketId(orderId);
      setReference(refStr);
      setSuccess(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Verification failed.";
      setError(msg);
    } finally {
      setPaying(false);
    }
  }

  function handleClose() {
    setShowModal(false);
    // Reset state
    setEmail("");
    setError(null);
    setSuccess(false);
    setTicketId(null);
    setReference("");
  }

  const isPaidEvent = activity.price > 0;
  const isAvailable = activity.status === "upcoming" || activity.status === "ongoing";

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:-translate-y-1 hover:border-[#009444]/50 hover:shadow-xl flex flex-col h-full">
        {/* Card Header (Image or gradient) */}
        {activity.imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            {isPaidEvent && (
              <div className="absolute bottom-3 right-3 rounded-full bg-black/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm shadow border border-white/10">
                ₦{activity.price.toLocaleString()}
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-36 w-full bg-gradient-to-br from-[#009444]/10 to-[#d3de2c]/10">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#009444]/5 transition group-hover:scale-125" />
            {isPaidEvent && (
              <div className="absolute bottom-3 right-3 rounded-full bg-black/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm shadow border border-white/10">
                ₦{activity.price.toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Card Body */}
        <div className="flex flex-col justify-between flex-1 p-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                activity.status === "upcoming"
                  ? "bg-[#009444]/15 text-[#157a2c] border-[#009444]/40"
                  : activity.status === "ongoing"
                  ? "bg-[#d3de2c]/30 text-black border-[#d3de2c]"
                  : "bg-black/5 text-black/60 border-black/15"
              }`}>
                {activity.status}
              </span>
              <span className="text-xs text-black/50 font-medium">
                {activity.date || "TBA"}
              </span>
            </div>
            <h3 className="font-display text-2xl leading-tight text-black">
              {activity.title}
            </h3>
            {activity.location && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-black/60 font-medium">
                <span>📍</span> {activity.location}
              </div>
            )}
            {activity.description && (
              <p className="mt-3 text-sm leading-relaxed text-black/75">
                {activity.description}
              </p>
            )}
          </div>

          {/* Action button if paid */}
          {isPaidEvent && isAvailable && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 w-full rounded-full bg-[#009444] py-3 text-center font-display text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#009444]/20 transition hover:bg-[#157a2c]"
            >
              Get Ticket — ₦{activity.price.toLocaleString()}
            </button>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition duration-300">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-black/10 p-6 shadow-2xl text-black">
            
            {/* Header */}
            <div className="mb-5 flex items-center justify-between border-b border-black/5 pb-3">
              <h3 className="font-display text-xl text-black">
                {success ? "Ticket Confirmed!" : "Get Event Ticket"}
              </h3>
              {!paying && !submitting && (
                <button
                  onClick={handleClose}
                  className="rounded-full bg-black/5 p-1 text-black/40 hover:bg-black/10 hover:text-black transition"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Success State */}
            {success ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#009444]/20 border border-[#009444]/50">
                  <span className="text-2xl text-[#009444]">✓</span>
                </div>
                <h4 className="font-bold text-lg text-black">Purchase Successful!</h4>
                <p className="text-xs text-black/60 mt-1 max-w-xs mx-auto">
                  Your ticket has been registered. Please keep your Ticket ID for verification at the event entrance.
                </p>

                <div className="mt-5 rounded-xl bg-neutral-50 border border-black/5 p-4 text-left space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-black/50">Event:</span>{" "}
                    <span className="font-bold text-black">{activity.title}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-black/50">Ticket ID:</span>{" "}
                    <span className="font-mono font-bold text-[#009444] bg-[#009444]/10 px-2 py-0.5 rounded text-[11px]">
                      #{ticketId}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-black/50">Email:</span>{" "}
                    <span className="font-bold text-black">{email}</span>
                  </div>
                  <div className="break-all">
                    <span className="font-semibold text-black/50">Payment Ref:</span>{" "}
                    <span className="font-mono text-black/60 text-[10px]">{reference}</span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="mt-6 w-full rounded-full bg-black py-3 font-display text-xs font-bold uppercase tracking-wider text-white transition hover:bg-black/80"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Checkout Form */
              <div className="space-y-4">
                <div className="rounded-xl bg-[#009444]/5 border border-[#009444]/20 p-4 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#009444]">
                      Event
                    </div>
                    <div className="font-display text-lg text-black font-semibold">
                      {activity.title}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-black/50">
                      Price
                    </div>
                    <div className="font-display text-xl text-[#009444] font-bold">
                      ₦{activity.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
                    Email Address *
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={paying || submitting}
                    className="w-full rounded-lg border-2 border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#009444] disabled:opacity-55"
                    required
                  />
                  <p className="text-[10px] text-black/50 mt-1.5 leading-normal">
                    We will send a payment receipt and ticket confirmation to this email address.
                  </p>
                </label>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 font-medium">
                    {error}
                  </div>
                )}

                {demoMode && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2.5 text-[10px] text-yellow-900 leading-normal">
                    <strong>Demo Mode</strong>: Local testing active. Payment will complete instantly.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleProceed}
                  disabled={paying || submitting || !email.trim()}
                  className="w-full rounded-full bg-[#009444] py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#009444]/20 transition hover:bg-[#157a2c] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paying || submitting
                    ? "Processing..."
                    : `Pay ₦${activity.price.toLocaleString()} via Paystack`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
