import { livePrice, type SalePrice } from "@/lib/shop/sale";

/*
  Deal of the day ("Bugungi taklif"), as a pure computation.

  A deal is a schedule entry (the `deals` table), never an edit to the
  product row. The engine asks `dealPrice` on every read with the clock it
  has now, so a deal starts and ends exactly on time with no cron and no
  process awake at that moment — and the order action, which prices through
  the same engine, charges exactly what the page showed.

  While a deal runs:
    oldPrice   = the price the product sold at right before it (its live
                 price — never an invented "was" price);
    price      = that price minus the deal's percent, or the deal's fixed price;
    saleEndsAt = the deal's end, so the product page's real countdown and the
                 browser's `livePrice` revert the price at that second.
  A fixed price that is not below the live price does nothing: a deal that
  would not lower the price shows no strike-through.
*/
export interface RawDeal {
  id: number;
  productSlug: string;
  percent: number | null;
  price: number | null;
  /** ISO timestamps. */
  startsAt: string;
  endsAt: string;
}

export function dealRunning(deal: Pick<RawDeal, "startsAt" | "endsAt">, now = Date.now()): boolean {
  return Date.parse(deal.startsAt) <= now && now < Date.parse(deal.endsAt);
}

/** The deal running right now, if any (deals never overlap — the table forbids it). */
export function currentDeal(deals: readonly RawDeal[] | undefined, now = Date.now()): RawDeal | null {
  return deals?.find((d) => dealRunning(d, now)) ?? null;
}

/** Deal price from a base price: percent off, rounded to whole hundreds of soʻm. */
export function discounted(base: number, deal: Pick<RawDeal, "percent" | "price">): number | null {
  const next = deal.price ?? (deal.percent ? Math.round((base * (100 - deal.percent)) / 100 / 100) * 100 : null);
  if (next == null || next <= 0 || next >= base) return null;
  return next;
}

export function dealPrice(
  p: SalePrice & { slug: string },
  deals: readonly RawDeal[] | undefined,
  now = Date.now(),
): SalePrice {
  const live = livePrice(p, now);
  const deal = currentDeal(deals, now);
  const liveEnds = live.oldPrice && p.saleEndsAt ? p.saleEndsAt : undefined;
  if (!deal || deal.productSlug !== p.slug) return { ...live, saleEndsAt: liveEnds };
  const price = discounted(live.price, deal);
  if (price == null) return { ...live, saleEndsAt: liveEnds };
  return { price, oldPrice: live.price, saleEndsAt: deal.endsAt };
}
