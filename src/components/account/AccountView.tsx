"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useSession } from "@/lib/auth/store";
import { useWishlist } from "@/lib/wishlist/store";
import { AuthForm } from "./AuthForm";
import { OrderHistory } from "./OrderHistory";
import { AccountShell, UserBadge } from "./AccountShell";

/*
  Design: LoginV3 / LoginMobileV3 when signed out, AccountV3 / AccountMobileV3
  when signed in. One route for both: the customer's question is "where are my
  orders", and answering it should not depend on guessing which URL they
  belong on. The session is restored from localStorage after mount, so the
  first render does not decide that nobody is signed in.
*/
export function AccountView() {
  const user = useSession((s) => s.user);
  const token = useSession((s) => s.token);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return <SignedOut pending />;
  if (!token || !user) return <SignedOut />;

  return <Dashboard name={user.name} phone={user.phone} />;
}

function SignedOut({ pending = false }: { pending?: boolean }) {
  const t = useTranslations("account");
  const tv = useTranslations("account.v3");
  const perks = [
    { title: t("orders"), text: tv("perkOrders"), d: ICON.bag },
    { title: tv("subs"), text: tv("perkSubs"), d: ICON.repeat },
    { title: t("shortcut.wishlist.title"), text: tv("perkFav"), d: ICON.heart },
    { title: tv("reminders"), text: tv("perkReminders"), d: ICON.bell },
  ];

  return (
    <div className="wrap grid items-start gap-8 pb-9 pt-3 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-12 lg:pb-20 lg:pt-12">
      {pending ? (
        <div className="flex flex-col gap-5 lg:rounded-[20px] lg:border lg:border-line lg:p-10">
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-[32px] lg:leading-[38px]">{t("title")}</h1>
          <div className="h-56 animate-pulse rounded-[20px] bg-tile" />
        </div>
      ) : (
        <AuthForm />
      )}
      <div className="flex flex-col gap-5 lg:pt-3">
        <h2 className="hidden text-h-section leading-9 font-bold lg:block">{tv("perksTitle")}</h2>
        <p className="hidden text-[17px] leading-[26px] text-ink-2 lg:block">{t("subtitle")}</p>
        <div className="hidden grid-cols-2 gap-3 lg:grid">
          {perks.map((p) => (
            <div key={p.title} className="flex flex-col gap-2 rounded-[20px] bg-tile p-[22px]">
              <Icon d={p.d} className="h-[26px] w-[26px]" />
              <span className="mt-1 text-lg font-bold">{p.title}</span>
              <span className="text-base leading-6 text-ink-2">{p.text}</span>
            </div>
          ))}
        </div>
        <p className="text-sm leading-5 text-muted">{t("guestNote")}</p>
      </div>
    </div>
  );
}

function Dashboard({ name, phone }: { name: string; phone: string }) {
  const t = useTranslations("account");
  const tv = useTranslations("account.v3");
  const favCount = useWishlist((s) => s.items.length);
  const tiles = [
    { href: "/wishlist", title: t("shortcut.wishlist.title"), text: tv("favCount", { count: favCount }), d: ICON.heart },
    { href: "/account/subscriptions", title: tv("subs"), text: tv("subsHint"), d: ICON.repeat },
    { href: "/quiz", title: tv("quiz"), text: tv("quizHint"), d: ICON.check },
    { href: "/profile", title: tv("profile"), text: tv("profileHint"), d: ICON.user },
  ];

  return (
    <AccountShell active="orders">
      <div className="lg:hidden">
        <UserBadge name={name} phone={phone} large />
      </div>
      <div className="hidden flex-col gap-1.5 lg:flex">
        <span className="text-base text-ink-2">{tv("welcome", { name })}</span>
        <h1 className="text-h-page leading-[42px] font-bold">{t("title")}</h1>
      </div>
      <h1 className="sr-only lg:hidden">{t("title")}</h1>
      <nav aria-label={t("shortcuts")} className="hidden grid-cols-4 gap-3 lg:grid">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="flex min-h-[140px] flex-col gap-1.5 rounded-[20px] bg-tile p-5 transition-colors hover:bg-tile-hover"
          >
            <Icon d={tile.d} className="h-[26px] w-[26px]" />
            <span className="mt-auto text-[17px] font-bold">{tile.title}</span>
            <span className="text-sm text-ink-2">{tile.text}</span>
          </Link>
        ))}
      </nav>
      <OrderHistory />
    </AccountShell>
  );
}

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICON = {
  bag: "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2",
  repeat: "M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  bell: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4",
  check: "M9 11l3 3 8-8M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6",
};
