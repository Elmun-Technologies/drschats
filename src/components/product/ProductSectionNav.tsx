"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/*
  Sticky section tabs (design: ProductV3 — Tavsif, Tarkibi, …). Anchor links,
  so they work without JavaScript; the script only marks the section in view
  and keeps the bar under the sticky desktop header, whose height changes when
  its utility row folds away on scroll.
*/
export function ProductSectionNav({ label, items }: { label: string; items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const [top, setTop] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header || typeof ResizeObserver === "undefined") return;
    const sync = () => setTop(Math.round(header.getBoundingClientRect().height));
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const offset = top + (ref.current?.offsetHeight ?? 0);
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: `-${offset + 1}px 0px -55% 0px` },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items, top]);

  return (
    <div ref={ref} style={{ top }} className="sticky z-20 hidden border-b border-line bg-bg lg:block">
      <nav aria-label={label} className="wrap no-scrollbar flex gap-9 overflow-x-auto">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active === item.id ? "location" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 py-4 text-base font-medium transition-colors",
              active === item.id ? "border-ink text-ink" : "border-transparent text-ink-2 hover:text-ink",
            )}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
