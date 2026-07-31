import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, organizationLd } from "@/lib/seo/jsonld";
import { HeroBento } from "@/components/home/HeroBento";
import { TopCategories } from "@/components/home/TopCategories";
import { DiscountRail } from "@/components/home/DiscountRail";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { PromoBanners } from "@/components/home/PromoBanners";
import { StatsBand } from "@/components/home/StatsBand";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { HomeCTA } from "@/components/home/HomeCTA";
import { QuizPromo } from "@/components/home/QuizPromo";
import { ProgramsRail } from "@/components/home/ProgramsRail";
import { DoctorAdvice } from "@/components/home/DoctorAdvice";
import { HomeFaq } from "@/components/home/HomeFaq";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { RecentlyViewed } from "@/components/personalization/RecentlyViewed";
import { PersonalizedRail } from "@/components/personalization/PersonalizedRail";
import { byDeepestDiscount } from "@/lib/shop/discounts";

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

  // "Popular, top 8" is the head of "popular, top 50" — one request, not two.
  const [categories, popular, topRated] = await Promise.all([
    shopflow.getCategories(locale),
    shopflow.getProducts({ locale, sort: "popular", pageSize: 50 }),
    shopflow.getProducts({ locale, sort: "new", pageSize: 8 }),
  ]);

  const bestsellers = popular.items.slice(0, 8);

  // One pass over the popular set feeds both the countdown panel and the rail;
  // the deal is dropped from the rail so the same product is not sold twice on
  // one screen.
  const deals = byDeepestDiscount(popular.items);
  const [deal, ...restOfDeals] = deals;

  return (
    <>
      <JsonLd data={organizationLd()} />
      <HeroBento products={bestsellers} deal={deal} />
      <TopCategories categories={categories} />
      <DiscountRail products={restOfDeals.slice(0, 8)} />
      {/* Intent first: the consultant is the widest entry into the catalogue. */}
      <QuizPromo />
      <FeaturedProducts products={bestsellers} />
      <ProgramsRail locale={locale} />
      <PersonalizedRail allProducts={popular.items} />
      <PromoBanners />
      <RecentlyViewed allProducts={popular.items} />
      <ProductCarousel products={topRated.items} />
      <DoctorAdvice locale={locale} />
      <StatsBand />
      <BlogTeaser locale={locale} />
      <HomeFaq />
      <NewsletterSignup />
      <HomeCTA />
    </>
  );
}
