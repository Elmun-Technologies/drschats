import type { OrderAttribution } from "@/lib/shopflow/types";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/*
  Where an order came from.

  Reading `location.search` at submit time recorded nothing: the order is
  sent from /cart, long after the ad's landing URL and its utm_* parameters
  are gone. So every page load looks for a campaign signal (utm_*, an ad
  click id, an outside referrer) and keeps two touches for 30 days — the
  first one that brought the visitor, and the latest. The order carries the
  latest, plus the first source, which is what tells a returning visitor's
  "direct" order apart from the campaign that actually found them.
*/

interface Touch {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  clickId?: string;
  landing: string;
  referrer?: string;
  at: number;
}

interface Stored {
  first: Touch;
  last: Touch;
}

const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CLICK_IDS = ["gclid", "fbclid", "yclid", "ttclid"] as const;
const MAX = 200;

const cut = (v: string | null | undefined) => (v ? v.slice(0, MAX) : undefined);

/*
  `document.referrer` keeps naming the page that opened the document for its
  whole life, so after client-side navigation it would read as a fresh outside
  visit on every route and overwrite the campaign that brought the visitor.
  It is a signal only on the document's first page view.
*/
let referrerRead = false;

function externalReferrer(): string | undefined {
  if (referrerRead) return undefined;
  referrerRead = true;
  try {
    if (!document.referrer) return undefined;
    const ref = new URL(document.referrer);
    return ref.host === window.location.host ? undefined : cut(ref.host);
  } catch {
    return undefined;
  }
}

/** The campaign signal on the current URL, or null when this visit is internal navigation. */
export function touchFromLocation(search: string, pathname: string, referrer: string | undefined, now: number): Touch | null {
  const params = new URLSearchParams(search);
  const click = CLICK_IDS.find((k) => params.get(k));
  const touch: Touch = {
    utmSource: cut(params.get("utm_source")),
    utmMedium: cut(params.get("utm_medium")),
    utmCampaign: cut(params.get("utm_campaign")),
    utmContent: cut(params.get("utm_content")),
    utmTerm: cut(params.get("utm_term")),
    clickId: click ? cut(`${click}:${params.get(click)}`) : undefined,
    landing: pathname.slice(0, MAX),
    referrer,
    at: now,
  };
  return touch.utmSource || touch.clickId || touch.referrer ? touch : null;
}

function read(now: number): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.attribution);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Stored;
    return stored?.last && now - stored.last.at < TTL_MS ? stored : null;
  } catch {
    return null;
  }
}

/** Call on every page view; cheap and silent. */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const stored = read(now);
  const touch = touchFromLocation(window.location.search, window.location.pathname, externalReferrer(), now);
  if (!touch && stored) return;
  const current = touch ?? { landing: window.location.pathname.slice(0, MAX), at: now };
  try {
    localStorage.setItem(
      STORAGE_KEYS.attribution,
      JSON.stringify({ first: stored?.first ?? current, last: current } satisfies Stored),
    );
  } catch {
    // Storage blocked: the order simply goes without a source.
  }
}

/** The attribution sent with an order. */
export function getAttribution(): OrderAttribution | undefined {
  if (typeof window === "undefined") return undefined;
  const stored = read(Date.now());
  if (!stored) return undefined;
  const { last, first } = stored;
  const firstSource = first.utmSource ?? first.referrer;
  return {
    utmSource: last.utmSource,
    utmMedium: last.utmMedium,
    utmCampaign: last.utmCampaign,
    utmContent: last.utmContent,
    utmTerm: last.utmTerm,
    clickId: last.clickId,
    landing: last.landing,
    referrer: last.referrer,
    firstSource: firstSource && firstSource !== (last.utmSource ?? last.referrer) ? firstSource : undefined,
  };
}

/** One line for the operator: "instagram / cpc / autumn-sale · first: google". */
export function describeAttribution(a: OrderAttribution | undefined): string {
  if (!a) return "";
  const source = a.utmSource
    ? [a.utmSource, a.utmMedium, a.utmCampaign].filter(Boolean).join(" / ")
    : a.clickId
      ? a.clickId.split(":")[0]
      : a.referrer ?? "";
  const parts = [source, a.firstSource ? `birinchi: ${a.firstSource}` : ""].filter(Boolean);
  return parts.join(" · ");
}
