"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn, formatMoney } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/shop/category-icons";
import { categoryCutout } from "@/lib/content/product-cutouts";
import { isNavigable } from "@/lib/content/nav-sections";
import type { Locale } from "@/lib/i18n/routing";
import type { Category } from "@/lib/shopflow/types";
import { discountPercent, type MenuDeal } from "./menu-deal";
import { HEALTH_LINKS, SALE_HREF } from "./nav-links";

/*
  The black "Katalog" button and its panel (design: MegaMenuV3).

  Left: every category that has stock. Middle: the hovered category and the
  health journeys — someone who does not know which product they need is
  browsing by problem, not by shelf, and both questions belong here. Right: the
  week's deepest real discount, or nothing when the catalogue has none.

  A disclosure, not a modal: the header stays usable while it is open, so it
  closes on Escape, on a click outside and on navigation instead of trapping
  focus.
*/
export function CatalogMenu({
  categories,
  topicPaths = [],
  deal,
}: {
  categories: Category[];
  topicPaths?: string[];
  deal: MenuDeal | null;
}) {
  const t = useTranslations("header");
  const nav = useTranslations("nav");
  const health = useTranslations("health");
  const locale = useLocale() as Locale;
  const visible = categories.filter((c) => c.productCount);
  const healthLinks = HEALTH_LINKS.filter((l) => isNavigable(l.href, topicPaths));
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  if (visible.length === 0) {
    return (
      <Link href="/products" className={TRIGGER_CLASS}>
        <GridIcon />
        {t("catalog")}
      </Link>
    );
  }

  const active = visible.find((c) => c.id === activeId) ?? visible[0];

  return (
    <div ref={rootRef} className="shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={TRIGGER_CLASS}
      >
        {open ? <CloseIcon /> : <GridIcon />}
        {t("catalog")}
      </button>

      {open && (
        <>
          {/* Starts below the header so the header itself stays undimmed. */}
          <div aria-hidden className="absolute inset-x-0 top-full z-30 h-screen bg-ink/45" />
          <div
            id={panelId}
            role="group"
            aria-label={t("catalog")}
            className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-11rem)] overflow-y-auto overscroll-contain rounded-b-[28px] bg-bg shadow-pop"
          >
            <div className="wrap grid grid-cols-[260px_minmax(0,1fr)] gap-8 pb-8 pt-6 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
              <nav
                aria-label={nav("shopByCategories")}
                className="flex flex-col gap-0.5 border-r border-line pr-5"
              >
                <Link href={SALE_HREF} className={cn(ROW_CLASS, "font-bold text-red")}>
                  <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red/10">
                    %
                  </span>
                  {nav("topDeals")}
                </Link>
                {visible.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products/${c.slug}`}
                    onMouseEnter={() => setActiveId(c.id)}
                    onFocus={() => setActiveId(c.id)}
                    className={cn(ROW_CLASS, c.id === active.id && "bg-tile font-bold")}
                  >
                    <CategoryThumb slug={c.slug} size={40} />
                    <span className="min-w-0 flex-1">{c.name}</span>
                    <ChevronIcon />
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-[26px] font-bold leading-8 tracking-[-0.01em]">{active.name}</h2>
                  <Link
                    href={`/products/${active.slug}`}
                    className="inline-flex items-center gap-1.5 text-[15px] font-semibold hover:underline"
                  >
                    {t("allProducts", { count: active.productCount ?? 0 })}
                    <ArrowIcon />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-7">
                  {healthLinks.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <span className="text-base font-bold">{health("goal.plural")}</span>
                      {healthLinks.map((l) => (
                        <Link key={l.key} href={l.href} className={GROUP_LINK_CLASS}>
                          {nav(l.key)}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <span className="text-base font-bold">{nav("shop")}</span>
                    <Link href="/products" className={GROUP_LINK_CLASS}>
                      {nav("allCategories")}
                    </Link>
                    <Link href="/brands" className={GROUP_LINK_CLASS}>
                      {nav("brands")}
                    </Link>
                    <Link href="/where-to-buy" className={GROUP_LINK_CLASS}>
                      {nav("whereToBuy")}
                    </Link>
                  </div>
                </div>
              </div>

              {deal && (
                <Link
                  href={`/product/${deal.slug}`}
                  className="hidden min-h-[420px] flex-col gap-2 rounded-3xl bg-tile p-6 transition-colors hover:bg-tile-hover xl:flex"
                >
                  <span className="text-[22px] font-bold leading-7">{t("weekOffer")}</span>
                  <span className="inline-flex h-[26px] items-center self-start rounded-pill bg-red px-2.5 text-sm font-bold text-white">
                    −{discountPercent(deal)}%
                  </span>
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[26px] font-bold leading-8">{formatMoney(deal.price, locale)}</span>
                    <span className="text-[15px] text-muted line-through">{formatMoney(deal.oldPrice, locale)}</span>
                  </span>
                  <span className="text-[15px] leading-[21px] text-ink-2">{deal.name}</span>
                  {deal.image && (
                    <span className="relative mt-auto block h-[200px] w-[200px] self-center">
                      <Image src={deal.image} alt="" fill sizes="200px" className="object-contain" />
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** Cutout pack shot for a category, or its line icon when it has none. */
export function CategoryThumb({ slug, size }: { slug: string; size: 40 | 44 }) {
  const src = categoryCutout(slug);
  const box = size === 40 ? "h-10 w-10" : "h-11 w-11";
  if (src) {
    return (
      <span className={cn("relative shrink-0", box)}>
        <Image src={src} alt="" fill sizes={`${size}px`} className="object-contain" />
      </span>
    );
  }
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-tile", box)}>
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={getCategoryIcon(slug)} />
      </svg>
    </span>
  );
}

const TRIGGER_CLASS =
  "inline-flex h-[52px] items-center gap-2 rounded-sm bg-ink px-[22px] text-button font-semibold text-white transition-colors hover:bg-black";

const ROW_CLASS =
  "flex items-center gap-3 rounded-[14px] px-3 py-2 text-base font-medium text-ink transition-colors hover:bg-tile";

const GROUP_LINK_CLASS = "text-[15px] leading-5 text-ink-2 hover:text-black hover:underline";

export function GridIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="ml-auto h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
