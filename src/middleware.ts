import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/lib/i18n/routing";
import { AB_COOKIE, AB_COOKIE_RE } from "@/lib/merch/ab";

const intl = createMiddleware(routing);

/*
  Locale routing, plus the A/B bucket cookie (lib/merch/ab.ts). The cookie is
  set on the response of the first page a browser loads, which arrives
  before the HTML is parsed, so the <head> script already sees it on that
  very page. Pages stay cached (ISR): the HTML is the same for everyone and
  the variant is chosen in the browser, before the first paint.
*/
export default function middleware(request: NextRequest) {
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

export const config = {
  // Match all pathnames except for
  // - /api, /_next, /_vercel
  // - files with an extension (e.g. /favicon.ico, /og.png)
  matcher: ["/((?!api|_next|_vercel|studio|admin|r/|s/|.*\\..*).*)"],
};
