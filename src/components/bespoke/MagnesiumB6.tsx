"use client";

import { useRef } from "react";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { BespokeSections } from "./BespokeSections";
import type { BespokeProps } from "./registry";

/** Bespoke page for Magnesium + B6 — the shared product hero plus the copy this formula needs. */
export function MagnesiumB6({ product, upsells }: BespokeProps) {
  const t = useTranslations("product");
  const ref = useRef<HTMLDivElement>(null);
  return (
    <article className="overflow-clip">
      <section ref={ref} className="relative flex min-h-[70svh] items-center">
        {/*
          This hero was a near-black starfield: a CSS moon (#dfe6ff → #5a6aa8,
          glowing blue), fourteen drifting stars on infinite animation, a blue
          radial wash and a veil of the porcelain ground over the top. It was
          also the wrong way round — the copy on top is written for a light
          background. It now uses the shared product wash, light, with no
          scene.
        */}
        <div className="absolute inset-0 -z-10 bg-legacy-ink">
          <div className="product-hero" />
        </div>

        <Container>
          <div className="max-w-2xl py-32">
            <Reveal>
              <p className="mb-5 inline-flex rounded-full border border-[#5a6aa8]/40 bg-[#5a6aa8]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#aab6e6]">
                {product.badges[0]}
              </p>
            </Reveal>
            <Reveal index={1}>
              <h1 className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>
            </Reveal>
            <Reveal index={2}>
              <p className="mt-6 max-w-lg text-lg text-legacy-muted">{product.tagline}</p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Benefits — calm split rows */}
      <section className="border-t border-legacy-line bg-surface py-24">
        <Container>
          <Reveal>
            <h2 className="mb-14 font-display text-2xl font-extrabold tracking-tight sm:text-4xl">{t("benefits")}</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {product.benefits.map((b, i) => (
              <Reveal key={b.title} index={i}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-legacy-line bg-legacy-ink p-8">
                  <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-[#5a6aa8]/15 blur-2xl" />
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
