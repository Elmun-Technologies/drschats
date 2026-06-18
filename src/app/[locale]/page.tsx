import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, organizationLd } from "@/lib/seo/jsonld";
import { HeroMinimal } from "@/components/home/HeroMinimal";
import { PressLogos } from "@/components/home/PressLogos";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { StatsBand } from "@/components/home/StatsBand";
import { QualityList } from "@/components/home/QualityList";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { HomeCTA } from "@/components/home/HomeCTA";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildPageMetadata({
    locale,
    path: "/",
    title: t("homeTitle"),
    description: t("homeDescription"),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [categories, bestsellers] = await Promise.all([
    shopflow.getCategories(locale),
    shopflow.getProducts({ locale, sort: "popular", pageSize: 8 }),
  ]);

  return (
    <>
      <JsonLd data={organizationLd()} />
      <HeroMinimal />
      <PressLogos />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={bestsellers.items} />
      <QualityList />
      <StatsBand />
      <BlogTeaser locale={locale} />
      <HomeCTA />
    </>
  );
}
