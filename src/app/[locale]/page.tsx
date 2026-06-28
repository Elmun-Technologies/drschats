import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, organizationLd } from "@/lib/seo/jsonld";
import { HeroBento } from "@/components/home/HeroBento";
import { TopCategories } from "@/components/home/TopCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { PromoBanners } from "@/components/home/PromoBanners";
import { StatsBand } from "@/components/home/StatsBand";
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

  const [categories, bestsellers, topRated] = await Promise.all([
    shopflow.getCategories(locale),
    shopflow.getProducts({ locale, sort: "popular", pageSize: 8 }),
    shopflow.getProducts({ locale, sort: "new", pageSize: 8 }),
  ]);

  return (
    <>
      <JsonLd data={organizationLd()} />
      <HeroBento />
      <TopCategories categories={categories} />
      <FeaturedProducts products={bestsellers.items} />
      <PromoBanners />
      <ProductCarousel products={topRated.items} />
      <StatsBand />
      <BlogTeaser locale={locale} />
      <HomeCTA />
    </>
  );
}
