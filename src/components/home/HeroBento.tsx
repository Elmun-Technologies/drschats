"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";

interface SlideCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  /** Catalogue page for the product the slide is about. */
  href: string;
}

/*
  The first screen, product-first.

  What was removed: three certification chips ("cGMP", "ISO 22000", "Halal") and
  a stock lifestyle photo. The chips were decorations — the shop holds no cGMP
  certificate of its own, it resells other people's — and the photograph showed
  a model holding a bottle of something this catalogue does not sell. A hero
  that illustrates the promise with an unrelated object is the fastest way to
  lose a shopper who actually reads labels.

  So each slide names a real product, shows that product's real photograph and
  links to its page. The photograph of a person holding the pack is still
  wanted — it is in the shoot list in docs/GOVITA-TAVSIYALAR.md — and when it
  exists it replaces the pack shot here, not a stranger's.
*/
export function HeroBento({ products = [] }: { products?: Product[] }) {
  const t = useTranslations("home");
  const locale = useLocale() as Locale;
  const slides = t.raw("slides") as SlideCopy[];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const current = slides[active] ?? slides[0];
  const featured = products[active % Math.max(products.length, 1)];

  if (!current) return null;

  return (
    <section className="bg-legacy-ink pb-9 pt-4 sm:pb-12 sm:pt-6">
      <Container size="wide">
        <div className="relative overflow-hidden rounded-3xl rounded-2xl border border-legacy-line bg-surface shadow-[var(--shadow-card)] sm:rounded-3xl">
          <div className="grid lg:min-h-[520px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative z-10 flex flex-col px-7 pb-9 pt-12 sm:px-12 sm:pb-12 sm:pt-16 lg:px-16 lg:pb-16 lg:pt-20">
              <div key={active} className="hero-slide-in relative max-w-xl">
                <p className="text-xs font-extrabold uppercase leading-relaxed tracking-[0.16em] text-legacy-muted sm:text-sm">
                  {current.eyebrow}
                </p>
                <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-fg sm:text-5xl xl:text-6xl">
                  {current.title}
                </h1>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-legacy-muted sm:text-lg">
                  {current.subtitle}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {/* The hero sends you to a category, so it is graphite. Gold is
                      kept for the buttons that put something in the cart. */}
                  <Link href={current.href} className={buttonVariants("dark", "lg")}>
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

              <div className="relative mt-auto flex items-center gap-2 pt-10" aria-label={t("hero.slideControls")}>
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={t("slideLabel", { number: index + 1 })}
                    aria-current={index === active}
                    className="flex h-7 w-7 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                  >
                    <span className={cn("h-1.5 rounded-full transition-all duration-300", index === active ? "w-7 bg-brand-deep" : "w-1.5 bg-brand-deep/30")} />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-h-[20rem] overflow-hidden border-t border-legacy-line bg-surface-2 sm:min-h-[26rem] lg:min-h-full lg:border-l lg:border-t-0">
              {featured?.images[0]?.url ? (
                <Link href={`/product/${featured.slug}`} className="group absolute inset-0 flex flex-col">
                  <span className="relative flex-1 overflow-hidden">
                    {/*
                      A hand holding a bottle — generated, unlabelled, the frame
                      the client asked for ("the main product in a real human
                      hand"). The product itself is still our own photograph,
                      drawn on top in the middle: a generated package would be
                      a made-up label on the page we sell from.
                    */}
                    <Image
                      src="/images/hero/hand.jpg"
                      alt=""
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                    />
                    <Image
                      src={featured.images[0].url}
                      alt={featured.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 60vw, 30vw"
                      className="object-contain p-10 drop-shadow-[0_20px_30px_rgba(45,42,37,0.28)] transition-transform duration-500 group-hover:scale-[1.03] sm:p-14"
                    />
                  </span>
                  <span className="relative border-t border-legacy-line bg-legacy-ink/85 px-6 py-4 backdrop-blur-sm">
                    <span className="block font-display text-sm font-bold text-fg">{featured.name}</span>
                    <span className="mt-1 flex items-baseline gap-2">
                      <b className="whitespace-nowrap font-display text-base font-extrabold tabular-nums text-fg sm:text-lg">
                        {formatMoney(featured.price, locale)}
                      </b>
                      {featured.oldPrice && (
                        <s className="text-xs tabular-nums text-legacy-muted line-through">
                          {formatMoney(featured.oldPrice, locale)}
                        </s>
                      )}
                    </span>
                  </span>
                </Link>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-3" />
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
