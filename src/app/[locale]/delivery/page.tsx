import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, faqLd } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { FaqSection } from "@/components/page/FaqSection";

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
    { title: t("tashkentTitle"), time: t("tashkentTime"), free: t("tashkentFree") },
    { title: t("regionsTitle"), time: t("regionsTime"), free: t("regionsFree") },
    { title: t("pickupTitle"), time: t("pickupTime"), free: "" },
  ];
  const payments = [t("payClick"), t("payPayme"), t("payCod"), t("payInstallment")];

  return (
    <div className="pt-10">
      <JsonLd data={faqLd(faq)} />
      <Container>
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </header>

        <section className="mt-14">
          <p className="mb-6 text-sm font-semibold text-accent-strong">{t("shippingTitle")}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {options.map((o, i) => (
              <Reveal key={o.title} index={i}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-ink p-6">
                  <h3 className="font-display text-lg font-bold">{o.title}</h3>
                  <p className="mt-2 text-accent-strong">{o.time}</p>
                  {o.free && <p className="mt-3 text-sm text-muted">{o.free}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <p className="mb-6 text-sm font-semibold text-accent-strong">{t("paymentTitle")}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {payments.map((p, i) => (
              <Reveal key={p} index={i}>
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-5">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  <span className="text-sm font-medium text-fg">{p}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <p className="mt-12 max-w-2xl text-muted">{t("note")}</p>
      </Container>
      <FaqSection heading={pg("deliveryFaqTitle")} items={faq} />
    </div>
  );
}
