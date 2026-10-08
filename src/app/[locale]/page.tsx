import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, localBusinessLd, organizationLd, websiteLd } from "@/lib/seo/jsonld";
import { byDeepestDiscount } from "@/lib/shop/discounts";
import { promotable } from "@/lib/shop/curation";
import { productCutout } from "@/lib/content/product-cutouts";
import { toMenuDeal, type MenuDeal } from "@/components/layout/menu-deal";
import { SALE_HREF } from "@/components/layout/nav-links";
import { Link } from "@/lib/i18n/navigation";
import { HeroSlider, WeeklyDeal, type HeroSlide } from "@/components/home/HomeHero";
import { BrandPanel } from "@/components/home/BrandPanel";
import {
  HomeAudience,
  HomeCategories,
  HomeFaqHelp,
  HomeNews,
  HomeOrigin,
  HomeSeo,
  HomeServices,
  HomeTrust,
  ProductGrid,
  ProductRow,
  PromoBanner,
  QuickChips,
  SectionHead,
} from "@/components/home/HomeBlocks";
import { isStocked } from "@/lib/shop/categories";
import { cutoutOf } from "@/lib/catalog/product-facts";

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
  Design: HomeV3 (desktop) / HomeMobileV3 (phones).

  Every product, price and discount on the page comes from the catalogue, and
  everything drawn from it asks for `assortment: "core"` with a real photo, so
  an accessory never headlines the page. The rails, in order:

  - Aksiyadagi mahsulotlar — products whose price really dropped
  - Swiss Energy panel     — that brand's line
  - Sara mahsulotlar       — the rest of the catalogue, deals excluded. The
    design calls this "Koʻp sotib olinadi"; with no sales history behind it,
    that would be a claim, so it keeps the curated title.
*/
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [categories, listing, promotions, t, meta, nav] = await Promise.all([
    shopflow.getCategories(locale),
    shopflow.getProducts({ locale, sort: "popular", pageSize: 50, assortment: "core" }),
    shopflow.getPromotions(locale).catch(() => []),
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "meta" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  // Products with a cutout pack shot lead every rail: they are the supplement
  // lines the design is built around, the rest (coffee, devices) follow.
  const catalogue = [...promotable(listing.items)].sort(
    (a, b) => Number(!cutoutOf(a)) - Number(!cutoutOf(b)),
  );
  const shelves = categories.filter(isStocked);
  const deals = byDeepestDiscount(catalogue).slice(0, 6);
  const dealIds = new Set(deals.map((p) => p.id));
  const weeklyDeals = deals.map(toMenuDeal).filter((d): d is MenuDeal => d !== null);
  const swissEnergy = catalogue
    .filter((p) => p.slug.startsWith("swiss-energy-") && cutoutOf(p))
    .slice(0, 8);
  const curated = catalogue.filter((p) => !dealIds.has(p.id)).slice(0, 12);
  const bundle = promotions.find((p) => p.type === "buy_x_get_y");

  const slides: HeroSlide[] = (t.raw("slides") as Omit<HeroSlide, "image">[]).map((s) => ({
    ...s,
    image: productCutout(s.href.replace(/^\/product\//, "")) ?? null,
  }));

  return (
    <>
      <JsonLd data={organizationLd(locale)} />
      <JsonLd data={websiteLd(locale)} />
      <JsonLd data={localBusinessLd()} />
      <h1 className="sr-only">{meta("homeTitle")}</h1>
      <div className="flex flex-col gap-8 pb-9 pt-1 lg:gap-16 lg:pb-[72px] lg:pt-6">
        <QuickChips categories={shelves} saleLabel={nav("topDeals")} label={nav("shopByCategories")} />

        <section className="wrap -mt-3 grid gap-5 lg:mt-0 lg:grid-cols-[minmax(0,2.55fr)_minmax(300px,1fr)]">
          <HeroSlider slides={slides} />
          {weeklyDeals.length > 0 && (
            <div className="hidden lg:block">
              <WeeklyDeal deals={weeklyDeals} variant="desktop" />
            </div>
          )}
        </section>

        <HomeCategories categories={shelves} />

        {weeklyDeals[0] && (
          <section className="wrap lg:hidden">
            <WeeklyDeal deals={weeklyDeals} variant="mobile" />
          </section>
        )}

        <HomeTrust />

        {deals.length > 0 && (
          <section aria-labelledby="home-deals" className="wrap flex flex-col gap-3.5 lg:gap-6">
            <SectionHead id="home-deals" title={t("v3.deals.title")} href={SALE_HREF} label={t("v3.deals.all")} shortLabel={t("v3.all")} />
            <ProductRow products={deals} />
          </section>
        )}

        <BrandPanel products={swissEnergy} />

        {curated.length > 0 && (
          <section aria-labelledby="home-curated" className="wrap flex flex-col gap-3.5 lg:gap-6">
            <SectionHead id="home-curated" title={t("catalog.title")} href="/products" label={t("v3.popular.all")} shortLabel={t("v3.all")} />
            <ProductGrid products={curated} mobileLimit={6} />
            <Link
              href="/products"
              className="flex h-12 items-center justify-center rounded-sm bg-tile text-base font-semibold transition-colors hover:bg-tile-hover md:hidden"
            >
              {t("v3.popular.allProducts")}
            </Link>
          </section>
        )}

        <PromoBanner promo={bundle} />
        <HomeAudience locale={locale} />
        <HomeServices />
        <HomeOrigin />
        <HomeNews locale={locale} />
        <HomeFaqHelp />
        <HomeSeo />
      </div>
    </>
  );
}
