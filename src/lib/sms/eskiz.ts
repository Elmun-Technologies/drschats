import type { SmsProvider, SmsSendResult } from "./types";

/*
  Eskiz.uz (notify.eskiz.uz) — the SMS gateway most Uzbek shops use.

  Two calls:
    POST /api/auth/login            email + password → { data: { token } }
    POST /api/message/sms/send      mobile_phone (998XXXXXXXXX), message, from
                                    → { id, status: "waiting" }
  The bearer token lives about a month; it is cached per account in this
  process and fetched again once when a send answers 401.

  The HTTP is isolated here with an injectable `fetch`, so the whole contract
  is unit-tested without the network (eskiz.test.ts). Response shapes are read
  defensively: a 200 carrying `status: "error"` is a failure too.

  What is retried: network errors, timeouts, 429 and 5xx. What is not: 4xx —
  a wrong number or a text Eskiz's moderation has not approved will not get
  better by itself, and retrying it only spends money on the next attempt.
*/

export const ESKIZ_BASE_URL = "https://notify.eskiz.uz/api";
/** Eskiz's shared test sender; a brand name needs their approval first. */
export const ESKIZ_DEFAULT_SENDER = "4546";

export interface EskizConfig {
  email: string;
  password: string;
  sender?: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  /** Request timeout, ms. */
  timeoutMs?: number;
}

const tokens = new Map<string, string>();

/** For tests: forget cached tokens. */
export function resetEskizTokens(): void {
  tokens.clear();
}

type Json = Record<string, unknown> | null;

async function readJson(response: Response): Promise<Json> {
  try {
    const value = (await response.json()) as unknown;
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function messageOf(body: Json, fallback: string): string {
  const raw = body?.message ?? body?.error ?? fallback;
  const text = typeof raw === "string" ? raw : JSON.stringify(raw);
  return text.slice(0, 200);
}

export function eskizPhone(phoneE164: string): string | null {
  const digits = phoneE164.replace(/\D/g, "");
  const full = digits.length === 9 ? `998${digits}` : digits;
  return /^998\d{9}$/.test(full) ? full : null;
}

export class EskizProvider implements SmsProvider {
  readonly name = "eskiz";
  private readonly base: string;
  private readonly http: typeof fetch;
  private readonly sender: string;
  private readonly timeout: number;

  constructor(private readonly config: EskizConfig) {
    this.base = (config.baseUrl ?? ESKIZ_BASE_URL).replace(/\/+$/, "");
    this.http = config.fetch ?? fetch;
    this.sender = config.sender?.trim() || ESKIZ_DEFAULT_SENDER;
    this.timeout = config.timeoutMs ?? 10_000;
  }

  private cacheKey(): string {
    return `${this.base}|${this.config.email}`;
  }

  private async login(): Promise<{ token: string } | { error: string; retryable: boolean }> {
    const form = new FormData();
    form.set("email", this.config.email);
    form.set("password", this.config.password);
    let response: Response;
    try {
      response = await this.http(`${this.base}/auth/login`, { method: "POST", body: form, signal: AbortSignal.timeout(this.timeout) });
    } catch {
      return { error: "eskiz_unreachable", retryable: true };
    }
    const body = await readJson(response);
    const data = body?.data as { token?: unknown } | undefined;
    const token = typeof data?.token === "string" ? data.token : null;
    if (!response.ok || !token) {
      return { error: response.status === 401 || response.status === 422 ? "eskiz_login_rejected" : `eskiz_login_${response.status}`, retryable: response.status >= 500 };
    }
    tokens.set(this.cacheKey(), token);
    return { token };
  }

  private async token(): Promise<{ token: string } | { error: string; retryable: boolean }> {
    const cached = tokens.get(this.cacheKey());
    return cached ? { token: cached } : this.login();
  }

  private async post(token: string, phone: string, text: string): Promise<Response | null> {
    const form = new FormData();
    form.set("mobile_phone", phone);
    form.set("message", text);
    form.set("from", this.sender);
    try {
      return await this.http(`${this.base}/message/sms/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
        signal: AbortSignal.timeout(this.timeout),
      });
    } catch {
      return null;
    }
  }

  async send(phoneE164: string, text: string): Promise<SmsSendResult> {
    const phone = eskizPhone(phoneE164);
    if (!phone) return { ok: false, retryable: false, error: "invalid_phone" };
    if (!text.trim()) return { ok: false, retryable: false, error: "empty_text" };

    let auth = await this.token();
    if ("error" in auth) return { ok: false, retryable: auth.retryable, error: auth.error };

    let response = await this.post(auth.token, phone, text);
    if (response?.status === 401) {
      tokens.delete(this.cacheKey());
      auth = await this.login();
      if ("error" in auth) return { ok: false, retryable: auth.retryable, error: auth.error };
      response = await this.post(auth.token, phone, text);
    }
    if (!response) return { ok: false, retryable: true, error: "eskiz_unreachable" };

    const body = await readJson(response);
    if (!response.ok || body?.status === "error") {
      const retryable = response.status === 429 || response.status >= 500;
      return { ok: false, retryable, error: `eskiz_${response.status}: ${messageOf(body, response.statusText || "rejected")}` };
    }
    const id = body?.id ?? (body?.data as { id?: unknown } | undefined)?.id;
    return { ok: true, id: id == null ? null : String(id) };
  }
}
