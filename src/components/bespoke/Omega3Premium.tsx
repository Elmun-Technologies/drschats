"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/shopflow/types";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { StarRating } from "@/components/ui/StarRating";
import { Breadcrumb } from "@/components/product/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { BuyBox } from "@/components/product/BuyBox";
import { UpsellRail } from "@/components/product/UpsellRail";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import type { BespokeProps } from "./registry";

/**
 * Bespoke page for Omega-3 Premium — the shared product hero, then the
 * "1000 mg EPA+DHA" number told through the section copy.
 */
export function Omega3Premium({ product, upsells }: BespokeProps) {
  const t = useTranslations("product");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  return (
    <article className="overflow-clip">
      {/* Cinematic hero */}
      <section ref={heroRef} className="relative flex min-h-[70svh] items-end">
        {/*
          A placeholder SVG ("/placeholders/p1.svg") was stretched full-bleed
          behind the headline, tinted green, and faded in on scroll. The
          shopper's first impression of the flagship product was a grey box.
        */}
        <div className="absolute inset-0 -z-10 bg-ink">
          <div className="product-hero" />
        </div>

        <motion.div style={{ y: textY }} className="w-full pb-24 pt-10">
          <Container>
            <Reveal>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {product.badges[0]}
              </p>
            </Reveal>
            <Reveal index={1}>
              <h1 className="max-w-4xl font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>
            </Reveal>
            <Reveal index={2}>
              <p className="mt-6 max-w-xl text-lg text-muted">{product.tagline}</p>
            </Reveal>
          </Container>
        </motion.div>
      </section>

      {/* Giant stat band */}
      <section className="border-y border-line bg-surface py-20">
        <Container>
          <div className="grid gap-10 sm:grid-cols-3">
            {product.highlights.slice(0, 3).map((h, i) => (
              <Reveal key={h} index={i} className="text-center">
                <div className="font-display text-3xl font-bold text-fg sm:text-4xl">{h.split(" ")[0]}</div>
                <p className="mt-2 text-sm text-muted">{h.split(" ").slice(1).join(" ")}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Buy section */}
      <section className="section-y">
        <Container>
          <Breadcrumb product={product} />
          <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-start">
            <div className="lg:sticky lg:top-24">
              <ProductGallery
                images={product.images}
                discountPercent={
                  product.oldPrice
                    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                    : 0
                }
                inStock={product.inStock}
              />
            </div>
            <BuyBox product={product} />
          </div>
        </Container>
      </section>

      {/* Benefits — sticky storytelling */}
      <BenefitStory product={product} benefitsLabel={t("benefits")} />

      {/* Ingredients */}
      <section className="section-y">
        <Container>
          <Reveal>
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl">{t("ingredients")}</h2>
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
        </Container>
      </section>

      <section className="pb-8">
        <Container>
          <UpsellRail offers={upsells} />
        </Container>
      </section>

      {product.faq.length > 0 && (
        <section className="section-y">
          <Container size="narrow">
            <Reveal>
              <h2 className="mb-8 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{t("faq")}</h2>
            </Reveal>
            <FaqAccordion items={product.faq} />
          </Container>
        </section>
      )}

      {product.reviews.length > 0 && (
        <section className="pb-32">
          <Container>
            <Reveal>
              <h2 className="mb-8 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{t("reviews")}</h2>
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
    </article>
  );
}

function BenefitStory({ product, benefitsLabel }: { product: Product; benefitsLabel: string }) {
  return (
    <section className="relative border-y border-line bg-surface py-24">
      <Container>
        <Reveal>
          <h2 className="mb-16 max-w-2xl font-display text-2xl font-extrabold tracking-tight sm:text-4xl">{benefitsLabel}
          </h2>
        </Reveal>
        <div className="space-y-px">
          {product.benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="group grid items-center gap-6 border-t border-line py-10 md:grid-cols-[80px_1fr_1.2fr]"
            >
              <span className="font-display text-2xl font-bold text-faint transition-colors group-hover:text-fg">
                0{i + 1}
              </span>
              <h3 className="font-display text-2xl font-semibold">{b.title}</h3>
              <p className="text-muted">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
