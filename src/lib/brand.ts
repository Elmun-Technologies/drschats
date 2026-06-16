/**
 * Single source of truth for brand assets. This is the only place to edit when
 * the real logo, product photos and fonts arrive — components and data read
 * from here, so nothing else needs to change.
 *
 * - Brand COLOURS live in src/styles/globals.css (@theme tokens).
 * - FONTS are wired in src/app/[locale]/layout.tsx via next/font (swap the two
 *   families there; keep the --font-display / --font-sans CSS variables).
 */

export const BRAND = {
  /** Text wordmark, split so the second half can take the accent colour. */
  wordmark: { lead: "ALIM", accent: "KHANOV" },

  /**
   * Path to a logo image placed in /public/brand (e.g. "/brand/logo.svg").
   * When set, <Logo> renders the image instead of the text wordmark.
   */
  logo: null as string | null,
  logoWidth: 150,
  logoHeight: 28,

  /**
   * Real product photos keyed by product slug. When a slug is present here its
   * URLs replace the placeholder imagery (see src/lib/shopflow/mock.ts).
   * Add the image host to next.config.ts remotePatterns (uzum.uz is allowed).
   *
   * Example:
   *   "omega-3-premium": [
   *     "https://images.uzum.uz/.../original.jpg",
   *     "https://images.uzum.uz/.../2.jpg",
   *   ],
   */
  productImageOverrides: {} as Record<string, string[]>,
} as const;
