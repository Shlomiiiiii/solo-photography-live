import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { adminAuth } from "@/lib/firebase/admin";
import { isAllowedAdmin } from "@/lib/auth/admin";

export async function POST(request: NextRequest) {
  const { idToken } = (await request.json()) as { idToken?: string };
  if (!idToken) return NextResponse.json({ error: "Missing idToken." }, { status: 400 });

  const decoded = await adminAuth.verifyIdToken(idToken, true);
  if (!isAllowedAdmin(decoded.uid, decoded.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const expiresIn = Number(process.env.SESSION_TIMEOUT_HOURS ?? "72") * 60 * 60 * 1000;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    maxAge: expiresIn / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
  });

  return response;
}
