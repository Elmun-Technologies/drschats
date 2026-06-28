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

/**
 * The rich, animated fallback layout used for any product that doesn't have a
 * hand-crafted bespoke page. Fully data-driven from Shopflow.
 */
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
      <Container>
        <Breadcrumb product={product} />

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <ProductGallery images={product.images} />
          <BuyBox product={product} reviewer={reviewer} />
        </div>

        {/* Highlights */}
        <Reveal className="mt-20">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {product.highlights.map((h) => (
              <div key={h} className="rounded-xl border border-line bg-surface p-5 text-sm font-medium text-fg">
                {h}
              </div>
            ))}
          </div>
        </Reveal>

        {/* Description + Benefits */}
        <section className="mt-24 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight">{t("benefits")}</h2>
              <p className="mt-4 text-muted">{product.description}</p>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.benefits.map((b, i) => (
              <Reveal key={b.title} index={i}>
                <div className="h-full rounded-2xl border border-line bg-surface p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted">{b.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Ingredients */}
        <section className="mt-24">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight">{t("ingredients")}</h2>
          </Reveal>
          <Reveal index={1} className="mt-8 overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-muted">
                <tr>
                  <th className="px-6 py-4 font-medium">{t("ingredientName")}</th>
                  <th className="px-6 py-4 font-medium">{t("ingredientAmount")}</th>
                  <th className="px-6 py-4 font-medium">{t("ingredientDV")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {product.ingredients.map((row) => (
                  <tr key={row.name} className="bg-surface">
                    <td className="px-6 py-4 font-medium text-fg">{row.name}</td>
                    <td className="px-6 py-4 text-muted">{row.amount}</td>
                    <td className="px-6 py-4 text-muted">{row.dailyValue ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
          <Reveal index={2} className="mt-6 rounded-2xl border border-line bg-surface p-6">
            <h3 className="font-display text-lg font-semibold">{t("howToUse")}</h3>
            <p className="mt-2 text-muted">{product.howToUse}</p>
          </Reveal>
        </section>

        {/* Sourcing & transparency */}
        <section className="mt-24">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight">{t("sourcing")}</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <Reveal>
              <div className="h-full rounded-2xl border border-line bg-surface p-6 text-muted">{t("coaNote")}</div>
            </Reveal>
            {product.certifications && product.certifications.length > 0 && (
              <Reveal index={1}>
                <div className="flex h-full flex-wrap content-start gap-2 rounded-2xl border border-line bg-surface p-6">
                  {product.certifications.map((c) => (
                    <span key={c} className="rounded-full border border-line bg-ink px-3 py-1 text-xs font-semibold text-muted">
                      {c}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </section>

        {/* Upsells */}
        <section className="mt-24">
          <UpsellRail offers={upsells} />
        </section>

        {/* FAQ */}
        {product.faq.length > 0 && (
          <section className="mt-24 max-w-3xl">
            <Reveal>
              <h2 className="mb-8 font-display text-3xl font-bold tracking-tight">{t("faq")}</h2>
            </Reveal>
            <FaqAccordion items={product.faq} />
          </section>
        )}

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <section className="mb-32 mt-24">
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
          </section>
        )}
      </Container>
    </div>
  );
}
