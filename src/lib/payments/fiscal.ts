/*
  The fiscal receipt Payme prints for the customer (CheckPerformTransaction →
  `detail`). Every line needs its MXIK (IKPU) code and package code from
  tasnif.soliq.uz; a receipt with a missing code would be rejected by the tax
  system, so without all of them no `detail` is sent at all and the admin is
  told which products to fill in.

  Money is tiyin. `price` is per unit, `discount` is for the whole line, and
  the receipt adds up to exactly what the customer pays:
    Σ (price × count − discount) = order total.
*/

export interface FiscalLine {
  name: string;
  /** So'm per unit, catalogue price after repricing. */
  unitPrice: number;
  quantity: number;
  upsellDiscountPercent?: number;
  mxik: string | null;
  packageCode: string | null;
}

export interface FiscalInput {
  lines: FiscalLine[];
  /** So'm. */
  total: number;
  shipping: number;
  shippingMxik: string;
  shippingPackage: string;
  vatPercent: number;
}

export interface FiscalItem {
  title: string;
  price: number;
  count: number;
  code: string;
  package_code: string;
  vat_percent: number;
  discount?: number;
}

export interface FiscalDetail {
  receipt_type: 0;
  items: FiscalItem[];
}

const MXIK = /^\d{17}$/;
const PACKAGE = /^\d{1,20}$/;
const TITLE_MAX = 128;

function lineNet(l: FiscalLine): number {
  const gross = l.unitPrice * l.quantity;
  return gross - (l.upsellDiscountPercent ? Math.round((gross * l.upsellDiscountPercent) / 100) : 0);
}

/** Names of lines that keep the receipt from being built. */
export function missingFiscalCodes(input: Pick<FiscalInput, "lines" | "shipping" | "shippingMxik" | "shippingPackage">): string[] {
  const missing = input.lines.filter((l) => !MXIK.test(l.mxik ?? "") || !PACKAGE.test(l.packageCode ?? "")).map((l) => l.name);
  if (input.shipping > 0 && (!MXIK.test(input.shippingMxik) || !PACKAGE.test(input.shippingPackage))) missing.push("Yetkazib berish");
  return missing;
}

export function fiscalDetail(input: FiscalInput): FiscalDetail | null {
  if (input.lines.length === 0 || missingFiscalCodes(input).length > 0) return null;
  const goodsTarget = (input.total - input.shipping) * 100;
  const nets = input.lines.map((l) => lineNet(l) * 100);
  const netSum = nets.reduce((a, b) => a + b, 0);
  // Order-level discounts (promotions, promo code, points) spread over the lines by their share.
  const extra = netSum - goodsTarget;
  if (goodsTarget < 0 || extra < 0) return null;

  const items: FiscalItem[] = [];
  let allocated = 0;
  input.lines.forEach((l, i) => {
    const gross = l.unitPrice * l.quantity * 100;
    const share = i === input.lines.length - 1 ? extra - allocated : netSum > 0 ? Math.floor((extra * nets[i]) / netSum) : 0;
    allocated += share;
    const discount = gross - nets[i] + share;
    items.push({
      title: l.name.slice(0, TITLE_MAX),
      price: l.unitPrice * 100,
      count: l.quantity,
      code: l.mxik as string,
      package_code: l.packageCode as string,
      vat_percent: input.vatPercent,
      ...(discount > 0 ? { discount } : {}),
    });
  });
  // The last line took the rounding remainder; it must not go below zero.
  if (items.some((it) => (it.discount ?? 0) > it.price * it.count)) return null;

  if (input.shipping > 0) {
    items.push({
      title: "Yetkazib berish",
      price: input.shipping * 100,
      count: 1,
      code: input.shippingMxik,
      package_code: input.shippingPackage,
      vat_percent: input.vatPercent,
    });
  }
  const sum = items.reduce((a, it) => a + it.price * it.count - (it.discount ?? 0), 0);
  return sum === input.total * 100 ? { receipt_type: 0, items } : null;
}
