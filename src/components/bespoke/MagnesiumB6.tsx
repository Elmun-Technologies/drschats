"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { BespokeSections } from "./BespokeSections";
import type { BespokeProps } from "./registry";

/** Bespoke page for Magnesium + B6 — calm midnight "sleep" theme. */
export function MagnesiumB6({ product, upsells }: BespokeProps) {
  const t = useTranslations("product");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const moonY = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const moonScale = useTransform(scrollYProgress, [0, 1], [1, 0.7]);
  const veil = useTransform(scrollYProgress, [0, 1], [0.2, 0.7]);

  return (
    <article className="overflow-clip">
      <section ref={ref} className="relative flex min-h-[100svh] items-center">
        <div className="absolute inset-0 -z-10 bg-[#070912]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(70,90,170,0.25),transparent_60%)]" />
          <motion.div
            style={{ y: moonY, scale: moonScale }}
            className="absolute right-[12%] top-[14%] h-48 w-48 rounded-full bg-[radial-gradient(circle_at_35%_35%,#dfe6ff,#9fb0e6_55%,#5a6aa8_80%)] shadow-[0_0_120px_40px_rgba(120,140,220,0.35)]"
          />
          {/* drifting stars */}
          {[...Array(14)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/70"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 80}%` }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          <motion.div style={{ opacity: veil }} className="absolute inset-0 bg-ink" />
        </div>

        <Container>
          <div className="max-w-2xl py-32">
            <Reveal>
              <p className="mb-5 inline-flex rounded-full border border-[#5a6aa8]/40 bg-[#5a6aa8]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#aab6e6]">
                {product.badges[0]}
              </p>
            </Reveal>
            <Reveal index={1}>
              <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight text-balance sm:text-7xl">
                {product.name}
              </h1>
            </Reveal>
            <Reveal index={2}>
              <p className="mt-6 max-w-lg text-lg text-muted">{product.tagline}</p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Benefits — calm split rows */}
      <section className="border-t border-line bg-surface py-24">
        <Container>
          <Reveal>
            <h2 className="mb-14 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("benefits")}</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {product.benefits.map((b, i) => (
              <Reveal key={b.title} index={i}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-ink p-8">
                  <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-[#5a6aa8]/15 blur-2xl" />
                  <h3 className="font-display text-xl font-semibold">{b.title}</h3>
                  <p className="mt-3 text-muted">{b.description}</p>
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
