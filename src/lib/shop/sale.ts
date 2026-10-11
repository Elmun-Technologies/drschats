/*
  The price a product sells at right now. The catalogue already reprices a
  sale whose end date has passed, but a page rendered (or cached) before that
  moment still carries the sale price — so anything that shows or adds a
  price in the browser asks this, with the clock it has now.
*/
export interface SalePrice {
  price: number;
  oldPrice?: number;
  saleEndsAt?: string;
}

export function saleOver(p: Pick<SalePrice, "oldPrice" | "saleEndsAt">, now = Date.now()): boolean {
  return Boolean(p.saleEndsAt && p.oldPrice && Date.parse(p.saleEndsAt) <= now);
}

export function livePrice(p: SalePrice, now = Date.now()): { price: number; oldPrice?: number } {
  return saleOver(p, now) ? { price: p.oldPrice as number, oldPrice: undefined } : { price: p.price, oldPrice: p.oldPrice };
}
