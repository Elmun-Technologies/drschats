"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { TopBar } from "./TopBar";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { CartButton } from "./CartButton";
import { CatalogMenu } from "./CatalogMenu";
import { SearchBox } from "./SearchBox";
import { WishlistLink } from "./WishlistLink";
import { Logo } from "./Logo";
import { useDialog } from "@/lib/ui/useDialog";
import { BRAND } from "@/lib/brand";
import type { Category } from "@/lib/shopflow/types";
import { isNavigable } from "@/lib/content/nav-sections";

/*
  One short, shop-first row: the logo already means "home", and the health
  journeys (quiz, programs, goals) live one tap away inside the catalogue
  panel instead of crowding the main line with badges.
*/
const navItems = [
  { key: "sale", href: "/products?sort=deals", badge: "sale" },
  { key: "delivery", href: "/delivery" },
  { key: "experts", href: "/experts" },
  { key: "blog", href: "/blog" },
] as const;

// Nav badges are neutral. "Sale" used to be the one rose pill in the header —
// the only red-adjacent colour on a milky, graphite and gold surface — and a
// discount label is not an alert. Graphite text on the pale ground announces
// itself without borrowing the warning colour.
const BADGE_STYLES: Record<string, string> = {
  sale: "border border-line-strong bg-surface-2 text-fg",
};

export function Header({
  categories = [],
  topicPaths = [],
}: {
  categories?: Category[];
  /** Health families that have at least one published page — see nav-sections. */
  topicPaths?: string[];
}) {
  const items = navItems.filter((item) => isNavigable(item.href, topicPaths));
  const t = useTranslations("nav");
  const h = useTranslations("header");
  const contact = useTranslations("contact");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  /*
    The search field collapses to an icon once the page is scrolled.

    Above the fold it earns its width — it is the fastest route into a 30-SKU
    catalogue. Once someone has scrolled past the hero they are reading, not
    searching, and a full-width field plus its own row on mobile was eating
    roughly a fifth of a phone screen in chrome. It comes back on a tap, and it
    comes back on its own when a new page is opened.
  */
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setSearchOpen(false), [pathname]);

  const searchCollapsed = scrolled && !searchOpen;
  // Stable identity, or useDialog's effect tears down and re-runs every render.
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const menuRef = useDialog<HTMLDivElement>(menuOpen, closeMenu);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-ink/90 backdrop-blur-xl">
      {/*
        The utility bar is an announcement, not navigation: it collapses once
        the shopper starts scrolling, which hands back 40px of screen on every
        page below the fold. It returns the moment the page is back at the top.
      */}
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
        )}
        aria-hidden={scrolled}
      >
        <TopBar />
      </div>

      {/* Main row */}
      <Container
        className={cn(
          "flex items-center gap-4 transition-[height] duration-300 ease-out",
          scrolled ? "h-16" : "h-[72px]",
        )}
      >
        <Link href="/" aria-label="Go Vita" className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          {searchCollapsed ? (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t("search")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg transition-colors hover:border-line-strong hover:bg-surface"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" />
              </svg>
            </button>
          ) : (
            <SearchBox categories={categories} />
          )}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-soft text-signal">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 5a2 2 0 012-2h2l2 5-2 1a12 12 0 005 5l1-2 5 2v2a2 2 0 01-2 2A16 16 0 013 5z" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="leading-tight">
            <div className="text-xs text-muted">{h("needHelp")}</div>
            <a href={`tel:${BRAND.contact.phoneHref}`} className="text-sm font-bold text-fg hover:text-signal">
              {h("phone")}
            </a>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {/* Mobile has no room for the field once the page moves; the icon
              reopens the row below. */}
          {searchCollapsed && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t("search")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg md:hidden"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" />
              </svg>
            </button>
          )}
          <LocaleSwitcher className="hidden sm:block" />
          <WishlistLink label={t("wishlist")} />
          <CartButton label={t("cart")} />
          <button
            onClick={() => setMenuOpen(true)}
            aria-label={t("openMenu")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </Container>

      {/* Search, on mobile, in the header rather than two taps inside the
          burger menu. A shop whose search is hidden behind a menu icon reads
          as a shop without search — and phones are where most of this
          catalogue is browsed. */}
      {!searchCollapsed && (
        <Container className="pb-3 md:hidden">
          <SearchBox categories={categories} autoFocus={searchOpen} />
        </Container>
      )}

      {/* Nav row. Since header is sticky, this row simply stays visible */}
      <div className="hidden border-t border-line/40 lg:block">
        <Container className="relative flex h-14 items-center gap-7">
          <CatalogMenu categories={categories} topicPaths={topicPaths} />
          <nav className="flex items-center gap-7">
            {items.map((item) => {
              // No bare "/" entry any more (the logo is home), and the deals
              // link carries a query pathname never contains — so a plain
              // prefix check is exactly right for the links that remain.
              const active = pathname.startsWith(item.href);
              const hasBadge = "badge" in item && item.badge;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-2 py-4 text-sm font-semibold transition-colors overflow-hidden",
                    active ? "text-fg" : "text-fg/75 hover:text-fg",
                  )}
                >
                  <span>{t(`menu.${item.key}`)}</span>
                  {/* Underline marks position, so it is graphite, not gold. */}
                  <span className={cn(
                    "absolute bottom-3 left-0 h-0.5 bg-fg transition-all duration-300 ease-out",
                    active ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                  {hasBadge && (
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase",
                      BADGE_STYLES[item.badge],
                    )}>
                      {t(`badge.${item.badge}`)}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </Container>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-ink lg:hidden"
          >
            <div className="container-px flex h-16 items-center justify-between border-b border-line">
              <Logo />
              <button onClick={closeMenu} aria-label={t("closeMenu")} className="flex h-10 w-10 items-center justify-center rounded-full border border-line">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="container-px pt-4">
              <SearchBox categories={categories} onNavigate={() => setMenuOpen(false)} />
            </div>
            <nav className="container-px flex flex-col gap-1 overflow-y-auto pb-10 pt-4">
              {items.map((item) => (
                <Link key={item.key} href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-line/50 py-4 font-display text-xl font-semibold">
                  <span>{t(`menu.${item.key}`)}</span>
                  {"badge" in item && item.badge && (
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase",
                      BADGE_STYLES[item.badge],
                    )}>
                      {t(`badge.${item.badge}`)}
                    </span>
                  )}
                </Link>
              ))}

              {/* Personal pages sit below the health navigation rather than in
                  it: on desktop they are the icons in the header, and on
                  mobile there is no header row to put them in. */}
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="border-b border-line/50 py-4 font-display text-xl font-semibold"
              >
                {t("profile")}
              </Link>

              {/* The desktop catalogue panel has no mobile equivalent, so the
                  categories are listed here instead of being reachable only
                  through the shop page. */}
              {categories.length > 0 && (
                <>
                  <p className="pt-6 text-xs font-bold uppercase tracking-widest text-faint">
                    {t("shopByCategories")}
                  </p>
                  <ul className="grid grid-cols-2 gap-x-4">
                    {categories.filter((c) => c.productCount).map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/products/${c.slug}`}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-start justify-between gap-2 border-b border-line/50 py-3 text-sm font-semibold"
                        >
                          <span className="leading-snug">{c.name}</span>
                          <span className="shrink-0 text-xs tabular-nums text-faint">{c.productCount}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Hours, phone and address in the menu itself. For a pharmacy
                  audience these answer "are they open and can I reach them"
                  without a trip to the contact page. */}
              <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-faint">
                  {t("contact")}
                </p>
                <p className="mt-2 text-sm text-muted">{contact("workHours")}</p>
                <a
                  href={`tel:${BRAND.contact.phoneHref}`}
                  className="mt-2 block text-base font-semibold text-fg transition-colors hover:text-signal"
                >
                  {BRAND.contact.phone}
                </a>
                <p className="mt-1 text-sm text-muted">{contact("addressValue")}</p>
              </div>

              <div className="pt-6">
                <LocaleSwitcher />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
