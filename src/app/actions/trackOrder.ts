"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { normalizeUzPhone } from "@/lib/phone";
import { normalizeOrderNumber } from "@/lib/orders/track-number";
import { orderBelongsTo, trackingAvailable } from "@/lib/orders/track";
import { orderTrackToken } from "@/lib/messaging/tokens";

/*
  "Where is my order?" without an account: the order number plus the phone it
  was placed with. Both must match, and a miss says only "not found" — the
  form must not tell anyone which numbers exist. Ten tries per address per
  ten minutes keeps it from being a phone-number guessing machine.
*/
const RATE = { limit: 10, windowMs: 10 * 60 * 1000 };
const schema = z.object({ number: z.string().max(40), phone: z.string().max(30) });

export type TrackLookup = { ok: true; token: string } | { ok: false; error: "invalid" | "not_found" | "rate_limited" | "unavailable" };

export async function findOrder(input: { number: string; phone: string }): Promise<TrackLookup> {
  if (!trackingAvailable) return { ok: false, error: "unavailable" };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const number = normalizeOrderNumber(parsed.data.number);
  const phone = normalizeUzPhone(parsed.data.phone);
  if (!number || !phone) return { ok: false, error: "invalid" };
  if (!withinRateLimit("track-order", clientIp(await headers()), RATE)) return { ok: false, error: "rate_limited" };
  try {
    if (!(await orderBelongsTo(number, phone.slice(-9)))) return { ok: false, error: "not_found" };
  } catch (err) {
    console.error("[track] lookup failed:", (err as Error).message);
    return { ok: false, error: "unavailable" };
  }
  return { ok: true, token: orderTrackToken(number) };
}
