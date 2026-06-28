import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, faqLd } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { FaqSection } from "@/components/page/FaqSection";
import { Link } from "@/lib/i18n/navigation";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "delivery" });
  return buildPageMetadata({ locale, path: "/delivery", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

const SHIPPING_ICONS = [
  "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
];

const PAYMENT_ICONS = [
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  "M17 9V7a5 5 0 00-10 0v2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2h-2z",
  "M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v2h16V6H4zm0 5v5h16v-5H4zm3 2h4v2H7v-2z",
  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
];

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("delivery");
  const pg = await getTranslations("pages");
  const faq = pg.raw("deliveryFaq") as { question: string; answer: string }[];

  const options = [
    { title: t("tashkentTitle"), time: t("tashkentTime"), free: t("tashkentFree"), icon: SHIPPING_ICONS[0] },
    { title: t("regionsTitle"), time: t("regionsTime"), free: t("regionsFree"), icon: SHIPPING_ICONS[1] },
    { title: t("pickupTitle"), time: t("pickupTime"), free: t("pickupFree"), icon: SHIPPING_ICONS[2] },
  ];
  const payments = [
    { label: t("payClick"), icon: PAYMENT_ICONS[0] },
    { label: t("payPayme"), icon: PAYMENT_ICONS[1] },
    { label: t("payCod"), icon: PAYMENT_ICONS[2] },
    { label: t("payInstallment"), icon: PAYMENT_ICONS[3] },
  ];

  return (
    <div className="pb-32 pt-10">
      <JsonLd data={faqLd(faq)} />
      <Container>
        {/* Header */}
        <Reveal>
          <header className="max-w-2xl">
            <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-strong">
              {t("eyebrow")}
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{t("title")}</h1>
            <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
          </header>
        </Reveal>

        {/* Free shipping banner */}
        <Reveal className="mt-10">
          <div className="flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent-soft p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-fg">{t("freeBannerTitle")}</p>
              <p className="text-sm text-muted">{t("freeBannerDesc")}</p>
            </div>
          </div>
        </Reveal>

        {/* Shipping options */}
        <section className="mt-14">
          <Reveal>
            <h2 className="mb-6 font-display text-2xl font-bold">{t("shippingTitle")}</h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {options.map((o, i) => (
              <Reveal key={o.title} index={i}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-ink p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d={o.icon} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-bold">{o.title}</h3>
                  <p className="mt-1 font-semibold text-accent">{o.time}</p>
                  {o.free && <p className="mt-3 flex-1 text-sm text-muted">{o.free}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Payment methods */}
        <section className="mt-16">
          <Reveal>
            <h2 className="mb-6 font-display text-2xl font-bold">{t("paymentTitle")}</h2>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {payments.map((p, i) => (
              <Reveal key={p.label} index={i}>
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d={p.icon} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-fg">{p.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Operator note + CTA */}
        <Reveal className="mt-12">
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-muted">{t("note")}</p>
            <Link href="/contact" className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:bg-accent-strong">
              {t("contactCta")}
            </Link>
          </div>
        </Reveal>
      </Container>

      <FaqSection heading={pg("deliveryFaqTitle")} items={faq} />
    </div>
  );
}
