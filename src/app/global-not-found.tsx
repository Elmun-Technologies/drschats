import "@/styles/globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { localeHtmlLang, defaultLocale } from "@/lib/i18n/routing";
import { buttonVariants } from "@/components/ui/Button";
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

  Styled as NotFoundV3 (NotFoundView): Onest from globals.css, 28/34 → 36/42
  heading, 12px-radius buttons.
*/

export const metadata: Metadata = {
  title: `${uz.common.notFoundTitle} · ${ru.common.notFoundTitle}`,
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang={localeHtmlLang[defaultLocale]}>
      <body className="grain min-h-screen antialiased">
        <main className="flex min-h-svh items-center justify-center px-4 py-16">
          <div className="flex max-w-[600px] flex-col items-center gap-4 text-center">
            <p aria-hidden className="text-[110px] font-bold leading-none tracking-[-0.04em] lg:text-[160px]">
              404
            </p>

            <h1 lang="uz-UZ" className="text-[28px] font-extrabold leading-[34px] lg:text-h-page">
              {uz.common.notFoundTitle}
            </h1>
            <p lang="ru-RU" className="text-lead text-ink-2">
              {ru.common.notFoundTitle}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <Link href="/uz" lang="uz-UZ" className={buttonVariants("primary")}>
                {uz.common.notFoundHome}
              </Link>
              <Link href="/ru" lang="ru-RU" className={buttonVariants("secondary")}>
                {ru.common.notFoundHome}
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
