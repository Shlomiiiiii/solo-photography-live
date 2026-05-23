import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { adminAuth } from "@/lib/firebase/admin";

export type AdminSession = {
  uid: string;
  email?: string;
};

export function isAllowedAdmin(uid: string, email?: string | null) {
  const allowedUid = process.env.ADMIN_UID;
  const allowedEmail = process.env.ADMIN_EMAIL?.toLowerCase();

  if (allowedUid && uid === allowedUid) return true;
  if (allowedEmail && email?.toLowerCase() === allowedEmail) return true;
  return false;
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    if (!isAllowedAdmin(decoded.uid, decoded.email)) return null;
    return {
      uid: decoded.uid,
      email: decoded.email
    };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");
  return admin;
}
