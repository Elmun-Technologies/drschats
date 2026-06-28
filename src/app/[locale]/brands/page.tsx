import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, itemListLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { PageHero } from "@/components/page/PageHero";
import { CardGrid, type GridCard } from "@/components/page/CardGrid";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.brands" });
  return buildPageMetadata({ locale, path: "/brands", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function BrandsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.brands");
  const items = t.raw("items") as GridCard[];

  return (
    <div className="pb-24">
      <JsonLd data={itemListLd(t("title"), items.map((i) => ({ name: i.title, description: i.text })))} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/brands` }])} />
      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <CardGrid items={items} columns={3} />
    </div>
  );
}
