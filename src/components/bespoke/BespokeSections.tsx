"use client";

import { useTranslations } from "next-intl";
import type { Product, UpsellOffer } from "@/lib/shopflow/types";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { StarRating } from "@/components/ui/StarRating";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { BuyBox } from "@/components/product/BuyBox";
import { UpsellRail } from "@/components/product/UpsellRail";
import { FaqAccordion } from "@/components/product/FaqAccordion";

/**
 * Shared lower half for bespoke product pages (buy block, ingredients, upsell,
 * FAQ, reviews). Each bespoke page supplies its own unique cinematic hero +
 * benefit storytelling, then drops this in so the conversion-critical parts
 * stay consistent and maintained in one place.
 */
export function BespokeSections({
  product,
  upsells,
  accent = "accent",
}: {
  product: Product;
  upsells: UpsellOffer[];
  accent?: "accent" | "gold";
}) {
  const t = useTranslations("product");
  const numberColor = accent === "gold" ? "text-gold/40" : "text-faint";

  return (
    <>
      {/* Buy */}
      <section className="border-t border-line py-24">
        <Container>
          <Breadcrumb product={product} />
          <div className="mt-8 grid gap-12 lg:grid-cols-2">
            <ProductGallery images={product.images} />
            <BuyBox product={product} />
          </div>
        </Container>
      </section>

      {/* Ingredients + how to use */}
      <section className="border-t border-line py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight">{t("ingredients")}</h2>
                <div className="mt-8 overflow-hidden rounded-2xl border border-line">
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-line">
                      {product.ingredients.map((row) => (
                        <tr key={row.name} className="bg-surface">
                          <td className="px-6 py-4 font-medium text-fg">{row.name}</td>
                          <td className="px-6 py-4 text-right text-muted">{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
            <Reveal index={1}>
              <div className="h-full rounded-2xl border border-line bg-surface p-8">
                <h3 className="font-display text-xl font-semibold">{t("howToUse")}</h3>
                <p className="mt-3 text-muted">{product.howToUse}</p>
                <ul className="mt-6 space-y-2">
                  {product.highlights.map((h, i) => (
                    <li key={h} className="flex items-center gap-3 text-sm text-muted">
                      <span className={`font-display text-lg font-bold ${numberColor}`}>0{i + 1}</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Upsell */}
      <section className="border-t border-line py-16">
        <Container>
          <UpsellRail offers={upsells} />
        </Container>
      </section>

      {/* FAQ */}
      {product.faq.length > 0 && (
        <section className="border-t border-line py-24">
          <Container size="narrow">
            <Reveal>
              <h2 className="mb-8 font-display text-3xl font-bold tracking-tight">{t("faq")}</h2>
            </Reveal>
            <FaqAccordion items={product.faq} />
          </Container>
        </section>
      )}

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="border-t border-line py-24">
          <Container>
            <Reveal>
              <h2 className="mb-8 font-display text-3xl font-bold tracking-tight">{t("reviews")}</h2>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              {product.reviews.map((r, i) => (
                <Reveal key={i} index={i}>
                  <figure className="h-full rounded-2xl border border-line bg-surface p-6">
                    <StarRating rating={r.rating} />
                    <blockquote className="mt-4 text-muted">“{r.text}”</blockquote>
                    <figcaption className="mt-4 text-sm font-medium text-fg">{r.author}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
