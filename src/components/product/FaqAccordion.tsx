"use client";

import { useId, useState } from "react";
import type { FaqItem } from "@/lib/shopflow/types";

export function FaqAccordion({
  items,
  defaultOpen = 0,
}: {
  items: FaqItem[];
  /** Index of the answer shown on load; null starts with all closed. */
  defaultOpen?: number | null;
}) {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="divide-y divide-line border-b border-line">
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
                className="flex min-h-[58px] w-full items-center justify-between gap-3 py-3 text-left text-base font-medium text-ink lg:min-h-16 lg:text-[17px]"
              >
                <span>{item.question}</span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
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
                <p className="pb-5 text-body text-ink-2">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
