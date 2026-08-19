/*
  Client for the Go Vita accounts/orders API (see backend/).

  Supports both real HTTP mode (via NEXT_PUBLIC_API_URL) and built-in offline/mock mode
  when the backend is not yet deployed, allowing customers to preview their cabinet,
  orders, subscriptions and health profile smoothly.
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

export interface StoredProfile extends Omit<ProfilePayload, "household"> {
  emailVerified: boolean;
  household: (HouseholdMemberPayload & { id: number })[];
}

// Demo mock data for offline mode
const MOCK_ORDERS: AccountOrder[] = [
  {
    orderId: "GV-98421",
    status: "delivered",
    total: 380000,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    items: [
      { slug: "vitamin-d3-k2", name: "Vitamin D3 + K2 (Swiss Energy)", quantity: 1, unitPrice: 190000 },
      { slug: "magnesium-b6", name: "Magnesium + B6 Xelat", quantity: 1, unitPrice: 190000 },
    ],
  },
  {
    orderId: "GV-98104",
    status: "processing",
    total: 420000,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    items: [
      { slug: "omega-3-premium", name: "Omega-3 Premium 1000mg", quantity: 1, unitPrice: 420000 },
    ],
  },
];

const MOCK_SUBSCRIPTIONS: AccountSubscription[] = [
  {
    id: 1,
    status: "active",
    intervalDays: 30,
    nextDeliveryAt: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString(),
    total: 357000,
    items: [
      { slug: "omega-3-premium", name: "Omega-3 Premium 1000mg", quantity: 1, unitPrice: 357000 },
    ],
  },
];

export const api = {
  requestOtp: async (body: { phone: string }): Promise<OtpRequestResult> => {
    if (isApiConfigured()) {
      return apiFetch<OtpRequestResult>("/api/v1/auth/otp/request", { method: "POST", body });
    }
    // Mock offline fallback
    await new Promise((r) => setTimeout(r, 400));
    return {
      status: "sent",
      channel: "telegram",
      telegramLink: null,
      expiresIn: 300,
    };
  },

  verifyOtp: async (body: { phone: string; code: string }): Promise<{ accessToken: string }> => {
    if (isApiConfigured()) {
      return apiFetch<{ accessToken: string }>("/api/v1/auth/otp/verify", { method: "POST", body });
    }
    await new Promise((r) => setTimeout(r, 400));
    return { accessToken: `demo_token_${body.phone.replace(/\D/g, "")}` };
  },

  me: async (token: string, signal?: AbortSignal): Promise<SessionUser> => {
    if (isApiConfigured()) {
      return apiFetch<SessionUser>("/api/v1/auth/me", { token, signal });
    }
    return {
      id: 1,
      name: "Go Vita Mijoz",
      phone: "+998 90 123 45 67",
    };
  },

  myOrders: async (token: string, signal?: AbortSignal): Promise<AccountOrder[]> => {
    if (isApiConfigured()) {
      return apiFetch<AccountOrder[]>("/api/v1/orders/me", { token, signal });
    }
    return MOCK_ORDERS;
  },

  mySubscriptions: async (token: string, signal?: AbortSignal): Promise<AccountSubscription[]> => {
    if (isApiConfigured()) {
      return apiFetch<AccountSubscription[]>("/api/v1/subscriptions/me", { token, signal });
    }
    return MOCK_SUBSCRIPTIONS;
  },

  updateSubscription: async (
    token: string,
    id: number,
    body: { status?: SubscriptionStatus; intervalDays?: number; skipNext?: boolean },
  ): Promise<AccountSubscription> => {
    if (isApiConfigured()) {
      return apiFetch<AccountSubscription>(`/api/v1/subscriptions/${id}`, { method: "PATCH", token, body });
    }
    const found = MOCK_SUBSCRIPTIONS.find((s) => s.id === id) ?? MOCK_SUBSCRIPTIONS[0];
    if (body.status) found.status = body.status;
    if (body.intervalDays) found.intervalDays = body.intervalDays;
    return { ...found };
  },

  myProfile: async (token: string, signal?: AbortSignal): Promise<StoredProfile> => {
    if (isApiConfigured()) {
      return apiFetch<StoredProfile>("/api/v1/profile/me", { token, signal });
    }
    return {
      locale: "uz",
      goals: ["immunity", "energy"],
      marketingEmail: true,
      marketingTelegram: true,
      emailVerified: true,
      email: "mijoz@govita.uz",
      household: [{ id: 1, relation: "self", name: "Mijoz", birthday: "1995-06-15" }],
    };
  },

  saveProfile: async (token: string, body: ProfilePayload): Promise<StoredProfile> => {
    if (isApiConfigured()) {
      return apiFetch<StoredProfile>("/api/v1/profile/me", { method: "PATCH", token, body });
    }
    return {
      ...body,
      emailVerified: true,
      household: body.household.map((h, i) => ({ ...h, id: i + 1 })),
    };
  },
};
