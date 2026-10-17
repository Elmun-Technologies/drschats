/*
  Stock rules, pure: no database, no Next. The storefront (client
  components), the order write and the admin panel all read them, so "kam
  qoldi" means the same number everywhere and the tests cover it once.

  A product's count is either tracked (a number, from products.stock_qty) or
  not (null) — and an untracked product behaves exactly as before stock
  existed: in_stock alone decides, no number is ever shown.
*/

/** The site default for "kam qoldi" when a product has no threshold of its own. */
export const DEFAULT_LOW_STOCK_AT = 5;
export const LOW_STOCK_SETTING_KEY = "stock.lowStockAt";

export interface StockInfo {
  qty: number;
  lowAt: number;
}

export function parseLowStockAt(raw: string | null | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 1000 ? n : DEFAULT_LOW_STOCK_AT;
}

/**
 * The number to say out loud ("Omborda 3 ta qoldi"), or null. Only a real,
 * tracked count, only when it is low, and never 0 — a sold-out product says
 * "sotuvda yoʻq", not "0 ta qoldi".
 */
export function lowStockLeft(stock: StockInfo | null | undefined): number | null {
  if (!stock) return null;
  return stock.qty > 0 && stock.qty <= stock.lowAt ? stock.qty : null;
}

/** The most units one cart line may ask for, given a tracked count (a hint; the server decides). */
export function stockCap(cap: number, stockQty: number | null | undefined): number {
  return stockQty == null ? cap : Math.max(0, Math.min(cap, stockQty));
}

/**
 * Units per product in an order, sorted by product id. Rows are always
 * locked in this one order, so two orders sharing products cannot deadlock.
 */
export function quantitiesByProduct(items: { productId: string; quantity: number }[]): [string, number][] {
  const sums = new Map<string, number>();
  for (const item of items) {
    if (!(item.quantity > 0)) continue;
    sums.set(item.productId, (sums.get(item.productId) ?? 0) + item.quantity);
  }
  return [...sums.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * What a cancel gives back: the net of an order's own movements per product.
 * Cancelling twice finds a net of zero the second time, so nothing is added
 * twice.
 */
export function cancelRestores(movements: { productId: string; delta: number }[]): [string, number][] {
  const net = new Map<string, number>();
  for (const m of movements) net.set(m.productId, (net.get(m.productId) ?? 0) + m.delta);
  return [...net.entries()]
    .filter(([, n]) => n < 0)
    .map(([id, n]): [string, number] => [id, -n])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * What re-opening a cancelled order takes again: the order's units for every
 * product whose net is back at zero (it was taken and given back).
 */
export function reopenTakes(movements: { productId: string; delta: number; reason: string }[]): [string, number][] {
  const net = new Map<string, number>();
  const taken = new Map<string, number>();
  for (const m of movements) {
    net.set(m.productId, (net.get(m.productId) ?? 0) + m.delta);
    if (m.reason === "order") taken.set(m.productId, (taken.get(m.productId) ?? 0) - m.delta);
  }
  return [...taken.entries()]
    .filter(([id, n]) => n > 0 && (net.get(id) ?? 0) >= 0)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

export type AdjustMode = "delta" | "set";

/** The admin's "+/−" or "aniq son": the new count, never below zero. */
export function adjustedQty(current: number | null, mode: AdjustMode, value: number): number {
  const base = current ?? 0;
  return Math.max(0, Math.round(mode === "set" ? value : base + value));
}

export type StockLabel = { label: string; tone: "neutral" | "outline" | "dark" | "muted"; low: boolean };

/** The products list's stock pill: "12 ta", "kam: 3", "tugagan", "kuzatilmaydi". */
export function stockLabel(qty: number | null, lowAt: number): StockLabel {
  if (qty == null) return { label: "kuzatilmaydi", tone: "muted", low: false };
  if (qty <= 0) return { label: "tugagan", tone: "outline", low: true };
  if (qty <= lowAt) return { label: `kam: ${qty}`, tone: "dark", low: true };
  return { label: `${qty} ta`, tone: "neutral", low: false };
}

/** Low for the "Kam qolganlar" chip and the dashboard: tracked and at or under the threshold, sold out included. */
export function isLowStock(qty: number | null, lowAt: number): boolean {
  return qty != null && qty <= lowAt;
}

export interface WaitingRequest {
  id: number;
  kind: "restock" | "price_drop";
  targetPrice: number | null;
}

/**
 * The waiting requests a product's current state fulfils. Back in stock
 * answers "restock"; a price below what the customer saw answers
 * "price_drop" — and only while it can be bought, because "it is cheaper
 * now" about a product nobody can order is not news.
 */
export function dueRequests<T extends WaitingRequest>(requests: T[], product: { inStock: boolean; price: number }): T[] {
  if (!product.inStock) return [];
  return requests.filter((r) =>
    r.kind === "restock" ? true : r.targetPrice != null && product.price < r.targetPrice,
  );
}

/** Last nine digits — how a phone is matched across orders, links and requests. */
export function phone9Of(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 9 ? digits.slice(-9) : null;
}
