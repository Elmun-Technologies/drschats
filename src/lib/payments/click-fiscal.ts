import { createHash } from "node:crypto";
import type { FiscalDetail } from "./fiscal";

/*
  Click fiscal receipt (docs.click.uz → Merchant API → Фискализация данных).
  Payme takes the receipt inside CheckPerformTransaction; Click takes it after
  the payment: POST api.click.uz/v2/merchant/payment/ofd_data/submit_items.
  The lines are the same ones Payme gets (fiscal.ts builds them), mapped to
  Click's field names. Pure: the request and its auth header, nothing sent.
*/

export const CLICK_OFD_URL = "https://api.click.uz/v2/merchant/payment/ofd_data/submit_items";

/** Auth: merchant_user_id:sha1(timestamp + secret_key):timestamp, timestamp in seconds. */
export function clickAuthHeader(merchantUserId: string, secretKey: string, nowMs: number): string {
  const timestamp = Math.floor(nowMs / 1000);
  const digest = createHash("sha1").update(`${timestamp}${secretKey}`).digest("hex");
  return `${merchantUserId}:${digest}:${timestamp}`;
}

export interface ClickOfdItem {
  Name: string;
  SPIC: string;
  PackageCode: string;
  GoodPrice: number;
  Price: number;
  Amount: number;
  VAT: number;
  VATPercent: number;
  Discount?: number;
  CommissionInfo: { TIN: string };
}

export interface ClickOfdBody {
  service_id: number;
  payment_id: number;
  items: ClickOfdItem[];
  received_ecash: number;
  received_cash: number;
  received_card: number;
}

/** VAT included in a gross sum, rounded to the tiyin. */
export function vatOf(gross: number, percent: number): number {
  return percent > 0 ? Math.round((gross * percent) / (100 + percent)) : 0;
}

/**
 * The submit_items body for a paid order. Price is the line total and
 * Discount comes off it, as in the OFD format; the card sum is what the
 * customer paid, so Σ (Price − Discount) = received_card.
 */
export function clickOfdBody(input: { serviceId: number; paymentId: number; detail: FiscalDetail; tin: string }): ClickOfdBody {
  const items = input.detail.items.map((it): ClickOfdItem => {
    const gross = it.price * it.count;
    const discount = it.discount ?? 0;
    return {
      Name: it.title.slice(0, 63),
      SPIC: it.code,
      PackageCode: it.package_code,
      GoodPrice: it.price,
      Price: gross,
      Amount: it.count,
      VAT: vatOf(gross - discount, it.vat_percent),
      VATPercent: it.vat_percent,
      ...(discount > 0 ? { Discount: discount } : {}),
      CommissionInfo: { TIN: input.tin },
    };
  });
  const paid = items.reduce((sum, it) => sum + it.Price - (it.Discount ?? 0), 0);
  return { service_id: input.serviceId, payment_id: input.paymentId, items, received_ecash: 0, received_cash: 0, received_card: paid };
}

/** Click answers error_code 0 on success; anything else is kept for the next try. */
export function clickOfdAccepted(status: number, body: unknown): boolean {
  if (status < 200 || status >= 300) return false;
  const code = (body as { error_code?: unknown } | null)?.error_code;
  return code === undefined || code === null || Number(code) === 0;
}
