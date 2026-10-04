"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
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
 * Bespoke page for Vitamin D3 + K2 — the shared product hero, with the
 * formula's own copy underneath.
 */
export function VitaminD3K2({ product, upsells }: BespokeProps) {
  const t = useTranslations("product");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <article className="overflow-clip">
      <section ref={heroRef} className="relative flex min-h-[70svh] items-center">
        {/* Was a giant gold sun that scaled and drifted on scroll. */}
        <div className="absolute inset-0 -z-10 bg-ink">
          <div className="product-hero" />
        </div>

        <motion.div style={{ y: contentY }} className="w-full">
          <Container>
            <div className="mx-auto max-w-3xl py-24 text-center">
              <Reveal>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {product.badges[0]}
                </p>
              </Reveal>
              <Reveal index={1}>
                <h1 className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-4xl lg:text-5xl">
                  {product.name}
                </h1>
              </Reveal>
              <Reveal index={2}>
                <p className="mx-auto mt-6 max-w-xl text-lg text-muted">{product.tagline}</p>
              </Reveal>
              <Reveal index={3}>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {product.highlights.map((h) => (
                    <span key={h} className="rounded-full border border-line bg-surface-2/60 px-4 py-2 text-sm text-fg backdrop-blur">
                      {h}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
          </Container>
        </motion.div>
      </section>

      {/* Buy section */}
      <section className="border-t border-line section-y">
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

      {/* Benefits cards with warm glow */}
      <section className="border-t border-line bg-surface py-24">
        <Container>
          <Reveal>
            <h2 className="mb-14 max-w-2xl font-display text-2xl font-extrabold tracking-tight sm:text-4xl">{t("benefits")}
            </h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {product.benefits.map((b, i) => (
              <Reveal key={b.title} index={i}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-line bg-ink p-8">
                  <div className="transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="font-display text-4xl font-bold text-faint">0{i + 1}</span>
                  <h3 className="mt-4 font-display text-lg font-bold">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted">{b.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Ingredients + how to use */}
      <section className="section-y">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{t("ingredients")}</h2>
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
                <h3 className="font-display text-lg font-bold">{t("howToUse")}</h3>
                <p className="mt-3 text-muted">{product.howToUse}</p>
              </div>
            </Reveal>
          </div>
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
