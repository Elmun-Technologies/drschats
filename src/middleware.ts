import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/lib/i18n/routing";
import { AB_COOKIE, AB_COOKIE_RE } from "@/lib/merch/ab";
import { ADMIN_PATH_HEADER, SESSION_COOKIE, isPublicAdminPath } from "@/lib/admin/cookie";

const intl = createMiddleware(routing);

/*
  Locale routing, plus the A/B bucket cookie (lib/merch/ab.ts). The cookie is
  set on the response of the first page a browser loads, which arrives
  before the HTML is parsed, so the <head> script already sees it on that
  very page. Pages stay cached (ISR): the HTML is the same for everyone and
  the variant is chosen in the browser, before the first paint.
*/
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminGate(request);
  const response = intl(request);
  if (!AB_COOKIE_RE.test(request.cookies.get(AB_COOKIE)?.value ?? "")) {
    response.cookies.set(AB_COOKIE, crypto.randomUUID().replace(/-/g, ""), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });
  }
  return response;
}

/*
  A second wall in front of the admin panel. Without a session cookie nothing
  under /admin is rendered at all; with one, every page still verifies it
  (requireAdmin) before it reads anything — a forged cookie gets that far and
  no further.
*/
function adminGate(request: NextRequest) {
  if (!isPublicAdminPath(request.nextUrl.pathname) && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  // The page's path for requireAdmin (role check). Set here, so a client-sent value never survives.
  const forwarded = new Headers(request.headers);
  forwarded.set(ADMIN_PATH_HEADER, request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: forwarded } });
}

export const config = {
  // Match all pathnames except for
  // - /api, /_next, /_vercel
  // - files with an extension (e.g. /favicon.ico, /og.png)
  // - /admin is matched on its own and only passes through adminGate
  matcher: ["/((?!api|_next|_vercel|studio|admin|r/|s/|.*\\..*).*)", "/admin", "/admin/:path*"],
};
