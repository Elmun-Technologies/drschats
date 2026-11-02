import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/lib/i18n/routing";
import { AB_COOKIE, AB_COOKIE_RE } from "@/lib/merch/ab";
import { ADMIN_PATH_HEADER, SESSION_COOKIE, isPublicAdminPath } from "@/lib/admin/cookie";
import { SESSION_IDLE_MS, refreshedSessionToken } from "@/lib/admin/session-edge";
import { REQUEST_ID_HEADER, requestIdFrom } from "@/lib/request-id";
import { shelfRoute } from "@/lib/shop/shelf-rewrite";

const intl = createMiddleware(routing);

/*
  Locale routing, plus the A/B bucket cookie (lib/merch/ab.ts). The cookie is
  set on the response of the first page a browser loads, which arrives
  before the HTML is parsed, so the <head> script already sees it on that
  very page. Pages stay cached (ISR): the HTML is the same for everyone and
  the variant is chosen in the browser, before the first paint.

  Every request also gets an x-request-id (lib/request-id.ts): in the request,
  so server logs can quote it, and in the response, so a customer or an
  operator can.
*/
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = requestIdFrom(request.headers.get(REQUEST_ID_HEADER));
  if (pathname.startsWith("/api/")) {
    const headers = new Headers(request.headers);
    headers.set(REQUEST_ID_HEADER, requestId);
    const response = NextResponse.next({ request: { headers } });
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminGate(request, requestId);
  const shelf = shelfRoute(pathname, request.nextUrl.searchParams);
  if (shelf?.kind === "redirect") {
    const url = request.nextUrl.clone();
    url.pathname = shelf.pathname;
    return NextResponse.redirect(url, 308);
  }
  // next-intl copies the request headers into its rewrite, so the id reaches the page and its actions.
  try {
    request.headers.set(REQUEST_ID_HEADER, requestId);
  } catch {
    // Immutable headers on some runtime: the response still carries the id.
  }
  let response = intl(request);
  if (shelf && response.headers.has("x-middleware-rewrite")) response = rewriteShelf(request, response, shelf.pathname, requestId);
  response.headers.set(REQUEST_ID_HEADER, requestId);
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
function rewriteShelf(request: NextRequest, intlResponse: NextResponse, pathname: string, requestId: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const headers = new Headers(request.headers);
  headers.set(REQUEST_ID_HEADER, requestId);
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
async function adminGate(request: NextRequest, requestId: string) {
  if (!isPublicAdminPath(request.nextUrl.pathname) && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  // The page's path for requireAdmin (role check). Set here, so a client-sent value never survives.
  const forwarded = new Headers(request.headers);
  forwarded.set(ADMIN_PATH_HEADER, request.nextUrl.pathname);
  forwarded.set(REQUEST_ID_HEADER, requestId);
  const response = NextResponse.next({ request: { headers: forwarded } });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  /*
    The idle timeout slides on page loads only (lib/admin/session-edge.ts). A
    server action (POST) may set or clear the session cookie itself — sign-in,
    sign-out — and a second Set-Cookie from here would race it.
  */
  if (request.method === "GET") {
    const fresh = await refreshedSessionToken(request.cookies.get(SESSION_COOKIE)?.value).catch(() => null);
    if (fresh) {
      response.cookies.set(SESSION_COOKIE, fresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        path: "/admin",
        maxAge: SESSION_IDLE_MS / 1000,
      });
    }
  }
  return response;
}

export const config = {
  // Match all pathnames except for
  // - /_next, /_vercel, /studio, /r/, /s/
  // - files with an extension (e.g. /favicon.ico, /og.png)
  // - /admin is matched on its own and only passes through adminGate
  // - /api is matched on its own and only gets a request id
  matcher: ["/((?!api|_next|_vercel|studio|admin|r/|s/|.*\\..*).*)", "/admin", "/admin/:path*", "/api/:path*"],
};
