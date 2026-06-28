import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, faqLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { PageHero } from "@/components/page/PageHero";
import { FaqSection } from "@/components/page/FaqSection";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.guarantee" });
  return buildPageMetadata({ locale, path: "/guarantee", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

const POINT_ICONS = [
  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
];

export default async function GuaranteePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.guarantee");
  const dt = await getTranslations("pages");
  const points = t.raw("points") as { title: string; text: string }[];
  const faq = t.raw("faq") as { question: string; answer: string }[];

  return (
    <div className="pb-24">
      <JsonLd data={faqLd(faq)} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/guarantee` }])} />
      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <Container className="mt-14">
        {/* Big guarantee badge */}
        <Reveal>
          <div className="mb-12 flex flex-col items-center gap-4 rounded-3xl border border-accent/30 bg-accent-soft py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-ink">
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-display text-5xl font-extrabold text-accent">30</p>
            <p className="font-display text-xl font-bold text-fg">{t("badgeLabel")}</p>
            <p className="max-w-sm text-sm text-muted">{t("badgeDesc")}</p>
          </div>
        </Reveal>

        {/* Points */}
        <div className="grid gap-4 sm:grid-cols-3">
          {points.map((p, i) => (
            <Reveal key={p.title} index={i}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d={POINT_ICONS[i] ?? ""} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-fg">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Return steps */}
        <Reveal className="mt-14">
          <div className="rounded-2xl border border-line bg-ink p-8">
            <h2 className="mb-8 font-display text-xl font-bold">{t("howToReturn")}</h2>
            <div className="relative grid gap-6 sm:grid-cols-3">
              {[t("returnStep1"), t("returnStep2"), t("returnStep3")].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-ink">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>

      <FaqSection heading={dt("deliveryFaqTitle")} items={faq} />
    </div>
  );
}
