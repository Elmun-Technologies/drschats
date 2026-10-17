import { z } from "zod";

/*
  Storefront merchandising (admin → Vitrina), the pure half: shapes, schedule
  windows, link and announcement validation. Plain module — the storefront's
  client components, the server readers and the admin actions all use it.
*/

export type L10n = { uz: string; ru: string };

export const PLACEMENT_LABEL: Record<"hero" | "strip" | "category", string> = {
  hero: "Bosh sahifa slayderi",
  strip: "Header ostidagi qator",
  category: "Katalog sahifalari",
};

/** A banner as the storefront draws it, already in the page's language. */
export interface StoreBanner {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string | null;
  imageMobile: string | null;
  theme: "light" | "dark";
  /** ISO; set only when the banner shows a countdown to it. */
  countdownTo: string | null;
  /** ISO; the banner disappears from the page at this moment. */
  endsAt: string | null;
  /** A/B test (lib/merch/ab.ts): this banner is variant A, `variantB` the other; the visitor's cookie picks one. */
  experiment?: string;
  variantB?: StoreBanner;
}

export interface ScheduleWindow {
  startsAt: Date | string | null;
  endsAt: Date | string | null;
}

const ms = (d: Date | string | null) => (d == null ? null : typeof d === "string" ? Date.parse(d) : d.getTime());

/** Inside its schedule: started (or no start) and not yet ended (or no end). */
export function inWindow(w: ScheduleWindow, now = Date.now()): boolean {
  const start = ms(w.startsAt);
  const end = ms(w.endsAt);
  return (start == null || start <= now) && (end == null || now < end);
}

export type ScheduleStatus = "off" | "scheduled" | "live" | "ended";

export function scheduleStatus(w: ScheduleWindow & { active: boolean }, now = Date.now()): ScheduleStatus {
  if (!w.active) return "off";
  const start = ms(w.startsAt);
  const end = ms(w.endsAt);
  if (end != null && end <= now) return "ended";
  if (start != null && start > now) return "scheduled";
  return "live";
}

export const SCHEDULE_LABEL: Record<ScheduleStatus, string> = {
  off: "Oʻchirilgan",
  scheduled: "Rejalashtirilgan",
  live: "Faol",
  ended: "Tugagan",
};

/**
 * Where a banner may point: a path on this site or an https link. Anything
 * else (javascript:, data:, protocol-relative //host) is refused.
 */
export function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (href === "/") return href;
  if (/^\/[^/\\]/.test(href) && !/[\s<>"]/.test(href)) return href.slice(0, 500);
  if (/^https:\/\//i.test(href)) {
    try {
      const url = new URL(href);
      return url.protocol === "https:" && url.hostname ? url.toString().slice(0, 500) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export const isExternal = (href: string) => /^https:\/\//i.test(href);

/** 23:59 today in Tashkent (UTC+5, no daylight saving) — a deal's default end. */
export function tashkentEndOfDay(now = Date.now()): Date {
  const day = new Date(now + 5 * 3_600_000).toISOString().slice(0, 10);
  return new Date(`${day}T23:59:00+05:00`);
}

/* ─── Announcement bar (site_settings → 'storefront.announcements') ─────── */

export const ANNOUNCEMENTS_KEY = "storefront.announcements";
export const MAX_ANNOUNCEMENTS = 5;

const announcementSchema = z.object({
  id: z.string().min(1).max(40),
  text: z.object({ uz: z.string().max(140), ru: z.string().max(140) }),
  href: z.string().max(500).nullable().default(null),
  endsAt: z.string().nullable().default(null),
  showCountdown: z.boolean().default(false),
  active: z.boolean().default(true),
});

export type Announcement = z.infer<typeof announcementSchema>;

/** Stored JSON → announcements; anything malformed reads as "none" rather than an error page. */
export function parseAnnouncements(raw: string | null | undefined): Announcement[] {
  if (!raw) return [];
  try {
    const parsed = z.array(announcementSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.slice(0, MAX_ANNOUNCEMENTS) : [];
  } catch {
    return [];
  }
}

/** A line as the bar draws it. */
export interface StoreAnnouncement {
  id: string;
  text: string;
  href: string | null;
  countdownTo: string | null;
  endsAt: string | null;
}

/** On, with text in this language, not past its end. A countdown only ever counts to a real end. */
export function liveAnnouncements(items: Announcement[], locale: keyof L10n, now = Date.now()): StoreAnnouncement[] {
  return items
    .filter((a) => a.active && a.text[locale].trim() && inWindow({ startsAt: null, endsAt: a.endsAt }, now))
    .map((a) => ({
      id: a.id,
      text: a.text[locale].trim(),
      href: a.href ? safeHref(a.href) : null,
      countdownTo: a.showCountdown && a.endsAt ? a.endsAt : null,
      endsAt: a.endsAt,
    }));
}
