"use client";

import { useId, useState } from "react";
import type { FaqItem } from "@/lib/shopflow/types";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const triggerId = `${uid}-faq-trigger-${i}`;
        const panelId = `${uid}-faq-panel-${i}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="font-medium text-fg">{item.question}</span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className={`h-5 w-5 shrink-0 text-accent-strong transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </button>
            </h3>
            {/* The answer stays in the DOM so the panel can animate to its own
                height, and `inert` keeps a collapsed one out of the
                accessibility tree and the tab order. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              data-open={isOpen}
              inert={!isOpen}
              className="accordion-panel"
            >
              <div>
                <p className="pb-5 text-muted">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
