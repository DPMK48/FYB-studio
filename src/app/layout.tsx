import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "25BITS FYB Studio — Class of 2025",
  description:
    "Create your custom FYB Class of 2025 profile flyer. Faculty of Computing, ATBU, Bauchi State.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f4f4ee] text-slate-900 antialiased min-h-screen">
        {children}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
