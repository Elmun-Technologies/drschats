"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { locales, type Locale } from "@/lib/i18n/routing";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { siteOrigin } from "@/lib/email/config";
import { sendCampaign } from "@/lib/email/send";
import { signToken } from "@/lib/email/token";

/*
  Registration confirmation.

  Accounts are keyed by phone in this market, so an email address is something
  the customer adds rather than something they sign up with — which is exactly
  why it has to be proved. The link carries the user id as its subject, so the
  route that receives the click knows which account to attach the address to
  without trusting anything in the URL that was not signed.
*/

const RATE = { limit: 5, windowMs: 15 * 60 * 1000 };

const schema = z.object({
  userId: z.union([z.string(), z.number()]).transform(String),
  email: z.string().trim().email().max(160),
  name: z.string().trim().max(120).optional(),
  locale: z.enum(locales),
});

export type VerificationResult = { ok: true } | { ok: false; error: "invalid" | "rate_limited" };

export async function sendAccountVerification(input: {
  userId: string | number;
  email: string;
  name?: string;
  locale: Locale;
}): Promise<VerificationResult> {
  const hdrs = await headers();
  if (!withinRateLimit("account-verify", clientIp(hdrs), RATE)) {
    return { ok: false, error: "rate_limited" };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const { userId, email, name, locale } = parsed.data;
  const token = signToken("verify-account", email, userId);
  const verifyUrl = `${siteOrigin()}/api/email/verify?token=${encodeURIComponent(token)}&locale=${locale}`;

  await sendCampaign({ to: email, locale, campaign: { type: "account-verify", verifyUrl, name } });
  return { ok: true };
}
