import "@/styles/globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { localeHtmlLang, defaultLocale } from "@/lib/i18n/routing";
import uz from "@/messages/uz.json";
import ru from "@/messages/ru.json";

/*
  The 404 for URLs that never reach a locale.

  Almost everything is rewritten to /uz/… or /ru/… by the middleware, and those
  misses land on [locale]/not-found.tsx inside a document that already declares
  its language. What is left over — paths the middleware matcher skips, and
  anything requested before routing decides — used to fall through to Next's
  built-in 404, which ships a bare document with no lang attribute. A screen
  reader then reads Uzbek text in the voice of whatever language it defaulted
  to, which is the one place on the site where that could still happen.

  This file exists to close that gap, so it renders the whole document itself:
  root layout is a passthrough and there is no locale segment above to provide
  one. Because the URL carried no locale, there is nothing to guess from, and
  the page answers in both languages with each line tagged for what it is —
  which is what `lang` is for.
*/

const exo2 = localFont({
  src: [
    { path: "../fonts/exo2/exo2-regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/exo2/exo2-medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/exo2/exo2-semibold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/exo2/exo2-bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/exo2/exo2-extrabold.woff2", weight: "800", style: "normal" },
    { path: "../fonts/exo2/exo2-black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-exo2",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: `${uz.common.notFoundTitle} · ${ru.common.notFoundTitle}`,
  robots: { index: false, follow: false },
};

const LINK_BASE =
  "inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors";

export default function GlobalNotFound() {
  return (
    <html
      lang={localeHtmlLang[defaultLocale]}
      className={exo2.variable}
    >
      <body className="grain min-h-screen antialiased">
        <main className="flex min-h-svh items-center justify-center px-6 py-16">
          <div className="text-center">
            <p
              aria-hidden
              className="font-display text-[120px] font-extrabold leading-none tracking-tight text-accent-strong sm:text-[180px]"
            >
              404
            </p>

            <h1 lang="uz-UZ" className="mt-4 font-display text-2xl font-bold text-fg sm:text-3xl">
              {uz.common.notFoundTitle}
            </h1>
            <p lang="ru-RU" className="mt-2 text-lg font-semibold text-muted">
              {ru.common.notFoundTitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/${defaultLocale}`}
                lang="ru-RU"
                className={`${LINK_BASE} bg-accent text-brand-deep hover:bg-accent-strong hover:text-ink`}
              >
                {ru.common.notFoundHome}
              </Link>
              <Link
                href="/uz"
                lang="uz-UZ"
                className={`${LINK_BASE} border border-line bg-surface text-fg hover:border-accent hover:text-accent-strong`}
              >
                {uz.common.notFoundHome}
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
