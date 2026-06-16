"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { BespokeSections } from "./BespokeSections";
import type { BespokeProps } from "./registry";

/** Bespoke page for Multivitamin Daily — vibrant "spectrum A–Z energy" theme. */
export function MultivitaminDaily({ product, upsells }: BespokeProps) {
  const t = useTranslations("product");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sweepX = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <article className="overflow-clip">
      <section ref={ref} className="relative flex min-h-[100svh] items-center">
        <div className="absolute inset-0 -z-10 bg-ink">
          <motion.div
            style={{ x: sweepX }}
            className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(31,209,123,0.18),rgba(231,185,75,0.18),rgba(95,140,255,0.18),rgba(230,160,192,0.18),rgba(31,209,123,0.18))] blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />
        </div>

        <motion.div style={{ opacity: fade }} className="w-full">
          <Container>
            <div className="max-w-3xl py-32">
              <Reveal>
                <p className="mb-5 inline-flex rounded-full border border-accent/30 bg-accent-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {product.badges[0]}
                </p>
              </Reveal>
              <Reveal index={1}>
                <h1 className="font-display text-6xl font-bold leading-[0.95] tracking-tight text-balance sm:text-8xl">
                  {product.name}
                </h1>
              </Reveal>
              <Reveal index={2}>
                <p className="mt-6 max-w-xl text-lg text-muted">{product.tagline}</p>
              </Reveal>
            </div>
          </Container>
        </motion.div>
      </section>

      {/* Benefits — alternating big rows */}
      <section className="border-t border-line bg-surface py-24">
        <Container>
          <Reveal>
            <h2 className="mb-12 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("benefits")}</h2>
          </Reveal>
          <div className="space-y-px">
            {product.benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="grid items-center gap-6 border-t border-line py-10 md:grid-cols-[1fr_1.4fr]"
              >
                <h3 className="font-display text-2xl font-semibold">
                  <span className="gradient-accent bg-clip-text text-transparent">0{i + 1}</span> · {b.title}
                </h3>
                <p className="text-muted">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <BespokeSections product={product} upsells={upsells} />
    </article>
  );
}
