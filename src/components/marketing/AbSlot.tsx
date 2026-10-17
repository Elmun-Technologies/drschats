"use client";

import { useEffect, type ReactNode } from "react";
import { abSlotCss, shownVariant } from "@/lib/merch/ab";
import { trackExperimentView } from "@/lib/analytics/events";

/*
  One A/B experiment slot (lib/merch/ab.ts). Both variants are in the HTML
  the server sent — the page stays cached and identical for everyone — and
  CSS shows the one the <head> script chose from the visitor's cookie before
  the first paint: no layout shift, and React hydrates exactly the markup it
  rendered. After mount the slot reports which variant was seen.
*/
export function AbSlot({
  experiment,
  a,
  b,
  slot,
  className,
}: {
  experiment: string;
  a: { id: number; title: string; node: ReactNode };
  b: { id: number; title: string; node: ReactNode };
  slot: "hero" | "strip" | "category";
  className?: string;
}) {
  const { id: idA, title: titleA } = a;
  const { id: idB, title: titleB } = b;
  useEffect(() => {
    const variant = shownVariant(document.documentElement.getAttribute("data-ab"), experiment);
    trackExperimentView(variant === "B" ? { id: idB, title: titleB } : { id: idA, title: titleA }, experiment, variant, slot);
  }, [experiment, idA, titleA, idB, titleB, slot]);

  return (
    <div data-ab-slot={experiment} className={className}>
      <style>{abSlotCss(experiment)}</style>
      <div data-variant="A">{a.node}</div>
      <div data-variant="B">{b.node}</div>
    </div>
  );
}
