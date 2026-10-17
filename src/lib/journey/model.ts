import type { Touch, VisitorEventType, VisitorStage } from "@/lib/db/schema";

/*
  Pure rules of the visitor journey, shared by the collector and the admin
  screens. The stage only ever moves forward: someone who reached checkout
  once stays a checkout-stage visitor even if their next visit is a bounce.
*/

export const STAGE_ORDER: VisitorStage[] = ["visit", "product", "cart", "checkout", "customer"];

export const STAGE_LABEL: Record<VisitorStage, string> = {
  visit: "Saytga kirdi",
  product: "Mahsulot koʻrdi",
  cart: "Savatga qoʻshdi",
  checkout: "Rasmiylashtirishni boshladi",
  customer: "Sotib oldi",
};

const EVENT_STAGE: Partial<Record<VisitorEventType, VisitorStage>> = {
  page_view: "visit",
  view_item: "product",
  add_to_wishlist: "product",
  add_to_cart: "cart",
  view_cart: "cart",
  begin_checkout: "checkout",
  purchase: "customer",
};

export function stageRank(stage: VisitorStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function furthestStage(current: VisitorStage, events: { type: VisitorEventType }[]): VisitorStage {
  let best = current;
  for (const event of events) {
    const stage = EVENT_STAGE[event.type];
    if (stage && stageRank(stage) > stageRank(best)) best = stage;
  }
  return best;
}

export function deviceOf(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|httpclient|facebookexternalhit/i;

export function isBotAgent(userAgent: string): boolean {
  return !userAgent || BOT_UA.test(userAgent);
}

const PRIVATE_PARAMS = ["token", "email", "phone", "code"];

/** The path to keep: query parameters that could carry a credential or contact are dropped. */
export function safePath(raw: string): string {
  try {
    const url = new URL(raw, "https://x.invalid");
    for (const key of PRIVATE_PARAMS) url.searchParams.delete(key);
    const query = url.searchParams.toString();
    return (url.pathname + (query ? `?${query}` : "")).slice(0, 300);
  } catch {
    return "/";
  }
}

const CLICK_IDS = ["gclid", "yclid", "fbclid", "ttclid"] as const;

/** Where this session came from, read from its landing URL and referrer. Null = direct. */
export function touchOf(landing: string, referrer: string, ownHost: string): Touch | null {
  let url: URL;
  try {
    url = new URL(landing);
  } catch {
    return null;
  }
  const param = (key: string) => url.searchParams.get(key)?.trim().slice(0, 100) || undefined;
  const touch: Touch = {
    source: param("utm_source"),
    medium: param("utm_medium"),
    campaign: param("utm_campaign"),
    content: param("utm_content"),
    term: param("utm_term"),
    landing: safePath(url.pathname + url.search),
  };
  for (const id of CLICK_IDS) {
    const value = param(id);
    if (value) {
      touch.clickId = `${id}:${value.slice(0, 80)}`;
      break;
    }
  }
  let refHost = "";
  try {
    refHost = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : "";
  } catch {
    refHost = "";
  }
  if (refHost && refHost !== ownHost.replace(/^www\./, "")) touch.referrer = refHost.slice(0, 100);
  if (!touch.source && !touch.clickId && !touch.referrer) return null;
  return Object.fromEntries(Object.entries(touch).filter(([, v]) => v !== undefined)) as Touch;
}

/** One readable channel name for a touch, the same buckets as order sources. */
export function channelOf(touch: Touch | null | undefined): string {
  if (!touch) return "Bevosita";
  const source = touch.source?.toLowerCase() ?? "";
  const click = touch.clickId?.split(":", 1)[0];
  const ref = touch.referrer ?? "";
  const has = (...parts: string[]) => parts.some((part) => source.includes(part) || ref.includes(part));
  if (click === "gclid" || has("google")) return touch.medium === "organic" || (!source && !click) ? "Google qidiruv" : "Google Ads";
  if (click === "yclid" || has("yandex", "ya.ru")) return !source && !click ? "Yandex qidiruv" : "Yandex Direct";
  if (has("instagram")) return "Instagram";
  if (click === "fbclid" || has("facebook", "fb", "meta")) return "Facebook";
  if (has("telegram", "t.me")) return "Telegram";
  if (has("email", "newsletter")) return "Email";
  if (touch.source) return touch.source;
  return ref || "Bevosita";
}

export const DAY = 24 * 60 * 60 * 1000;

export function daysSince(date: Date | null | undefined, now = Date.now()): number | null {
  return date ? Math.max(0, Math.floor((now - date.getTime()) / DAY)) : null;
}
