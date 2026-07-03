"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";

type MaterialId = "sash" | "tshirt" | "hoodie" | "cap";

type SashConfig = {
  fullName: string;
};

type ClothingConfig = {
  customName: string;
  size: "L" | "XL";
  type: "standard" | "premium";
};

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

export default function MaterialsPage() {
  const [selected, setSelected] = useState<Record<MaterialId, boolean>>({
    sash: false,
    tshirt: false,
    hoodie: false,
    cap: false,
  });

  const [sashConfig, setSashConfig] = useState<SashConfig>({ fullName: "" });
  const [tshirtConfig, setTshirtConfig] = useState<ClothingConfig>({
    customName: "",
    size: "L",
    type: "standard",
  });
  const [hoodieConfig, setHoodieConfig] = useState<ClothingConfig>({
    customName: "",
    size: "L",
    type: "standard",
  });

  const [hoodieView, setHoodieView] = useState<"front" | "back">("front");

  const [email, setEmail] = useState("");
  const [paying, setPaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paidReference, setPaidReference] = useState("");
  const [orderSummary, setOrderSummary] = useState<any[]>([]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
  const demoMode = !publicKey;

  // Price configuration
  const prices = useMemo(() => {
    return {
      sash: 2500,
      tshirt: {
        standard: 5000,
        premium: 10500,
      },
      hoodie: {
        standard: 8000,
        premium: 13000,
      },
      cap: 2500,
    };
  }, []);

  // Calculate pricing for each selection
  const sashPrice = prices.sash;
  const tshirtPrice = tshirtConfig.type === "premium" ? prices.tshirt.premium : prices.tshirt.standard;
  const hoodiePrice = hoodieConfig.type === "premium" ? prices.hoodie.premium : prices.hoodie.standard;
  const capPrice = prices.cap;

  const totalAmount = useMemo(() => {
    let total = 0;
    if (selected.sash) total += sashPrice;
    if (selected.tshirt) total += tshirtPrice;
    if (selected.hoodie) total += hoodiePrice;
    if (selected.cap) total += capPrice;
    return total;
  }, [selected, sashPrice, tshirtPrice, hoodiePrice, capPrice]);

  const hasSelections = selected.sash || selected.tshirt || selected.hoodie || selected.cap;

  // Validate nickname input (no spaces, single word)
  const validateNickname = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    return !trimmed.includes(" ");
  };

  const validationErrors = useMemo(() => {
    const errs: string[] = [];
    if (selected.sash && !sashConfig.fullName.trim()) {
      errs.push("Sash: Full Name is required.");
    }
    if (selected.tshirt) {
      if (!tshirtConfig.customName.trim()) {
        errs.push("T-shirt: Name/Nickname is required.");
      } else if (!validateNickname(tshirtConfig.customName)) {
        errs.push("T-shirt: Enter Firstname or Nickname only (no spaces).");
      }
    }
    if (selected.hoodie) {
      if (!hoodieConfig.customName.trim()) {
        errs.push("Hoodie: Name/Nickname is required.");
      } else if (!validateNickname(hoodieConfig.customName)) {
        errs.push("Hoodie: Enter Firstname or Nickname only (no spaces).");
      }
    }
    return errs;
  }, [selected, sashConfig, tshirtConfig, hoodieConfig]);

  const canPay = useMemo(() => {
    return hasSelections && email.trim() && validationErrors.length === 0;
  }, [hasSelections, email, validationErrors]);

  const getItemsData = () => {
    const items = [];
    if (selected.sash) {
      items.push({
        id: "sash",
        name: "FYB Custom Sash",
        price: sashPrice,
        customName: sashConfig.fullName.trim(),
      });
    }
    if (selected.tshirt) {
      items.push({
        id: "tshirt",
        name: "FYB T-Shirt",
        price: tshirtPrice,
        type: tshirtConfig.type,
        size: tshirtConfig.size,
        customName: tshirtConfig.customName.trim(),
      });
    }
    if (selected.hoodie) {
      items.push({
        id: "hoodie",
        name: "FYB Varsity Hoodie",
        price: hoodiePrice,
        type: hoodieConfig.type,
        size: hoodieConfig.size,
        customName: hoodieConfig.customName.trim(),
      });
    }
    if (selected.cap) {
      items.push({
        id: "cap",
        name: "FYB Snapback Cap",
        price: capPrice,
      });
    }
    return items;
  };

  async function createDraftOrder(): Promise<number | null> {
    setSubmitting(true);
    setError(null);
    try {
      const items = getItemsData();
      const res = await fetch("/api/materials/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          items,
          amountPaid: totalAmount,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to initiate order.");
      }
      const j = await res.json();
      return j.id as number;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save order draft.";
      setError(msg);
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyAndSuccess(id: number, reference: string) {
    setPaying(true);
    try {
      const res = await fetch("/api/payments/verify-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, reference, amount: totalAmount }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Payment verification failed.");
      }
      setPaidReference(reference);
      setOrderSummary(getItemsData());
      setSuccess(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Verification failed.";
      setError(msg);
      setPaying(false);
    }
  }

  async function handleCheckout() {
    if (!canPay) {
      if (validationErrors.length > 0) {
        setError(validationErrors[0]);
      } else {
        setError("Please enter your email and select at least one material.");
      }
      return;
    }

    const id = await createDraftOrder();
    if (!id) return;

    if (demoMode) {
      // simulated payment for testing
      const reference = `demo_mat_${Date.now()}_${id}`;
      await verifyAndSuccess(id, reference);
      return;
    }

    if (!window.PaystackPop) {
      setError("Paystack SDK is loading. Please try again in a few seconds.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: email.trim(),
      amount: totalAmount * 100, // kobo
      currency: "NGN",
      ref: `mat_${Date.now()}_${id}`,
      metadata: { orderId: id, email: email.trim() },
      callback: (response) => {
        void verifyAndSuccess(id, response.reference);
      },
      onClose: () => {
        setPaying(false);
      },
    });

    setPaying(true);
    handler.openIframe();
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col">
        <SiteNav />
        <div className="mx-auto max-w-2xl px-5 py-20 text-center flex-1">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#009444]/20 border border-[#009444]/50">
            <span className="text-3xl text-[#009444]">✓</span>
          </div>
          <h1 className="font-display text-4xl mb-3">Order Confirmed!</h1>
          <p className="text-white/70 mb-8">
            Thank you! Your payment has been received successfully. A receipt has been sent to{" "}
            <strong className="text-white">{email}</strong>.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left mb-8">
            <h3 className="font-display text-lg mb-4 text-[#d3de2c]">Order Details</h3>
            <div className="space-y-3 border-b border-white/10 pb-4 mb-4">
              {orderSummary.map((item, index) => (
                <div key={index} className="flex justify-between items-start text-sm">
                  <div>
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="text-white/60 text-xs mt-0.5">
                      {item.type && `Type: ${item.type.toUpperCase()}`}
                      {item.size && ` • Size: ${item.size}`}
                      {item.customName && ` • Name: "${item.customName}"`}
                    </div>
                  </div>
                  <div className="font-semibold text-white">₦{item.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-base font-bold">
              <span>Total Paid</span>
              <span className="text-[#009444]">₦{totalAmount.toLocaleString()}</span>
            </div>
            <div className="mt-4 text-[11px] text-white/50 break-all">
              Payment Ref: {paidReference}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link
              href="/home"
              className="rounded-full bg-[#009444] px-8 py-3.5 font-display text-xs uppercase tracking-wider text-white shadow-lg transition hover:bg-[#157a2c]"
            >
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] text-black flex flex-col">
      <SiteNav />

      <div className="mx-auto max-w-7xl px-5 py-10 flex-1">
        <div className="mb-8">
          <Link href="/home" className="text-xs font-bold uppercase tracking-widest text-[#009444] hover:underline">
            ← Back to Home
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">FYB materials</h1>
          <p className="text-black/60 text-sm mt-1">
            Customise your graduate gear. Select items, configure options, and checkout.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* ITEMS SELECTION */}
          <div className="space-y-6">
            {/* SASH */}
            <div
              className={`rounded-2xl border-2 p-5 bg-white transition-all duration-300 ${
                selected.sash ? "border-[#009444] shadow-md" : "border-black/10 hover:border-black/20"
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="sash"
                  checked={selected.sash}
                  onChange={(e) => setSelected({ ...selected, sash: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-[#009444] focus:ring-[#009444]"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor="sash" className="font-display text-xl cursor-pointer">
                      FYB Custom Sash
                    </label>
                    <span className="font-display text-lg text-[#009444]">₦{sashPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-black/60 mt-1">
                    Premium custom sash featuring Abubakar Tafawa Balewa University logo and your full name.
                  </p>

                  {selected.sash && (
                    <div className="mt-4 pt-4 border-t border-black/5 animate-fadeIn">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
                          Full Name *
                        </span>
                        <input
                          type="text"
                          value={sashConfig.fullName}
                          onChange={(e) => setSashConfig({ ...sashConfig, fullName: e.target.value })}
                          placeholder="e.g. Sadiq Abubakar"
                          className="w-full rounded-lg border-2 border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#009444]"
                        />
                      </label>
                    </div>
                  )}
                </div>
                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-neutral-100 hidden sm:block">
                  <Image src="/materials/sash.png" alt="Sash" fill className="object-contain p-1" />
                </div>
              </div>
            </div>

            {/* T-SHIRT */}
            <div
              className={`rounded-2xl border-2 p-5 bg-white transition-all duration-300 ${
                selected.tshirt ? "border-[#009444] shadow-md" : "border-black/10 hover:border-black/20"
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="tshirt"
                  checked={selected.tshirt}
                  onChange={(e) => setSelected({ ...selected, tshirt: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-[#009444] focus:ring-[#009444]"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor="tshirt" className="font-display text-xl cursor-pointer">
                      FYB T-Shirt
                    </label>
                    <span className="font-display text-lg text-[#009444]">
                      ₦{tshirtPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-black/60 mt-1">
                    White Faculty of Computing class of 2025 T-shirt with your custom name/nickname.
                  </p>

                  {selected.tshirt && (
                    <div className="mt-4 pt-4 border-t border-black/5 space-y-4 animate-fadeIn">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Type Selection */}
                        <div>
                          <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
                            Quality Type
                          </span>
                          <div className="flex gap-2">
                            {(["standard", "premium"] as const).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTshirtConfig({ ...tshirtConfig, type: t })}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition ${
                                  tshirtConfig.type === t
                                    ? "border-[#009444] bg-[#009444]/10 text-[#009444]"
                                    : "border-black/10 bg-white text-black/70"
                                }`}
                              >
                                {t} ({t === "standard" ? "₦5,000" : "₦10,500"})
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Size Selection */}
                        <div>
                          <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
                            Size
                          </span>
                          <div className="flex gap-2">
                            {(["L", "XL"] as const).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setTshirtConfig({ ...tshirtConfig, size: s })}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition ${
                                  tshirtConfig.size === s
                                    ? "border-[#009444] bg-[#009444]/10 text-[#009444]"
                                    : "border-black/10 bg-white text-black/70"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Custom Name */}
                      <div>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
                            Firstname or Nickname Only *
                          </span>
                          <input
                            type="text"
                            value={tshirtConfig.customName}
                            onChange={(e) => setTshirtConfig({ ...tshirtConfig, customName: e.target.value })}
                            placeholder="e.g. ABS"
                            className="w-full rounded-lg border-2 border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#009444]"
                          />
                          <p className="text-[10px] text-black/50 mt-1">
                            Only enter a single word (no spaces allowed on the back).
                          </p>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-neutral-100 hidden sm:block">
                  <Image src="/materials/tshirt.jpg" alt="T-Shirt" fill className="object-contain p-1" />
                </div>
              </div>
            </div>

            {/* HOODIE */}
            <div
              className={`rounded-2xl border-2 p-5 bg-white transition-all duration-300 ${
                selected.hoodie ? "border-[#009444] shadow-md" : "border-black/10 hover:border-black/20"
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="hoodie"
                  checked={selected.hoodie}
                  onChange={(e) => setSelected({ ...selected, hoodie: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-[#009444] focus:ring-[#009444]"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor="hoodie" className="font-display text-xl cursor-pointer">
                      FYB Varsity Hoodie
                    </label>
                    <span className="font-display text-lg text-[#009444]">
                      ₦{hoodiePrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-black/60 mt-1">
                    Varsity-style green/black class hoodie. Click the image to preview the front/back view.
                  </p>

                  {selected.hoodie && (
                    <div className="mt-4 pt-4 border-t border-black/5 space-y-4 animate-fadeIn">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Type Selection */}
                        <div>
                          <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
                            Quality Type
                          </span>
                          <div className="flex gap-2">
                            {(["standard", "premium"] as const).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setHoodieConfig({ ...hoodieConfig, type: t })}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition ${
                                  hoodieConfig.type === t
                                    ? "border-[#009444] bg-[#009444]/10 text-[#009444]"
                                    : "border-black/10 bg-white text-black/70"
                                }`}
                              >
                                {t} ({t === "standard" ? "₦8,000" : "₦13,000"})
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Size Selection */}
                        <div>
                          <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
                            Size
                          </span>
                          <div className="flex gap-2">
                            {(["L", "XL"] as const).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setHoodieConfig({ ...hoodieConfig, size: s })}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition ${
                                  hoodieConfig.size === s
                                    ? "border-[#009444] bg-[#009444]/10 text-[#009444]"
                                    : "border-black/10 bg-white text-black/70"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Custom Name */}
                      <div>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
                            Firstname or Nickname Only *
                          </span>
                          <input
                            type="text"
                            value={hoodieConfig.customName}
                            onChange={(e) => setHoodieConfig({ ...hoodieConfig, customName: e.target.value })}
                            placeholder="e.g. Sunny"
                            className="w-full rounded-lg border-2 border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#009444]"
                          />
                          <p className="text-[10px] text-black/50 mt-1">
                            Only enter a single word (no spaces allowed on the back).
                          </p>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hoodie image toggle (interactive on click) */}
                <div 
                  onClick={() => setHoodieView(prev => prev === "front" ? "back" : "front")}
                  title="Click to toggle front/back view"
                  className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-xl bg-neutral-100 hover:border-black/20 border border-black/5 select-none"
                >
                  <Image 
                    src={hoodieView === "front" ? "/materials/hoodie_front.png" : "/materials/hoodie_back.png"} 
                    alt="Hoodie View" 
                    fill 
                    className="object-contain p-1" 
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[7px] text-center uppercase py-0.5 tracking-tighter">
                    {hoodieView}
                  </div>
                </div>
              </div>
            </div>

            {/* CAP */}
            <div
              className={`rounded-2xl border-2 p-5 bg-white transition-all duration-300 ${
                selected.cap ? "border-[#009444] shadow-md" : "border-black/10 hover:border-black/20"
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="cap"
                  checked={selected.cap}
                  onChange={(e) => setSelected({ ...selected, cap: e.target.checked })}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-[#009444] focus:ring-[#009444]"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor="cap" className="font-display text-xl cursor-pointer">
                      FYB Snapback Cap
                    </label>
                    <span className="font-display text-lg text-[#009444]">₦{capPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-black/60 mt-1">
                    Premium black or green snapback cap with detailed 25BITS class embroidery.
                  </p>
                </div>
                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-neutral-100 hidden sm:block">
                  <Image src="/materials/cap.png" alt="Cap" fill className="object-contain p-1" />
                </div>
              </div>
            </div>
          </div>

          {/* CHECKOUT SIDEBAR */}
          <div className="h-fit rounded-2xl border border-black/10 bg-white p-6 sticky top-24 shadow-sm">
            <h3 className="font-display text-2xl mb-4 border-b border-black/5 pb-2">Purchase Summary</h3>

            {hasSelections ? (
              <div className="space-y-3 mb-6">
                {selected.sash && (
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-semibold">FYB Custom Sash</span>
                      {sashConfig.fullName.trim() && (
                        <div className="text-[10px] text-black/50">Name: &quot;{sashConfig.fullName}&quot;</div>
                      )}
                    </div>
                    <span>₦{sashPrice.toLocaleString()}</span>
                  </div>
                )}
                {selected.tshirt && (
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-semibold">FYB T-Shirt ({tshirtConfig.type})</span>
                      <div className="text-[10px] text-black/50">
                        Size: {tshirtConfig.size}
                        {tshirtConfig.customName.trim() && ` • Nickname: "${tshirtConfig.customName}"`}
                      </div>
                    </div>
                    <span>₦{tshirtPrice.toLocaleString()}</span>
                  </div>
                )}
                {selected.hoodie && (
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-semibold">FYB Varsity Hoodie ({hoodieConfig.type})</span>
                      <div className="text-[10px] text-black/50">
                        Size: {hoodieConfig.size}
                        {hoodieConfig.customName.trim() && ` • Nickname: "${hoodieConfig.customName}"`}
                      </div>
                    </div>
                    <span>₦{hoodiePrice.toLocaleString()}</span>
                  </div>
                )}
                {selected.cap && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">FYB Snapback Cap</span>
                    <span>₦{capPrice.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t border-black/5 pt-3 mt-3 flex justify-between items-center font-bold text-lg">
                  <span>Total Due</span>
                  <span className="text-[#009444]">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-black/40 text-sm border-2 border-dashed border-black/5 rounded-xl mb-6">
                No items selected. Check boxes on the left to add items to your cart.
              </div>
            )}

            {/* EMAIL AND CHECKOUT FIELDS */}
            <div className="space-y-4 pt-2 border-t border-black/5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-black/70">
                  Email Address *
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border-2 border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#009444]"
                  required
                />
                <p className="text-[10px] text-black/50 mt-1">
                  We require your email so Paystack can send you a transaction receipt.
                </p>
              </label>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              {demoMode && hasSelections && (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-2.5 text-[11px] text-yellow-900 leading-normal">
                  <strong>Demo Mode</strong>: Local testing enabled. Payment will simulate instantly.
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={!canPay || paying || submitting}
                className="w-full rounded-full bg-[#009444] py-3.5 font-display text-xs uppercase tracking-wider text-white shadow-lg shadow-[#009444]/20 transition hover:bg-[#157a2c] disabled:opacity-50 disabled:cursor-not-allowed text-center block font-semibold"
              >
                {paying || submitting
                  ? "Processing..."
                  : hasSelections
                  ? `Pay ₦${totalAmount.toLocaleString()} via Paystack`
                  : "Select Items to Pay"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
