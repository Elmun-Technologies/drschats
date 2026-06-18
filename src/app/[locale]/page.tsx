import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, organizationLd } from "@/lib/seo/jsonld";
import { HeroSlider } from "@/components/home/HeroSlider";
import { PressLogos } from "@/components/home/PressLogos";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { ScienceSection } from "@/components/home/ScienceSection";
import { TrustStats } from "@/components/home/TrustStats";
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
      <HeroSlider />
      <PressLogos />
      <ProductCarousel products={bestsellers.items} />
      <CategoryCarousel categories={categories} />
      <ScienceSection />
      <TrustStats />
      <HomeCTA />
    </>
  );
}
