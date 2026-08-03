"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { formatMoney } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/routing";
import type { Category } from "@/lib/shopflow/types";

interface Suggestion {
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string | null;
}

type Option =
  | { kind: "category"; key: string; label: string; href: string }
  | { kind: "product"; key: string; label: string; href: string; product: Suggestion };

const MIN_QUERY = 2;
const DEBOUNCE_MS = 250;

/*
  Header search with type-ahead.

  Two sources, deliberately unmixed: categories are matched locally from data
  the header already holds, so they appear the instant a letter lands, while
  products come from the API a moment later. Showing the local matches
  immediately is what keeps the box from feeling dead while someone types.

  Suggestions are an accelerator, never a gate — the form submits to the shop
  page whether or not the request succeeded, so a failing API costs a
  convenience and not the search itself.
*/
export function SearchBox({
  categories = [],
  onNavigate,
  className = "",
}: {
  categories?: Category[];
  onNavigate?: () => void;
  className?: string;
}) {
  const t = useTranslations("common");
  const shop = useTranslations("shop");
  const nav = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();

  const categoryMatches: Option[] =
    trimmed.length >= MIN_QUERY
      ? categories
          .filter((c) => c.name.toLowerCase().includes(trimmed.toLowerCase()))
          .slice(0, 3)
          .map((c) => ({
            kind: "category" as const,
            key: `c-${c.id}`,
            label: c.name,
            href: `/products/${c.slug}`,
          }))
      : [];

  const options: Option[] = [
    ...categoryMatches,
    ...products.map((p) => ({
      kind: "product" as const,
      key: `p-${p.slug}`,
      label: p.name,
      href: `/product/${p.slug}`,
      product: p,
    })),
  ];

  useEffect(() => {
    if (trimmed.length < MIN_QUERY) {
      setProducts([]);
      return;
    }

    // Abort rather than ignore: a slow early request must not land after a
    // fast later one and repopulate the list with stale matches.
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&locale=${locale}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { items?: Suggestion[] };
        setProducts(data.items ?? []);
      } catch {
        // Aborted or offline — the form still submits.
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, locale]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function go(href: string) {
    setOpen(false);
    setActive(-1);
    onNavigate?.();
    router.push(href);
  }

  function goToResults() {
    if (!trimmed) return;
    setOpen(false);
    setActive(-1);
    onNavigate?.();
    router.push({ pathname: "/products", query: { q: trimmed } });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && options[active]) {
      go(options[active].href);
      return;
    }
    goToResults();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    }
  }

  const showList = open && trimmed.length >= MIN_QUERY;
  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form
        onSubmit={submit}
        /* The input clears its own outline, and nothing replaced it — tabbing
           into search gave no visual signal at all. The ring goes on the form
           so it traces the rounded field rather than the bare input. */
        className="flex items-center rounded-full border border-line-strong bg-surface pl-5 pr-1.5 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-ink"
      >
        <input
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
          aria-label={t("search")}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={`${t("search")}…`}
          className="h-11 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-faint"
        />
        <button
          type="submit"
          aria-label={t("search")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-strong"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" />
          </svg>
        </button>
      </form>

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t("search")}
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-ink py-2 shadow-[0_24px_48px_-24px_rgba(19,22,50,0.35)]"
        >
          {categoryMatches.length > 0 && (
            <li role="presentation" className="px-4 pb-1 pt-2 text-xs font-bold uppercase tracking-widest text-faint">
              {nav("shopByCategories")}
            </li>
          )}

          {options.map((opt, i) => (
            <li
              key={opt.key}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              // pointerdown, not click: it fires before the input blurs, so the
              // list is still mounted when the choice is made.
              onPointerDown={(e) => {
                e.preventDefault();
                go(opt.href);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${i === active ? "bg-surface" : ""}`}
            >
              {opt.kind === "product" ? (
                <>
                  {opt.product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={opt.product.image}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      className="h-10 w-10 shrink-0 rounded-lg bg-surface object-cover"
                    />
                  ) : (
                    <span className="h-10 w-10 shrink-0 rounded-lg bg-surface" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm text-fg">{opt.label}</span>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-danger">
                    {formatMoney(opt.product.price, locale)}
                  </span>
                </>
              ) : (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-accent-strong">
                    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                      <path d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">
                    {opt.label}
                  </span>
                </>
              )}
            </li>
          ))}

          {/* Always present, so a query with no suggestions still shows where
              Enter is about to take you. */}
          <li
            role="presentation"
            onPointerDown={(e) => {
              e.preventDefault();
              goToResults();
            }}
            className="mt-1 cursor-pointer border-t border-line px-4 pb-1 pt-3 text-sm font-semibold text-accent-strong"
          >
            {shop("searchResults", { query: trimmed })}
          </li>
        </ul>
      )}
    </div>
  );
}
