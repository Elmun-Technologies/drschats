import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/*
  The visitor's answer to the cookie bar. Until it is "granted", no analytics
  tag (GTM, GA4, Meta Pixel, Yandex Metrika) is loaded and the first-party
  journey (/api/t, the gv_vid cookie) sends nothing. "denied" is remembered
  like a yes, so the bar does not come back on every page.

  The value "1" is what the bar stored before it had a «Rad etish» button —
  it was a yes.
*/
export type Consent = "granted" | "denied";

const EVENT = "govita-consent";

export function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.cookieConsent);
    if (value === "granted" || value === "1") return "granted";
    if (value === "denied") return "denied";
    return null;
  } catch {
    return null;
  }
}

export function writeConsent(value: Consent) {
  try {
    localStorage.setItem(STORAGE_KEYS.cookieConsent, value);
  } catch {
    // Storage off: the answer holds for this page only.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function analyticsAllowed(): boolean {
  return typeof window !== "undefined" && readConsent() === "granted";
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The stored answer; "unknown" during server render and before hydration reads storage. */
export function useConsent(): Consent | null | "unknown" {
  return useSyncExternalStore<Consent | null | "unknown">(subscribe, readConsent, () => "unknown");
}
