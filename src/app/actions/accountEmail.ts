"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { locales, type Locale } from "@/lib/i18n/routing";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { siteOrigin } from "@/lib/email/config";
import { sendCampaign } from "@/lib/email/send";
import { signToken } from "@/lib/email/token";
import { apiFetch, isApiConfigured, type SessionUser } from "@/lib/api/client";

/*
  Registration confirmation.

  Accounts are keyed by phone in this market, so an email address is something
  the customer adds rather than something they sign up with — which is exactly
  why it has to be proved. The link carries the user id as its subject, so the
  route that receives the click knows which account to attach the address to
  without trusting anything in the URL that was not signed.

  The user id is never taken from the browser: the caller sends its access
  token and the id comes from the backend's /me. Otherwise anyone could sign a
  link that binds their address to somebody else's account.
*/

const RATE = { limit: 5, windowMs: 15 * 60 * 1000 };

const schema = z.object({
  token: z.string().min(1).max(4096),
  email: z.string().trim().email().max(160),
  name: z.string().trim().max(120).optional(),
  locale: z.enum(locales),
});

export type VerificationResult = { ok: true } | { ok: false; error: "invalid" | "rate_limited" };

async function signedInUserId(token: string): Promise<string | null> {
  if (!isApiConfigured()) return null;
  try {
    const user = await apiFetch<SessionUser>("/api/v1/auth/me", { token });
    return user?.id != null ? String(user.id) : null;
  } catch {
    return null;
  }
}

export async function sendAccountVerification(input: {
  token: string;
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

  const { email, name, locale } = parsed.data;
  const userId = await signedInUserId(parsed.data.token);
  if (!userId) return { ok: false, error: "invalid" };
  const token = signToken("verify-account", email, userId);
  const verifyUrl = `${siteOrigin()}/api/email/verify?token=${encodeURIComponent(token)}&locale=${locale}`;

  await sendCampaign({ to: email, locale, campaign: { type: "account-verify", verifyUrl, name } });
  return { ok: true };
}
