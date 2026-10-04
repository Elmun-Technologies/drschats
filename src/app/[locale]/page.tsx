import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, organizationLd } from "@/lib/seo/jsonld";
import { HeroBento } from "@/components/home/HeroBento";
import { TrustRibbon } from "@/components/home/TrustRibbon";
import { TopCategories } from "@/components/home/TopCategories";
import { DealOfDay } from "@/components/home/DealOfDay";
import { ProductCard } from "@/components/product/ProductCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/lib/i18n/navigation";
import { QuizPromo } from "@/components/home/QuizPromo";
import { AudienceDoors } from "@/components/home/AudienceDoors";
import { HomeFaq } from "@/components/home/HomeFaq";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { ScienceSection } from "@/components/home/ScienceSection";
import { byDeepestDiscount } from "@/lib/shop/discounts";
import { promotable } from "@/lib/shop/curation";

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

/*
  The home page in eight blocks.

  It used to be fourteen, and three of them were the same 30-SKU catalogue
  sliced three ways: "Chegirmali mahsulotlar", "Top mahsulotlar" and "Xitlar"
  each showed Delical, because with thirty products a second and third rail
  cannot help but repeat the first. A shopper who scrolls fourteen sections has
  not read fourteen sections.

  The eight, in order:

  1. hero + trust ribbon   — what the shop is, and the four facts about it
  2. six audience doors    — the one piece of navigation that is ours
  3. categories
  4. products              — one grid, the deep-discount card first, and no
                             product repeated anywhere on the page
  5. vitamin quiz          — "Vitamin tanlash", the entry to the recommender
  6. quality & documents   — trust, in the health colour
  7. FAQ                   — delivery, returns, authenticity
  8. Telegram club + CTA

  Everything drawn from the catalogue asks for `assortment: "core"`, so a
  thermometer or a balm can sit in the cart but never headline the page.

  What is still missing on purpose: a hero photograph of a person holding a
  product, and photographs of the six audience doors. Both need the Tashkent
  shoot described in docs/GOVITA-TAVSIYALAR.md — until then the hero shows the
  real pack shot, which is honest, rather than a stock model holding somebody
  else's bottle.
*/
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [categories, popular, t, common] = await Promise.all([
    shopflow.getCategories(locale),
    shopflow.getProducts({ locale, sort: "popular", pageSize: 50, assortment: "core" }),
    getTranslations({ locale, namespace: "home.catalog" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const catalogue = promotable(popular.items);
  const deals = byDeepestDiscount(catalogue);

  /*
    The deal card takes the deepest real discount, two more deals follow it,
    and the grid continues with everything that has not been shown yet. The
    page must never repeat a product: with one catalogue and one page, a
    repeated card is not "more choice", it is padding.
  */
  const dealBlock = deals.slice(0, 3);
  const shown = new Set(dealBlock.map((p) => p.id));
  const grid = catalogue.filter((p) => !shown.has(p.id)).slice(0, 8);

  return (
    <>
      <JsonLd data={organizationLd(locale)} />
      <div>
        <HeroBento products={catalogue.slice(0, 3)} />
        <TrustRibbon />
      </div>
      <AudienceDoors locale={locale} />
      <TopCategories categories={categories} />

      <Section tone="ink">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t("subtitle")} title={t("title")} />
          <Link href="/products" className={buttonVariants("secondary")}>
            {common("viewAll")}
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {dealBlock[0] && (
            <div className="col-span-2">
              <DealOfDay product={dealBlock[0]} />
            </div>
          )}
          {dealBlock.slice(1).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
          {grid.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i + dealBlock.length} />
          ))}
        </div>
      </Section>

      <QuizPromo locale={locale} />
      <ScienceSection />
      <HomeFaq />
      <NewsletterSignup />
    </>
  );
}
