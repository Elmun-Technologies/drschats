"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { DealOfDay } from "@/components/home/DealOfDay";
import type { Product } from "@/lib/shopflow/types";
import { cn } from "@/lib/utils";

interface SlideCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
}

const DEAL_CARDS = [
  {
    bgImage: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&q=80&w=600",
    iconBg: "bg-brand-deep/20",
    iconColor: "text-white",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    offKey: "b1Off" as const,
    titleKey: "b1Title" as const,
    showCta: true,
    big: true,
  },
  {
    bgImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600",
    iconBg: "bg-signal-soft/30",
    iconColor: "text-white",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    offKey: "b2Off" as const,
    titleKey: "b2Title" as const,
    showCta: false,
    big: false,
  },
  {
    bgImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    iconBg: "bg-gold/30",
    iconColor: "text-white",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    offKey: "b3Off" as const,
    titleKey: "b3Title" as const,
    showCta: false,
    big: false,
  },
];

export function HeroBento({
  products = [],
  deal,
}: {
  products?: Product[];
  /* The real discounted product for the countdown panel. When the catalogue has
     nothing on offer the decorative card takes its place, so the bento never
     collapses to an empty column. */
  deal?: Product;
}) {
  const t = useTranslations("home");
  const b = useTranslations("home.bento");
  const slides = t.raw("slides") as SlideCopy[];
  const [i, setI] = useState(0);
  // The first slide paints unanimated so it cannot delay LCP.
  const [rotated, setRotated] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setI((v) => (v + 1) % slides.length);
      setRotated(true);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const s = slides[i];

  return (
    <section className="bg-ink pt-6">
      <Container>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* Main rotating banner */}
          <div className="relative flex min-h-[360px] overflow-hidden rounded-3xl bg-surface shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] sm:min-h-[440px]">
            {/* Stunning AI Lifestyle Image Background */}
            <div className="absolute inset-0 z-0">
              <Image 
                src="/hero/beauty_wellness.jpg"
                alt="Wellness & Beauty"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover object-[70%_30%] mix-blend-multiply opacity-90"
              />
              {/* Gradient mask to ensure text readability on the left */}
              <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/95 to-transparent sm:via-surface/80" />
            </div>
            
            <div
              key={i}
              className={cn("relative z-10 flex flex-1 items-center", rotated && "hero-slide-in")}
            >
                {/* The panel is ~800px at desktop; capping the copy at max-w-sm
                    turned a long headline into a seven-line ribbon down the
                    left edge with half the panel empty beside it. */}
                <div className="max-w-md p-8 sm:p-12 lg:max-w-xl">
                  <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent-strong">
                    {s.eyebrow}
                  </span>
                  <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-deep sm:text-6xl drop-shadow-sm">
                    {s.title}
                  </h1>
                  <p className="mt-5 text-base text-muted max-w-md leading-relaxed">{s.subtitle}</p>
                  <Link href="/products" className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-deep px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover-lift-premium hover:bg-black">
                    {s.cta}
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
                {/* Certification pills */}
                <div className="absolute bottom-6 right-6 hidden gap-2.5 sm:flex sm:right-10">
                  {["cGMP", "ISO", "Halal", "IFOS"].map((badge) => (
                    <span key={badge} className="rounded-full border border-white/40 bg-white/60 px-4 py-1.5 text-xs font-bold text-brand-deep/80 backdrop-blur-md shadow-sm">
                      {badge}
                    </span>
                  ))}
                </div>
            </div>
            {/*
              The dot is 8px tall; the button around it is not. The indicator
              stays small because that is what reads as a carousel dot, but the
              thing a thumb has to hit is 24px square — the WCAG 2.2 minimum,
              and roughly the difference between "works on a phone" and "works
              on the third try".
            */}
            <div className="absolute bottom-3 left-6 flex sm:left-10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setI(idx);
                    setRotated(true);
                  }}
                  aria-label={t("slideLabel", { number: idx + 1 })}
                  aria-current={idx === i}
                  className="flex h-6 w-6 items-center justify-center"
                >
                  <span
                    aria-hidden
                    className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-fg" : "w-2 bg-fg/30"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Bento deal cards */}
          <div className="grid gap-4">
            {deal ? (
              <DealOfDay product={deal} />
            ) : (
              <DealCard
                card={DEAL_CARDS[0]}
                off={b(DEAL_CARDS[0].offKey)}
                title={b(DEAL_CARDS[0].titleKey)}
                cta={b("viewMore")}
                product={products[0]}
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <DealCard card={DEAL_CARDS[1]} off={b(DEAL_CARDS[1].offKey)} title={b(DEAL_CARDS[1].titleKey)} product={products[1]} />
              <DealCard card={DEAL_CARDS[2]} off={b(DEAL_CARDS[2].offKey)} title={b(DEAL_CARDS[2].titleKey)} product={products[2]} />
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
  product,
}: {
  card: typeof DEAL_CARDS[number];
  off: string;
  title: string;
  cta?: string;
  product?: Product;
}) {
  const image = product?.images[0]?.url;

  return (
    <Link
      href={product ? `/product/${product.slug}` : "/products"}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 ${card.big ? "min-h-[200px] p-8" : "min-h-[170px] p-6"} hover-lift-premium shadow-lg`}
    >
      <div className="absolute inset-0 z-0">
        <Image src={card.bgImage} alt="" fill sizes="50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-brand-deep/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-transparent to-transparent opacity-80" />
      </div>

      <div className="relative z-10 flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-md ${card.iconBg} ${card.iconColor}`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={card.icon} />
          </svg>
        </span>
      </div>

      <div className={`relative z-10 ${image ? (card.big ? "max-w-[58%]" : "sm:max-w-[62%]") : ""}`}>
        <p className="text-xs font-bold uppercase tracking-widest text-gold drop-shadow-sm">{off}</p>
        <h2 className={`mt-2 font-display font-extrabold leading-tight text-white drop-shadow-md ${card.big ? "text-2xl" : "text-lg"}`}>{title}</h2>
        {cta && (
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-5 py-2 text-xs font-bold text-brand-deep shadow-sm transition-all group-hover:bg-white group-hover:shadow-md">
            {cta}
            <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 10h6M10 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      {image && (
        <div
          className={`pointer-events-none absolute overflow-hidden rounded-2xl bg-white shadow-2xl p-3 ${
            card.big ? "bottom-5 right-5 top-5 w-[34%]" : "hidden sm:block bottom-4 right-4 top-4 w-[32%]"
          }`}
        >
          <div className="relative h-full w-full rounded-xl overflow-hidden bg-white">
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 1024px) 40vw, 200px"
              className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </div>
      )}

      {!image && (
        <div className="pointer-events-none absolute bottom-0 right-3 opacity-[0.15]">
          <svg viewBox="0 0 24 24" className={`text-white ${card.big ? "h-28 w-28" : "h-20 w-20"}`} fill="currentColor">
            <path d={card.icon} />
          </svg>
        </div>
      )}
    </Link>
  );
}
