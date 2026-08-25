"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import type { Product } from "@/lib/shopflow/types";
import { cn } from "@/lib/utils";

interface SlideCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
}

/*
  The home page now starts as an editorial brand introduction rather than a
  dark promotion wall. The warm, spacious hero is inspired by the reference
  direction while using Go Vita's own content and existing product imagery.
*/
export function HeroBento({ products = [] }: { products?: Product[] }) {
  const t = useTranslations("home");
  const slides = t.raw("slides") as SlideCopy[];
  const [active, setActive] = useState(0);
  const [hasRotated, setHasRotated] = useState(false);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
      setHasRotated(true);
    }, 6500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const current = slides[active] ?? slides[0];
  const featured = products[active % Math.max(products.length, 1)];

  if (!current) return null;

  return (
    <section className="bg-ink pb-9 pt-4 sm:pb-12 sm:pt-6">
      <Container size="wide">
        <div className="relative overflow-hidden rounded-t-[3.75rem] rounded-b-[2rem] border border-line bg-surface shadow-[0_24px_54px_-44px_rgba(65,50,20,0.52)] sm:rounded-t-[5.5rem]">
          <div className="grid lg:min-h-[540px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            {/* Copy */}
            <div className="relative z-10 flex flex-col px-7 pb-9 pt-12 sm:px-12 sm:pb-12 sm:pt-16 lg:px-16 lg:pb-16 lg:pt-20">
              <div className="pointer-events-none absolute -left-24 top-2 h-52 w-52 rounded-full border-[22px] border-gold/10" />
              <div className="pointer-events-none absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-gold/10 blur-3xl" />

              <div key={active} className={cn("relative max-w-xl", hasRotated && "hero-slide-in")}>
                <p className="text-xs font-extrabold uppercase leading-relaxed tracking-[0.16em] text-gold-ink sm:text-sm">
                  {current.eyebrow.replace(/^✦\s*/, "")}
                </p>
                <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-fg sm:text-5xl xl:text-6xl">
                  {current.title}
                </h1>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">{current.subtitle}</p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/products" className={buttonVariants("gold", "lg")}>
                    {current.cta}
                    <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25">
                      <path d="M7 10h6M10 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <Link href="/quiz" className={buttonVariants("secondary", "lg")}>
                    {t("quizPromo.cta")}
                  </Link>
                </div>
              </div>

              <div className="relative mt-auto flex items-center gap-2 pt-10" aria-label="Hero slides">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setActive(index);
                      setHasRotated(true);
                    }}
                    aria-label={t("slideLabel", { number: index + 1 })}
                    aria-current={index === active}
                    className="flex h-7 w-7 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <span className={cn("h-1.5 rounded-full transition-all duration-300", index === active ? "w-7 bg-gold-ink" : "w-1.5 bg-gold-ink/30")} />
                  </button>
                ))}
                <span className="ml-2 hidden text-xs font-semibold text-muted sm:inline">01 — 03</span>
              </div>
            </div>

            {/* Lifestyle image and featured product — no reference-site images
                or marks are used; both are Go Vita project assets. */}
            <div className="relative min-h-[25rem] overflow-hidden bg-pastel-beige sm:min-h-[31rem] lg:min-h-full">
              <Image
                src="/hero/beauty_wellness.jpg"
                alt={t("hero.title")}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-[62%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/45 via-transparent to-transparent" />
              <div className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-surface to-transparent lg:block" />

              <div className="absolute right-5 top-5 flex flex-wrap justify-end gap-2 sm:right-8 sm:top-8">
                {['cGMP', 'ISO 22000', 'Halal'].map((certificate) => (
                  <span key={certificate} className="rounded-full border border-white/50 bg-ink/85 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-gold-ink shadow-sm backdrop-blur-sm">
                    {certificate}
                  </span>
                ))}
              </div>

              {featured && (
                <Link
                  href={`/product/${featured.slug}`}
                  className="group absolute bottom-5 left-5 right-5 flex items-center gap-4 rounded-2xl border border-white/35 bg-ink/90 p-3 shadow-xl backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 sm:bottom-8 sm:left-8 sm:right-8 sm:p-4"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface p-1 sm:h-16 sm:w-16">
                    <Image
                      src={featured.images[0]?.url ?? "/products/vitamin-d3-k2.jpg"}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-gold-ink">{t("bestsellers.eyebrow")}</p>
                    <p className="mt-1 line-clamp-1 font-display text-sm font-extrabold text-fg sm:text-base">{featured.name}</p>
                    {featured.highlights[0] && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{featured.highlights[0]}</p>}
                  </div>
                  <svg viewBox="0 0 20 20" aria-hidden className="ml-auto h-5 w-5 shrink-0 text-gold-ink transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 10h6M10 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
