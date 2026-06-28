import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, faqLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { PageHero } from "@/components/page/PageHero";
import { CardGrid, type GridCard } from "@/components/page/CardGrid";
import { FaqSection } from "@/components/page/FaqSection";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.guarantee" });
  return buildPageMetadata({ locale, path: "/guarantee", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function GuaranteePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.guarantee");
  const dt = await getTranslations("pages");
  const points = t.raw("points") as GridCard[];
  const faq = t.raw("faq") as { question: string; answer: string }[];

  return (
    <div className="pb-24">
      <JsonLd data={faqLd(faq)} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/guarantee` }])} />
      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <CardGrid items={points} columns={3} />
      <FaqSection heading={dt("deliveryFaqTitle")} items={faq} />
    </div>
  );
}
