import "server-only";

import { notifyOperator } from "@/lib/notifications/operator";
import { catalogFallbackState } from "@/lib/catalog/db";
import { claimOnce } from "./state";
import { workerHealth, type WorkerHealth } from "./health";

/*
  An operator alert in the Telegram group when something has gone wrong in
  the background and nobody would otherwise notice: messages failing in
  bulk, the queue falling behind, operator pings not arriving, the shop
  serving the built-in catalogue because Postgres is not answering.

  At most once per ALERT_EVERY_MIN per kind, across machines (ops_state).
  Counts only — no phone numbers, texts or error messages.
*/

export const ALERT_EVERY_MIN = 180;
export const FAILED_PER_HOUR_ALERT = 10;
export const OVERDUE_ALERT = 50;

export type AlertKind = "outbox_failed" | "outbox_overdue" | "operator_pings" | "catalog_fallback";

/** Which alerts the numbers call for. Pure, for tests. */
export function alertsFor(h: Pick<WorkerHealth, "failed1h" | "overdue" | "unsentOperatorPings">, catalog: { circuitOpen: boolean; recentErrors: boolean }): { kind: AlertKind; text: string }[] {
  const out: { kind: AlertKind; text: string }[] = [];
  if (h.failed1h > FAILED_PER_HOUR_ALERT) {
    out.push({ kind: "outbox_failed", text: `⚠️ Soʻnggi soatda ${h.failed1h} ta SMS/Telegram xabari yuborilmadi. /admin/messages jurnalini va /admin/integrations (Eskiz) ni tekshiring.` });
  }
  if (h.overdue > OVERDUE_ALERT) {
    out.push({ kind: "outbox_overdue", text: `⚠️ Xabarlar navbati orqada: ${h.overdue} ta xabar 10 daqiqadan ortiq kutmoqda. Ishchi (worker) ishlayaptimi — /api/health.` });
  }
  if (h.unsentOperatorPings > 0) {
    out.push({ kind: "operator_pings", text: `⚠️ ${h.unsentOperatorPings} ta buyurtma haqidagi xabar bu guruhga yetib bormagan. /admin/orders da tekshiring.` });
  }
  if (catalog.circuitOpen || catalog.recentErrors) {
    out.push({ kind: "catalog_fallback", text: "⚠️ Sayt bazani oʻqiy olmadi va oʻrnatilgan katalogni koʻrsatmoqda (narx va qoldiq eskirgan boʻlishi mumkin). Postgres holatini tekshiring: /api/health." });
  }
  return out;
}

export async function runAlerts(): Promise<AlertKind[]> {
  const health = await workerHealth();
  const catalog = catalogFallbackState();
  const due = alertsFor(health, { circuitOpen: catalog.circuitOpen, recentErrors: catalog.reason === "error" && catalog.lastAt !== null && Date.now() - catalog.lastAt < 10 * 60_000 });
  const sent: AlertKind[] = [];
  for (const alert of due) {
    if (!(await claimOnce(`alert.${alert.kind}`, ALERT_EVERY_MIN))) continue;
    if (await notifyOperator(alert.text)) sent.push(alert.kind);
  }
  return sent;
}
