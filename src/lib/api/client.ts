/*
  Client for the Go Vita accounts/orders API (see backend/).

  Everything here is optional by design. Until NEXT_PUBLIC_API_URL is set the
  API does not exist, `isApiConfigured()` is false, and the account UI is not
  rendered at all — the storefront works exactly as it does today. The day a
  server exists, one environment variable turns it on.
*/

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function isApiConfigured(): boolean {
  return API_URL.length > 0;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError("API is not configured", 0);
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    signal: options.signal,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!res.ok) {
    // FastAPI puts the reason in `detail`; anything else is a network box in
    // between, and its HTML body is not worth surfacing to a customer.
    let message = res.statusText;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") message = data.detail;
    } catch {
      /* keep statusText */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// --- shapes, mirroring backend/app/schemas.py ---------------------------

export interface OtpRequestResult {
  status: "sent" | "link_required";
  channel: "telegram";
  telegramLink: string | null;
  expiresIn: number;
}

export interface SessionUser {
  id: number;
  name: string;
  phone: string;
}

export interface AccountOrderLine {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface AccountOrder {
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
  items: AccountOrderLine[];
}

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface AccountSubscription {
  id: number;
  status: SubscriptionStatus;
  intervalDays: number;
  /** ISO date of the next planned delivery; null once cancelled. */
  nextDeliveryAt: string | null;
  items: AccountOrderLine[];
  total: number;
}

export interface HouseholdMemberPayload {
  relation: string;
  name?: string;
  birthday?: string;
}

export interface ProfilePayload {
  email?: string;
  birthday?: string;
  locale: string;
  goals: string[];
  household: HouseholdMemberPayload[];
  marketingEmail: boolean;
  marketingTelegram: boolean;
}

/** What the account holds — the same fields, plus what only the server knows. */
export interface StoredProfile extends Omit<ProfilePayload, "household"> {
  emailVerified: boolean;
  household: (HouseholdMemberPayload & { id: number })[];
}

export const api = {
  /*
    Ask for a sign-in code. Two possible answers, and "link_required" is not a
    failure: a Telegram bot cannot message a phone it has never spoken to, so
    a first-time visitor is handed a deep link to start the bot instead.
  */
  requestOtp: (body: { phone: string }) =>
    apiFetch<OtpRequestResult>("/api/v1/auth/otp/request", { method: "POST", body }),

  verifyOtp: (body: { phone: string; code: string }) =>
    apiFetch<{ accessToken: string }>("/api/v1/auth/otp/verify", { method: "POST", body }),

  me: (token: string, signal?: AbortSignal) =>
    apiFetch<SessionUser>("/api/v1/auth/me", { token, signal }),

  myOrders: (token: string, signal?: AbortSignal) =>
    apiFetch<AccountOrder[]>("/api/v1/orders/me", { token, signal }),

  mySubscriptions: (token: string, signal?: AbortSignal) =>
    apiFetch<AccountSubscription[]>("/api/v1/subscriptions/me", { token, signal }),

  /**
   * Pause, resume, re-time, skip one delivery, or cancel.
   *
   * One endpoint for all five because they are one thing to the customer —
   * "change my subscription" — and splitting them would mean five ways for the
   * account page and the backend to disagree about the next delivery date.
   */
  updateSubscription: (
    token: string,
    id: number,
    body: { status?: SubscriptionStatus; intervalDays?: number; skipNext?: boolean },
  ) => apiFetch<AccountSubscription>(`/api/v1/subscriptions/${id}`, { method: "PATCH", token, body }),

  myProfile: (token: string, signal?: AbortSignal) =>
    apiFetch<StoredProfile>("/api/v1/profile/me", { token, signal }),

  saveProfile: (token: string, body: ProfilePayload) =>
    apiFetch<StoredProfile>("/api/v1/profile/me", { method: "PATCH", token, body }),
};
