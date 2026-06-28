"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { TopBar } from "./TopBar";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { CartButton } from "./CartButton";
import { Logo } from "./Logo";

const navItems = [
  { key: "home", href: "/" },
  { key: "products", href: "/products" },
  { key: "ingredients", href: "/ingredients", badge: "sale" },
  { key: "experts", href: "/experts", badge: "hot" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const h = useTranslations("header");
  const badges = useTranslations("badges");
  const common = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push({ pathname: "/products", query: { q } });
  }

  return (
    <header className="border-b border-line bg-ink">
      <TopBar />

      {/* Main row */}
      <Container className="flex h-[72px] items-center gap-4">
        <Link href="/" aria-label="Alimkhanov" className="shrink-0">
          <Logo />
        </Link>

        <form onSubmit={submitSearch} className="hidden flex-1 items-center rounded-full border border-line-strong bg-surface pl-5 pr-1.5 md:flex">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={common("search") + "…"}
            className="h-11 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-faint"
          />
          <button type="submit" aria-label={common("search")} className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-ink">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
          </button>
        </form>

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

      {/* Nav row (sticky) */}
      <div className="sticky top-0 z-40 hidden border-t border-line bg-ink/95 backdrop-blur lg:block">
        <Container className="flex h-14 items-center gap-7">
          <Link href="/products" className="flex items-center gap-2 rounded-full bg-blue px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
            {t("shopByCategories")}
          </Link>
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
                      item.badge === "sale" ? "bg-accent-soft text-accent-strong" : "bg-danger/10 text-danger",
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-ink lg:hidden"
          >
            <div className="container-px flex h-16 items-center justify-between border-b border-line">
              <Logo />
              <button onClick={() => setMenuOpen(false)} aria-label={t("closeMenu")} className="flex h-10 w-10 items-center justify-center rounded-full border border-line">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="container-px pt-4">
              <form onSubmit={submitSearch} className="flex items-center rounded-xl border border-line bg-surface px-4">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={common("search") + "…"}
                  className="h-12 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-faint"
                />
                <button type="submit" aria-label={common("search")} onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
                  </svg>
                </button>
              </form>
            </div>
            <nav className="container-px flex flex-col gap-1 pt-4">
              {navItems.map((item) => (
                <Link key={item.key} href={item.href} onClick={() => setMenuOpen(false)} className="border-b border-line/50 py-4 font-display text-xl font-semibold last:border-0">
                  {t(item.key)}
                </Link>
              ))}
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
