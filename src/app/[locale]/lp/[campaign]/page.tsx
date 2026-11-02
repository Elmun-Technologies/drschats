import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { getAllProducts } from "@/lib/shop/all-products";
import { Link } from "@/lib/i18n/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { clampDescription } from "@/lib/seo/page-meta";
import { resolveCampaign, type Campaign } from "@/lib/marketing/campaign";
import { ProductCard } from "@/components/product/ProductCard";
import { HomeTrust } from "@/components/home/HomeBlocks";
import { SALE_HREF } from "@/components/layout/nav-links";
import { cn } from "@/lib/utils";

/*
  Ad landing pages for paid traffic (context ads, social). Not indexed: each
  one repeats a shelf, a brand or a product page. UTM parameters are captured
  on the order for attribution (lib/analytics/attribution.ts).

  The slug decides the content (lib/marketing/campaign.ts); an unknown slug
  is a 404. The first screen carries the product, its price and «Savatga» —
  someone who clicked an ad for a product should not have to look for it.
*/
export const dynamicParams = true;

type Params = Promise<{ locale: Locale; campaign: string }>;

async function load(locale: Locale, slug: string): Promise<Campaign | null> {
  const [listing, categories] = await Promise.all([
    getAllProducts({ locale, sort: "popular" }),
    shopflow.getCategories(locale).catch(() => []),
  ]);
  return resolveCampaign(decodeURIComponent(slug), listing.items, categories);
}

async function copyOf(campaign: Campaign, locale: Locale) {
  const t = await getTranslations({ locale, namespace: "home.v3.lp" });
  switch (campaign.kind) {
    case "sale":
      return { eyebrow: t("eyebrowSale"), title: t("saleTitle"), lead: t("saleLead"), href: SALE_HREF };
    case "category":
      return {
        eyebrow: t("eyebrowCategory"),
        title: campaign.category.name,
        lead: campaign.category.description || t("categoryLead", { name: campaign.category.name }),
        href: `/products/${campaign.category.slug}`,
      };
    case "brand":
      return {
        eyebrow: t("eyebrowBrand"),
        title: campaign.brand.name,
        lead: t("brandLead", { brand: campaign.brand.name }),
        href: `/brands/${campaign.brand.slug}`,
      };
    case "product":
      return {
        eyebrow: campaign.category?.name ?? t("eyebrowProduct"),
        title: campaign.product.name,
        lead: campaign.product.tagline,
        href: `/product/${campaign.product.slug}`,
      };
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, campaign: slug } = await params;
  const campaign = await load(locale, slug);
  if (!campaign) return {};
  const copy = await copyOf(campaign, locale);
  return buildPageMetadata({
    locale,
    path: `/lp/${slug}`,
    title: copy.title,
    description: clampDescription(copy.lead || copy.title),
    noindex: true,
  });
}

export default async function CampaignLanding({ params }: { params: Params }) {
  const { locale, campaign: slug } = await params;
  setRequestLocale(locale);

  const campaign = await load(locale, slug);
  if (!campaign) notFound();
  const [copy, t] = await Promise.all([copyOf(campaign, locale), getTranslations("home.v3.lp")]);
  const [lead, ...rest] = campaign.products;

  return (
    <div className="flex flex-col gap-8 pb-9 pt-3 lg:gap-14 lg:pb-[72px] lg:pt-6">
      <section className="wrap grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5">
        <div className="flex flex-col justify-center gap-2 rounded-[24px] bg-tile p-5 lg:gap-4 lg:rounded-[28px] lg:p-12">
          <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted lg:text-sm">{copy.eyebrow}</span>
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-[40px] lg:leading-[46px]">{copy.title}</h1>
          {copy.lead && <p className="max-w-[560px] text-[15px] leading-[22px] text-ink-2 lg:text-[17px] lg:leading-[26px]">{copy.lead}</p>}
          <Link
            href={copy.href}
            className="mt-2 hidden h-12 items-center self-start rounded-sm bg-ink px-6 text-button font-semibold text-white transition-colors hover:bg-ink-2 lg:inline-flex"
          >
            {campaign.kind === "product" ? t("details") : t("all")}
          </Link>
        </div>
        <div className="hidden h-full lg:block">
          <ProductCard product={lead} index={0} />
        </div>
      </section>

      <section aria-labelledby="lp-products" className={cn("wrap flex flex-col gap-3.5 lg:gap-6", rest.length === 0 && "lg:hidden")}>
        <h2 id="lp-products" className="text-[22px] font-bold leading-7 max-lg:sr-only lg:text-h-section lg:leading-9">
          {campaign.kind === "product" ? t("moreTitle") : t("productsTitle")}
        </h2>
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 md:grid-cols-3 md:gap-x-3 md:gap-y-6 xl:grid-cols-4">
          {campaign.products.map((p, i) => (
            <div key={p.id} className={i === 0 ? "h-full lg:hidden" : "h-full"}>
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
        <Link
          href={copy.href}
          className="flex h-12 items-center justify-center rounded-sm bg-tile text-button font-semibold transition-colors hover:bg-tile-hover lg:hidden"
        >
          {campaign.kind === "product" ? t("details") : t("all")}
        </Link>
      </section>

      <HomeTrust />
    </div>
  );
}
