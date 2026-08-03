import type { Locale } from "@/lib/i18n/routing";
import { API_URL } from "@/lib/api/client";

/*
  Server-to-server calls to the accounts backend, for things a browser must
  never be trusted with: writing consent, marking an address verified, reading
  the queue of people who are due a message today.

  Authenticated with a service key rather than a customer's token, so this file
  must only ever be imported from server actions and route handlers. The key is
  MARKETING_API_KEY on both sides; when either half is missing, every function
  here reports "not configured" and the caller carries on — the storefront's
  email still sends, it just is not recorded anywhere.
*/

const SERVICE_KEY = process.env.MARKETING_API_KEY ?? "";
const TIMEOUT_MS = 8000;

export function isMarketingApiConfigured(): boolean {
  return API_URL.length > 0 && SERVICE_KEY.length > 0;
}

async function call<T>(path: string, body?: unknown, method: "GET" | "POST" = "POST"): Promise<T | null> {
  if (!isMarketingApiConfigured()) return null;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Service-Key": SERVICE_KEY,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(`[marketing] ${method} ${path} failed: ${response.status}`);
      return null;
    }
    if (response.status === 204) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`[marketing] ${method} ${path} failed`, error);
    return null;
  }
}

export type SubscriberStatus = "confirmed" | "unsubscribed";

export function recordSubscriber(input: {
  email: string;
  status: SubscriberStatus;
  locale: Locale;
  name?: string;
}) {
  return call("/api/v1/marketing/subscribers", input);
}

export function markAccountEmailVerified(input: { userId: string; email: string }) {
  return call("/api/v1/marketing/verify-email", input);
}

/** One person, one message, due today. */
export interface DueMessage {
  /** Stable per occurrence — the same value the reminder engine produced. */
  reminderId: string;
  channel: "email" | "telegram";
  campaign: string;
  locale: Locale;
  email?: string;
  telegramChatId?: string;
  name?: string;
  /** Campaign-specific fields, validated by the sender before use. */
  data: Record<string, unknown>;
}

export function fetchDueMessages(limit: number) {
  return call<DueMessage[]>(`/api/v1/marketing/due?limit=${limit}`, undefined, "GET");
}

export function markMessagesSent(results: { reminderId: string; channel: string; ok: boolean }[]) {
  return call("/api/v1/marketing/sent", { results });
}
