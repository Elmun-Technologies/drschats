import type { OrderStatus } from "@/lib/db/schema";

/* Pure half of lib/orders/cancel.ts: the tracking page asks it whether to offer the button. */
export const SELF_CANCELLABLE: readonly OrderStatus[] = ["new", "confirmed"];

export type SelfCancelOutcome = "cancelled" | "paid" | "too_late" | "not_found";

/** Pure: may the customer cancel an order in this state? */
export function selfCancelVerdict(status: string, paymentStatus: string): Exclude<SelfCancelOutcome, "cancelled" | "not_found"> | "ok" {
  if (paymentStatus === "paid" || paymentStatus === "refunded") return "paid";
  if (!(SELF_CANCELLABLE as readonly string[]).includes(status)) return "too_late";
  return "ok";
}
