import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const adminPrefixes = ["/dashboard", "/clients", "/properties", "/galleries", "/payments", "/revenue", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isAdminPath = adminPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isAdminPath && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/clients/:path*", "/properties/:path*", "/galleries/:path*", "/payments/:path*", "/revenue/:path*", "/settings/:path*", "/login"]
};
