"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { cn, formatMoney } from "@/lib/utils";
import { productBrand } from "@/lib/content/product-brands";
import { chipClass } from "@/components/ui/Chip";
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
  inline = false,
  leading,
}: {
  categories?: Category[];
  onNavigate?: () => void;
  className?: string;
  /** Set when the field opens in its own screen (mobile search). */
  autoFocus?: boolean;
  /** The suggestions fill the screen below the field instead of dropping over the page. */
  inline?: boolean;
  /** Drawn before the field, inside the same row (the mobile screen's back button). */
  leading?: React.ReactNode;
}) {
  const t = useTranslations("common");
  const ts = useTranslations("shop.search");
  const header = useTranslations("header");
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Suggestion[]>([]);
  const [total, setTotal] = useState(0);
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
          .slice(0, 4)
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
        ...products.slice(0, inline ? 4 : 3).map((p) => ({
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
      setTotal(0);
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
        const data = (await res.json()) as { items?: Suggestion[]; total?: number };
        setProducts(data.items ?? []);
        setTotal(data.total ?? data.items?.length ?? 0);
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
    router.push({ pathname: "/search", query: { q: trimmed } });
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

  const showList = inline || (open && (options.length > 0 || trimmed.length > 0));
  const optionId = (i: number) => `${listboxId}-opt-${i}`;
  const categoryOptions = options.filter((o) => o.kind === "category");
  const productOptions = options.filter((o) => o.kind === "product");
  const indexOf = (opt: Option) => options.indexOf(opt);
  const optionProps = (opt: Option) => {
    const i = indexOf(opt);
    return {
      id: optionId(i),
      role: "option" as const,
      "aria-selected": i === active,
      // pointerdown, not click: it fires before the input blurs, so the list
      // is still mounted when the choice is made.
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
        go(opt.href);
      },
      onMouseEnter: () => setActive(i),
    };
  };

  return (
    <div ref={rootRef} className={cn("relative", inline && "flex min-h-0 flex-1 flex-col", className)}>
      <div className="flex items-center gap-2">
        {leading}
        <form
          onSubmit={submit}
          /* The input clears its own outline, and nothing replaced it — tabbing
             into search gave no visual signal at all. The ring goes on the form
             so it traces the rounded field rather than the bare input. */
          className="flex h-[52px] min-w-0 flex-1 items-center gap-2.5 rounded-[14px] bg-tile pl-[18px] pr-1.5 focus-within:ring-2 focus-within:ring-ink focus-within:ring-offset-2 focus-within:ring-offset-bg"
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
            placeholder={inline ? header("searchShort") : header("searchPlaceholder")}
            className="h-11 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label={t("close")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
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
      </div>

      {showList && (
        <div
          className={cn(
            "flex flex-col bg-bg",
            inline
              ? "-mx-4 mt-3 min-h-0 flex-1 border-t border-line"
              : "absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-hidden rounded-[20px] shadow-pop",
          )}
        >
          <ul id={listboxId} role="listbox" aria-label={t("search")} className="min-h-0 flex-1 overflow-y-auto">
            {categoryOptions.length > 0 && (
              <li role="presentation" className="flex flex-col gap-2.5 px-4 pb-3.5 pt-4 lg:px-5">
                <span className="text-[13px] font-semibold uppercase tracking-[0.04em] text-muted">
                  {ts("categories")}
                </span>
                <ul role="group" className="flex flex-wrap gap-2">
                  {categoryOptions.map((opt) => (
                    <li
                      key={opt.key}
                      {...optionProps(opt)}
                      className={cn(chipClass(indexOf(opt) === active), "h-11 cursor-pointer lg:h-9")}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              </li>
            )}
            {productOptions.length > 0 && (
              <li role="presentation" className="flex flex-col border-t border-line py-2 first:border-t-0">
                <span className="px-4 pb-1.5 pt-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-muted lg:px-5">
                  {ts("products")}
                </span>
                <ul role="group">
                  {productOptions.map((opt) => {
                    if (opt.kind !== "product") return null;
                    const brand = productBrand(opt.product.slug);
                    return (
                      <li
                        key={opt.key}
                        {...optionProps(opt)}
                        className={cn("flex cursor-pointer items-center gap-3 px-4 py-1.5 lg:px-5 lg:py-2", indexOf(opt) === active && "bg-tile")}
                      >
                        {opt.product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={opt.product.image}
                            alt=""
                            width={56}
                            height={56}
                            loading="lazy"
                            className="h-[60px] w-[60px] shrink-0 rounded-[14px] bg-tile object-contain p-1.5 lg:h-14 lg:w-14 lg:rounded-[12px]"
                          />
                        ) : (
                          <span className="h-[60px] w-[60px] shrink-0 rounded-[14px] bg-tile lg:h-14 lg:w-14" />
                        )}
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="line-clamp-2 text-[15px] leading-[19px] lg:truncate">{opt.label}</span>
                          {brand && <span className="hidden text-[13px] text-muted lg:block">{brand.name}</span>}
                          <span className="text-base font-bold tabular-nums lg:hidden">{formatMoney(opt.product.price, locale)}</span>
                        </span>
                        <span className="hidden shrink-0 text-base font-bold tabular-nums lg:block">
                          {formatMoney(opt.product.price, locale)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            )}
          </ul>
          {/* Present whenever there is a query, so a search with no suggestions
              still shows where Enter is about to take you. */}
          {trimmed.length > 0 && (
            <div className={cn("px-4 pb-5 pt-3 lg:px-5", inline && "border-t border-line")}>
              <button
                type="button"
                onClick={goToResults}
                className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-ink px-4 text-base font-semibold text-white transition-colors hover:bg-black lg:h-12 lg:rounded-sm"
              >
                {total > 0 ? ts("showAll", { count: total }) : ts("showResults")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
