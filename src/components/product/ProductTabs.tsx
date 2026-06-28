"use client";

import { useState } from "react";
import type { Product } from "@/lib/shopflow/types";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  t: {
    benefits: string;
    ingredients: string;
    ingredientName: string;
    ingredientAmount: string;
    ingredientDV: string;
    howToUse: string;
    faq: string;
  };
}

const TABS = ["benefits", "ingredients", "faq"] as const;
type Tab = typeof TABS[number];

export function ProductTabs({ product, t }: Props) {
  const [active, setActive] = useState<Tab>("benefits");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
              active === tab
                ? "bg-accent text-ink shadow-sm"
                : "text-muted hover:text-fg",
            )}
          >
            {tab === "benefits" ? t.benefits : tab === "ingredients" ? t.ingredients : t.faq}
          </button>
        ))}
      </div>

      {/* Panel: Description / Benefits */}
      {active === "benefits" && (
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-muted">{product.description}</p>
            <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
              <h3 className="mb-2 font-display text-base font-semibold">{t.howToUse}</h3>
              <p className="text-sm text-muted">{product.howToUse}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.benefits.map((b, i) => (
              <div key={b.title} className="h-full rounded-2xl border border-line bg-surface p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-display text-sm font-semibold">{b.title}</h3>
                <p className="mt-1 text-xs text-muted">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel: Ingredients */}
      {active === "ingredients" && (
        <div className="mt-6 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">{t.ingredientName}</th>
                  <th className="px-5 py-3 font-medium">{t.ingredientAmount}</th>
                  <th className="px-5 py-3 font-medium">{t.ingredientDV}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {product.ingredients.map((row) => (
                  <tr key={row.name} className="bg-surface">
                    <td className="px-5 py-3 font-medium text-fg">{row.name}</td>
                    <td className="px-5 py-3 text-muted">{row.amount}</td>
                    <td className="px-5 py-3 text-muted">{row.dailyValue ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panel: FAQ */}
      {active === "faq" && (
        <div className="mt-6">
          {product.faq.length > 0 ? (
            <FaqList items={product.faq} />
          ) : (
            <p className="text-muted">—</p>
          )}
        </div>
      )}
    </div>
  );
}

function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-fg"
          >
            <span>{item.question}</span>
            <svg
              viewBox="0 0 20 20"
              className={cn("h-5 w-5 shrink-0 text-muted transition-transform", open === i && "rotate-180")}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm text-muted">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
