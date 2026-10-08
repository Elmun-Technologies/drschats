import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, faqLd } from "@/lib/seo/jsonld";
import Image from "next/image";
import { formatMoney } from "@/lib/utils";
import { COMMERCE, thousands } from "@/lib/config/commerce";
import { onlinePaymentAvailable } from "@/lib/config/payments";
import { InfoFaq, InfoHeader, InfoShell } from "@/components/info/InfoShell";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "delivery" });
  return buildPageMetadata({ locale, path: "/delivery", title: `${t("title")} — Go Vita`, description: t("subtitle") });
}

const ICONS = {
  courier: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  post: "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9",
  pickup: "M4 10.5L12 4l8 6.5V20H4v-9.5zM9 20v-6h6v6",
};

export default async function DeliveryPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.v3");
  const pg = await getTranslations("pages");
  const faq = pg.raw("deliveryFaq") as { question: string; answer: string }[];

  // One shipping rule, read from config/commerce.ts.
  const vars = {
    amount: thousands(COMMERCE.freeShippingOver),
    fee: thousands(COMMERCE.shippingFee),
    hours: COMMERCE.delivery.tashkent.hours,
  };
  const options = [
    { icon: ICONS.courier, title: t("delivery.courierTitle"), value: t("delivery.courierTime", vars), text: t("delivery.feeNote", vars) },
    { icon: ICONS.post, title: t("delivery.postTitle"), value: t("delivery.postTime"), text: t("delivery.feeNote", vars) },
    { icon: ICONS.pickup, title: t("delivery.pickupTitle"), value: t("free"), text: t("delivery.pickupText") },
  ];
  const rows = [
    { label: t("delivery.rowCourier"), below: formatMoney(COMMERCE.shippingFee, locale) },
    { label: t("delivery.rowPost"), below: formatMoney(COMMERCE.shippingFee, locale) },
    { label: t("delivery.rowPickup"), below: t("free") },
  ];

  return (
    <InfoShell active="delivery" crumb={t("nav.delivery")}>
      <JsonLd data={faqLd(faq)} />
      <InfoHeader title={t("nav.delivery")} lead={t("delivery.lead")} leadShort={t("delivery.leadShort")} />

      <div className="flex flex-col overflow-hidden rounded-[20px] bg-dark-panel text-white lg:flex-row lg:items-center lg:gap-8 lg:rounded-[28px] lg:p-7 lg:pl-8">
        <div className="relative h-40 w-full lg:order-2 lg:h-[172px] lg:w-[260px] lg:shrink-0 lg:overflow-hidden lg:rounded-[16px]">
          <Image src="/images/stock/st-delivery-door.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 260px" className="object-cover" />
        </div>
        <div className="flex flex-col gap-2 p-5 lg:flex-1 lg:p-0">
          <p className="text-[22px] font-bold leading-7 lg:text-[32px] lg:leading-[38px]">
            <span className="hidden lg:inline">{t("delivery.heroTitle", vars)}</span>
            <span className="lg:hidden">{t("delivery.heroShort", vars)}</span>
          </p>
          <p className="text-[15px] text-on-dark-2">{t("delivery.heroText")}</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        {options.map((o) => (
          <div key={o.title} className="flex gap-4 rounded-[20px] bg-tile p-4 lg:flex-col lg:gap-0 lg:p-6">
            <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={o.icon} />
              </svg>
            </span>
            <div className="flex flex-col gap-0.5 lg:mt-5 lg:gap-2">
              <h2 className="text-[15px] font-bold lg:text-lg">{o.title}</h2>
              <p className="text-lg font-bold lg:text-[26px] lg:leading-8">{o.value}</p>
              <p className="text-sm leading-5 text-ink-2">{o.text}</p>
            </div>
          </div>
        ))}
      </div>

      <section aria-labelledby="delivery-prices" className="hidden rounded-[20px] border border-line p-7 lg:block">
        <h2 id="delivery-prices" className="text-[22px] font-bold">{t("delivery.pricesTitle")}</h2>
        <table className="mt-5 w-full text-left text-base">
          <thead>
            <tr className="border-b border-line text-sm text-ink-2">
              <th scope="col" className="pb-3 font-medium">{t("delivery.colMethod")}</th>
              <th scope="col" className="w-[25%] pb-3 font-medium">{t("delivery.colBelow", vars)}</th>
              <th scope="col" className="w-[25%] pb-3 font-medium">{t("delivery.colAbove", vars)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-line">
                <th scope="row" className="py-4 font-semibold">{r.label}</th>
                <td className="py-4">{r.below}</td>
                <td className="py-4 font-bold">{t("free")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <InfoFaq title={t("faqTitle")} items={faq} />

      <p className="text-sm text-muted">{onlinePaymentAvailable() ? t("delivery.noteOnline") : t("delivery.noteCall")}</p>
    </InfoShell>
  );
}
