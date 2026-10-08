import { productBrand } from "@/lib/content/product-brands";
import { PRODUCT_UNITS, type DoseUnit } from "@/lib/content/product-units";
import type { HealthTopic } from "@/lib/content/health-topics";
import type { Product } from "@/lib/shopflow/types";
import { productMatchesTopic } from "./goal-facets";

/*
  The catalogue's filters (design: CatalogV3 sidebar, FiltersMobileV3 sheet).

  Shopflow filters by category, search and price only, so the rest is applied
  here over the category's pool — the same pool for the listing, the sidebar
  counts and the phone sheet's live "N ta mahsulotni koʻrsatish". Everything
  works on `ProductFacts`, a plain object small enough to hand to the client.

  A count answers "how many would I see if I also ticked this": every other
  group's selection applies, the option's own group does not.
*/

export interface ProductFacts {
  id: string;
  price: number;
  inStock: boolean;
  sale: boolean;
  brand: string | null;
  origin: string | null;
  form: DoseUnit | null;
  goals: string[];
}

export interface CatalogFilters {
  stock: boolean;
  sale: boolean;
  brands: string[];
  forms: DoseUnit[];
  origins: string[];
  goal: string | null;
  min: number | null;
  max: number | null;
}

export const EMPTY_FILTERS: CatalogFilters = {
  stock: false,
  sale: false,
  brands: [],
  forms: [],
  origins: [],
  goal: null,
  min: null,
  max: null,
};

export function toFacts(product: Product, topics: HealthTopic[]): ProductFacts {
  return {
    id: product.id,
    price: product.price,
    inStock: product.inStock,
    sale: Boolean(product.oldPrice && product.oldPrice > product.price),
    brand: productBrand(product.slug)?.slug ?? null,
    origin: product.origin ?? null,
    form: PRODUCT_UNITS[product.slug]?.unit ?? null,
    goals: topics.filter((t) => productMatchesTopic(product, t)).map((t) => t.slug),
  };
}

type Group = keyof CatalogFilters;

function matches(f: ProductFacts, filters: CatalogFilters, skip?: Group): boolean {
  if (skip !== "stock" && filters.stock && !f.inStock) return false;
  if (skip !== "sale" && filters.sale && !f.sale) return false;
  if (skip !== "brands" && filters.brands.length && !(f.brand && filters.brands.includes(f.brand))) return false;
  if (skip !== "forms" && filters.forms.length && !(f.form && filters.forms.includes(f.form))) return false;
  if (skip !== "origins" && filters.origins.length && !(f.origin && filters.origins.includes(f.origin))) return false;
  if (skip !== "goal" && filters.goal && !f.goals.includes(filters.goal)) return false;
  if (filters.min != null && f.price < filters.min) return false;
  if (filters.max != null && f.price > filters.max) return false;
  return true;
}

export function applyFilters(facts: ProductFacts[], filters: CatalogFilters): ProductFacts[] {
  return facts.filter((f) => matches(f, filters));
}

export interface FacetOption {
  value: string;
  count: number;
}

export interface FacetCounts {
  stock: number;
  sale: number;
  brands: FacetOption[];
  forms: FacetOption[];
  origins: FacetOption[];
  goals: FacetOption[];
}

function tally(facts: ProductFacts[], pick: (f: ProductFacts) => (string | null)[]): FacetOption[] {
  const counts = new Map<string, number>();
  for (const f of facts) for (const v of pick(f)) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
}

/** Options are listed from the whole pool, so ticking one never hides its siblings. */
export function facetCounts(facts: ProductFacts[], filters: CatalogFilters): FacetCounts {
  const without = (group: Group) => facts.filter((f) => matches(f, filters, group));
  const count = (group: Group, pick: (f: ProductFacts) => (string | null)[]) => {
    const live = new Map(tally(without(group), pick).map((o) => [o.value, o.count]));
    return tally(facts, pick).map((o) => ({ value: o.value, count: live.get(o.value) ?? 0 }));
  };
  return {
    stock: without("stock").filter((f) => f.inStock).length,
    sale: without("sale").filter((f) => f.sale).length,
    brands: count("brands", (f) => [f.brand]),
    forms: count("forms", (f) => [f.form]),
    origins: count("origins", (f) => [f.origin]),
    goals: count("goal", (f) => f.goals),
  };
}

export function activeFilterCount(filters: CatalogFilters): number {
  return (
    Number(filters.stock) +
    Number(filters.sale) +
    filters.brands.length +
    filters.forms.length +
    filters.origins.length +
    Number(Boolean(filters.goal)) +
    Number(filters.min != null || filters.max != null)
  );
}

const list = (v?: string) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);
const num = (v?: string) => {
  const n = Number(v);
  return v && Number.isFinite(n) && n >= 0 ? n : null;
};
const DOSE_UNITS: DoseUnit[] = ["capsule", "tablet"];

export type FilterParams = Partial<Record<"stock" | "sale" | "brand" | "form" | "origin" | "goal" | "min" | "max", string>>;

export function parseFilters(params: FilterParams): CatalogFilters {
  return {
    stock: params.stock === "1",
    sale: params.sale === "1",
    brands: list(params.brand),
    forms: list(params.form).filter((f): f is DoseUnit => DOSE_UNITS.includes(f as DoseUnit)),
    origins: list(params.origin),
    goal: params.goal?.trim() || null,
    min: num(params.min),
    max: num(params.max),
  };
}

/** The URL form of a filter set; empty values are left out so URLs stay short. */
export function filtersToQuery(filters: CatalogFilters): Record<string, string> {
  const q: Record<string, string> = {};
  if (filters.stock) q.stock = "1";
  if (filters.sale) q.sale = "1";
  if (filters.brands.length) q.brand = filters.brands.join(",");
  if (filters.forms.length) q.form = filters.forms.join(",");
  if (filters.origins.length) q.origin = filters.origins.join(",");
  if (filters.goal) q.goal = filters.goal;
  if (filters.min != null) q.min = String(filters.min);
  if (filters.max != null) q.max = String(filters.max);
  return q;
}

export function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}
