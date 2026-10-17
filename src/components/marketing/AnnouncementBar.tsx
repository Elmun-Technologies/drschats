"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { StoreAnnouncement, StoreBanner } from "@/lib/merch/model";
import { cn } from "@/lib/utils";
import { BannerLink, useUnexpired } from "./BannerLink";
import { splitLeft, useRemaining } from "./SaleCountdown";

const ROTATE_MS = 6000;

/* "2 kun 05:12:33" — the time left to a real end, inline. */
export function InlineClock({ endsAt, className }: { endsAt: string; className?: string }) {
  const t = useTranslations("countdown");
  const left = useRemaining(endsAt, 1000);
  if (left === null || left <= 0) return null;
  const { days, clock } = splitLeft(left);
  return (
    <span className={cn("font-bold tabular-nums", className)}>
      {days > 0 && `${days} ${t("days")} `}
      {clock}
    </span>
  );
}

/*
  The announcement bar (admin → Vitrina → Eʼlon qatori). Several lines take
  turns every 6 seconds; the rotation holds while the pointer or focus is on
  it, never runs for reduced motion, and has a pause button (WCAG 2.2.2).
  A line with an end leaves at that second.
*/
export function AnnouncementBar({ items, variant }: { items: StoreAnnouncement[]; variant: "desktop" | "mobile" }) {
  const t = useTranslations("header");
  const live = useUnexpired(items);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const [reduced, setReduced] = useState(false);
  const count = live.length;

  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  useEffect(() => {
    if (count < 2 || paused || hold || reduced) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [count, paused, hold, reduced]);

  const item = live[index % Math.max(1, count)];
  if (!item) return null;

  const body = (
    <>
      <span className="min-w-0 truncate">{item.text}</span>
      {item.countdownTo && <InlineClock endsAt={item.countdownTo} className="shrink-0 text-ink" />}
    </>
  );
  const line = item.href ? (
    <BannerLink href={item.href} slot="strip" className="inline-flex min-w-0 items-center gap-2 font-semibold text-ink underline-offset-4 hover:underline">
      {body}
    </BannerLink>
  ) : (
    <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-ink">{body}</span>
  );

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1",
        variant === "mobile" ? "h-9 justify-center bg-tile px-4 text-[13px]" : "flex-1 justify-center text-sm",
      )}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <span key={item.id} className="hero-slide-in flex min-w-0 items-center">{line}</span>
      {count > 1 && !reduced && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? t("announcementPlay") : t("announcementPause")}
          aria-pressed={paused}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-2 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="currentColor">
            {paused ? <path d="M8 5v14l11-7z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
          </svg>
        </button>
      )}
    </div>
  );
}

/*
  The thin promo strip under the header (banners placed "strip"). The first
  one running is shown; it leaves at its end.
*/
export function PromoStrip({ banners }: { banners: StoreBanner[] }) {
  const live = useUnexpired(banners);
  const b = live[0];
  if (!b) return null;
  const dark = b.theme === "dark";
  return (
    <BannerLink
      href={b.href}
      slot="strip"
      banner={{ id: b.id, title: b.title }}
      className={cn(
        "flex min-h-11 items-center justify-center gap-x-3 px-4 py-2 text-center text-[13px] lg:text-sm",
        dark ? "bg-dark-panel text-white hover:bg-ink" : "bg-yellow-banner text-ink",
      )}
    >
      <span className="font-semibold">{b.title}</span>
      {b.subtitle && <span className={cn("max-md:hidden", dark ? "text-on-dark-2" : "text-ink-2")}>{b.subtitle}</span>}
      {b.countdownTo && <InlineClock endsAt={b.countdownTo} className={dark ? "text-white" : "text-ink"} />}
      {b.cta && <span className="font-semibold underline underline-offset-4 max-sm:hidden">{b.cta}</span>}
    </BannerLink>
  );
}
