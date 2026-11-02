import { STORAGE_KEYS } from "@/lib/storage-keys";

/*
  The success page knows the order number and nothing else: the cart is
  cleared before the redirect, and order numbers are sequential, so the page
  must not look an order up by its number. The checkout leaves a short summary
  in this tab's sessionStorage instead — names, quantities, total — and the
  page shows it only for the matching number. No name, phone or address.
*/
export interface LastOrder {
  order: string;
  total: number;
  method: "courier" | "pickup";
  payment: "cod" | "online";
  items: { name: string; quantity: number }[];
}

export function saveLastOrder(summary: LastOrder) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.lastOrder, JSON.stringify(summary));
  } catch {
    // Private mode or storage off: the page simply shows less.
  }
}

export function readLastOrder(order: string): LastOrder | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.lastOrder) ?? "null") as LastOrder | null;
    if (!value || value.order !== order || !Number.isFinite(value.total) || !Array.isArray(value.items)) return null;
    return value;
  } catch {
    return null;
  }
}
