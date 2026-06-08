import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = new URL("/admin/login", req.url);
  const res = NextResponse.redirect(url, { status: 303 });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
