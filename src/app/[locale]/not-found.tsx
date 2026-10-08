"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { categoryCutout } from "@/lib/content/product-cutouts";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/* Design: NotFoundV3 — the one page every wrong URL lands on. */
const POPULAR = ["vitamins", "immunity", "beauty", "kids", "effervescent"] as const;

export default function NotFound() {
  const t = useTranslations("common");
  const header = useTranslations("header");
  const names = useTranslations("categoryNames");
  const locale = useLocale();

  return (
    <div className="wrap flex flex-col gap-10 pb-12 pt-10 lg:gap-14 lg:pb-20 lg:pt-16">
      <div className="mx-auto flex max-w-[600px] flex-col items-center gap-4 text-center">
        <p aria-hidden className="text-[110px] font-bold leading-none tracking-[-0.04em] lg:text-[160px]">404</p>
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-[36px] lg:leading-[42px]">{t("notFoundTitle")}</h1>
        <p className="text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{t("notFoundLead")}</p>
        <form action={`/${locale}/search`} role="search" className="mt-2 flex h-14 w-full items-center gap-2 rounded-[14px] bg-tile pl-5 pr-1.5">
          <label htmlFor="nf-search" className="sr-only">{header("searchShort")}</label>
          <input
            id="nf-search"
            name="q"
            type="search"
            placeholder={header("searchShort")}
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          />
          <button type="submit" aria-label={t("search")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-ink text-white">
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
          </button>
        </form>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link href="/" className={buttonVariants("primary")}>{t("notFoundHome")}</Link>
          <Link href="/products" className={buttonVariants("secondary")}>{t("notFoundShop")}</Link>
        </div>
      </div>

      <section aria-labelledby="nf-popular" className="flex flex-col gap-4">
        <h2 id="nf-popular" className="text-[22px] font-bold leading-7 lg:text-[26px]">{t("notFoundPopular")}</h2>
        <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0">
          {POPULAR.map((slug) => {
            const image = categoryCutout(slug);
            return (
              <li key={slug} className="w-[160px] shrink-0 lg:w-auto">
                <Link href={`/products/${slug}`} className="relative flex h-[150px] flex-col rounded-[20px] bg-tile p-4 transition-colors hover:bg-tile-hover lg:h-[180px] lg:p-5">
                  <span className="relative z-[1] text-base font-bold lg:text-lg">{names(slug)}</span>
                  {image && (
                    <span className={cn("absolute bottom-3 right-3 h-[90px] w-[90px] lg:h-[120px] lg:w-[120px]")}>
                      <Image src={image} alt="" fill sizes="120px" className="object-contain" />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
