import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, organizationLd } from "@/lib/seo/jsonld";
import { HeroBento } from "@/components/home/HeroBento";
import { TrustRibbon } from "@/components/home/TrustRibbon";
import { TopCategories } from "@/components/home/TopCategories";
import { DiscountRail } from "@/components/home/DiscountRail";
import { DealOfDay } from "@/components/home/DealOfDay";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BestSellers } from "@/components/home/BestSellers";
import { TopProducts } from "@/components/home/TopProducts";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/Container";
import { PromoBanners } from "@/components/home/PromoBanners";
import { StatsBand } from "@/components/home/StatsBand";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { HomeCTA } from "@/components/home/HomeCTA";
import { QuizPromo } from "@/components/home/QuizPromo";
import { AudienceDoors } from "@/components/home/AudienceDoors";
import { ProgramsRail } from "@/components/home/ProgramsRail";
import { DoctorAdvice } from "@/components/home/DoctorAdvice";
import { HomeFaq } from "@/components/home/HomeFaq";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { Testimonials } from "@/components/home/Testimonials";
import { ScienceSection } from "@/components/home/ScienceSection";
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

  // One pass over the popular set produces the discounted catalogue rail.
  // The editorial hero deliberately stays focused on the brand story instead
  // of duplicating a product promotion above the fold.
  const deals = byDeepestDiscount(popular.items);

  return (
    <>
      <JsonLd data={organizationLd()} />
      <HeroBento products={bestsellers} />
      <TrustRibbon />
      <AudienceDoors locale={locale} />
      <TopCategories categories={categories} />
      {/* Deal of the day: the catalogue's deepest real discount, flanked by
          the runners-up. The rail below carries the rest of the markdowns. */}
      {deals.length > 0 && (
        <section className="border-t border-line bg-surface-2/40 py-14 sm:py-16">
          <Container>
            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <DealOfDay product={deals[0]} />
              {deals.slice(1, 3).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i + 1} />
              ))}
            </div>
          </Container>
        </section>
      )}
      <DiscountRail products={deals.slice(3, 11)} />
      <QuizPromo />
      {/* Top 3 products with full feature breakdown — the most persuasive
          single section on the page for a health-conscious buyer. */}
      <TopProducts products={bestsellers} />
      <FeaturedProducts products={popular.items} />
      <ProgramsRail locale={locale} />
      {/* The catalogue past the bestsellers: another eight real products so
          the home page shows most of what the shop actually stocks. */}
      <BestSellers products={popular.items.slice(12, 20)} namespace="home.catalog" />
      <PersonalizedRail allProducts={popular.items} />
      <PromoBanners />
      {/* Social proof — only renders when there are real reviews to show. */}
      <Testimonials products={popular.items} />
      <ScienceSection />
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
