"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";

interface SlideCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
}

const slides = [
  { href: "/products", img: "/placeholders/p3.svg", bg: "from-emerald-50 to-teal-100", blob: "bg-emerald-200/50" },
  { href: "/products", img: "/placeholders/p1.svg", bg: "from-orange-50 to-amber-100", blob: "bg-amber-200/50" },
  { href: "/product/omega-3-premium", img: "/placeholders/p4.svg", bg: "from-sky-50 to-blue-100", blob: "bg-sky-200/50" },
];

const AUTOPLAY = 6000;

export function HeroSlider() {
  const t = useTranslations("home");
  const copies = t.raw("slides") as SlideCopy[];
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback((next: number) => {
    setDir(next > index ? 1 : -1);
    setIndex((next + slides.length) % slides.length);
  }, [index]);

  useEffect(() => {
    const id = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY);
    return () => clearInterval(id);
  }, []);

  const slide = slides[index];
  const copy = copies[index];

  return (
    <section className="pt-20">
      <Container className="px-0 sm:px-0">
        <div className="relative mx-3 overflow-hidden rounded-3xl sm:mx-5">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={index}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`relative grid items-center gap-6 bg-gradient-to-br ${slide.bg} px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-2 lg:px-16`}
            >
              <div className={`pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl ${slide.blob}`} />
              <div className="relative z-10 max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent-strong shadow-sm backdrop-blur">
                  {copy.eyebrow}
                </span>
                <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-fg text-balance sm:text-5xl lg:text-6xl">
                  {copy.title}
                </h1>
                <p className="mt-5 max-w-md text-base text-muted sm:text-lg">{copy.subtitle}</p>
                <div className="mt-8 flex items-center gap-4">
                  <Link href={slide.href} className={buttonVariants("primary", "lg")}>
                    {copy.cta}
                  </Link>
                  <span className="text-sm font-medium text-fg">
                    ★★★★★ <span className="text-muted">4.6 · 3M+</span>
                  </span>
                </div>
              </div>

              <div className="relative z-10 hidden h-[320px] items-center justify-center lg:flex">
                <motion.div
                  animate={{ y: [0, -16, 0], rotate: [-3, 3, -3] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="relative h-[300px] w-[240px] drop-shadow-2xl"
                >
                  <Image src={slide.img} alt="" fill sizes="240px" className="rounded-2xl object-cover" priority />
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* arrows */}
          <button onClick={() => go(index - 1)} aria-label="Previous" className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-fg shadow-md backdrop-blur transition hover:bg-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button onClick={() => go(index + 1)} aria-label="Next" className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-fg shadow-md backdrop-blur transition hover:bg-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>

          {/* dots */}
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? "w-7 bg-accent" : "w-2 bg-fg/25 hover:bg-fg/40"}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
