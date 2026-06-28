import type { UserProfile, ViewEvent } from "./types";

const STORAGE_KEY = "alimkhanov-user";
const MAX_VIEWS = 50;
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

export function trackPurchase(slugs: string[]): void {
  const profile = read() ?? defaultProfile();
  const existing = new Set(profile.purchases);
  for (const s of slugs) existing.add(s);
  profile.purchases = Array.from(existing);
  profile.lastSeen = Date.now();
  write(profile);
}

/**
 * Returns a map of categorySlug → affinity score (0–1), using exponential
 * recency decay. Views from 1h ago score ~0.95, 24h ago ~0.3, 72h ago ~0.02.
 */
export function getCategoryAffinities(profile: UserProfile): Record<string, number> {
  const now = Date.now();
  const raw: Record<string, number> = {};

  for (const view of profile.views) {
    const hoursAgo = (now - view.ts) / 3_600_000;
    const weight = Math.exp(-0.05 * hoursAgo);
    raw[view.categorySlug] = (raw[view.categorySlug] ?? 0) + weight;
  }

  // Normalize to 0–1
  const maxScore = Math.max(...Object.values(raw), 1);
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
