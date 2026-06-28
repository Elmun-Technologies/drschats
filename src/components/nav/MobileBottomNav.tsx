"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/store";

export function MobileBottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { lines, open } = useCart();
  const cartCount = lines.reduce((s, l) => s + l.quantity, 0);

  function isActive(href: string) {
    if (href === "/") return /^\/[a-z]{2}\/?$/.test(pathname);
    return pathname.includes(href);
  }

  const tabs = [
    {
      href: "/",
      label: t("home"),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 12L12 3l9 9M4 10.5V20a1 1 0 001 1h5v-5h4v5h5a1 1 0 001-1V10.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/products",
      label: t("products"),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      href: null,
      label: t("cart"),
      onClick: open,
      icon: (
        <div className="relative">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-ink">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </div>
      ),
    },
    {
      href: "/contact",
      label: t("contact"),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-surface md:hidden">
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = tab.href ? isActive(tab.href) : false;
          const cls = `flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${active ? "text-accent" : "text-muted"}`;

          if ("onClick" in tab && tab.onClick) {
            return (
              <button key={tab.label} onClick={tab.onClick} className={cls}>
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          }

          return (
            <Link key={tab.label} href={tab.href as string} className={cls}>
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
