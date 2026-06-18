"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

/**
 * Whoop-style oversized statement: the headline words brighten as the section
 * scrolls through the viewport — a cinematic, high-impact moment.
 */
export function BigStatement() {
  const t = useTranslations("home.statement");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end center"] });
  const words = t("text").split(" ");

  return (
    <section ref={ref} className="relative border-y border-line py-28 sm:py-40">
      <Container>
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          {t("eyebrow")}
        </p>
        <h2 className="mx-auto max-w-5xl text-center font-display text-[clamp(2rem,5.5vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
          {words.map((w, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return <Word key={i} progress={scrollYProgress} range={[start, end]} word={w} />;
          })}
        </h2>
      </Container>
    </section>
  );
}

function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  );
}
