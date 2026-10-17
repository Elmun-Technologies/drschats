/*
  The cashback ledger, evaluated — pure, `now` is an argument.

  The balance is never a stored number. It is what the rows add up to once
  expiry is taken into account, and expiry is decided here, lazily, from each
  earning row's `expires_at`:

  - every positive row (earn, a positive adjust, a refund) is a *lot* with an
    optional end date;
  - a negative row (redeem, a negative adjust, the reversal of an earn) spends
    lots first-to-expire first; a reversal that names its lot (`refId`) takes
    from that lot before any other;
  - what a lot still holds when its end date passes is gone;
  - spending more than there is leaves a debt that the next lot pays first (a
    reversal of points already spent), so the balance can be negative and
    nothing is invented to cover it.

  'expire' rows are bookkeeping: the expiry job writes one per expired lot so
  the plain SQL sum matches. They are ignored as spending — the lot's own end
  date already decided what expired — and only mark the lot as written off.
*/

export type LedgerKind = "earn" | "redeem" | "expire" | "adjust" | "reverse";

export interface LedgerRow {
  id: number;
  delta: number;
  kind: LedgerKind;
  refId: number | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface Lot {
  id: number;
  amount: number;
  remaining: number;
  /** What this lot lost to its end date. */
  expired: number;
  expiresAt: Date | null;
  /** An 'expire' row already writes this lot off. */
  writtenOff: boolean;
}

export interface LedgerState {
  balance: number;
  debt: number;
  lots: Lot[];
  /** Expired lots without an 'expire' row yet: what the expiry job writes. */
  toExpire: { lotId: number; amount: number }[];
  /** Points that will expire within `soonDays`, earliest first. */
  expiringSoon: { amount: number; at: Date }[];
}

const time = (d: Date | null) => (d ? d.getTime() : Number.POSITIVE_INFINITY);

export function evaluateLedger(rows: LedgerRow[], now: Date, soonDays = 30): LedgerState {
  const sorted = [...rows].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id - b.id);
  const lots = new Map<number, Lot>();
  const order: Lot[] = [];
  let debt = 0;

  const expireUntil = (t: number) => {
    for (const lot of order) {
      if (lot.remaining > 0 && time(lot.expiresAt) <= t) {
        lot.expired += lot.remaining;
        lot.remaining = 0;
      }
    }
  };

  const spend = (need: number, from?: Lot) => {
    if (from && from.remaining > 0) {
      const take = Math.min(from.remaining, need);
      from.remaining -= take;
      need -= take;
    }
    if (need > 0) {
      const open = order
        .filter((l) => l.remaining > 0)
        .sort((a, b) => time(a.expiresAt) - time(b.expiresAt) || a.id - b.id);
      for (const lot of open) {
        if (need === 0) break;
        const take = Math.min(lot.remaining, need);
        lot.remaining -= take;
        need -= take;
      }
    }
    debt += need;
  };

  for (const row of sorted) {
    expireUntil(row.createdAt.getTime());
    if (row.kind === "expire") {
      const lot = row.refId != null ? lots.get(row.refId) : undefined;
      if (lot) lot.writtenOff = true;
      continue;
    }
    if (row.delta > 0) {
      const lot: Lot = { id: row.id, amount: row.delta, remaining: row.delta, expired: 0, expiresAt: row.expiresAt, writtenOff: false };
      const pay = Math.min(debt, lot.remaining);
      lot.remaining -= pay;
      debt -= pay;
      lots.set(row.id, lot);
      order.push(lot);
      // A lot created already past its end date is expired at once.
      expireUntil(row.createdAt.getTime());
    } else if (row.delta < 0) {
      spend(-row.delta, row.refId != null ? lots.get(row.refId) : undefined);
    }
  }
  expireUntil(now.getTime());

  const balance = order.reduce((s, l) => s + l.remaining, 0) - debt;
  const soon = now.getTime() + soonDays * 86_400_000;
  return {
    balance,
    debt,
    lots: order,
    toExpire: order.filter((l) => l.expired > 0 && !l.writtenOff).map((l) => ({ lotId: l.id, amount: l.expired })),
    expiringSoon: order
      .filter((l) => l.remaining > 0 && l.expiresAt && l.expiresAt.getTime() <= soon)
      .sort((a, b) => time(a.expiresAt) - time(b.expiresAt))
      .map((l) => ({ amount: l.remaining, at: l.expiresAt! })),
  };
}

/** The plain sum of the rows — equals the evaluated balance once every expired lot is written off. */
export function ledgerSum(rows: Pick<LedgerRow, "delta">[]): number {
  return rows.reduce((s, r) => s + r.delta, 0);
}

/**
 * How much a cancellation takes back for an earn row: what the lot earned
 * minus what it already lost to expiry (expired points are not taken twice).
 * Points already spent are still taken back — from the rest of the balance,
 * or as a debt.
 */
export function reversibleAmount(rows: LedgerRow[], lotId: number, now: Date): number {
  const lot = evaluateLedger(rows, now).lots.find((l) => l.id === lotId);
  return lot ? Math.max(0, lot.amount - lot.expired) : 0;
}
