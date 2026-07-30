/**
 * Single source of truth for brand identity.
 *
 * Everything the storefront prints about itself — name, contacts, socials —
 * reads from here, so a rebrand or a change of phone number is one edit rather
 * than a search across forty files.
 *
 * - Brand COLOURS live in src/styles/globals.css (@theme tokens).
 * - FONTS are wired in src/app/[locale]/layout.tsx via next/font (swap the two
 *   families there; keep the --font-display / --font-sans CSS variables).
 */

export const BRAND = {
  /** Display name used in copy, metadata and structured data. */
  name: "Go Vita",

  /**
   * Registered company name for legal pages, invoices and Organization
   * schema. TODO: replace with the entity that actually operates Go Vita.
   */
  legalName: "Go Vita",

  /** Text wordmark, split so the second half can take the accent colour. */
  wordmark: { lead: "GO", accent: "VITA" },

  /**
   * Path to a logo image placed in /public/brand (e.g. "/brand/logo.svg").
   * When set, <Logo> renders the image instead of the text wordmark.
   */
  logo: null as string | null,
  logoWidth: 150,
  logoHeight: 28,

  /*
    Contact details below are carried over from the previous brand. They are
    still live values, so they are kept rather than replaced with invented
    ones — update each as the Go Vita equivalents are registered.
  */
  contact: {
    phone: "+998 71 200 00 00",
    /** E.164 form for tel: and wa.me links. */
    phoneHref: "+998712000000",
    email: "info@alimkhanov.com",
    /** Purpose-specific inbox used by the pharmacy / distributor / B2B routes. */
    b2bEmail: "b2b@alimkhanov.com",
  },

  social: {
    telegram: "https://t.me/alimkhanov_pharm",
    instagram: "https://instagram.com/alimkhanov_pharm",
    facebook: "https://facebook.com/alimkhanov.pharm",
  },

  /**
   * Real product photos keyed by product slug. When a slug is present here its
   * URLs replace the placeholder imagery (see src/lib/shopflow/mock.ts).
   * Add the image host to next.config.ts remotePatterns.
   */
  productImageOverrides: {} as Record<string, string[]>,
} as const;

/** WhatsApp deep link derived from the same number as the phone link. */
export const WHATSAPP_URL = `https://wa.me/${BRAND.contact.phoneHref.replace(/\D/g, "")}`;
