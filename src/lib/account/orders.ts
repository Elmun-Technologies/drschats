/*
  Order statuses, as the backend sends them (backend/app/models.py). The
  timeline draws the four happy-path steps; "cancelled" replaces it. A status
  the operations team adds later is shown as itself and counts as active.
*/
export const ORDER_STEPS = ["new", "confirmed", "shipped", "delivered"] as const;
export const KNOWN_ORDER_STATUSES = new Set<string>([...ORDER_STEPS, "cancelled"]);

export function orderStepIndex(status: string): number {
  return ORDER_STEPS.indexOf(status as (typeof ORDER_STEPS)[number]);
}

export function isOrderActive(status: string): boolean {
  return status !== "delivered" && status !== "cancelled";
}
