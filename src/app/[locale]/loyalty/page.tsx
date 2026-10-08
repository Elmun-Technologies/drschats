import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { COMMERCE, thousands } from "@/lib/config/commerce";
import { InfoHeader, InfoShell } from "@/components/info/InfoShell";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

/*
  One discount system, on one page.

  This page used to carry a second, invented one: Standard / Silver / Gold tiers
  at 5 / 10 / 15% unlocked by 500 000 and 1 500 000 so'm of spending, plus a
  points scheme with three point-to-so'm rates. None of it existed anywhere in
  the code — the cart has never applied a tier discount — so a customer who
  reached "Silver" would have been told they had a 10% discount that no order
  form would honour.

  What is left is what the storefront actually implements, with the numbers
  read from src/lib/config/commerce.ts so the page cannot drift from the till:
  the first-order discount, Subscribe & Save, and the VIP club's free shipping.
  The partner programme stays, as a contractual B2B arrangement, because that
  is what it is.
*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "loyalty" });
  return buildPageMetadata({
    locale,
    path: "/loyalty",
    title: `${t("title")} — Go Vita`,
    description: t("subtitle"),
  });
}

export default async function LoyaltyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.v3");
  const { discounts } = COMMERCE;
  const amount = thousands(COMMERCE.freeShippingOver);
  const hours = COMMERCE.delivery.tashkent.hours;

  const programs = [
    {
      value: `−${discounts.firstOrderPercent}%`,
      title: t("loyalty.firstTitle"),
      text: t("loyalty.firstText", { percent: discounts.firstOrderPercent }),
      note: t("loyalty.firstNote"),
      dark: true,
    },
    {
      value: `−${discounts.subscriptionFirstPercent}% → −${discounts.subscriptionRecurringPercent}%`,
      title: t("loyalty.subTitle"),
      text: t("loyalty.subText", { first: discounts.subscriptionFirstPercent, next: discounts.subscriptionRecurringPercent }),
      note: t("loyalty.subNote"),
      dark: false,
    },
    {
      value: t("free"),
      title: t("loyalty.clubTitle"),
      text: t("loyalty.clubText", { amount }),
      note: t("loyalty.clubNote"),
      dark: false,
    },
  ];
  const how = t.raw("loyalty.how") as { title: string; text: string }[];
  const rules = (t.raw("loyalty.rules") as string[]).map((r) =>
    r.replace("{amount}", amount).replace("{hours}", String(hours)),
  );

  return (
    <InfoShell active="loyalty" crumb={t("nav.loyaltyShort")}>
      <InfoHeader title={t("nav.loyaltyShort")} lead={t("loyalty.lead")} />

      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        {programs.map((p) => (
          <div
            key={p.title}
            className={cn(
              "flex flex-col gap-3 rounded-[24px] p-6 lg:min-h-[340px] lg:p-7",
              p.dark ? "bg-dark-panel text-white" : "bg-tile",
            )}
          >
            <span className="text-[34px] font-bold leading-10 lg:text-[40px] lg:leading-[44px]">{p.value}</span>
            <h2 className="text-xl font-bold leading-7">{p.title}</h2>
            <p className={cn("text-[15px] leading-[22px]", p.dark ? "text-on-dark-2" : "text-ink-2")}>{p.text}</p>
            <p className={cn("mt-auto pt-3 text-sm leading-5", p.dark ? "text-on-dark-2" : "text-ink-2")}>{p.note}</p>
          </div>
        ))}
      </div>

      <section aria-labelledby="loyalty-how" className="flex flex-col gap-4">
        <h2 id="loyalty-how" className="text-[22px] font-bold leading-7 lg:text-[26px] lg:leading-8">{t("loyalty.howTitle")}</h2>
        <ol className="grid gap-3 lg:grid-cols-3 lg:gap-4">
          {how.map((h, i) => (
            <li key={h.title} className="flex flex-col gap-2 rounded-[20px] border border-line p-5 lg:p-6">
              <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-[15px] font-bold text-white">{i + 1}</span>
              <h3 className="mt-1 text-lg font-bold">{h.title}</h3>
              <p className="text-[15px] leading-[22px] text-ink-2">{h.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="loyalty-rules" className="flex flex-col gap-3 rounded-[20px] bg-tile p-5 lg:p-7">
        <h2 id="loyalty-rules" className="text-[22px] font-bold leading-7">{t("loyalty.rulesTitle")}</h2>
        <ul className="flex flex-col gap-2.5">
          {rules.map((r) => (
            <li key={r} className="flex items-start gap-3 text-base leading-6">
              <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5 9-10" />
              </svg>
              {r}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col items-start gap-4 rounded-[20px] border border-line p-5 lg:p-7">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold">{t("loyalty.b2bTitle")}</h2>
          <p className="max-w-[640px] text-[15px] leading-[22px] text-ink-2">{t("loyalty.b2bText")}</p>
        </div>
        <Link href="/partners" className={buttonVariants("secondary")}>{t("loyalty.b2bCta")}</Link>
      </div>
    </InfoShell>
  );
}
