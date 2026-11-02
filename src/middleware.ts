import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/lib/i18n/routing";
import { AB_COOKIE, AB_COOKIE_RE } from "@/lib/merch/ab";
import { SESSION_COOKIE, isPublicAdminPath } from "@/lib/admin/cookie";
import { shelfRoute } from "@/lib/shop/shelf-rewrite";

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
  const shelf = shelfRoute(pathname, request.nextUrl.searchParams);
  if (shelf?.kind === "redirect") {
    const url = request.nextUrl.clone();
    url.pathname = shelf.pathname;
    return NextResponse.redirect(url, 308);
  }
  let response = intl(request);
  if (shelf && response.headers.has("x-middleware-rewrite")) response = rewriteShelf(request, response, shelf.pathname);
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
  A sorted or filtered catalogue URL renders per request on an internal
  route (lib/shop/shelf-rewrite.ts), so the clean shelf can stay static. The
  locale middleware has already decided this is a rewrite; this points it at
  the other page and keeps what it set — the locale request header, the
  hreflang Link header for the public URL, the locale cookie.
*/
function rewriteShelf(request: NextRequest, intlResponse: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const headers = new Headers(request.headers);
  const locale = pathname.split("/")[1];
  headers.set("X-NEXT-INTL-LOCALE", locale);
  const response = NextResponse.rewrite(url, { request: { headers } });
  const link = intlResponse.headers.get("Link");
  if (link) response.headers.set("Link", link);
  for (const cookie of intlResponse.cookies.getAll()) response.cookies.set(cookie);
  return response;
}

/*
  A second wall in front of the admin panel. Without a session cookie nothing
  under /admin is rendered at all; with one, every page still verifies it
  (requireAdmin) before it reads anything — a forged cookie gets that far and
  no further.
*/
function adminGate(request: NextRequest) {
  if (isPublicAdminPath(request.nextUrl.pathname) || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  // Match all pathnames except for
  // - /api, /_next, /_vercel
  // - files with an extension (e.g. /favicon.ico, /og.png)
  // - /admin is matched on its own and only passes through adminGate
  matcher: ["/((?!api|_next|_vercel|studio|admin|r/|s/|.*\\..*).*)", "/admin", "/admin/:path*"],
};
