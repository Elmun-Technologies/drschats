/*
  Browser storage keys, and the rename that came with the Go Vita rebrand.

  The old `alimkhanov-*` keys hold live data: carts, wishlists, view history,
  quiz results. Simply renaming them would silently empty every returning
  visitor's cart, so the legacy values are copied across the first time a
  browser loads the new build.

  The copy runs on import rather than from a component, because Zustand's
  persist middleware reads localStorage while the store module initialises —
  by the time any effect fires it is already too late. Stores therefore import
  their key from here, which guarantees the migration has run first.
*/

const LEGACY_PREFIX = "alimkhanov-";
const PREFIX = "govita-";

const NAMES = ["cart", "wishlist", "user", "quiz", "cookie-consent"] as const;

export const STORAGE_KEYS = {
  cart: `${PREFIX}cart`,
  wishlist: `${PREFIX}wishlist`,
  user: `${PREFIX}user`,
  quiz: `${PREFIX}quiz`,
  cookieConsent: `${PREFIX}cookie-consent`,
} as const;

let migrated = false;

/** Copy any pre-rebrand values onto the new keys. Safe to call repeatedly. */
export function migrateLegacyStorage() {
  if (migrated || typeof window === "undefined") return;
  migrated = true;

  try {
    for (const name of NAMES) {
      const legacyKey = `${LEGACY_PREFIX}${name}`;
      const key = `${PREFIX}${name}`;
      // Never overwrite data the visitor has already created under the new key.
      if (window.localStorage.getItem(key) !== null) continue;

      const legacyValue = window.localStorage.getItem(legacyKey);
      if (legacyValue === null) continue;

      window.localStorage.setItem(key, legacyValue);
      window.localStorage.removeItem(legacyKey);
    }
  } catch {
    // Private mode or a full quota: the visitor starts fresh rather than crashing.
  }
}

migrateLegacyStorage();
