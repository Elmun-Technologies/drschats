"use client";

import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { itemOf, trackRecClick, trackRecImpression } from "@/lib/analytics/events";
import type { RecoItem, RecoList } from "@/lib/reco/lists";

/*
  Measures one product rail (docs/REJA-JALB-QILISH.md §5): an impression once
  the rail has really scrolled into view, and a click on any card in it — the
  card is found by its `data-slug`, so a link, the add button and the stepper
  all count, each product once per rail shown.
*/
export function useRecoTracking<T extends HTMLElement>(list: RecoList, items: readonly RecoItem[]) {
  const ref = useRef<T>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const clicked = useRef(new Set<string>());
  const key = items.map((i) => i.slug).join(",");

  useEffect(() => {
    const node = ref.current;
    if (!node || !key) return;
    clicked.current = new Set();
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      // Cards a breakpoint hides (the home grid shows 6 of 12 on a phone) were not shown.
      const shown = itemsRef.current.filter((i) => {
        const card = node.querySelector(`[data-slug="${CSS.escape(i.slug)}"]`);
        return !card || card.getClientRects().length > 0;
      });
      trackRecImpression(list, shown.map((i) => itemOf(i)));
    };
    if (typeof IntersectionObserver === "undefined") {
      fire();
      return;
    }
    // The bottom fifth of the screen does not count: a rail peeking under the fold was not seen.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        fire();
        observer.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [list, key]);

  const onClickCapture = useCallback(
    (event: MouseEvent) => {
      const card = (event.target as Element | null)?.closest?.("[data-slug]");
      if (!card || !ref.current?.contains(card)) return;
      const slug = card.getAttribute("data-slug") ?? "";
      const position = itemsRef.current.findIndex((i) => i.slug === slug);
      if (position < 0 || clicked.current.has(slug)) return;
      clicked.current.add(slug);
      trackRecClick(list, itemOf(itemsRef.current[position]), position);
    },
    [list],
  );

  return { ref, onClickCapture };
}

/** The same measurement around a rail a server component draws. */
export function TrackedRail({ list, items, children }: { list: RecoList; items: readonly RecoItem[]; children: ReactNode }) {
  const { ref, onClickCapture } = useRecoTracking<HTMLDivElement>(list, items);
  return (
    <div ref={ref} onClickCapture={onClickCapture}>
      {children}
    </div>
  );
}

