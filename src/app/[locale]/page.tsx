import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, organizationLd } from "@/lib/seo/jsonld";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/animation/Marquee";
import { ScienceSection } from "@/components/home/ScienceSection";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { BestSellers } from "@/components/home/BestSellers";
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

  const [categories, bestsellers, t] = await Promise.all([
    shopflow.getCategories(locale),
    shopflow.getProducts({ locale, sort: "popular", pageSize: 4 }),
    getTranslations("home"),
  ]);

  return (
    <>
      <JsonLd data={organizationLd()} />
      <Hero />
      <Marquee text={t("marquee")} />
      <ScienceSection />
      <CategoryShowcase categories={categories} />
      <BestSellers products={bestsellers.items} />
      <TrustStats />
      <HomeCTA />
    </>
  );
}
