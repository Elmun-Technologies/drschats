import { BRAND } from "@/lib/brand";
import { SITE_URL } from "@/lib/config/site";

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
 * Falls back to the production domain, not localhost: a marketing email sent
 * from a deployment that forgot NEXT_PUBLIC_SITE_URL used to carry
 * `http://localhost:3000` links, which are dead for every recipient. The same
 * value drives canonical tags (see src/lib/config/site.ts).
 */
export function siteOrigin(): string {
  return SITE_URL;
}
