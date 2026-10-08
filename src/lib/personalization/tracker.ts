import type { PurchaseEvent, UserProfile, ViewEvent } from "./types";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const STORAGE_KEY = STORAGE_KEYS.user;
const MAX_VIEWS = 50;
const MAX_PURCHASE_EVENTS = 100;
const DEDUP_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function read(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (parsed.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage full or blocked — silently skip
  }
}

function defaultProfile(): UserProfile {
  return { v: 1, views: [], purchases: [], lastSeen: Date.now() };
}

export function getUserProfile(): UserProfile | null {
  return read();
}

export function trackView(slug: string, categorySlug: string, price: number): void {
  const now = Date.now();
  const profile = read() ?? defaultProfile();

  // Skip if same product was viewed within the dedup window
  const recent = profile.views.find((v) => v.slug === slug);
  if (recent && now - recent.ts < DEDUP_WINDOW_MS) {
    profile.lastSeen = now;
    write(profile);
    return;
  }

  const event: ViewEvent = { slug, categorySlug, price, ts: now };
  // Remove any previous entry for this slug, then prepend fresh one
  const filtered = profile.views.filter((v) => v.slug !== slug);
  profile.views = [event, ...filtered].slice(0, MAX_VIEWS);
  profile.lastSeen = now;
  write(profile);
}

export function trackPurchase(items: { slug: string; name?: string }[]): void {
  const now = Date.now();
  const profile = read() ?? defaultProfile();
  const existing = new Set(profile.purchases);
  for (const item of items) existing.add(item.slug);
  profile.purchases = Array.from(existing);

  // Dated events sit alongside the slug set: recommendations only care *whether*
  // something was bought, reorder reminders care *when*.
  const events = [
    ...(profile.purchaseEvents ?? []),
    ...items.map(({ slug, name }) => ({ slug, name, ts: now })),
  ];
  profile.purchaseEvents = events.slice(-MAX_PURCHASE_EVENTS);
  profile.lastSeen = now;
  write(profile);
}

/** Dated purchase history, oldest first. Empty for pre-existing profiles. */
export function getPurchaseEvents(profile: UserProfile): PurchaseEvent[] {
  return profile.purchaseEvents ?? [];
}

/**
 * Returns a map of categorySlug → affinity score (0–1), using exponential
 * recency decay with a 7-day half-life — vitamins are bought on a cycle of
 * days to weeks, and the old 14-hour half-life forgot a visitor who came back
 * after a weekend. Normalised against the strongest category, so a returning
 * visitor's interests keep their shape however long ago they were formed.
 */
const HALF_LIFE_HOURS = 7 * 24;

export function getCategoryAffinities(profile: UserProfile): Record<string, number> {
  const now = Date.now();
  const raw: Record<string, number> = {};

  for (const view of profile.views) {
    const hoursAgo = (now - view.ts) / 3_600_000;
    const weight = Math.pow(0.5, hoursAgo / HALF_LIFE_HOURS);
    raw[view.categorySlug] = (raw[view.categorySlug] ?? 0) + weight;
  }

  // Normalize to 0–1
  const maxScore = Math.max(...Object.values(raw), Number.EPSILON);
  const normalized: Record<string, number> = {};
  for (const [cat, score] of Object.entries(raw)) {
    normalized[cat] = score / maxScore;
  }
  return normalized;
}

/**
 * Returns the median price of recently viewed products (last 10 views).
 */
export function getTypicalPrice(profile: UserProfile): number {
  const prices = profile.views.slice(0, 10).map((v) => v.price);
  if (prices.length === 0) return 0;
  const sorted = [...prices].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
