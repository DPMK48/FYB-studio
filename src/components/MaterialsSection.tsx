"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function MaterialsSection() {
  const [hoodieImage, setHoodieImage] = useState<"front" | "back">("front");

  return (
    <section className="border-b border-black/5 bg-[#fcfcf9] py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#009444] sm:text-xs">
            Official 25BITS Merchandise
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-5xl">
            FYB Materials
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-black/60">
            Show your class pride. Click on cards to view images, and click customisation buttons to select sizes, add names, and order.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* SASH */}
          <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#009444]/40 hover:shadow-lg">
            <Link href="/materials" className="absolute inset-0 z-10" />
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src="/materials/sash.png"
                alt="FYB Sash"
                fill
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="relative z-20 mt-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-black">FYB Custom Sash</h3>
                <p className="text-sm font-semibold text-[#009444]">₦2,510</p>
              </div>
              <span className="rounded-full bg-black/5 p-2 text-black/60 transition group-hover:bg-[#009444]/10 group-hover:text-[#009444]">
                →
              </span>
            </div>
          </div>

          {/* T-SHIRT */}
          <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#009444]/40 hover:shadow-lg">
            <Link href="/materials" className="absolute inset-0 z-10" />
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src="/materials/tshirt.jpg"
                alt="FYB T-Shirt"
                fill
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="relative z-20 mt-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-black">FYB T-Shirt</h3>
                <p className="text-xs text-black/50">L, XL • Std & Prem</p>
                <p className="text-sm font-semibold text-[#009444]">From ₦5,010</p>
              </div>
              <span className="rounded-full bg-black/5 p-2 text-black/60 transition group-hover:bg-[#009444]/10 group-hover:text-[#009444]">
                →
              </span>
            </div>
          </div>

          {/* HOODIE (Click image toggles front/back, but wrapper link or button goes to /materials) */}
          <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#009444]/40 hover:shadow-lg">
            {/* Clickable Image to Toggle View */}
            <div 
              onClick={(e) => {
                e.preventDefault();
                setHoodieImage((prev) => (prev === "front" ? "back" : "front"));
              }}
              title="Click to toggle front/back view"
              className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-neutral-100"
            >
              <Image
                src={
                  hoodieImage === "front"
                    ? "/materials/hoodie_front.png"
                    : "/materials/hoodie_back.png"
                }
                alt={`FYB Hoodie (${hoodieImage} view)`}
                fill
                className="object-contain p-4 transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-bold tracking-widest text-white backdrop-blur">
                {hoodieImage.toUpperCase()} VIEW
              </div>
            </div>

            {/* Link details section */}
            <div className="relative z-20 mt-4 flex items-center justify-between">
              <Link href="/materials" className="flex-1">
                <h3 className="font-display text-lg text-black">FYB Varsity Hoodie</h3>
                <p className="text-xs text-black/50">L, XL • Std & Prem</p>
                <p className="text-sm font-semibold text-[#009444]">From ₦8,010</p>
              </Link>
              <Link href="/materials" className="rounded-full bg-black/5 p-2 text-black/60 transition hover:bg-[#009444]/10 hover:text-[#009444]">
                →
              </Link>
            </div>
          </div>

          {/* CAP */}
          <div className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#009444]/40 hover:shadow-lg">
            <Link href="/materials" className="absolute inset-0 z-10" />
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src="/materials/cap.png"
                alt="FYB Snapback Cap"
                fill
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="relative z-20 mt-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-black">FYB Snapback Cap</h3>
                <p className="text-sm font-semibold text-[#009444]">₦2,510</p>
              </div>
              <span className="rounded-full bg-black/5 p-2 text-black/60 transition group-hover:bg-[#009444]/10 group-hover:text-[#009444]">
                →
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/materials"
            className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 font-display text-xs uppercase tracking-wider text-white shadow-lg transition hover:bg-neutral-800"
          >
            Customise & Purchase Materials
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
