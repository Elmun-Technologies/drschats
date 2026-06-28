"use client";

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

const DEAL_CARDS = [
  {
    bg: "bg-pastel-lilac",
    iconBg: "bg-[#6366f1]/15",
    iconColor: "text-[#6366f1]",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    offKey: "b1Off" as const,
    titleKey: "b1Title" as const,
    showCta: true,
    big: true,
  },
  {
    bg: "bg-pastel-mint",
    iconBg: "bg-accent/15",
    iconColor: "text-accent-strong",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    offKey: "b2Off" as const,
    titleKey: "b2Title" as const,
    showCta: false,
    big: false,
  },
  {
    bg: "bg-pastel-sky",
    iconBg: "bg-gold/15",
    iconColor: "text-gold",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    offKey: "b3Off" as const,
    titleKey: "b3Title" as const,
    showCta: false,
    big: false,
  },
];

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
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
                {/* Decorative pill cluster */}
                <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3 sm:flex">
                  {["cGMP", "ISO", "Halal", "IFOS"].map((badge) => (
                    <span key={badge} className="rounded-full border border-fg/10 bg-fg/5 px-3 py-1.5 text-xs font-semibold text-fg/60 backdrop-blur-sm">
                      {badge}
                    </span>
                  ))}
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
            <DealCard card={DEAL_CARDS[0]} off={b(DEAL_CARDS[0].offKey)} title={b(DEAL_CARDS[0].titleKey)} cta={b("viewMore")} />
            <div className="grid grid-cols-2 gap-4">
              <DealCard card={DEAL_CARDS[1]} off={b(DEAL_CARDS[1].offKey)} title={b(DEAL_CARDS[1].titleKey)} />
              <DealCard card={DEAL_CARDS[2]} off={b(DEAL_CARDS[2].offKey)} title={b(DEAL_CARDS[2].titleKey)} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function DealCard({
  card,
  off,
  title,
  cta,
}: {
  card: typeof DEAL_CARDS[number];
  off: string;
  title: string;
  cta?: string;
}) {
  return (
    <Link
      href="/products"
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl ${card.bg} ${card.big ? "min-h-[200px] p-7" : "min-h-[170px] p-5"} transition-all hover:-translate-y-0.5`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d={card.icon} />
        </svg>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-fg/60">{off}</p>
        <h3 className={`mt-1 font-display font-extrabold leading-tight text-fg ${card.big ? "text-xl" : "text-base"}`}>{title}</h3>
        {cta && (
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-ink transition-gap group-hover:gap-2">
            {cta}
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 10h6M10 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
      {/* decorative watermark icon */}
      <div className="absolute bottom-0 right-3 opacity-[0.07]">
        <svg viewBox="0 0 24 24" className={`${card.big ? "h-28 w-28" : "h-20 w-20"}`} fill="currentColor">
          <path d={card.icon} />
        </svg>
      </div>
    </Link>
  );
}
