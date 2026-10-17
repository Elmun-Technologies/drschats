/*
  A/B tests of banners — the pure half: assignment, the pre-paint script,
  grouping and the significance test.

  How a visitor sees one variant without a hydration mismatch, without layout
  shift, and with the home page still ISR (one cached HTML for everyone):

  1. middleware.ts gives every browser a random `gv_ab` cookie (1 year,
     readable by scripts — it identifies a bucket, nothing else).
  2. The page HTML carries BOTH variants of an experiment slot. CSS hides B by
     default, so without the cookie or JavaScript everyone sees A.
  3. A tiny inline script in <head> (`abHeadScript`, rendered by the locale
     layout with the live experiment keys) reads the cookie and writes
     `data-ab="<key>:A <key>:B …"` on <html> before the body is parsed. The
     slot's CSS (`abSlotCss`) shows the visitor's variant from that attribute.
     The choice is made before the first paint, so nothing moves; React
     hydrates the same markup the server sent (the attribute on <html> is
     covered by suppressHydrationWarning there).
  4. After mount, the slot reads the attribute to know which variant was seen
     and sends one exposure beacon per session; clicks go through the usual
     banner click beacon.

  Assignment is FNV-1a of "<cookie>:<experiment>", bit-mixed (mix32) —
  deterministic per visitor and experiment, independent across experiments,
  50/50. The head script
  carries the same function, tested to agree (ab.test.ts).
*/

export const AB_COOKIE = "gv_ab";
export const AB_COOKIE_RE = /^[A-Za-z0-9_-]{8,64}$/;
export const EXPERIMENT_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;

export type Variant = "A" | "B";

/** 32-bit FNV-1a over UTF-16 code units (ASCII keys and cookies). */
export function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * The finaliser of MurmurHash3. FNV-1a's lowest bit is only the parity of
 * the input's characters, so its bits are mixed before one is used.
 */
export function mix32(h: number): number {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

export function assignVariant(abId: string, experiment: string): Variant {
  return mix32(fnv1a(`${abId}:${experiment}`)) % 2 === 0 ? "A" : "B";
}

/**
 * The inline <head> script. Keys are validated (EXPERIMENT_RE) before they
 * reach it, so they can be embedded as a JSON array literally.
 */
export function abHeadScript(experiments: string[]): string {
  const keys = JSON.stringify(experiments.filter((k) => EXPERIMENT_RE.test(k)));
  return (
    `(function(){try{var m=document.cookie.match(/(?:^|; )${AB_COOKIE}=([A-Za-z0-9_-]{8,64})/);if(!m)return;` +
    `var id=m[1],k=${keys},o=[];for(var i=0;i<k.length;i++){var s=id+":"+k[i],h=2166136261;` +
    `for(var j=0;j<s.length;j++){h^=s.charCodeAt(j);h=Math.imul(h,16777619)>>>0}` +
    `h^=h>>>16;h=Math.imul(h,2246822507);h^=h>>>13;h=Math.imul(h,3266489909);h^=h>>>16;h=h>>>0;` +
    `o.push(k[i]+":"+(h%2===0?"A":"B"))}` +
    `document.documentElement.setAttribute("data-ab",o.join(" "))}catch(e){}})();`
  );
}

/** CSS for one slot: B hidden unless the head script chose B for this visitor. */
export function abSlotCss(experiment: string): string {
  if (!EXPERIMENT_RE.test(experiment)) return "";
  const slot = `[data-ab-slot="${experiment}"]`;
  const isB = `html[data-ab~="${experiment}:B"]`;
  return `${slot}>[data-variant="B"]{display:none}${isB} ${slot}>[data-variant="A"]{display:none}${isB} ${slot}>[data-variant="B"]{display:block}`;
}

/** The variant the head script chose for this page view (client only; "A" without a cookie). */
export function shownVariant(attr: string | null, experiment: string): Variant {
  return (attr ?? "").split(" ").includes(`${experiment}:B`) ? "B" : "A";
}

export function newAbId(randomUUID: () => string): string {
  return randomUUID().replace(/-/g, "");
}

/** Day key (Tashkent) for exposure counting — one row per visitor, banner and day. */
export function tashkentDay(now: Date): string {
  return new Date(now.getTime() + 5 * 3_600_000).toISOString().slice(0, 10);
}

/* ─── Statistics ─────────────────────────────────────────────────────── */

export interface ArmStats {
  exposures: number;
  clicks: number;
}

export interface ZTest {
  /** Enough data to say anything: each arm ≥ minExposures and ≥ minClicks clicks in total. */
  enough: boolean;
  ctrA: number;
  ctrB: number;
  z: number;
  /** Two-sided p-value. */
  p: number;
  significant: boolean;
  /** The arm with the higher CTR when significant, else null. */
  winner: Variant | null;
}

/** Standard normal CDF (Abramowitz–Stegun 7.1.26 erf, |error| < 1.5e-7). */
export function normalCdf(x: number): number {
  const t = 1 / (1 + 0.3275911 * (Math.abs(x) / Math.SQRT2));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(x * x) / 2);
  return x >= 0 ? (1 + y) / 2 : (1 - y) / 2;
}

/**
 * Two-proportion z-test on click-through (clicks / exposures), pooled
 * variance, two-sided, alpha 0.05. Below the minimum sample it reports
 * `enough: false` and no winner — the admin shows "not enough data yet".
 */
export function twoProportionZ(a: ArmStats, b: ArmStats, opts: { minExposures?: number; minClicks?: number; alpha?: number } = {}): ZTest {
  const minExposures = opts.minExposures ?? 200;
  const minClicks = opts.minClicks ?? 10;
  const alpha = opts.alpha ?? 0.05;
  const ctrA = a.exposures > 0 ? Math.min(1, a.clicks / a.exposures) : 0;
  const ctrB = b.exposures > 0 ? Math.min(1, b.clicks / b.exposures) : 0;
  const enough = a.exposures >= minExposures && b.exposures >= minExposures && a.clicks + b.clicks >= minClicks;
  const pooled = a.exposures + b.exposures > 0 ? Math.min(1, (a.clicks + b.clicks) / (a.exposures + b.exposures)) : 0;
  const se = a.exposures > 0 && b.exposures > 0 ? Math.sqrt(pooled * (1 - pooled) * (1 / a.exposures + 1 / b.exposures)) : 0;
  const z = se > 0 ? (ctrB - ctrA) / se : 0;
  const p = se > 0 ? 2 * (1 - normalCdf(Math.abs(z))) : 1;
  const significant = enough && p < alpha;
  return { enough, ctrA, ctrB, z, p, significant, winner: significant ? (ctrB > ctrA ? "B" : "A") : null };
}

/** Banners grouped into experiment slots: a key with both variants live is a test; a lone variant shows as a plain banner. */
export function pairVariants<T extends { experiment: string | null; variant: Variant | null }>(items: T[]): { single: T[]; pairs: { key: string; A: T; B: T }[] } {
  const byKey = new Map<string, Partial<Record<Variant, T>>>();
  const single: T[] = [];
  for (const item of items) {
    if (!item.experiment || !item.variant) {
      single.push(item);
      continue;
    }
    const slot = byKey.get(item.experiment) ?? {};
    if (!slot[item.variant]) slot[item.variant] = item;
    byKey.set(item.experiment, slot);
  }
  const pairs: { key: string; A: T; B: T }[] = [];
  for (const [key, slot] of byKey) {
    if (slot.A && slot.B) pairs.push({ key, A: slot.A, B: slot.B });
    else single.push((slot.A ?? slot.B)!);
  }
  return { single, pairs };
}
