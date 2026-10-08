"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth/store";
import { useWishlist } from "@/lib/wishlist/store";

/*
  Design: AccountNavV3 (desktop sidebar) and the menu list at the bottom of
  AccountMobileV3. One list, two placements: beside the content from lg,
  below it on a phone.
*/
const ITEMS = [
  { key: "orders", href: "/account", d: "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2" },
  { key: "subs", href: "/account/subscriptions", d: "M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4" },
  { key: "fav", href: "/wishlist", d: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" },
  { key: "quiz", href: "/quiz", d: "M9 11l3 3 8-8M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11" },
  { key: "profile", href: "/profile", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" },
] as const;

export type AccountSection = (typeof ITEMS)[number]["key"];

export function AccountShell({ active, children }: { active: AccountSection; children: ReactNode }) {
  return (
    <div className="wrap grid items-start gap-6 pb-9 pt-2 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 lg:pb-[72px] lg:pt-8">
      <div className="hidden lg:block">
        <AccountNav active={active} variant="sidebar" />
      </div>
      <div className="flex min-w-0 flex-col gap-6 lg:gap-8">{children}</div>
      <div className="-mx-4 lg:hidden">
        <AccountNav active={active} variant="list" />
      </div>
    </div>
  );
}

export function AccountNav({ active, variant }: { active: AccountSection; variant: "sidebar" | "list" }) {
  const t = useTranslations("account");
  const tv = useTranslations("account.v3");
  const nav = useTranslations("nav");
  const user = useSession((s) => s.user);
  const signOut = useSession((s) => s.signOut);
  const favCount = useWishlist((s) => s.items.length);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const label = (key: AccountSection) =>
    key === "orders" ? t("orders") : key === "subs" ? tv("subs") : key === "fav" ? nav("wishlist") : key === "quiz" ? tv("quiz") : tv("profile");
  const sidebar = variant === "sidebar";

  return (
    <nav aria-label={tv("nav")} className={cn("flex flex-col", sidebar ? "gap-1" : "border-t border-[#EEF0F1]")}>
      {sidebar && user && <UserBadge name={user.name} phone={user.phone} />}
      {ITEMS.map((item) => {
        const on = item.key === active && (item.href !== "/account" || pathname === "/account" || pathname.startsWith("/account/orders"));
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 text-base",
              sidebar ? "rounded-sm px-3.5 py-3 hover:bg-tile" : "min-h-14 border-b border-[#EEF0F1] px-4 text-[17px]",
              sidebar && on && "bg-tile font-bold",
            )}
          >
            <Icon d={item.d} />
            {label(item.key)}
            {item.key === "fav" && mounted && favCount > 0 && <span className="ml-auto text-sm text-muted">{favCount}</span>}
            {!sidebar && <Icon d="M9 6l6 6-6 6" className={cn("h-[18px] w-[18px] text-[#8A8F95]", !(item.key === "fav" && mounted && favCount > 0) && "ml-auto")} />}
          </Link>
        );
      })}
      {user && (
        <button
          type="button"
          onClick={signOut}
          className={cn(
            "flex items-center gap-3 text-left text-base text-ink-2 hover:text-ink",
            sidebar ? "mt-2 border-t border-line px-3.5 pb-3 pt-[18px]" : "min-h-14 px-4 text-[17px]",
          )}
        >
          <Icon d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
          {t("signOut")}
        </button>
      )}
    </nav>
  );
}

export function UserBadge({ name, phone, large = false }: { name: string; phone: string; large?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3.5", large ? "" : "px-1 pb-[18px] pt-1.5")}>
      <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-[22px] font-bold text-white">
        {name.trim().charAt(0).toUpperCase() || "·"}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={cn("truncate font-bold", large ? "text-xl" : "text-lg")}>{name}</span>
        <span className="text-sm text-ink-2">{phone}</span>
      </span>
    </div>
  );
}

function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
