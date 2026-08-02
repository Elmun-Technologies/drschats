import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { Product, UpsellOffer } from "@/lib/shopflow/types";
import type { Expert } from "@/lib/content/experts";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { BuyBox } from "@/components/product/BuyBox";
import { UpsellRail } from "@/components/product/UpsellRail";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductReviews } from "@/components/product/ProductReviews";
import { HealthContext } from "@/components/product/HealthContext";
import type { HealthTopic } from "@/lib/content/health-topics";

export async function ProductTemplate({
  product,
  upsells,
  locale,
  reviewer,
  topics = [],
}: {
  product: Product;
  upsells: UpsellOffer[];
  locale: Locale;
  reviewer?: Expert;
  /** Health topics this product belongs to; empty hides the section. */
  topics?: HealthTopic[];
}) {
  const t = await getTranslations("product");

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="pt-10 pb-6">
      <StickyBuyBar product={product} />
      <Container>
        <Breadcrumb product={product} />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="lg:sticky lg:top-24">
            <ProductGallery
              images={product.images}
              discountPercent={discountPercent}
              inStock={product.inStock}
            />
          </div>
          <BuyBox product={product} reviewer={reviewer} />
        </div>

        {product.highlights.length > 0 && (
          <section aria-labelledby="highlights-heading" className="mt-20">
            <Reveal>
              <h2 id="highlights-heading" className="mb-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {t("highlights")}
              </h2>
            </Reveal>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {product.highlights.map((h, i) => (
                <Reveal key={h} index={i} as="li">
                  <div className="flex h-full items-start gap-3 rounded-xl border border-line bg-surface p-5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <svg viewBox="0 0 20 20" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-fg">{h}</span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </section>
        )}

        <HealthContext topics={topics} />

        <section id="details" aria-label={t("tabsLabel")} className="mt-20 scroll-mt-28">
          <ProductTabs
            product={product}
            t={{
              benefits: t("benefits"),
              ingredients: t("ingredients"),
              ingredientName: t("ingredientName"),
              ingredientAmount: t("ingredientAmount"),
              ingredientDV: t("ingredientDV"),
              howToUse: t("howToUse"),
              faq: t("faq"),
              tabsLabel: t("tabsLabel"),
            }}
          />
        </section>

        {upsells.length > 0 && (
          <section className="mt-20">
            <UpsellRail offers={upsells} />
          </section>
        )}

        {product.reviews.length > 0 && (
          <section id="reviews" aria-labelledby="reviews-heading" className="mt-20 scroll-mt-28">
            <Reveal>
              <h2 id="reviews-heading" className="mb-8 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {t("reviews")}
              </h2>
            </Reveal>
            <ProductReviews
              reviews={product.reviews}
              rating={product.rating}
              reviewCount={product.reviewCount}
            />
          </section>
        )}
      </Container>
    </div>
  );
}
