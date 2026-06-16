"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { BespokeSections } from "./BespokeSections";
import type { BespokeProps } from "./registry";

/** Bespoke page for Immuno Complex — vitamin-C "citrus burst / shield" theme. */
export function ImmunoComplex({ product, upsells }: BespokeProps) {
  const t = useTranslations("product");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const ringScale = useTransform(scrollYProgress, [0, 1], [1, 1.8]);
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <article className="overflow-clip">
      <section ref={ref} className="relative flex min-h-[100svh] items-center">
        <div className="absolute inset-0 -z-10 bg-ink">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,176,32,0.22),transparent_55%)]" />
          {/* concentric shield rings */}
          <motion.div
            style={{ scale: ringScale, rotate: ringRotate }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            {[460, 340, 220].map((s, i) => (
              <div
                key={s}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
                style={{
                  width: s,
                  height: s,
                  borderColor: i === 2 ? "rgba(31,209,123,0.45)" : "rgba(255,176,32,0.25)",
                }}
              />
            ))}
          </motion.div>
        </div>

        <Container>
          <div className="mx-auto max-w-3xl py-32 text-center">
            <Reveal>
              <p className="mb-5 inline-flex rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                {product.badges[0]}
              </p>
            </Reveal>
            <Reveal index={1}>
              <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight text-balance sm:text-7xl">
                {product.name}
              </h1>
            </Reveal>
            <Reveal index={2}>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted">{product.tagline}</p>
            </Reveal>
            <Reveal index={3}>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {product.highlights.map((h) => (
                  <span key={h} className="rounded-full border border-line bg-surface-2/70 px-4 py-2 text-sm text-fg backdrop-blur">
                    {h}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Benefits — bold numbered grid */}
      <section className="border-t border-line bg-surface py-24">
        <Container>
          <Reveal>
            <h2 className="mb-14 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("benefits")}</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {product.benefits.map((b, i) => (
              <Reveal key={b.title} index={i}>
                <div className="group flex h-full items-start gap-5 rounded-2xl border border-line bg-ink p-8 transition-colors hover:border-gold/40">
                  <span className="font-display text-4xl font-bold text-gold/50">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-xl font-semibold">{b.title}</h3>
                    <p className="mt-2 text-muted">{b.description}</p>
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
