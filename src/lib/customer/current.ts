import "server-only";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { telegramLinks } from "@/lib/db/schema";
import { loyaltySecret } from "@/lib/loyalty/otp";
import { ORDERS_IN_DB } from "@/lib/shopflow";
import { CUSTOMER_COOKIE, SESSION_TTL_MS, readSession, sessionSecret, type CustomerSession } from "./session";

export interface SignedInCustomer {
  chatId: number;
  phone9: string;
  /** +998XXXXXXXXX */
  phone: string;
  name: string;
  username: string | null;
}

/** The cookie alone: cheap, no database (checkout uses it with the order's own phone). */
export async function sessionFromCookies(): Promise<CustomerSession | null> {
  try {
    const raw = (await cookies()).get(CUSTOMER_COOKIE)?.value;
    return readSession(raw, sessionSecret(loyaltySecret()));
  } catch {
    return null;
  }
}

/**
 * The signed-in customer, or null. The chat must still be linked to the same
 * phone: a link removed or changed by the operator ends the session.
 */
export async function currentCustomer(): Promise<SignedInCustomer | null> {
  if (!ORDERS_IN_DB) return null;
  const s = await sessionFromCookies();
  if (!s) return null;
  const [link] = await getDb().select().from(telegramLinks).where(eq(telegramLinks.chatId, s.c)).limit(1);
  if (!link || link.phone.slice(-9) !== s.p) return null;
  return { chatId: s.c, phone9: s.p, phone: `+998${s.p}`, name: link.name ?? s.n, username: link.username };
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: Math.floor(SESSION_TTL_MS / 1000),
};

/** First name for the header link — display only, never trusted. */
export const NAME_COOKIE = "gv_cn";
