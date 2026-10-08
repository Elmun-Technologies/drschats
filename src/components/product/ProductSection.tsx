"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
  A product-page section. Always open on a desktop; with `collapsible` it is an
  accordion row on a phone (design: ProductMobileV3 — Tavsif, Barcha
  xususiyatlar, Savol-javob, Hujjatlar). Closed means `display: none`, never
  <details>: Chrome keeps a closed details' content laid out, and the
  tap-target and bottom-edge audits would count links nobody can see.
*/
export function ProductSection({
  id,
  title,
  collapsible = false,
  className,
  children,
}: {
  id: string;
  title: string;
  collapsible?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-40", collapsible && "border-b border-line lg:border-0", className)}
    >
      {collapsible ? (
        <>
          <h2 id={headingId} className="hidden text-[26px] font-bold leading-8 lg:mb-4 lg:block">
            {title}
          </h2>
          <h2 className="lg:hidden">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={bodyId}
              onClick={() => setOpen((v) => !v)}
              className="flex h-14 w-full items-center justify-between text-left text-[19px] font-bold"
            >
              {title}
              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M12 5v14" className={cn("transition-opacity", open && "opacity-0")} />
                <path d="M5 12h14" />
              </svg>
            </button>
          </h2>
          <div id={bodyId} className={cn(open ? "block pb-5" : "hidden", "lg:block lg:pb-0")}>
            {children}
          </div>
        </>
      ) : (
        <>
          <h2 id={headingId} className="mb-3 text-[22px] font-bold leading-7 lg:mb-4 lg:text-[26px] lg:leading-8">
            {title}
          </h2>
          {children}
        </>
      )}
    </section>
  );
}
