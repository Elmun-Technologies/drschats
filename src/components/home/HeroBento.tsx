"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";

interface SlideCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
}

/** HealthMart-style hero: a rotating main banner + a bento of pastel deal cards. */
export function HeroBento() {
  const t = useTranslations("home");
  const b = useTranslations("home.bento");
  const slides = t.raw("slides") as SlideCopy[];
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const s = slides[i];

  return (
    <section className="bg-ink pt-6">
      <Container>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* Main rotating banner */}
          <div className="relative flex min-h-[360px] overflow-hidden rounded-2xl bg-pastel-beige sm:min-h-[440px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-1 items-center"
              >
                <div className="max-w-sm p-8 sm:p-12">
                  <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent-strong">
                    {s.eyebrow}
                  </span>
                  <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-fg sm:text-5xl">
                    {s.title}
                  </h1>
                  <p className="mt-4 text-sm text-fg/70">{s.subtitle}</p>
                  <Link href="/products" className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent-strong">
                    {s.cta}
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                </div>
                <div className="relative hidden flex-1 sm:block">
                  <Image src="/placeholders/p3.svg" alt="" fill sizes="40vw" className="object-contain p-8" priority />
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-5 left-8 flex gap-2 sm:left-12">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-ink" : "w-2 bg-ink/30"}`}
                />
              ))}
            </div>
          </div>

          {/* Bento deal cards */}
          <div className="grid gap-4">
            <DealCard bg="bg-pastel-lilac" img="/placeholders/p2.svg" off={b("b1Off")} title={b("b1Title")} cta={b("viewMore")} big />
            <div className="grid grid-cols-2 gap-4">
              <DealCard bg="bg-pastel-mint" img="/placeholders/p4.svg" off={b("b2Off")} title={b("b2Title")} />
              <DealCard bg="bg-pastel-sky" img="/placeholders/p6.svg" off={b("b3Off")} title={b("b3Title")} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function DealCard({
  bg,
  img,
  off,
  title,
  cta,
  big,
}: {
  bg: string;
  img: string;
  off: string;
  title: string;
  cta?: string;
  big?: boolean;
}) {
  return (
    <Link href="/products" className={`group relative flex items-center overflow-hidden rounded-2xl ${bg} ${big ? "min-h-[200px]" : "min-h-[180px]"}`}>
      <div className="relative z-10 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-fg/70">{off}</p>
        <h3 className={`mt-2 font-display font-extrabold leading-tight text-fg ${big ? "text-2xl" : "text-lg"}`}>{title}</h3>
        {cta && (
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink">
            {cta} →
          </span>
        )}
      </div>
      <div className="absolute bottom-0 right-0 h-3/4 w-1/2">
        <Image src={img} alt="" fill sizes="200px" className="object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
      </div>
    </Link>
  );
}
