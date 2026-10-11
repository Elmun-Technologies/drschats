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

  The rail advances by itself, one card every few seconds, and wraps to the
  start. It holds still while the visitor is reading or touching it (hover,
  focus inside, a touch — resumes a few seconds after), while it is off
  screen or the tab is hidden, and never moves for prefers-reduced-motion.
  Moving content needs a way to stop it (WCAG 2.2.2): the pause button.
*/
const AUTOPLAY_MS = 3500;
const RESUME_AFTER_TOUCH_MS = 6000;
export function BrandPanel({ products }: { products: Product[] }) {
  const t = useTranslations("home.v3.brand");
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const hold = useRef(false);
  const visible = useRef(false);
  const touchTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || paused || reduced) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.4 });
    io.observe(rail);
    const timer = window.setInterval(() => {
      if (hold.current || !visible.current || document.hidden) return;
      const card = rail.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.offsetWidth + parseFloat(getComputedStyle(rail).columnGap || "0");
      const end = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
      rail.scrollTo({ left: end ? 0 : rail.scrollLeft + step, behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => {
      window.clearInterval(timer);
      io.disconnect();
    };
  }, [paused, reduced]);

  const holdOn = () => {
    window.clearTimeout(touchTimer.current);
    hold.current = true;
  };
  const holdOff = (delay = 0) => {
    window.clearTimeout(touchTimer.current);
    touchTimer.current = window.setTimeout(() => (hold.current = false), delay);
  };

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
          <span className="flex items-center gap-1 lg:hidden">
            {!reduced && <PauseButton paused={paused} onToggle={() => setPaused(!paused)} label={paused ? t("play") : t("pause")} />}
            <Link href="/brands" className="flex min-h-11 items-center text-[15px] font-semibold underline-offset-2 hover:underline">
              {t("short")}
            </Link>
          </span>
          <span className="mt-auto hidden items-center gap-2 lg:flex">
            <Link href="/brands" className="inline-flex h-[52px] items-center rounded-[14px] bg-bg px-7 text-[17px] font-semibold text-ink">
              {t("cta")}
            </Link>
            {!reduced && <PauseButton paused={paused} onToggle={() => setPaused(!paused)} label={paused ? t("play") : t("pause")} />}
          </span>
        </div>

        <div
          ref={railRef}
          onMouseEnter={holdOn}
          onMouseLeave={() => holdOff()}
          onFocus={holdOn}
          onBlur={() => holdOff()}
          onTouchStart={holdOn}
          onTouchEnd={() => holdOff(RESUME_AFTER_TOUCH_MS)}
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

function PauseButton({ paused, onToggle, label }: { paused: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-pressed={paused}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-dark-2 transition-colors hover:bg-white/10 hover:text-white"
    >
      {paused ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
        </svg>
      )}
    </button>
  );
}
