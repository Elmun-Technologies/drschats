"use client";

import { useRef } from "react";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { BespokeSections } from "./BespokeSections";
import type { BespokeProps } from "./registry";

/** Bespoke page for Immuno Complex — vitamin-C "citrus burst / shield" theme. */
export function ImmunoComplex({ product, upsells }: BespokeProps) {
  const t = useTranslations("product");
  const ref = useRef<HTMLDivElement>(null);
  return (
    <article className="overflow-clip">
      <section ref={ref} className="relative flex min-h-[70svh] items-center">
        <div className="absolute inset-0 -z-10 bg-legacy-ink">
          <div className="product-hero" />
        </div>

        <Container>
          <div className="mx-auto max-w-3xl py-24 text-center">
            <Reveal>
              <p className="mb-5 inline-flex rounded-full border border-legacy-line bg-surface-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-legacy-muted">
                {product.badges[0]}
              </p>
            </Reveal>
            <Reveal index={1}>
              <h1 className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>
            </Reveal>
            <Reveal index={2}>
              <p className="mx-auto mt-6 max-w-xl text-lg text-legacy-muted">{product.tagline}</p>
            </Reveal>
            <Reveal index={3}>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {product.highlights.map((h) => (
                  <span key={h} className="rounded-full border border-legacy-line bg-surface-2/70 px-4 py-2 text-sm text-fg backdrop-blur">
                    {h}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Benefits — bold numbered grid */}
      <section className="border-t border-legacy-line bg-surface py-24">
        <Container>
          <Reveal>
            <h2 className="mb-14 max-w-2xl font-display text-2xl font-extrabold tracking-tight sm:text-4xl">{t("benefits")}</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {product.benefits.map((b, i) => (
              <Reveal key={b.title} index={i}>
                <div className="group flex h-full items-start gap-5 rounded-2xl border border-legacy-line bg-legacy-ink p-8 transition-colors hover:border-legacy-gold/40">
                  <span className="font-display text-4xl font-bold text-faint">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{b.title}</h3>
                    <p className="mt-2 text-legacy-muted">{b.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <BespokeSections product={product} upsells={upsells} accent="gold" />
    </article>
  );
}
