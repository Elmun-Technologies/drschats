"use client";

import { useCallback, useState } from "react";
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

/*
  Navigation leads with health intent, not with the catalogue: visitors arrive
  with "I can't sleep", not with "magnesium". Goals and symptoms therefore sit
  ahead of the shop, and the shop is what they funnel into.
*/
const BADGE_TONE: Record<string, string> = {
  sale: "bg-accent-soft text-accent-strong",
  hot: "bg-danger/10 text-danger",
};

const navItems = [
  { key: "home", href: "/" },
  { key: "quiz", href: "/quiz", badge: "hot" },
  { key: "goals", href: "/goals" },
  { key: "symptoms", href: "/symptoms" },
  { key: "programs", href: "/programs" },
  { key: "vitamins", href: "/vitamins" },
  { key: "products", href: "/products" },
  { key: "experts", href: "/experts" },
  { key: "blog", href: "/blog" },
] as const;

export function Header({ categories = [] }: { categories?: Category[] }) {
  const t = useTranslations("nav");
  const h = useTranslations("header");
  const badges = useTranslations("badges");
  const contact = useTranslations("contact");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // Stable identity, or useDialog's effect tears down and re-runs every render.
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const menuRef = useDialog<HTMLDivElement>(menuOpen, closeMenu);

  return (
    <header className="border-b border-line bg-ink">
      <TopBar />

      {/* Main row */}
      <Container className="flex h-[72px] items-center gap-4">
        <Link href="/" aria-label="Go Vita" className="shrink-0">
          <Logo />
        </Link>

        <SearchBox categories={categories} className="hidden flex-1 md:block" />

        <div className="hidden items-center gap-2 lg:flex">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 5a2 2 0 012-2h2l2 5-2 1a12 12 0 005 5l1-2 5 2v2a2 2 0 01-2 2A16 16 0 013 5z" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="leading-tight">
            <div className="text-xs text-muted">{h("needHelp")}</div>
            <div className="text-sm font-bold text-fg">{h("phone")}</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
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
      <Container className="pb-3 md:hidden">
        <SearchBox categories={categories} />
      </Container>

      {/* Nav row (sticky). `relative` anchors the catalogue panel, which drops
          out of this row rather than out of the page. */}
      <div className="sticky top-0 z-40 hidden border-t border-line bg-ink/95 backdrop-blur lg:block">
        <Container className="relative flex h-14 items-center gap-7">
          <CatalogMenu categories={categories} />
          <nav className="flex items-center gap-7">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-1.5 text-sm font-semibold transition-colors",
                    active ? "text-accent-strong" : "text-fg hover:text-accent-strong",
                  )}
                >
                  {t(item.key)}
                  {"badge" in item && item.badge && (
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                      BADGE_TONE[item.badge],
                    )}>
                      {badges(item.badge)}
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
              {navItems.map((item) => (
                <Link key={item.key} href={item.href} onClick={() => setMenuOpen(false)} className="border-b border-line/50 py-4 font-display text-xl font-semibold">
                  {t(item.key)}
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
                  <ul className="flex flex-col">
                    {categories.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/products/${c.slug}`}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-between gap-3 border-b border-line/50 py-3 text-base font-semibold"
                        >
                          {c.name}
                          {c.productCount ? (
                            <span className="text-xs tabular-nums text-faint">{c.productCount}</span>
                          ) : null}
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
                  className="mt-2 block text-base font-semibold text-fg transition-colors hover:text-accent-strong"
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
