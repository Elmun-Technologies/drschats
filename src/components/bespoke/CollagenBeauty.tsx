"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { BespokeSections } from "./BespokeSections";
import type { BespokeProps } from "./registry";

/** Bespoke page for Collagen Beauty — elegant editorial "glow" theme. */
export function CollagenBeauty({ product, upsells }: BespokeProps) {
  const t = useTranslations("product");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.25]);
  const glow = useTransform(scrollYProgress, [0, 1], [0.6, 0.2]);

  return (
    <article className="overflow-clip">
      <section ref={ref} className="relative grid min-h-[100svh] items-center lg:grid-cols-2">
        {/* Left: editorial copy */}
        <div className="relative z-10 py-32">
          <Container>
            <Reveal>
              <p className="mb-5 inline-flex rounded-full border border-[#e0a0b0]/40 bg-[#e0a0b0]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#e6b0c0]">
                {product.badges[0]}
              </p>
            </Reveal>
            <Reveal index={1}>
              <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-balance sm:text-7xl">
                {product.name}
              </h1>
            </Reveal>
            <Reveal index={2}>
              <p className="mt-6 max-w-md text-lg text-muted">{product.tagline}</p>
            </Reveal>
          </Container>
        </div>

        {/* Right: glowing product image */}
        <div className="absolute inset-0 lg:relative lg:h-full">
          <motion.div style={{ scale: imgScale }} className="absolute inset-0">
            <Image src="/placeholders/p5.svg" alt="" fill priority sizes="50vw" className="object-cover" />
          </motion.div>
          <motion.div
            style={{ opacity: glow }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(230,160,192,0.5),transparent_60%)]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/30 to-transparent lg:from-ink/90" />
        </div>
      </section>

      {/* Benefits — soft glass cards */}
      <section className="border-t border-line py-24">
        <Container>
          <Reveal>
            <h2 className="mb-14 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("benefits")}</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {product.benefits.map((b, i) => (
              <Reveal key={b.title} index={i}>
                <div className="relative h-full overflow-hidden rounded-3xl border border-line bg-surface p-8">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#e0a0b0]/15 blur-2xl" />
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
