import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, faqLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { PAYMENT_PROVIDERS } from "@/lib/config/payments";
import { InfoFaq, InfoHeader, InfoShell } from "@/components/info/InfoShell";
import { cn } from "@/lib/utils";
import { staticPageMetadata } from "@/lib/seo/page-meta";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "payment", "/payment");
}

export default async function PaymentPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.v3");
  const faq = t.raw("payment.faq") as { question: string; answer: string }[];

  // A provider shows as available only once its merchant id is configured;
  // until then it says "soon" — the page never promises a route checkout lacks.
  const methods = [
    ...PAYMENT_PROVIDERS.map((p) => ({
      title: p.label,
      badge: p.configured ? t("online") : t("soon"),
      text: p.configured ? t("payment.providerText", { name: p.label }) : t("payment.providerSoon", { name: p.label }),
      muted: !p.configured,
    })),
    { title: t("payment.codTitle"), badge: t("onDelivery"), text: t("payment.codText"), muted: false },
  ];

  return (
    <InfoShell active="payment" crumb={t("nav.paymentShort")}>
      <JsonLd data={faqLd(faq)} />
      <JsonLd data={breadcrumbLd([{ name: t("nav.payment"), url: `${SITE_URL}/${locale}/payment` }])} />
      <InfoHeader title={t("nav.payment")} lead={t("payment.lead")} />

      <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
        {methods.map((m) => (
          <div key={m.title} className="flex min-h-[150px] flex-col justify-between gap-6 rounded-[20px] bg-tile p-5 lg:min-h-[180px] lg:p-7">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-bold lg:text-[30px] lg:leading-9">{m.title}</h2>
              <span className={cn("inline-flex h-7 items-center rounded-pill bg-bg px-2.5 text-[13px] font-semibold", m.muted && "text-ink-2")}>
                {m.badge}
              </span>
            </div>
            <p className="text-[15px] leading-[22px] text-ink-2 lg:text-base lg:leading-6">{m.text}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-4 rounded-[20px] border border-line p-5 lg:items-center lg:gap-5 lg:px-8 lg:py-7">
        <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tile lg:h-14 lg:w-14">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold lg:text-xl">{t("payment.safeTitle")}</h2>
          <p className="text-[15px] leading-[22px] text-ink-2 lg:text-base lg:leading-6">{t("payment.safeText")}</p>
        </div>
      </div>

      <InfoFaq title={t("faqTitle")} items={faq} />
    </InfoShell>
  );
}
