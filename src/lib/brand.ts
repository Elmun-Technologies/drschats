/**
 * Single source of truth for brand identity.
 *
 * Everything the storefront prints about itself — name, contacts, socials —
 * reads from here, so a rebrand or a change of phone number is one edit rather
 * than a search across forty files.
 *
 * - Brand COLOURS live in src/styles/globals.css (@theme tokens).
 * - FONTS are wired in src/app/[locale]/layout.tsx via next/font.
 * - Real product PHOTOS are generated into src/lib/content/product-photos.ts
 *   by scripts/assets/ingest-product-images.mjs.
 */

import { PRODUCT_PHOTOS } from "@/lib/content/product-photos";

export const BRAND = {
  /** Display name used in copy, metadata and structured data. */
  name: "Go Vita",

  /**
   * Registered company name, exactly as the state registry writes it. Taken
   * from the organisation record the client sent (orginfo.uz, INN 307895851):
   * the storefront is operated by "DR SCHATZ" MChJ, the entity that also
   * imports the lines sold here. If a separate company ever fronts the shop,
   * this is the one line to change.
   */
  legalName: "«DR SCHATZ» mas\u2019uliyati cheklangan jamiyati",

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


  /**
   * Legal identifiers printed in the footer and on /requisites.
   *
   * Kept here rather than in the translation files because they are facts, not
   * copy: they do not change with the language and a lawyer reviews one place.
   * `registration` and `licence` stay empty until the documents are in hand —
   * the pages render a clearly-labelled "being updated" row instead of a
   * guessed number, because an invented registration number is worse than a
   * missing one.
   */
  legal: {
    /** The distribution house behind the shop; the registry entity above is its legal form. */
    importer: "Alimkhanov Pharm Group",
    /**
     * Licence to distribute medicines / supplements. Still empty: the registry
     * record does not carry it, and an invented number is worse than a missing
     * one — /requisites prints a labelled "being updated" row until the client
     * sends the document (docs/GOVITA-TAVSIYALAR.md §4).
     */
    licence: process.env.NEXT_PUBLIC_LICENCE_NUMBER ?? "",
    /**
     * Taxpayer identification number (STIR) — from the state registry record,
     * not from an environment variable, so the footer always prints the real
     * company.
     */
    stir: "307895851",
    /** Registered address, as recorded in the registry (Latin, official form). */
    address: "Toshkent shahri, Yakkasaroy tumani, Bobur ko‘chasi, 77-uy",
    /** The same address in Cyrillic, for the Russian pages. */
    addressRu: "г. Ташкент, Яккасарайский район, ул. Бабура, 77",
    /** Registered director and sole founder. */
    director: "Alimkhanov Dilshod Shuxratovich",
    /** Date of state registration. */
    registeredAt: "11.11.2020",
    /** Registry activity code and its wording. */
    activity: "OKED 46490 — boshqa uy-ro‘zg‘or tovarlari ulgurji savdosi",
    /** Where these facts were read from, and when — printed on /requisites. */
    source: "orginfo.uz (INN 307895851), ma’lumot sanasi: 25.06.2024",
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
  productImageOverrides: PRODUCT_PHOTOS as Record<string, string[]>,
} as const;

/** WhatsApp deep link derived from the same number as the phone link. */
export const WHATSAPP_URL = `https://wa.me/${BRAND.contact.phoneHref.replace(/\D/g, "")}`;
