"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { locales, type Locale } from "@/lib/i18n/routing";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { siteOrigin } from "@/lib/email/config";
import { sendCampaign } from "@/lib/email/send";
import { signToken } from "@/lib/email/token";
import { notifyOperator } from "@/lib/notifications/operator";

/*
  Asking for permission, once.

  This is the only place a marketing address enters the system, and it never
  enters it confirmed: the address gets one email with a signed link, and
  nothing else until that link is clicked. Double opt-in costs a few percent of
  a subscriber list and buys the only defence there is against being signed up
  by someone else — plus a deliverability record that survives a shared inbox
  marking us as spam.
*/

const RATE = { limit: 5, windowMs: 10 * 60 * 1000 };

const schema = z.object({
  email: z.string().trim().email().max(160),
  name: z.string().trim().max(120).optional(),
  locale: z.enum(locales),
  /** Where the request came from, for the operator notice only. */
  source: z.string().max(40).optional(),
});

export type OptInResult = { ok: true } | { ok: false; error: "invalid" | "rate_limited" };

export async function requestEmailOptIn(input: {
  email: string;
  name?: string;
  locale: Locale;
  source?: string;
}): Promise<OptInResult> {
  const hdrs = await headers();
  if (!withinRateLimit("email-opt-in", clientIp(hdrs), RATE)) {
    return { ok: false, error: "rate_limited" };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const { email, name, locale, source } = parsed.data;
  const token = signToken("opt-in", email);
  const confirmUrl = `${siteOrigin()}/api/email/confirm?token=${encodeURIComponent(token)}&locale=${locale}`;

  await sendCampaign({
    to: email,
    locale,
    campaign: { type: "opt-in", confirmUrl, name },
  });

  // The operator hears about the request, not the confirmation, because an
  // address that never confirms is itself worth knowing about.
  await notifyOperator(`📬 Obuna so'raldi: ${email}${source ? ` (${source})` : ""}`);

  // The same answer whether or not the address is already on the list: telling
  // the caller which addresses are known turns this form into a lookup tool.
  return { ok: true };
}
