"use client";

import { useRef } from "react";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { BespokeSections } from "./BespokeSections";
import type { BespokeProps } from "./registry";

/** Bespoke page for Collagen Beauty — elegant editorial "glow" theme. */
export function CollagenBeauty({ product, upsells }: BespokeProps) {
  const t = useTranslations("product");
  const ref = useRef<HTMLDivElement>(null);
  return (
    <article className="overflow-clip">
      <section ref={ref} className="relative grid min-h-[70svh] items-center lg:grid-cols-2">
        {/* Left: editorial copy */}
        <div className="relative z-10 py-32">
          <Container>
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
              <p className="mt-6 max-w-md text-lg text-legacy-muted">{product.tagline}</p>
            </Reveal>
          </Container>
        </div>

        {/*
          The right half was a placeholder SVG stretched to cover half the
          screen behind a pink radial glow — a pink product page for a product
          whose photo is a stock bottle. The ground is now the same warm wash
          as every other product hero, and the real photo appears in the
          gallery below.
        */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:relative lg:h-full">
          <div className="product-hero" />
        </div>
      </section>

      {/* Benefits — soft glass cards */}
      <section className="border-t border-legacy-line section-y">
        <Container>
          <Reveal>
            <h2 className="mb-10 max-w-2xl font-display text-2xl font-extrabold tracking-tight sm:text-4xl">{t("benefits")}</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {product.benefits.map((b, i) => (
              <Reveal key={b.title} index={i}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-legacy-line bg-surface p-8">
                  <h3 className="font-display text-lg font-bold">{b.title}</h3>
                  <p className="mt-3 text-legacy-muted">{b.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <BespokeSections product={product} upsells={upsells} />
    </article>
  );
}
