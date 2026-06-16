"use client";

/*
  Thin analytics layer for context-ads conversion tracking. Pushes to the GTM
  dataLayer and to Meta Pixel / Yandex Metrika if their IDs are configured.
  All calls are no-ops when the corresponding tag isn't present.
*/

type Payload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    ym?: (...args: unknown[]) => void;
  }
}

export function track(event: string, payload: Payload = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

export function trackViewProduct(slug: string, price: number) {
  track("view_item", { item_id: slug, value: price, currency: "UZS" });
  window.fbq?.("track", "ViewContent", { content_ids: [slug], value: price, currency: "UZS" });
}

export function trackAddToCart(slug: string, price: number, quantity: number) {
  track("add_to_cart", { item_id: slug, value: price * quantity, currency: "UZS", quantity });
  window.fbq?.("track", "AddToCart", { content_ids: [slug], value: price * quantity, currency: "UZS" });
}

export function trackBeginCheckout(value: number) {
  track("begin_checkout", { value, currency: "UZS" });
  window.fbq?.("track", "InitiateCheckout", { value, currency: "UZS" });
}

/** The key conversion: a confirmed lead/zayavka sent to Shopflow. */
export function trackLead(orderId: string, value: number) {
  track("generate_lead", { order_id: orderId, value, currency: "UZS" });
  window.fbq?.("track", "Lead", { value, currency: "UZS" });
  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (ymId) window.ym?.(Number(ymId), "reachGoal", "order_submitted");
}

/** Read UTM/referrer for ad attribution stored on the order. */
export function getAttribution() {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const attr = {
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    landing: window.location.pathname,
    referrer: document.referrer || undefined,
  };
  const hasAny = Object.values(attr).some(Boolean);
  return hasAny ? attr : undefined;
}
