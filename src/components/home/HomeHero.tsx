"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/routing";
import { discountPercent, type MenuDeal } from "@/components/layout/menu-deal";

export interface HeroSlide {
  eyebrow: string;
  title: string;
  cta: string;
  href: string;
  /** Background-removed pack shot of the product the slide is about. */
  image: string | null;
}

/*
  Design: HomeV3 / HomeMobileV3, first block.

  Every slide names a real product, shows that product's own pack shot and
  links to its page — the slide and the picture can never disagree. Auto-advance
  every 7s, off for reduced motion; the arrows and dots take over at any time.
*/
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const t = useTranslations("home");
  const [active, setActive] = useState(0);
  const count = slides.length;
  const go = useCallback((step: number) => setActive((i) => (i + step + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => go(1), 7000);
    return () => window.clearInterval(id);
  }, [count, go, active]);

  const slide = slides[active];
  if (!slide) return null;

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:gap-3.5">
      <div className="relative">
        <Link
          key={active}
          href={slide.href}
          className="hero-slide-in relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl bg-tile px-5 pt-5 transition-colors hover:bg-tile-hover lg:grid lg:h-[420px] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)] lg:items-center lg:gap-6 lg:rounded-[28px] lg:px-[88px] lg:pt-0"
        >
          <span className="relative z-10 flex flex-col items-start gap-3 lg:gap-4">
            <span className="inline-flex h-6 items-center rounded-pill bg-bg px-2.5 text-xs font-semibold lg:h-[26px] lg:text-[13px]">
              {slide.eyebrow}
            </span>
            <span className="text-[25px] font-bold leading-[30px] tracking-[-0.01em] lg:text-h-hero lg:leading-[46px] lg:tracking-[-0.02em]">{slide.title}</span>
            <span className="mt-0.5 inline-flex h-11 items-center rounded-sm bg-ink px-[18px] text-[15px] font-semibold text-white lg:mt-1.5 lg:h-14 lg:rounded-[14px] lg:px-8 lg:text-[17px]">
              {slide.cta}
            </span>
          </span>
          {slide.image && (
            <span className="absolute bottom-1.5 right-1.5 h-44 w-44 lg:relative lg:bottom-auto lg:right-auto lg:aspect-square lg:h-auto lg:w-full lg:max-w-[330px] lg:justify-self-center">
              <Image
                src={slide.image}
                alt=""
                fill
                priority={active === 0}
                sizes="(max-width: 1024px) 176px, 330px"
                className="object-contain"
              />
            </span>
          )}
        </Link>
        {count > 1 && (
          <>
            <ArrowButton dir="prev" label={t("v3.prevSlide")} onClick={() => go(-1)} className="absolute left-4 top-[182px] hidden lg:flex" />
            <ArrowButton dir="next" label={t("v3.nextSlide")} onClick={() => go(1)} className="absolute right-4 top-[182px] hidden lg:flex" />
          </>
        )}
      </div>
      {count > 1 && (
        <div className="flex justify-center" role="group" aria-label={t("v3.slides")}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={t("slideLabel", { number: i + 1 })}
              aria-current={i === active}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all lg:h-2",
                  i === active ? "w-5 bg-ink lg:w-6" : "w-1.5 bg-on-dark-2 lg:w-2",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
        <span className="absolute bottom-3 right-3 h-[180px] w-[180px]">
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
