import { BRAND } from "@/lib/brand";

/*
  Email configuration, in one place, with the same "one variable turns it on"
  shape the accounts API uses.

  Nothing here throws when the keys are missing. A storefront without a mail
  provider must still take orders and still let people tick the newsletter box;
  it simply has nothing to send with, and says so in the logs.
*/

export const EMAIL_PROVIDER_KEY = process.env.RESEND_API_KEY ?? "";

/** Envelope sender. Must be a domain verified with the provider. */
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? `${BRAND.name} <no-reply@govita.uz>`;

/** Where replies go — a monitored inbox, not the no-reply sender. */
export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO ?? BRAND.contact.email;

export function isEmailConfigured(): boolean {
  return EMAIL_PROVIDER_KEY.length > 0;
}

/**
 * Absolute site origin, needed because every link in an email must be absolute.
 *
 * Falls back to localhost so a developer's confirmation link is clickable
 * rather than broken; production sets NEXT_PUBLIC_SITE_URL for the sitemap
 * already, so this is the same value the canonical tags use.
 */
export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
