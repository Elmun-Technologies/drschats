import "server-only";

import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";
import { CLICK_OFD_URL, clickAuthHeader, clickOfdAccepted, clickOfdBody } from "./click-fiscal";
import { orderFiscalDetail } from "./fiscal-server";
import { dueClickFiscal, recordClickFiscal, type DueClickFiscal } from "./store";

/*
  Sends the fiscal receipt of performed Click payments. Right after Complete
  (see the route) and from the worker every minute, so a receipt Click did not
  take — network, a missing code filled in later — goes again. Click counts a
  payment as fiscalised only after this call; the payment itself is never
  held back by it.
*/

const MAX_ATTEMPTS = 20;
const TIMEOUT_MS = 15_000;

async function sendOne(p: DueClickFiscal): Promise<boolean> {
  const { click, fiscal } = await getRuntimeIntegrationSettings();
  if (!click.merchantUserId || !click.secretKey || !click.serviceId || !/^\d{9}$/.test(fiscal.tin)) {
    await recordClickFiscal(p.id, "missing_codes", "Click Merchant user ID, Secret key, Service ID yoki STIR (INN) kiritilmagan", false);
    return false;
  }
  const detail = await orderFiscalDetail(p.orderNumber, fiscal);
  if (!detail) {
    await recordClickFiscal(p.id, "missing_codes", "Mahsulot yoki yetkazish MXIK / qadoq kodi yoʻq", false);
    return false;
  }
  const body = clickOfdBody({ serviceId: Number(click.serviceId), paymentId: Number(p.clickTransId), detail, tin: fiscal.tin });
  try {
    const res = await fetch(CLICK_OFD_URL, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", Auth: clickAuthHeader(click.merchantUserId, click.secretKey, Date.now()) },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const answer = await res.json().catch(() => null);
    if (clickOfdAccepted(res.status, answer)) {
      await recordClickFiscal(p.id, "sent", null, true);
      return true;
    }
    const note = (answer as { error_note?: string; error_code?: number } | null) ?? {};
    await recordClickFiscal(p.id, "failed", `HTTP ${res.status} ${note.error_code ?? ""} ${note.error_note ?? ""}`.trim().slice(0, 300), true);
  } catch (err) {
    await recordClickFiscal(p.id, "failed", (err as Error).message.slice(0, 300), true);
  }
  return false;
}

/** The worker's job: every due receipt, a few per tick. */
export async function submitDueClickFiscal(): Promise<{ sent: number; left: number }> {
  const due = await dueClickFiscal(MAX_ATTEMPTS, 20);
  let sent = 0;
  for (const p of due) if (await sendOne(p)) sent += 1;
  return { sent, left: due.length - sent };
}

/** Straight after Complete: the receipt of that one order. */
export async function submitClickFiscalFor(orderNumber: string): Promise<void> {
  const due = (await dueClickFiscal(MAX_ATTEMPTS, 50)).filter((p) => p.orderNumber === orderNumber);
  for (const p of due) await sendOne(p);
}
