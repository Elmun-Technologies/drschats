"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { Aurora } from "@/components/visual/Aurora";
import { HeroOrb } from "@/components/visual/HeroOrb";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("home.hero");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  const origins = ["Switzerland", "Germany", "Russia"];

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden">
      <Aurora className="-z-10" variant="green" />

      <motion.div style={{ y }} className="relative w-full pt-24">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Copy */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface-2/50 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-accent backdrop-blur-md"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                {t("eyebrow")}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.1, ease }}
                className="font-display text-[clamp(2.75rem,7vw,6.5rem)] font-bold leading-[0.95] tracking-tight text-balance"
              >
                <span className="text-gradient">{t("title")}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease }}
                className="mt-7 max-w-xl text-lg text-muted sm:text-xl"
              >
                {t("subtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4, ease }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link href="/products" className={buttonVariants("primary", "lg")}>
                  {t("cta")}
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link href="/about" className={buttonVariants("secondary", "lg")}>
                  {t("secondaryCta")}
                </Link>
              </motion.div>

              {/* origin trust row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3"
              >
                <span className="text-xs uppercase tracking-[0.18em] text-faint">EU/CH/RU</span>
                {origins.map((o) => (
                  <span key={o} className="flex items-center gap-2 text-sm text-muted">
                    <svg viewBox="0 0 20 20" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {o}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Visual */}
            <motion.div
              style={{ y: orbY }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease }}
              className="hidden justify-center lg:flex"
            >
              <HeroOrb />
            </motion.div>
          </div>
        </Container>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-line-strong p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-2 w-1 rounded-full bg-accent"
          />
        </div>
      </motion.div>
    </section>
  );
}
