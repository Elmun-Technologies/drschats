"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { verifyOrderTrackToken } from "@/lib/messaging/tokens";
import { cancelByCustomer } from "@/lib/orders/cancel";
import type { SelfCancelOutcome } from "@/lib/orders/cancel-rules";
import { trackingAvailable } from "@/lib/orders/track";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";

const RATE = { limit: 10, windowMs: 10 * 60 * 1000 };

/*
  The signed link is the authority: whoever holds it may see the order, and
  — while it is still being prepared and unpaid — cancel it. A forged or
  edited token never reaches the database.
*/
export async function cancelTrackedOrder(token: string): Promise<{ result: SelfCancelOutcome | "unavailable" }> {
  const number = verifyOrderTrackToken(token);
  if (!number || !trackingAvailable) return { result: "not_found" };
  if (!withinRateLimit("track-cancel", clientIp(await headers()), RATE)) return { result: "unavailable" };
  try {
    const result = await cancelByCustomer(number);
    revalidatePath("/admin/orders");
    return { result };
  } catch (err) {
    console.error(`[track] cancel ${number} failed:`, (err as Error).message);
    return { result: "unavailable" };
  }
}
