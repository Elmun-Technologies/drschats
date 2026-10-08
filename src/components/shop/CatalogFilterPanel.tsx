"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { cn, formatNumber } from "@/lib/utils";
import { useDialog } from "@/lib/ui/useDialog";
import { chipClass } from "@/components/ui/Chip";
import {
  applyFilters,
  facetCounts,
  filtersToQuery,
  toggle,
  EMPTY_FILTERS,
  type CatalogFilters,
  type FacetOption,
  type ProductFacts,
} from "@/lib/shop/catalog-filters";
import { SORT_ORDER, sortKey, type CatalogSort } from "@/lib/shop/catalog-sort";

export interface PanelContext {
  facts: ProductFacts[];
  filters: CatalogFilters;
  sort: CatalogSort;
  basePath: string;
  /** Query that rides along unchanged (the search term). */
  keep: Record<string, string>;
  brandNames: Record<string, string>;
  goalNames: Record<string, string>;
}

function useCatalogNav({ basePath, keep }: Pick<PanelContext, "basePath" | "keep">) {
  const router = useRouter();
  return useCallback(
    (filters: CatalogFilters, sort: CatalogSort) => {
      const query: Record<string, string> = { ...keep, ...filtersToQuery(filters) };
      if (sort !== "popular") query.sort = sort;
      router.push({ pathname: basePath, query }, { scroll: false });
    },
    [router, basePath, keep],
  );
}

/*
  Design: CatalogV3 sidebar. Ticking a box navigates at once (filters are
  URLs); the price pair waits for the button, whose count is worked out here
  from the same facts the server filtered with.
*/
export function CatalogSidebar(ctx: PanelContext) {
  const t = useTranslations("shop.v3");
  const go = useCatalogNav(ctx);
  const [draft, setDraft] = useState(ctx.filters);
  const update = (next: CatalogFilters) => {
    setDraft(next);
    go(next, ctx.sort);
  };
  const shown = applyFilters(ctx.facts, draft).length;

  return (
    <div className="flex flex-col">
      <FilterGroups ctx={ctx} draft={draft} onChange={update} onPrice={setDraft} first />
      <div className="flex flex-col gap-2 pt-5">
        <button
          type="button"
          onClick={() => go(draft, ctx.sort)}
          className="flex h-12 items-center justify-center rounded-sm bg-ink px-6 text-button font-semibold text-white transition-colors hover:bg-black"
        >
          {t("show", { count: shown })}
        </button>
        <button
          type="button"
          onClick={() => update(EMPTY_FILTERS)}
          className="flex h-12 items-center justify-center rounded-sm px-6 text-button font-semibold transition-colors hover:bg-tile"
        >
          {t("clearAll")}
        </button>
      </div>
    </div>
  );
}

/*
  Design: the sticky "Filtrlar / Ommabop" pair and FiltersMobileV3, the sheet
  they open. Nothing navigates until "N ta mahsulotni koʻrsatish".
*/
export function MobileFilterBar({ ctx, activeCount }: { ctx: PanelContext; activeCount: number }) {
  const t = useTranslations("shop");
  const v3 = useTranslations("shop.v3");
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 grid grid-cols-2 gap-2 bg-bg px-4 py-1 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={BAR_BUTTON}>
          <Icon d="M4 6h16M7 12h10M10 18h4" />
          {t("filters")}
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-pill bg-ink px-1.5 text-xs text-white">{activeCount}</span>
          )}
        </button>
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${v3("sortLabel")} ${t(sortKey(ctx.sort))}`} className={BAR_BUTTON}>
          <Icon d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4" />
          {t(sortKey(ctx.sort))}
        </button>
      </div>
      {open && <FilterSheet ctx={ctx} onClose={() => setOpen(false)} />}
    </>
  );
}

function FilterSheet({ ctx, onClose }: { ctx: PanelContext; onClose: () => void }) {
  const t = useTranslations("shop");
  const v3 = useTranslations("shop.v3");
  const go = useCatalogNav(ctx);
  const [draft, setDraft] = useState(ctx.filters);
  const [sort, setSort] = useState(ctx.sort);
  const close = useCallback(() => onClose(), [onClose]);
  const ref = useDialog<HTMLDivElement>(true, close);
  const shown = applyFilters(ctx.facts, draft).length;

  return (
    <div className="fixed inset-0 z-[60] bg-ink/45 lg:hidden" onClick={close}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-0 top-14 flex flex-col rounded-t-3xl bg-bg"
      >
        <div className="flex justify-center pt-2" aria-hidden>
          <span className="h-[5px] w-10 rounded-full bg-line-strong" />
        </div>
        <div className="flex items-center justify-between border-b border-line py-2 pl-4 pr-2">
          <h2 id="filter-sheet-title" className="text-[22px] font-bold">
            {t("filters")}
          </h2>
          <div className="flex items-center">
            <button type="button" onClick={() => setDraft(EMPTY_FILTERS)} className="h-11 px-3 text-[15px] font-medium text-ink-2">
              {v3("clear")}
            </button>
            <button type="button" onClick={close} aria-label={v3("close")} className="flex h-11 w-11 items-center justify-center">
              <Icon d="M6 6l12 12M18 6L6 18" className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <Group title={t("sort")} sheet>
            <div className="flex flex-wrap gap-1.5">
              {SORT_ORDER.map((s) => (
                <button key={s} type="button" aria-pressed={s === sort} onClick={() => setSort(s)} className={cn(chipClass(s === sort), "h-9")}>
                  {t(sortKey(s))}
                </button>
              ))}
            </div>
          </Group>
          <FilterGroups ctx={ctx} draft={draft} onChange={setDraft} onPrice={setDraft} sheet />
        </div>
        <div className="border-t border-line px-4 pb-5 pt-3">
          <button
            type="button"
            onClick={() => {
              go(draft, sort);
              close();
            }}
            className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-ink text-button font-semibold text-white"
          >
            {v3("show", { count: shown })}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterGroups({
  ctx,
  draft,
  onChange,
  onPrice,
  first = false,
  sheet = false,
}: {
  ctx: PanelContext;
  draft: CatalogFilters;
  onChange: (f: CatalogFilters) => void;
  onPrice: (f: CatalogFilters) => void;
  first?: boolean;
  sheet?: boolean;
}) {
  const t = useTranslations("shop.v3");
  const health = useTranslations("health");
  const counts = useMemo(() => facetCounts(ctx.facts, draft), [ctx.facts, draft]);
  const prices = ctx.facts.map((f) => f.price);
  const low = prices.length ? Math.min(...prices) : 0;
  const high = prices.length ? Math.max(...prices) : 0;
  const formLabel: Record<string, string> = { capsule: t("formCapsule"), tablet: t("formTablet") };

  const groups: { key: "brands" | "forms" | "origins"; title: string; options: FacetOption[]; label: (v: string) => string }[] = [
    { key: "brands", title: t("brand"), options: counts.brands, label: (v) => ctx.brandNames[v] ?? v },
    { key: "forms", title: t("form"), options: counts.forms, label: (v) => formLabel[v] ?? v },
    { key: "origins", title: t("origin"), options: counts.origins, label: (v) => v },
  ];

  return (
    <>
      <Group title={t("price")} first={first} sheet={sheet}>
        <div className="grid grid-cols-2 gap-2">
          <PriceInput label={t("priceMin")} placeholder={low} value={draft.min} onChange={(min) => onPrice({ ...draft, min })} />
          <PriceInput label={t("priceMax")} placeholder={high} value={draft.max} onChange={(max) => onPrice({ ...draft, max })} />
        </div>
      </Group>
      <Group sheet={sheet}>
        <Check checked={draft.stock} count={counts.stock} onChange={() => onChange({ ...draft, stock: !draft.stock })} strong>
          {t("inStock")}
        </Check>
        <Check checked={draft.sale} count={counts.sale} onChange={() => onChange({ ...draft, sale: !draft.sale })} strong>
          {t("onSale")}
        </Check>
      </Group>
      {counts.goals.length > 0 && (
        <Group title={health("goal.plural")} sheet={sheet}>
          {counts.goals.map((o) => (
            <Check
              key={o.value}
              checked={draft.goal === o.value}
              count={o.count}
              onChange={() => onChange({ ...draft, goal: draft.goal === o.value ? null : o.value })}
            >
              {ctx.goalNames[o.value] ?? o.value}
            </Check>
          ))}
        </Group>
      )}
      {groups
        .filter((g) => g.options.length > 1)
        .map((g) => (
          <Group key={g.key} title={g.title} sheet={sheet}>
            {g.options.map((o) => (
              <Check
                key={o.value}
                checked={(draft[g.key] as string[]).includes(o.value)}
                count={o.count}
                onChange={() => onChange({ ...draft, [g.key]: toggle(draft[g.key] as string[], o.value) })}
              >
                {g.label(o.value)}
              </Check>
            ))}
          </Group>
        ))}
    </>
  );
}

function Group({ title, children, first = false, sheet = false }: { title?: string; children: ReactNode; first?: boolean; sheet?: boolean }) {
  return (
    <fieldset className={cn("flex flex-col gap-3 border-b border-line", sheet ? "px-4 py-[18px]" : first ? "pb-5" : "py-5")}>
      {title && <legend className={cn("float-left mb-0 w-full font-bold", sheet ? "text-[17px]" : "text-base")}>{title}</legend>}
      {children}
    </fieldset>
  );
}

function Check({
  checked,
  count,
  onChange,
  strong = false,
  children,
}: {
  checked: boolean;
  count: number;
  onChange: () => void;
  strong?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex min-h-6 cursor-pointer items-center gap-2.5 text-[15px]", strong && "font-semibold", count === 0 && !checked && "text-muted")}>
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
          checked ? "border-ink bg-ink" : "border-[#8A8F95]",
        )}
      >
        {checked && <Icon d="M5 12l5 5 9-10" className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      <span className="text-sm font-normal text-muted">{count}</span>
    </label>
  );
}

function PriceInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: number;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      placeholder={formatNumber(placeholder)}
      value={value == null ? "" : formatNumber(value)}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "");
        onChange(digits ? Number(digits) : null);
      }}
      className="h-11 w-full min-w-0 rounded-sm border-[1.5px] border-line-strong bg-bg px-3.5 text-[15px] text-ink outline-none placeholder:text-muted focus:border-ink"
    />
  );
}

const BAR_BUTTON =
  "flex h-11 items-center justify-center gap-2 rounded-sm bg-tile text-[15px] font-semibold transition-colors hover:bg-tile-hover";

function Icon({ d, className = "h-[18px] w-[18px]", strokeWidth = 1.75 }: { d: string; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
