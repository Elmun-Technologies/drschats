"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
  Desktop: the sticky row of section tabs under the header. The tab whose
  section is in the upper part of the screen is marked; a click is a plain
  anchor jump, so it works before hydration too.
*/
export function SectionNav({ label, items }: { label: string; items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        const first = items.find((i) => visible.get(i.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-200px 0px -55% 0px" },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="sticky top-[var(--header-sticky)] z-20 hidden border-b border-line bg-bg lg:block">
      <nav aria-label={label} className="wrap no-scrollbar flex gap-9 overflow-x-auto">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={item.id === active ? "location" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 py-4 text-base transition-colors hover:text-ink",
              item.id === active ? "border-ink font-semibold text-ink" : "border-transparent font-medium text-muted",
            )}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

/*
  A section that is always open on desktop and an accordion row on a phone
  (ProductMobileV3: Tavsif, Barcha xususiyatlar, Savol-javob, Hujjatlar).
  Closed content is not rendered visible at all — `hidden`, not <details> —
  so the audits never count links nobody can see. A jump to the section's
  anchor opens it.
*/
export function Collapsible({
  id,
  title,
  mobileTitle = title,
  className,
  children,
}: {
  id: string;
  title: string;
  /** The accordion row's wording, when it differs from the heading's. */
  mobileTitle?: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === `#${id}`) setOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [id]);

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(SECTION_SCROLL, className)}>
      <h2 id={`${id}-title`} className="lg:mb-4 lg:text-[26px] lg:font-bold lg:leading-8">
        <span className="hidden lg:inline">{title}</span>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-body`}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-[58px] w-full items-center justify-between border-b border-line text-left text-[17px] font-semibold lg:hidden"
        >
          {mobileTitle}
          <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d={open ? "M5 12h14" : "M12 5v14M5 12h14"} />
          </svg>
        </button>
      </h2>
      <div id={`${id}-body`} className={cn(open ? "block pt-4 pb-2" : "hidden", "lg:block lg:p-0")}>
        {children}
      </div>
    </section>
  );
}

/** Anchored sections land below the sticky header and the tab row. */
const SECTION_SCROLL = "scroll-mt-4 lg:scroll-mt-[calc(var(--header-sticky)+72px)]";
