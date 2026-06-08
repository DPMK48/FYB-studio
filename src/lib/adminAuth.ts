import { cookies } from "next/headers";

export const ADMIN_COOKIE = "fyb_admin_session";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "25bits";
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  const v = c.get(ADMIN_COOKIE)?.value;
  return Boolean(v) && v === getAdminPassword();
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
}
