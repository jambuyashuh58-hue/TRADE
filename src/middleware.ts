import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_SECRET, TRIAL_DAYS } from "@/lib/config";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/payment", "/subscribe"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return NextResponse.next();

  // ── Check session ────────────────────────────────────────────────────────
  const session = request.cookies.get("tp_session");
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = Buffer.from(session.value, "base64").toString("utf-8");
    const [, secret] = decoded.split(":");
    if (secret !== SESSION_SECRET) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
