import { create } from "zustand";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/*
  One queue for the marketing popups (welcome offer, exit intent, quiz nudge).

  Each of them is reasonable alone; three of them in one visit is a site that
  shouts. So: one at a time, at most one per browser session, each with its
  own cool-down before it may return, and none on the pages where an order is
  being placed. The add-to-cart card is transactional, not marketing, and
  does not go through here.
*/

export type MarketingPopup = "welcome" | "exit" | "quiz";

/** Days before a dismissed popup may show again. */
const COOLDOWN_DAYS: Record<MarketingPopup, number> = { welcome: 30, exit: 3, quiz: 7 };
const SESSION_KEY = "govita-popup-shown";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Paths (without locale) where no marketing popup may interrupt. */
const QUIET_PATHS = ["/cart", "/checkout", "/quiz", "/account", "/profile"];

export function isQuietPath(pathname: string): boolean {
  return QUIET_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function readSeen(): Partial<Record<MarketingPopup, number>> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.popups) ?? "{}");
  } catch {
    return {};
  }
}

/** True when this popup may be offered now (cool-down passed, nothing shown this session). */
export function popupAllowed(id: MarketingPopup, now = Date.now()): boolean {
  if (typeof window === "undefined") return false;
  // Crawlers and test browsers: a popup is for people, and it would cover the page being measured.
  if (navigator.webdriver) return false;
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
  } catch {
    return false;
  }
  const last = readSeen()[id];
  return !last || now - last > COOLDOWN_DAYS[id] * DAY_MS;
}

function markSeen(id: MarketingPopup) {
  try {
    sessionStorage.setItem(SESSION_KEY, id);
    localStorage.setItem(STORAGE_KEYS.popups, JSON.stringify({ ...readSeen(), [id]: Date.now() }));
  } catch {
    // Storage blocked: the popup still closes, it may simply return sooner.
  }
}

interface PopupState {
  active: MarketingPopup | null;
  /** Asks for the screen; false when another popup holds it or the rules say no. */
  request: (id: MarketingPopup) => boolean;
  close: () => void;
}

export const usePopups = create<PopupState>((set, get) => ({
  active: null,
  request: (id) => {
    // Never over another dialog (cart drawer, upsell ladder, catalogue sheet).
    if (document.querySelector('[aria-modal="true"]')) return false;
    if (get().active || !popupAllowed(id)) return false;
    markSeen(id);
    set({ active: id });
    return true;
  },
  close: () => set({ active: null }),
}));
