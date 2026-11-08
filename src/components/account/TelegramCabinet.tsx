import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { cn, formatDate, formatMoney, formatNumber } from "@/lib/utils";
import { productCutout } from "@/lib/content/product-cutouts";
import { orderTrackToken } from "@/lib/messaging/tokens";
import { botDeepLink } from "@/lib/config/telegram-login";
import type { ClubCard } from "@/lib/customer/club";
import type { SignedInCustomer } from "@/lib/customer/current";
import { UserBadge } from "./AccountShell";
import { CopyCode, SignOutButton } from "./CabinetActions";
import { TelegramIcon } from "./TelegramLogin";

/*
  The cabinet for a customer signed in through the club bot (design:
  AccountV3). Orders are the ones the bot also lists — from this Telegram
  chat or with its proven phone — each opening the signed tracking page.
  The club card shows only what /admin/loyalty switched on.
*/

export interface CabinetOrder {
  code: string;
  status: string;
  stage: string;
  createdAt: Date | string;
  total: number;
  unverified: boolean;
  items: { slug: string; name: string; qty: number }[];
}

const LINKS = [
  { href: "/wishlist", key: "wishlist", d: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" },
  { href: "/quiz", key: "quiz", d: "M9 11l3 3 8-8M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11" },
  { href: "/profile", key: "profile", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" },
] as const;

export async function TelegramCabinet({
  customer,
  orders,
  club,
  locale,
}: {
  customer: SignedInCustomer;
  orders: CabinetOrder[];
  club: ClubCard | null;
  locale: Locale;
}) {
  const t = await getTranslations("account.tg");
  const ta = await getTranslations("account");
  const name = customer.name || customer.phone;
  const first = name.split(/\s+/)[0];
  const phone = customer.phone.replace(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/, "+998 $1 $2 $3 $4");
  const linkLabel = (key: (typeof LINKS)[number]["key"]) =>
    key === "wishlist" ? ta("shortcut.wishlist.title") : key === "quiz" ? ta("shortcut.quiz.title") : ta("shortcut.profile.title");

  return (
    <div className="wrap grid items-start gap-6 pb-9 pt-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 lg:pb-[72px] lg:pt-8">
      <aside className="order-last flex flex-col gap-4 lg:order-first">
        <UserBadge name={name} phone={phone} />
        <nav aria-label={ta("v3.nav")} className="flex flex-col gap-1 border-t border-line pt-3">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="flex min-h-11 items-center gap-3 rounded-sm px-3.5 text-base hover:bg-tile">
              <Icon d={l.d} />
              {linkLabel(l.key)}
            </Link>
          ))}
          <SignOutButton className="mt-2 border-t border-line px-3.5 pt-3" />
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col gap-6 lg:gap-8">
        <div className="flex flex-col gap-1">
          <p className="text-[15px] text-ink-2">{t("welcome", { name: first })}</p>
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-[36px] lg:leading-[42px]">{ta("title")}</h1>
        </div>

        {club && (club.points || club.referral) && (
          <section aria-labelledby="club-h" className="flex flex-col gap-4 rounded-[20px] bg-dark-panel p-5 text-white lg:p-7">
            <h2 id="club-h" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-on-dark-2">
              {t("club")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {club.points && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[15px] text-on-dark-2">{t("points")}</span>
                  <span className="text-[30px] font-bold leading-9">{t("pointsValue", { amount: formatNumber(club.points.balance) })}</span>
                  <span className="text-sm leading-5 text-on-dark-2">
                    {t("pointsHint", { percent: club.points.earnPercent, share: club.points.maxSharePercent })}
                  </span>
                </div>
              )}
              {club.referral && (
                <div className="flex flex-col gap-2">
                  <span className="text-[15px] text-on-dark-2">{t("referral")}</span>
                  {club.referral.code ? (
                    <>
                      <span className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-[26px] font-bold tracking-[0.06em]">{club.referral.code}</span>
                        <span className="text-ink">
                          <CopyCode code={club.referral.code} />
                        </span>
                      </span>
                      <span className="text-sm leading-5 text-on-dark-2">{t("referralHint", { percent: club.referral.friendPercent })}</span>
                    </>
                  ) : (
                    <span className="text-[15px] leading-6">{t("referralLater")}</span>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <section aria-labelledby="orders-h" className="flex flex-col gap-4">
          <h2 id="orders-h" className="text-[22px] font-bold leading-7 lg:text-h-section">
            {t("orders")}
          </h2>
          {orders.length === 0 ? (
            <div className="flex flex-col items-start gap-4 rounded-[20px] bg-tile p-6">
              <p className="text-base text-ink-2">{t("noOrders")}</p>
              <Link href="/products" className="flex h-12 items-center rounded-sm bg-ink px-5 text-base font-semibold text-white">
                {t("toCatalog")}
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {orders.map((o) => (
                <li key={o.code}>
                  <OrderRow order={o} locale={locale} detailsLabel={t("details")} orderNo={t("orderNo", { id: o.code })} itemsLabel={t("items", { count: o.items.length })} unverifiedLabel={t("unverified")} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col items-start gap-3 rounded-[20px] border border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] leading-6 text-ink-2">{t("botHint")}</p>
          <a href={botDeepLink()} target="_blank" rel="noopener noreferrer" className="flex h-12 shrink-0 items-center gap-2 rounded-sm border border-line-strong px-5 text-base font-semibold">
            <TelegramIcon />
            {t("openBot")}
          </a>
        </div>
      </div>
    </div>
  );
}

function OrderRow({
  order,
  locale,
  detailsLabel,
  orderNo,
  itemsLabel,
  unverifiedLabel,
}: {
  order: CabinetOrder;
  locale: Locale;
  detailsLabel: string;
  orderNo: string;
  itemsLabel: string;
  unverifiedLabel: string;
}) {
  const images = [...new Set(order.items.map((i) => productCutout(i.slug)).filter((s): s is string => Boolean(s)))].slice(0, 4);
  const created = typeof order.createdAt === "string" ? order.createdAt : order.createdAt.toISOString();
  return (
    <Link
      href={`/track/${orderTrackToken(order.code)}`}
      className="flex items-center justify-between gap-4 rounded-[20px] border border-line p-4 hover:border-line-strong lg:p-6"
    >
      <span className="flex min-w-0 flex-col gap-3">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[17px] font-bold lg:text-lg">{orderNo}</span>
          <span className="text-sm text-muted">{formatDate(created, locale)}</span>
          <span
            className={cn(
              "inline-flex h-[26px] items-center whitespace-nowrap rounded-pill px-2.5 text-[13px] font-semibold",
              order.status === "shipped" ? "bg-ink text-white" : order.status === "cancelled" ? "bg-red/10 text-red" : "bg-chip-strong text-ink",
            )}
          >
            {order.stage}
          </span>
        </span>
        <span className="flex items-center gap-2">
          {images.map((src) => (
            <span key={src} className="relative h-12 w-12 rounded-[10px] bg-tile lg:h-14 lg:w-14">
              <Image src={src} alt="" fill sizes="56px" className="object-contain p-1" />
            </span>
          ))}
          <span className="text-sm text-muted">{itemsLabel}</span>
        </span>
        {order.unverified && <span className="text-[13px] text-muted">{unverifiedLabel}</span>}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-lg font-bold lg:text-xl">{formatMoney(order.total, locale)}</span>
        <span className="inline-flex items-center gap-1 text-[15px] font-semibold">
          {detailsLabel}
          <Icon d="M9 6l6 6-6 6" className="h-4 w-4" />
        </span>
      </span>
    </Link>
  );
}

function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
