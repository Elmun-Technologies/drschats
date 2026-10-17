"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/routing";
import { discountPercent, type MenuDeal } from "@/components/layout/menu-deal";
import { BannerLink, useUnexpired } from "@/components/marketing/BannerLink";
import { SaleCountdown } from "@/components/marketing/SaleCountdown";

export interface HeroSlide {
  /** Stable key: "banner-12" for a panel banner, "slide-0" for a built-in one. */
  key: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  cta: string;
  href: string;
  /** Background-removed pack shot (built-in slides) or the banner's picture. */
  image: string | null;
  /** Phones only, when the banner has its own picture for them. */
  imageMobile?: string | null;
  theme?: "light" | "dark";
  /** A real end date the slide counts down to. */
  countdownTo?: string | null;
  /** The slide leaves the slider at this moment. */
  endsAt?: string | null;
  /** Set for banners from admin → Vitrina: their clicks are counted. */
  bannerId?: number;
}

/*
  Design: HomeV3 / HomeMobileV3, first block.

  The slides are the banners the team schedules in admin → Vitrina; with none
  running, the built-in slides (`fallback`) — every one names a real product,
  shows that product's own pack shot and links to its page. A banner leaves
  at its end even on an open page, and if that empties the list the built-in
  slides come back: the hero is never empty. Auto-advance every 7s, off for
  reduced motion; the arrows and dots take over at any time.
*/
export function HeroSlider({ slides: scheduled, fallback }: { slides: HeroSlide[]; fallback: HeroSlide[] }) {
  const t = useTranslations("home");
  const live = useUnexpired(scheduled);
  const slides = live.length > 0 ? live : fallback;
  const [active, setActive] = useState(0);
  const count = slides.length;
  const go = useCallback((step: number) => setActive((i) => (i + step + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => go(1), 7000);
    return () => window.clearInterval(id);
  }, [count, go, active]);

  const slide = slides[active] ?? slides[0];
  if (!slide) return null;
  const dark = slide.theme === "dark";
  const index = slides.indexOf(slide);

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:gap-3.5">
      <div className="relative">
        <BannerLink
          key={slide.key}
          href={slide.href}
          slot="hero"
          banner={slide.bannerId ? { id: slide.bannerId, title: slide.title } : undefined}
          className={cn(
            "hero-slide-in relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl px-5 pt-5 transition-colors md:grid md:min-h-[320px] md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)] md:items-center md:gap-6 md:px-10 md:py-8 lg:h-[420px] lg:rounded-[28px] lg:px-[88px] lg:py-0",
            dark ? "bg-dark-panel text-white hover:bg-ink" : "bg-tile hover:bg-tile-hover",
          )}
        >
          <span className="relative z-10 flex flex-col items-start gap-3 lg:gap-4">
            {slide.eyebrow && (
              <span className="inline-flex h-6 items-center rounded-pill bg-bg px-2.5 text-xs font-semibold text-ink lg:h-[26px] lg:text-[13px]">
                {slide.eyebrow}
              </span>
            )}
            <span className="text-[25px] font-bold leading-[30px] tracking-[-0.01em] lg:text-h-hero lg:leading-[46px] lg:tracking-[-0.02em]">{slide.title}</span>
            {slide.subtitle && (
              <span className={cn("max-w-[520px] text-[15px] leading-[21px] lg:text-[17px] lg:leading-6", dark ? "text-on-dark-2" : "text-ink-2")}>{slide.subtitle}</span>
            )}
            {slide.countdownTo && <SaleCountdown as="span" endsAt={slide.countdownTo} onDark={dark} className="lg:text-[15px]" />}
            {slide.cta && (
              <span
                className={cn(
                  "mt-0.5 inline-flex h-11 items-center rounded-sm px-[18px] text-[15px] font-semibold lg:mt-1.5 lg:h-14 lg:rounded-[14px] lg:px-8 lg:text-[17px]",
                  dark ? "bg-bg text-ink" : "bg-ink text-white",
                )}
              >
                {slide.cta}
              </span>
            )}
          </span>
          {slide.image && (
            <span
              className={cn(
                "relative -mr-3.5 mb-1.5 mt-auto h-44 w-44 shrink-0 self-end md:m-0 md:aspect-square md:h-auto md:w-full md:max-w-[260px] md:justify-self-center lg:max-w-[330px]",
                slide.imageMobile && "max-md:hidden",
              )}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                unoptimized={!isLocal(slide.image)}
                sizes="(max-width: 767px) 176px, 330px"
                className="object-contain"
              />
            </span>
          )}
          {slide.imageMobile && (
            <span className="relative -mr-3.5 mb-1.5 mt-auto h-44 w-44 shrink-0 self-end md:hidden">
              <Image src={slide.imageMobile} alt="" fill priority={index === 0} unoptimized={!isLocal(slide.imageMobile)} sizes="176px" className="object-contain" />
            </span>
          )}
        </BannerLink>
        {count > 1 && (
          <>
            <ArrowButton dir="prev" label={t("v3.prevSlide")} onClick={() => go(-1)} className="absolute left-4 top-[182px] hidden lg:flex" />
            <ArrowButton dir="next" label={t("v3.nextSlide")} onClick={() => go(1)} className="absolute right-4 top-[182px] hidden lg:flex" />
          </>
        )}
      </div>
      {count > 1 && (
        <div className="flex justify-center" role="group" aria-label={t("v3.slides")}>
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(i)}
              aria-label={t("slideLabel", { number: i + 1 })}
              aria-current={i === index}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all lg:h-2",
                  i === index ? "w-5 bg-ink lg:w-6" : "w-1.5 bg-on-dark-2 lg:w-2",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Remote pictures (Tigris uploads) may sit on hosts the optimiser does not proxy; the site's own files go through it. */
const isLocal = (src: string) => src.startsWith("/") && !src.startsWith("//");

/*
  "Haftaning taklifi": the catalogue's real discounts, deepest first. The arrows
  step through them; with one discount there is nothing to step through and
  with none the tile is not drawn at all.
*/
export function WeeklyDeal({ deals, variant }: { deals: MenuDeal[]; variant: "desktop" | "mobile" }) {
  const t = useTranslations("home.v3");
  const header = useTranslations("header");
  const locale = useLocale() as Locale;
  const [index, setIndex] = useState(0);
  const deal = deals[index];
  if (!deal) return null;
  const href = `/product/${deal.slug}`;

  if (variant === "mobile") {
    return (
      <Link href={href} className="grid grid-cols-[minmax(0,1fr)_120px] items-center gap-2 rounded-3xl bg-tile p-[18px]">
        <span className="flex flex-col items-start gap-1.5">
          <span className="text-lg font-bold">{header("weekOffer")}</span>
          <SalePill percent={discountPercent(deal)} />
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[22px] font-bold">{formatMoney(deal.price, locale)}</span>
            <span className="text-sm text-muted line-through">{formatNumber(deal.oldPrice)}</span>
          </span>
          <span className="text-sm leading-[19px] text-ink-2">{deal.name}</span>
        </span>
        {deal.image && (
          <span className="relative h-[120px] w-[120px]">
            <Image src={deal.image} alt="" fill sizes="120px" className="object-contain" />
          </span>
        )}
      </Link>
    );
  }

  const step = (n: number) => setIndex((i) => (i + n + deals.length) % deals.length);

  return (
    <div className="relative flex h-[420px] flex-col items-start gap-2.5 overflow-hidden rounded-[28px] bg-tile p-7">
      <span className="text-[26px] font-bold leading-8">{header("weekOffer")}</span>
      <SalePill percent={discountPercent(deal)} className="mt-1.5" />
      <span className="flex flex-wrap items-baseline gap-x-2.5">
        <span className="text-[30px] font-bold leading-9">{formatMoney(deal.price, locale)}</span>
        <span className="text-[17px] text-muted line-through">{formatNumber(deal.oldPrice)}</span>
      </span>
      <Link href={href} className="relative z-10 max-w-[200px] text-[17px] leading-[23px] text-ink-2 hover:text-ink hover:underline">
        {deal.name}
      </Link>
      {deal.image && (
        <span className="absolute bottom-3 right-3 h-[180px] w-[clamp(100px,calc(100%-172px),180px)]">
          <Image src={deal.image} alt="" fill sizes="180px" className="object-contain" />
        </span>
      )}
      {deals.length > 1 && (
        <div className="relative mt-auto flex gap-2.5">
          <ArrowButton dir="prev" label={t("prevOffer")} onClick={() => step(-1)} />
          <ArrowButton dir="next" label={t("nextOffer")} onClick={() => step(1)} />
        </div>
      )}
    </div>
  );
}

export function SalePill({ percent, className }: { percent: number; className?: string }) {
  return (
    <span className={cn("inline-flex h-[26px] items-center rounded-pill bg-red px-2.5 text-sm font-bold text-white", className)}>
      −{percent}%
    </span>
  );
}

export function ArrowButton({
  dir,
  label,
  onClick,
  className,
}: {
  dir: "prev" | "next";
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bg text-ink shadow-arrow transition-colors hover:bg-tile",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d={dir === "prev" ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
