/**
 * Single source of truth for brand identity.
 *
 * Everything the storefront prints about itself — name, contacts, socials —
 * reads from here, so a rebrand or a change of phone number is one edit rather
 * than a search across forty files.
 *
 * - Brand COLOURS live in src/styles/globals.css (@theme tokens).
 * - FONTS are wired in src/app/[locale]/layout.tsx via next/font.
 */

export const BRAND = {
  /** Display name used in copy, metadata and structured data. */
  name: "Go Vita",

  /**
   * Registered company name for legal pages, invoices and Organization
   * schema.
   */
  legalName: "GO VITA HEALTHCARE MCHJ",

  /** Text wordmark, split so the second half can take the accent colour. */
  wordmark: { lead: "GO", accent: "VITA" },

  /**
   * Path to a logo image placed in /public/brand (e.g. "/brand/logo.svg").
   * When set, <Logo> renders the image instead of the text wordmark.
   */
  logo: null as string | null,
  logoWidth: 150,
  logoHeight: 28,

  contact: {
    phone: "+998 71 200 70 80",
    /** E.164 form for tel: and wa.me links. */
    phoneHref: "+998712007080",
    email: "info@govita.uz",
    /** Purpose-specific inbox used by the pharmacy / distributor / B2B routes. */
    b2bEmail: "b2b@govita.uz",
  },

  social: {
    telegram: "https://t.me/govita_uz",
    instagram: "https://instagram.com/govita_uz",
    facebook: "https://facebook.com/govita.uz",
  },

  /**
   * Real product photos keyed by product slug. When a slug is present here its
   * URLs replace the placeholder imagery (see src/lib/shopflow/mock.ts).
   */
  productImageOverrides: {} as Record<string, string[]>,
} as const;

/** WhatsApp deep link derived from the same number as the phone link. */
export const WHATSAPP_URL = `https://wa.me/${BRAND.contact.phoneHref.replace(/\D/g, "")}`;
