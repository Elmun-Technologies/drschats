import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { isApiConfigured } from "@/lib/api/client";
import { accountAreaAvailable } from "@/lib/config/demo";
import { CLUB_BOT_USERNAME, TELEGRAM_LOGIN_ON } from "@/lib/config/telegram-login";
import { ORDERS_IN_DB } from "@/lib/shopflow";
import { currentCustomer } from "@/lib/customer/current";
import { clubCard } from "@/lib/customer/club";
import { ordersFor } from "@/lib/bot/store";
import { AccountView } from "@/components/account/AccountView";
import { TelegramLogin } from "@/components/account/TelegramLogin";
import { TelegramCabinet } from "@/components/account/TelegramCabinet";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return {
    ...buildPageMetadata({
      locale,
      noindex: true,
      path: "/account",
      title: t("title"),
      description: t("subtitle"),
    }),
    robots: { index: false, follow: false },
  };
}

/*
  Three cabinets behind one URL: the FastAPI account (or its demo) when that
  is configured; otherwise the Telegram cabinet — «Telegram orqali kirish»
  when signed out (lib/customer), orders and the club card when signed in.
*/
export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (accountAreaAvailable(isApiConfigured())) return <AccountView />;
  if (!TELEGRAM_LOGIN_ON) notFound();
  // The link exists in the header, so a shop without its database sends it to the browser's own orders.
  if (!ORDERS_IN_DB) redirect(`/${locale}/orders`);

  const customer = await currentCustomer().catch(() => null);
  if (!customer) return <SignIn />;

  const [orders, club] = await Promise.all([
    ordersFor(customer.chatId, 30, locale === "ru" ? "ru" : "uz").catch(() => []),
    clubCard(customer.phone9).catch(() => null),
  ]);
  const listed = orders.flatMap((o) => (o.code ? [{ ...o, code: o.code }] : []));
  return <TelegramCabinet customer={customer} orders={listed} club={club} locale={locale} />;
}

async function SignIn() {
  const t = await getTranslations("account.tg");
  const perks = [
    { text: t("perkOrders"), d: "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2" },
    { text: t("perkStatus"), d: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" },
    { text: t("perkCheckout"), d: "M9 11l3 3 8-8M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11" },
    { text: t("perkClub"), d: "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" },
  ];
  return (
    <div className="wrap grid items-start gap-8 pb-9 pt-3 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-12 lg:pb-20 lg:pt-12">
      <TelegramLogin bot={CLUB_BOT_USERNAME} />
      <div className="flex flex-col gap-5 lg:pt-3">
        <h2 className="text-[22px] font-bold leading-7 lg:text-h-section">{t("perksTitle")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {perks.map((p) => (
            <li key={p.text} className="flex flex-col gap-3 rounded-[20px] bg-tile p-[22px]">
              <svg viewBox="0 0 24 24" aria-hidden className="h-[26px] w-[26px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={p.d} />
              </svg>
              <span className="text-base leading-6 text-ink-2">{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
