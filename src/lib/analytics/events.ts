"use client";

/*
  Analytics layer. One call reaches every configured tag:
  - GTM: `{ event, ecommerce }` on the dataLayer (ecommerce cleared first, as
    GA4's GTM integration expects);
  - GA4 without GTM: `gtag("event", …)` — gtag.js ignores plain objects on the
    dataLayer, so pushing them alone sent GA4 nothing;
  - Meta Pixel and Yandex Metrika for the conversions they optimise on.
  Every call is a no-op when its tag is absent.

  Cart events (add/remove) fire from the cart store itself, so every way of
  adding a product reports the same price — the one the line is actually sold
  at, offer included.
*/

export { getAttribution } from "./attribution";

type Payload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ym?: (...args: unknown[]) => void;
  }
}

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  /** Unit price actually charged. */
  price: number;
  quantity: number;
  /** Unit discount against the catalogue price, when an offer applies. */
  discount?: number;
  item_category?: string;
}

const CURRENCY = "UZS";
const viaGtm = Boolean(process.env.NEXT_PUBLIC_GTM_ID);

function send(event: string, params: Payload, ecommerce: boolean) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (ecommerce) {
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event, ecommerce: params });
  } else {
    window.dataLayer.push({ event, ...params });
  }
  if (!viaGtm) window.gtag?.("event", event, params);
}

/** A custom (non-ecommerce) event. */
export function track(event: string, payload: Payload = {}) {
  send(event, payload, false);
}

const valueOf = (items: AnalyticsItem[]) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export function itemOf(p: { slug: string; name: string; price: number; categorySlug?: string | null }, quantity = 1, offerPercent?: number): AnalyticsItem {
  const discount = offerPercent ? Math.round((p.price * offerPercent) / 100) : 0;
  return {
    item_id: p.slug,
    item_name: p.name,
    price: p.price - discount,
    quantity,
    ...(discount ? { discount } : {}),
    ...(p.categorySlug ? { item_category: p.categorySlug } : {}),
  };
}

export function trackViewProduct(item: AnalyticsItem) {
  send("view_item", { currency: CURRENCY, value: item.price, items: [item] }, true);
  window.fbq?.("track", "ViewContent", { content_ids: [item.item_id], content_type: "product", value: item.price, currency: CURRENCY });
}

export function trackViewItemList(listName: string, items: AnalyticsItem[]) {
  if (items.length === 0) return;
  send("view_item_list", { item_list_name: listName, items }, true);
}

export function trackAddToCart(item: AnalyticsItem) {
  const value = item.price * item.quantity;
  send("add_to_cart", { currency: CURRENCY, value, items: [item] }, true);
  window.fbq?.("track", "AddToCart", { content_ids: [item.item_id], content_type: "product", value, currency: CURRENCY });
}

export function trackRemoveFromCart(item: AnalyticsItem) {
  send("remove_from_cart", { currency: CURRENCY, value: item.price * item.quantity, items: [item] }, true);
}

export function trackAddToWishlist(item: Pick<AnalyticsItem, "item_id"> & Partial<AnalyticsItem>) {
  send("add_to_wishlist", { currency: CURRENCY, value: item.price ?? 0, items: [item] }, true);
  window.fbq?.("track", "AddToWishlist", { content_ids: [item.item_id] });
}

export function trackViewCart(items: AnalyticsItem[]) {
  send("view_cart", { currency: CURRENCY, value: valueOf(items), items }, true);
}

export function trackBeginCheckout(value: number, items: AnalyticsItem[]) {
  send("begin_checkout", { currency: CURRENCY, value, items }, true);
  window.fbq?.("track", "InitiateCheckout", { value, currency: CURRENCY, num_items: items.length });
}

export function trackSearch(term: string) {
  send("search", { search_term: term }, false);
  window.fbq?.("track", "Search", { search_string: term });
}

/**
 * The order went through. Cash on delivery makes it a lead until the courier
 * is paid, but ad platforms optimise and report revenue on `purchase`, so
 * both are sent: `purchase` with the order id (GA4 dedupes on it) and the
 * lead conversion the existing campaigns are set up on.
 */
export function trackOrder(orderId: string, totals: { total: number; shipping: number }, items: AnalyticsItem[]) {
  send(
    "purchase",
    { transaction_id: orderId, currency: CURRENCY, value: totals.total, shipping: totals.shipping, items },
    true,
  );
  send("generate_lead", { currency: CURRENCY, value: totals.total, transaction_id: orderId }, false);
  window.fbq?.(
    "track",
    "Purchase",
    { value: totals.total, currency: CURRENCY, content_ids: items.map((i) => i.item_id), content_type: "product", num_items: items.length },
    { eventID: orderId },
  );
  window.fbq?.("track", "Lead", { value: totals.total, currency: CURRENCY }, { eventID: `lead-${orderId}` });
  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (ymId) window.ym?.(Number(ymId), "reachGoal", "order_submitted", { order_price: totals.total, currency: CURRENCY });
}

export function trackUpsellView(step: number, total: number, productId: string) {
  track("upsell_view", { step, total, product_id: productId });
}

export function trackUpsellAccept(step: number, productId: string, savedAmount: number) {
  track("upsell_accept", { step, product_id: productId, saved_amount: savedAmount, currency: CURRENCY });
}

export function trackUpsellSkip(step: number, productId: string) {
  track("upsell_skip", { step, product_id: productId });
}

/** Single-page navigations: Meta Pixel and Metrika only count hard loads on their own. */
export function trackPageView(url: string) {
  window.fbq?.("track", "PageView");
  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (ymId) window.ym?.(Number(ymId), "hit", url);
}
