import type { Locale } from "@/lib/i18n/routing";
import {
  EMAIL_FROM,
  EMAIL_PROVIDER_KEY,
  EMAIL_REPLY_TO,
  isEmailConfigured,
  siteOrigin,
} from "./config";
import { buildCampaign, isTransactional, type Campaign } from "./campaigns";
import { renderEmail } from "./render";
import { signToken } from "./token";

/*
  Sending, in one function.

  Everything that can go out goes through `sendCampaign`, which means three
  things hold for every message without anyone having to remember them:

  - a marketing message always carries an unsubscribe link, and a transactional
    one never does (an order confirmation with "unsubscribe" under it invites
    someone to opt out of being told where their parcel is);
  - the List-Unsubscribe headers are set, which is what Gmail and Mail.ru
    actually read when deciding whether we are a sender or a nuisance;
  - a missing provider key is a logged no-op, not an exception. Checkout must
    not fail because the mail provider is down or unconfigured.
*/

const PROVIDER_ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 8000;

export type SendResult =
  | { ok: true; id?: string }
  | { ok: false; reason: "not-configured" | "rejected" | "network" };

export interface SendCampaignInput {
  to: string;
  locale: Locale;
  campaign: Campaign;
}

export function unsubscribeUrl(email: string): string {
  return `${siteOrigin()}/api/email/unsubscribe?token=${encodeURIComponent(signToken("unsubscribe", email))}`;
}

export function preferencesUrl(email: string, locale: Locale): string {
  return `${siteOrigin()}/${locale}/email/preferences?token=${encodeURIComponent(signToken("preferences", email))}`;
}

export async function sendCampaign({ to, locale, campaign }: SendCampaignInput): Promise<SendResult> {
  const { subject, blocks } = buildCampaign(campaign, locale);
  const transactional = isTransactional(campaign.type);

  const unsubscribe = transactional ? undefined : unsubscribeUrl(to);
  const { html, text } = renderEmail(locale, blocks, {
    unsubscribeUrl: unsubscribe,
    preferencesUrl: transactional ? undefined : preferencesUrl(to, locale),
  });

  if (!isEmailConfigured()) {
    // Loud enough to notice in a dev log, quiet enough not to break anything.
    console.info(`[email] skipped "${campaign.type}" to ${to} — RESEND_API_KEY not set`);
    return { ok: false, reason: "not-configured" };
  }

  const headers: Record<string, string> = {};
  if (unsubscribe) {
    headers["List-Unsubscribe"] = `<${unsubscribe}>`;
    // Tells the client the link is safe to call without asking the reader to
    // confirm on a web page — one click, done.
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  try {
    const response = await fetch(PROVIDER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${EMAIL_PROVIDER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        reply_to: EMAIL_REPLY_TO,
        subject,
        html,
        text,
        headers,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`[email] provider rejected "${campaign.type}": ${response.status}`);
      return { ok: false, reason: "rejected" };
    }

    const body = (await response.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: body.id };
  } catch (error) {
    console.error(`[email] sending "${campaign.type}" failed`, error);
    return { ok: false, reason: "network" };
  }
}
