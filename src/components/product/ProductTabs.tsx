"use client";

import { useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/shopflow/types";
import { FaqAccordion } from "@/components/product/FaqAccordion";
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
    tabsLabel: string;
  };
}

type TabId = "benefits" | "ingredients" | "faq";

export function ProductTabs({ product, t }: Props) {
  const tabs = useMemo(() => {
    const list: { id: TabId; label: string }[] = [{ id: "benefits", label: t.benefits }];
    if (product.ingredients.length > 0) list.push({ id: "ingredients", label: t.ingredients });
    if (product.faq.length > 0) list.push({ id: "faq", label: t.faq });
    return list;
  }, [product.ingredients.length, product.faq.length, t.benefits, t.ingredients, t.faq]);

  const [active, setActive] = useState<TabId>("benefits");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  if (tabs.length < 2) return <BenefitsPanel product={product} t={t} />;

  function focusTab(index: number) {
    const next = tabs[(index + tabs.length) % tabs.length];
    setActive(next.id);
    tabRefs.current[next.id]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusTab(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusTab(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTab(tabs.length - 1);
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={t.tabsLabel}
        className="no-scrollbar flex snap-x gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={`product-tab-${tab.id}`}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            role="tab"
            type="button"
            aria-selected={active === tab.id}
            aria-controls={`product-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              "shrink-0 snap-start whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex-1 sm:shrink",
              active === tab.id ? "bg-accent text-ink shadow-sm" : "text-muted hover:text-fg",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`product-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`product-tab-${tab.id}`}
          tabIndex={0}
          hidden={active !== tab.id}
          className="mt-6 focus-visible:outline-none"
        >
          {tab.id === "benefits" && <BenefitsPanel product={product} t={t} />}
          {tab.id === "ingredients" && <IngredientsPanel product={product} t={t} />}
          {tab.id === "faq" && <FaqAccordion items={product.faq} />}
        </div>
      ))}
    </div>
  );
}

function BenefitsPanel({ product, t }: Props) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="text-muted">{product.description}</p>
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-2 font-display text-base font-semibold">{t.howToUse}</h3>
          <p className="text-sm text-muted">{product.howToUse}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {product.benefits.map((b) => (
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
  );
}

function IngredientsPanel({ product, t }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] text-left text-sm">
          <thead className="bg-surface-2 text-muted">
            <tr>
              <th scope="col" className="px-3 py-3 font-medium sm:px-5">{t.ingredientName}</th>
              <th scope="col" className="px-3 py-3 font-medium sm:px-5">{t.ingredientAmount}</th>
              <th scope="col" className="px-3 py-3 font-medium sm:px-5">{t.ingredientDV}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {product.ingredients.map((row) => (
              <tr key={row.name} className="bg-surface">
                <th scope="row" className="px-3 py-3 text-left font-medium text-fg sm:px-5">{row.name}</th>
                <td className="px-3 py-3 text-muted sm:px-5">{row.amount}</td>
                <td className="px-3 py-3 text-muted sm:px-5">{row.dailyValue ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
