"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { Product } from "@/lib/shopflow/types";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowButton } from "./HomeHero";

/*
  Design: the dark Swiss Energy panel (HomeV3). Four white cards in view on
  desktop, a swipe rail on phones; the arrow pages the rail and only appears
  while there is more to see.
*/
export function BrandPanel({ products }: { products: Product[] }) {
  const t = useTranslations("home.v3.brand");
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      setAtStart(rail.scrollLeft <= 4);
      setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4);
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (products.length === 0) return null;

  const page = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (rail) rail.scrollBy({ left: dir * rail.clientWidth, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="home-brand" className="wrap">
      <div className="relative flex flex-col gap-3.5 rounded-3xl bg-dark-panel p-5 text-white lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-7 lg:rounded-[28px] lg:p-8">
        <div className="flex items-end justify-between gap-3.5 lg:flex-col lg:items-start lg:justify-start lg:py-2 lg:pl-2">
          <span className="flex flex-col gap-0.5 lg:gap-3.5">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-on-dark-2 lg:text-[13px]">{t("eyebrow")}</span>
            <h2 id="home-brand" className="text-[28px] font-bold leading-8 lg:text-[44px] lg:leading-[46px] lg:tracking-[-0.02em]">
              Swiss Energy
            </h2>
          </span>
          <span className="hidden text-base leading-6 text-on-dark-2 lg:block">{t("text")}</span>
          <Link href="/brands" className="text-[15px] font-semibold underline-offset-2 hover:underline lg:hidden">
            {t("short")}
          </Link>
          <Link
            href="/brands"
            className="mt-auto hidden h-[52px] items-center rounded-[14px] bg-bg px-7 text-[17px] font-semibold text-ink lg:inline-flex"
          >
            {t("cta")}
          </Link>
        </div>

        <div
          ref={railRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto lg:gap-3"
        >
          {products.map((p, i) => (
            <div key={p.id} className="h-full w-40 shrink-0 snap-start lg:w-[calc((100%-36px)/4)]">
              <ProductCard product={p} index={i} onCard />
            </div>
          ))}
        </div>

        {!atStart && (
          <ArrowButton dir="prev" label={t("prev")} onClick={() => page(-1)} className="absolute left-[318px] top-1/2 -mt-7 hidden lg:flex" />
        )}
        {!atEnd && (
          <ArrowButton dir="next" label={t("next")} onClick={() => page(1)} className="absolute -right-3 top-1/2 -mt-7 hidden lg:flex" />
        )}
      </div>
    </section>
  );
}
