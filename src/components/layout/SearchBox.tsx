"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { formatMoney } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/shop/category-icons";
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
  | { kind: "category"; key: string; label: string; href: string; slug: string }
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
  autoFocus = false,
}: {
  categories?: Category[];
  onNavigate?: () => void;
  className?: string;
  /** Set when the field opens in its own screen (mobile search). */
  autoFocus?: boolean;
}) {
  const t = useTranslations("common");
  const shop = useTranslations("shop");
  const nav = useTranslations("nav");
  const header = useTranslations("header");
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

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
            slug: c.slug,
          }))
      : [];

  const isSearching = trimmed.length >= MIN_QUERY;

  /*
    Before anyone types, the panel offers the top categories rather than
    nothing. An empty search box is the commonest state it's in, and a blank
    dropdown asks the visitor to already know what the catalogue is called.
  */
  const popular: Option[] = categories.slice(0, 6).map((c) => ({
    kind: "category" as const,
    key: `pop-${c.id}`,
    label: c.name,
    href: `/products/${c.slug}`,
    slug: c.slug,
  }));

  const options: Option[] = isSearching
    ? [
        ...categoryMatches,
        ...products.map((p) => ({
          kind: "product" as const,
          key: `p-${p.slug}`,
          label: p.name,
          href: `/product/${p.slug}`,
          product: p,
        })),
      ]
    : popular;

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

  const showList = open && options.length > 0;
  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form
        onSubmit={submit}
        /* The input clears its own outline, and nothing replaced it — tabbing
           into search gave no visual signal at all. The ring goes on the form
           so it traces the rounded field rather than the bare input. */
        className="flex h-[52px] items-center gap-2.5 rounded-[14px] bg-tile pl-[18px] pr-1.5 focus-within:ring-2 focus-within:ring-ink focus-within:ring-offset-2 focus-within:ring-offset-bg"
      >
        <input
          ref={inputRef}
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
          placeholder={header("searchPlaceholder")}
          className="h-11 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          aria-label={t("search")}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-ink text-white transition-colors hover:bg-black"
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
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-[20px] border border-line bg-bg py-2 shadow-pop"
        >
          {(isSearching ? categoryMatches.length > 0 : popular.length > 0) && (
            <li role="presentation" className="px-4 pb-1 pt-2 text-[13px] font-semibold text-muted">
              {isSearching ? nav("shopByCategories") : t("popularCategories")}
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
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${i === active ? "bg-tile" : ""}`}
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
                      className="h-10 w-10 shrink-0 rounded-lg bg-tile object-contain"
                    />
                  ) : (
                    <span className="h-10 w-10 shrink-0 rounded-lg bg-tile" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{opt.label}</span>
                  <span className="shrink-0 text-[15px] font-bold tabular-nums text-ink">
                    {formatMoney(opt.product.price, locale)}
                  </span>
                </>
              ) : (
                <>
                  {/* The same glyph the category rail uses. One shared hamburger
                      here made six different categories look like one row
                      repeated. */}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tile text-ink">
                    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d={getCategoryIcon(opt.slug)} />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink">
                    {opt.label}
                  </span>
                </>
              )}
            </li>
          ))}

          {/* Present whenever there is a query, so a search with no suggestions
              still shows where Enter is about to take you. Without a query it
              would read “ ” bo‘yicha natijalar and go nowhere on click. */}
          {trimmed.length > 0 && (
            <li
              role="presentation"
              onPointerDown={(e) => {
                e.preventDefault();
                goToResults();
              }}
              className="mt-1 cursor-pointer border-t border-line px-4 pb-1 pt-3 text-[15px] font-semibold text-ink"
            >
              {shop("searchResults", { query: trimmed })}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
