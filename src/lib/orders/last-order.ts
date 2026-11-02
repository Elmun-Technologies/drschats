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

/*
  «Buyurtmalarim» without an account: every order placed in this browser
  leaves its signed tracking link here (localStorage), so a returning
  customer finds their orders, their status and «Takrorlash» on /orders. The
  token is the only key to an order page and carries no name, phone or
  address; the list holds a summary for the row and nothing more.
*/
export interface RememberedOrder {
  order: string;
  /** The signed /track/<token> part (lib/messaging/tokens.ts → orderTrackToken). */
  track: string;
  total: number;
  /** ISO time the order was placed. */
  at: string;
  items: { name: string; quantity: number }[];
}

const MAX_REMEMBERED = 30;

export function readOrders(): RememberedOrder[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) ?? "[]") as unknown;
    if (!Array.isArray(value)) return [];
    return value.filter(
      (o): o is RememberedOrder =>
        Boolean(o) && typeof o.order === "string" && typeof o.track === "string" && Number.isFinite(o.total) && Array.isArray(o.items),
    );
  } catch {
    return [];
  }
}

export function rememberOrder(entry: RememberedOrder) {
  try {
    const rest = readOrders().filter((o) => o.order !== entry.order);
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify([entry, ...rest].slice(0, MAX_REMEMBERED)));
  } catch {
    // Storage off: the order is still reachable from its SMS / Telegram link.
  }
}

export function forgetOrder(order: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(readOrders().filter((o) => o.order !== order)));
  } catch {
    // Nothing to forget without storage.
  }
}
