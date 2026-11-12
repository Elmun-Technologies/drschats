import "server-only";

import { fiscalDetail, type FiscalDetail } from "./fiscal";
import { findPayableOrder, fiscalCodes } from "./store";

export interface FiscalSettings {
  shippingMxik: string;
  shippingPackage: string;
  vatPercent: number;
}

/**
 * The receipt lines of a saved order, priced from the order itself. One
 * builder for both gateways: Payme reads it in CheckPerformTransaction, Click
 * gets it after the payment. Null while a product or the delivery has no codes.
 */
export async function orderFiscalDetail(orderNumber: string, fiscal: FiscalSettings): Promise<FiscalDetail | null> {
  const order = await findPayableOrder(orderNumber);
  if (!order) return null;
  const codes = await fiscalCodes([...new Set(order.items.map((i) => i.productId))]);
  return fiscalDetail({
    lines: order.items.map((i) => ({
      name: i.name,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      upsellDiscountPercent: i.upsellDiscountPercent,
      mxik: codes.get(i.productId)?.mxik ?? null,
      packageCode: codes.get(i.productId)?.packageCode ?? null,
    })),
    total: order.total,
    shipping: order.totals?.shipping ?? 0,
    shippingMxik: fiscal.shippingMxik,
    shippingPackage: fiscal.shippingPackage,
    vatPercent: fiscal.vatPercent,
  });
}
