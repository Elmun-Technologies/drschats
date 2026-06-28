import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { Product, UpsellOffer } from "@/lib/shopflow/types";
import type { Expert } from "@/lib/content/experts";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { StarRating } from "@/components/ui/StarRating";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { BuyBox } from "@/components/product/BuyBox";
import { UpsellRail } from "@/components/product/UpsellRail";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { ProductTabs } from "@/components/product/ProductTabs";

export async function ProductTemplate({
  product,
  upsells,
  locale,
  reviewer,
}: {
  product: Product;
  upsells: UpsellOffer[];
  locale: Locale;
  reviewer?: Expert;
}) {
  const t = await getTranslations("product");

  return (
    <div className="pt-10">
      <StickyBuyBar product={product} />
      <Container>
        <Breadcrumb product={product} />

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} />
          <BuyBox product={product} reviewer={reviewer} />
        </div>

        {/* Highlights */}
        <Reveal className="mt-16">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {product.highlights.map((h) => (
              <div key={h} className="rounded-xl border border-line bg-surface p-5 text-sm font-medium text-fg">
                {h}
              </div>
            ))}
          </div>
        </Reveal>

        {/* Tabbed content: Description | Ingredients | FAQ */}
        <section className="mt-16">
          <ProductTabs product={product} t={{
            benefits: t("benefits"),
            ingredients: t("ingredients"),
            ingredientName: t("ingredientName"),
            ingredientAmount: t("ingredientAmount"),
            ingredientDV: t("ingredientDV"),
            howToUse: t("howToUse"),
            faq: t("faq"),
          }} />
        </section>

        {/* Upsells */}
        <section className="mt-20">
          <UpsellRail offers={upsells} />
        </section>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <section className="mb-32 mt-20">
            <Reveal>
              <h2 className="mb-8 font-display text-3xl font-bold tracking-tight">{t("reviews")}</h2>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              {product.reviews.map((r, i) => (
                <Reveal key={i} index={i}>
                  <figure className="h-full rounded-2xl border border-line bg-surface p-6">
                    <StarRating rating={r.rating} />
                    <blockquote className="mt-4 text-muted">&ldquo;{r.text}&rdquo;</blockquote>
                    <figcaption className="mt-4 text-sm font-medium text-fg">{r.author}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
