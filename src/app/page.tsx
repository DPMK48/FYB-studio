"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SplashPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0c0c0c] text-white">
      {/* Animated grid */}
      <div className="absolute inset-0 bg-grid opacity-60" />
      {/* Glow gradients */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#009444]/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#d3de2c]/20 blur-3xl" />

      {/* Floating binary */}
      <div className="pointer-events-none absolute inset-0 select-none overflow-hidden font-mono text-xs leading-7 text-white/10">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap">
            {"01011010 10010110 01010110 10100101 01011010 10010110 01010110 10100101 ".repeat(
              6,
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        {/* 25BITS logo */}
        <div
          className={`mb-8 transition-all duration-700 ${
            mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <PixelLogo />
        </div>

        <p
          className={`mb-3 text-xs font-bold uppercase tracking-[0.4em] text-[#d3de2c] transition-all duration-700 delay-150 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Faculty of Computing • ATBU Bauchi
        </p>

        <h1
          className={`font-display text-2xl leading-[0.95] sm:text-4xl md:text-6xl transition-all duration-700 delay-300 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          CONGRATULATIONS
          <br />
          <span className="shimmer-text">FYB CLASS OF 2025</span>
        </h1>

        <p
          className={`mt-6 max-w-2xl text-base text-white/80 sm:text-lg transition-all duration-700 delay-500 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Five years. Countless late nights. One unforgettable journey. Welcome
          to the official <span className="text-[#009444] font-semibold">25BITS</span>{" "}
          FYB Studio — where your story becomes a flyer worth framing.
        </p>

        <div
          className={`mt-10 flex flex-col items-center gap-4 sm:flex-row transition-all duration-700 delay-700 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <Link
            href="/home"
            className="group relative inline-flex items-center gap-2 rounded-full bg-[#009444] px-8 py-4 font-display text-base uppercase tracking-wider text-white shadow-[0_10px_40px_-10px_rgba(31,158,58,0.8)] transition hover:bg-[#157a2c]"
          >
            Enter the Studio
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/activities"
            className="rounded-full border border-white/30 px-8 py-4 font-display text-base uppercase tracking-wider text-white/90 transition hover:bg-white/10"
          >
            View FYB Activities
          </Link>
        </div>

        <div className="mt-16 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-widest text-white/70 backdrop-blur">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#009444]" />
          Beyond Binary • Profile of the Day
        </div>
      </div>

      {/* Bottom binary strip */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-[#009444] py-3">
        <div className="binary-strip overflow-hidden text-center text-[10px] sm:text-xs text-white/80">
          01011010 10010110 01010110 10100101 01011010 10010110 01010110 10100101
          01011010
        </div>
      </div>
    </main>
  );
}

function PixelLogo() {
  // 5x4-ish pixelated "25" then "-BITS-"
  const two = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ];
  const five = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ];
  const render = (grid: number[][]) => (
    <div className="grid grid-cols-5 gap-[2px]">
      {grid.flat().map((c, i) => (
        <div
          key={i}
          className={`h-3 w-3 ${
            c ? "bg-white" : "bg-transparent"
          } sm:h-4 sm:w-4`}
        />
      ))}
    </div>
  );
  return (
    <div className="inline-flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur">
      <div className="flex items-end gap-2">
        {render(two)}
        {render(five)}
      </div>
      <div className="font-display text-sm tracking-[0.5em] text-white">
        — BITS —
      </div>
    </div>
  );
}
