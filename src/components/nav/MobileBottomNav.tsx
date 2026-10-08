"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { useCart } from "@/lib/cart/store";
import { useWishlist } from "@/lib/wishlist/store";
import { isApiConfigured } from "@/lib/api/client";
import { accountAreaAvailable } from "@/lib/config/demo";
import { isNavigable } from "@/lib/content/nav-sections";
import { useDialog } from "@/lib/ui/useDialog";
import type { Category } from "@/lib/shopflow/types";
import { CategoryThumb, ChevronIcon } from "@/components/layout/CatalogMenu";
import { HEALTH_LINKS, SALE_HREF } from "@/components/layout/nav-links";
import { LocaleLinks } from "@/components/layout/TopBar";
import { ICONS } from "@/components/layout/header-item";
import { isStocked } from "@/lib/shop/categories";

/*
  Design: TabBarV3 + MenuMobileV3. Fixed to the bottom below lg; its height is
  the `--bottom-nav` token, so everything else pinned to the bottom edge
  offsets by the same number.

  "Katalog" opens the catalogue screen above the bar rather than navigating,
  and "Savat" opens the cart drawer, as the header's cart does.
*/
export function MobileBottomNav({
  categories = [],
  topicPaths = [],
}: {
  categories?: Category[];
  topicPaths?: string[];
}) {
  const t = useTranslations("header");
  const nav = useTranslations("nav");
  const pathname = usePathname();
  const openCart = useCart((s) => s.open);
  const cartCount = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const favCount = useWishlist((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  const cabinetHref = accountAreaAvailable(isApiConfigured()) ? "/account" : "/profile";

  return (
    <>
      {menuOpen && (
        <CatalogScreen categories={categories} topicPaths={topicPaths} onClose={closeMenu} />
      )}
      <nav
        aria-label={t("mainNav")}
        className="fixed inset-x-0 bottom-0 z-50 h-[var(--tab-bar)] border-t border-line bg-bg pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
      >
        <div className="grid h-full grid-cols-5 px-1 pb-2.5 pt-1.5">
          <Tab href="/" label={nav("home")} icon={ICONS.home} active={!menuOpen && pathname === "/"} />
          <Tab
            label={t("catalog")}
            icon={ICONS.grid}
            active={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            expanded={menuOpen}
          />
          <Tab
            label={nav("cart")}
            icon={ICONS.bag}
            active={false}
            badge={mounted ? cartCount : 0}
            onClick={() => {
              setMenuOpen(false);
              openCart();
            }}
          />
          <Tab
            href="/wishlist"
            label={nav("wishlist")}
            icon={ICONS.heart}
            active={!menuOpen && pathname.startsWith("/wishlist")}
            badge={mounted ? favCount : 0}
          />
          <Tab
            href={cabinetHref}
            label={t("cabinet")}
            icon={ICONS.user}
            active={!menuOpen && pathname.startsWith(cabinetHref)}
          />
        </div>
      </nav>
    </>
  );
}

function Tab({
  href,
  label,
  icon,
  active,
  badge = 0,
  onClick,
  expanded,
}: {
  href?: string;
  label: string;
  icon: string;
  active: boolean;
  badge?: number;
  onClick?: () => void;
  expanded?: boolean;
}) {
  const className = cn(
    "relative flex flex-col items-center justify-center gap-[3px] text-[11px] leading-[14px]",
    active ? "font-bold text-ink" : "font-medium text-muted",
  );
  const body = (
    <>
      <svg viewBox="0 0 24 24" aria-hidden className="h-[26px] w-[26px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d={icon} />
      </svg>
      {label}
      {badge > 0 && (
        <span className="absolute left-1/2 top-0 ml-[5px] flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-red px-1 text-[11px] font-bold tabular-nums text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} aria-current={active ? "page" : undefined} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-expanded={expanded} className={className}>
      {body}
    </button>
  );
}

function CatalogScreen({
  categories,
  topicPaths,
  onClose,
}: {
  categories: Category[];
  topicPaths: string[];
  onClose: () => void;
}) {
  const t = useTranslations("header");
  const nav = useTranslations("nav");
  const health = useTranslations("health");
  const contact = useTranslations("contact");
  const ref = useDialog<HTMLDivElement>(true, onClose);
  const shelves = categories.filter(isStocked);
  const healthLinks = HEALTH_LINKS.filter((l) => l.key !== "quiz" && isNavigable(l.href, topicPaths));
  const customerLinks = [
    { href: "/delivery", label: nav("menu.delivery") },
    { href: "/payment", label: nav("payment") },
    { href: "/guarantee", label: t("guarantee") },
    { href: "/loyalty", label: t("loyalty") },
    { href: "/about", label: nav("aboutUs") },
    { href: "/contact", label: nav("contact") },
  ];

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-catalog-title"
      tabIndex={-1}
      onClick={(e) => {
        // Close on any followed link: Aksiyalar from /products changes only the
        // query, and the pathname effect would leave the screen covering it.
        if ((e.target as HTMLElement).closest("a")) onClose();
      }}
      className="fixed inset-x-0 top-0 bottom-[var(--tab-bar)] z-40 overflow-y-auto bg-bg lg:hidden"
    >
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between pl-4 pr-2 pt-3">
          <h2 id="mobile-catalog-title" className="text-[28px] font-bold leading-[34px]">
            {t("catalog")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeCatalog")}
            className="flex h-11 w-11 items-center justify-center"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d={ICONS.close} />
            </svg>
          </button>
        </div>

        <nav aria-label={nav("shopByCategories")} className="flex flex-col">
          <Link href={SALE_HREF} className={cn(MENU_ROW, "font-bold text-red")}>
            <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red/10">
              %
            </span>
            {nav("topDeals")}
          </Link>
          {shelves.map((c) => (
            <Link key={c.id} href={`/products/${c.slug}`} className={MENU_ROW}>
              <CategoryThumb slug={c.slug} size={44} />
              <span className="min-w-0 flex-1">{c.name}</span>
              <ChevronIcon />
            </Link>
          ))}
          <Link href="/brands" className={MENU_ROW}>
            <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tile text-sm font-bold">
              Aa
            </span>
            {nav("brands")}
            <ChevronIcon />
          </Link>
        </nav>

        <div className="px-4">
          <Link href="/quiz" className="flex flex-col gap-1.5 rounded-[22px] bg-dark-panel p-[18px] text-white">
            <span className="text-lg font-bold">{nav("quiz")}</span>
            <span className="text-sm text-on-dark-2">{t("quizSub")}</span>
          </Link>
        </div>

        {healthLinks.length > 0 && (
          <LinkPanel label={health("goal.plural")} links={healthLinks.map((l) => ({ href: l.href, label: nav(l.key) }))} />
        )}
        <LinkPanel label={t("customers")} links={customerLinks} />

        <div className="flex flex-col gap-1 px-4">
          <a href={`tel:${BRAND.contact.phoneHref}`} className="text-[22px] font-bold">
            {BRAND.contact.phone}
          </a>
          <span className="text-sm text-ink-2">{contact("workHours")}</span>
          <span className="pt-2 text-sm">
            <LocaleLinks />
          </span>
        </div>
      </div>
    </div>
  );
}

function LinkPanel({ label, links }: { label: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={label} className="mx-4 flex flex-col rounded-[20px] bg-tile py-1.5">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="flex min-h-[52px] items-center justify-between px-4 text-base">
          {l.label}
          <ChevronIcon />
        </Link>
      ))}
    </nav>
  );
}

const MENU_ROW =
  "flex min-h-16 items-center gap-3.5 border-b border-[#EEF0F1] px-4 text-[17px] font-medium";
