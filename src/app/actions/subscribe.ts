"use server";

import { z } from "zod";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/routing";
import { requestEmailOptIn } from "./emailOptIn";

const subscribeSchema = z.object({
  email: z.string().trim().email().max(160),
  locale: z.enum(locales).optional(),
  // Honeypot: real people leave it empty, bots fill every field they find.
  company: z.string().max(0).optional(),
});

export type SubscribeResult = { ok: true } | { ok: false; error: "invalid" | "rate_limited" };

/**
 * The newsletter form.
 *
 * Thin on purpose: the honeypot is the only thing this form knows that the
 * consent panel on /profile does not, so everything after it — the rate limit,
 * the signed confirmation link, the operator notice — is the shared opt-in
 * path rather than a second implementation of it.
 */
export async function subscribeToNewsletter(formData: {
  email: string;
  company?: string;
  locale?: Locale;
}): Promise<SubscribeResult> {
  const parsed = subscribeSchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: "invalid" };

  return requestEmailOptIn({
    email: parsed.data.email,
    locale: parsed.data.locale ?? defaultLocale,
    source: "newsletter",
  });
}
