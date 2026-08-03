"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { locales } from "@/lib/i18n/routing";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { verifyToken } from "@/lib/email/token";
import { recordSubscriber } from "@/lib/marketing/api";
import { notifyOperator } from "@/lib/notifications/operator";

/*
  The preference centre's write path.

  The signed token in the link is the authorisation — there is no session here,
  and demanding one would mean a customer has to create an account before they
  are allowed to stop receiving email from us.
*/

const RATE = { limit: 20, windowMs: 10 * 60 * 1000 };

const schema = z.object({
  token: z.string().min(8).max(512),
  subscribed: z.boolean(),
  locale: z.enum(locales),
});

export type PreferenceResult =
  | { ok: true; email: string; subscribed: boolean }
  | { ok: false; error: "invalid" | "rate_limited" };

export async function updateEmailPreference(input: {
  token: string;
  subscribed: boolean;
  locale: (typeof locales)[number];
}): Promise<PreferenceResult> {
  const hdrs = await headers();
  if (!withinRateLimit("email-preferences", clientIp(hdrs), RATE)) {
    return { ok: false, error: "rate_limited" };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  // A preferences link is issued in the footer of every marketing email, so it
  // is the one token that both subscribes and unsubscribes.
  const verified = verifyToken(parsed.data.token, "preferences");
  if (!verified) return { ok: false, error: "invalid" };

  await recordSubscriber({
    email: verified.email,
    status: parsed.data.subscribed ? "confirmed" : "unsubscribed",
    locale: parsed.data.locale,
  });

  await notifyOperator(
    `${parsed.data.subscribed ? "✅" : "🚫"} Sozlamalar yangilandi: ${verified.email}`,
  );

  return { ok: true, email: verified.email, subscribed: parsed.data.subscribed };
}
