"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { isApiConfigured } from "@/lib/api/client";
import { accountAreaAvailable } from "@/lib/config/demo";
import { useDialog } from "@/lib/ui/useDialog";
import type { Locale } from "@/lib/i18n/routing";
import type { Category } from "@/lib/shopflow/types";
import { TopBar } from "./TopBar";
import { CartButton } from "./CartButton";
import { CatalogMenu } from "./CatalogMenu";
import { SALE_HREF } from "./nav-links";
import { SearchBox } from "./SearchBox";
import { WishlistLink } from "./WishlistLink";
import { CompareLink } from "./CompareLink";
import { AccountLink } from "./AccountLink";
import { Logo } from "./Logo";
import { ICONS } from "./header-item";
import type { MenuDeal } from "./menu-deal";
import { isStocked } from "@/lib/shop/categories";

/*
  Design: HeaderV3 (lg and up) and HeaderMobileV3 (below lg, where the fixed
  tab bar carries the navigation).

  Only the desktop header is sticky. On a phone the tab bar is always on
  screen, and a sticky 116px header on top of it would leave a third of an
  844px screen for the page. On desktop the utility row folds away once the
  page scrolls and the main row plus the category row stay.
*/
export function Header({
  categories = [],
  topicPaths = [],
  deal = null,
}: {
  categories?: Category[];
  /** Health families that have at least one published page — see nav-sections. */
  topicPaths?: string[];
  deal?: MenuDeal | null;
}) {
  const t = useTranslations("header");
  const nav = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shelves = categories.filter(isStocked);
  // Hidden until the account area can answer: the link and the route read the
  // same predicate, so the link can never point at a 404.
  const showAccount = accountAreaAvailable(isApiConfigured());

  return (
    <header className="z-50 w-full border-b border-line bg-bg text-ink lg:sticky lg:top-0">
      <div className="hidden lg:block">
        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
            scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
          )}
          aria-hidden={scrolled}
          inert={scrolled}
        >
          <TopBar />
        </div>

        <div className="wrap flex h-[76px] items-center gap-5">
          <Link href="/" aria-label={t("homeLabel")} className="shrink-0">
            <Logo className="text-[34px]" />
          </Link>
          <CatalogMenu categories={categories} topicPaths={topicPaths} deal={deal} />
          <SearchBox categories={categories} className="min-w-0 flex-1" />
          <nav aria-label={t("userNav")} className="flex shrink-0 gap-1">
            <CompareLink label={t("compare")} />
            <WishlistLink label={nav("wishlist")} />
            {showAccount && <AccountLink />}
            <CartButton label={nav("cart")} />
          </nav>
        </div>

        <nav aria-label={nav("shopByCategories")} className="wrap no-scrollbar flex gap-[26px] overflow-x-auto">
          <CategoryLink href={SALE_HREF} active={false} className="font-semibold text-red">
            {nav("topDeals")}
          </CategoryLink>
          {shelves.map((c) => {
            const href = `/products/${c.slug}`;
            return (
              <CategoryLink key={c.id} href={href} active={pathname === href}>
                {c.name}
              </CategoryLink>
            );
          })}
          <CategoryLink href="/brands" active={pathname.startsWith("/brands")}>
            {nav("brands")}
          </CategoryLink>
        </nav>
      </div>

      <MobileHeader categories={categories} />
    </header>
  );
}

function CategoryLink({
  href,
  active,
  className,
  children,
}: {
  href: string;
  active: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "shrink-0 whitespace-nowrap border-b-2 py-3.5 text-[15px] font-medium transition-colors hover:border-ink",
        active ? "border-ink font-bold" : "border-transparent",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function MobileHeader({ categories }: { categories: Category[] }) {
  const t = useTranslations("header");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const searchRef = useDialog<HTMLDivElement>(searchOpen, closeSearch);
  const other: Locale = locale === "uz" ? "ru" : "uz";

  useEffect(() => setSearchOpen(false), [pathname]);

  return (
    <div className="lg:hidden">
      <div className="flex h-14 items-center justify-between pl-4 pr-2">
        <Link href="/" aria-label={t("homeLabel")}>
          <Logo className="text-[30px]" />
        </Link>
        <div className="flex items-center">
          <Link href="/delivery" className="flex h-11 items-center gap-1 px-2 text-sm font-semibold">
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICONS.pin} />
            </svg>
            {t("city")}
          </Link>
          <Link
            href={pathname}
            locale={other}
            aria-label={t("switchLocale")}
            className="flex h-11 items-center px-2 text-sm font-semibold uppercase"
          >
            {other}
          </Link>
          <a
            href={`tel:${BRAND.contact.phoneHref}`}
            aria-label={t("call")}
            className="flex h-11 w-11 items-center justify-center"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICONS.phone} />
            </svg>
          </a>
        </div>
      </div>
      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-haspopup="dialog"
          className="flex h-12 w-full items-center gap-2.5 rounded-[14px] bg-tile px-3.5 text-left text-base text-muted"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={ICONS.search} />
          </svg>
          {t("searchShort")}
        </button>
      </div>

      {searchOpen && (
        <div
          ref={searchRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("searchShort")}
          tabIndex={-1}
          className="fixed inset-0 z-[60] flex flex-col bg-bg px-4 pt-3"
        >
          <SearchBox
            categories={categories}
            autoFocus
            inline
            onNavigate={closeSearch}
            leading={
              <button
                type="button"
                onClick={closeSearch}
                aria-label={t("closeSearch")}
                className="-ml-3 flex h-12 w-11 shrink-0 items-center justify-center"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}
