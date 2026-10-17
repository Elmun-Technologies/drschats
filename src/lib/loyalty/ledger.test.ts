import { describe, expect, it } from "vitest";
import { evaluateLedger, ledgerSum, reversibleAmount, type LedgerRow } from "./ledger";

const D = (iso: string) => new Date(`${iso}T12:00:00Z`);
let id = 0;
const row = (delta: number, kind: LedgerRow["kind"], at: string, extra: Partial<LedgerRow> = {}): LedgerRow => ({
  id: ++id,
  delta,
  kind,
  refId: null,
  expiresAt: null,
  createdAt: D(at),
  ...extra,
});

describe("evaluateLedger", () => {
  it("sums earnings and spending while nothing expires", () => {
    const rows = [row(3000, "earn", "2026-01-01"), row(2000, "earn", "2026-02-01"), row(-1500, "redeem", "2026-03-01")];
    const s = evaluateLedger(rows, D("2026-03-02"));
    expect(s.balance).toBe(3500);
    expect(s.balance).toBe(ledgerSum(rows));
    expect(s.toExpire).toEqual([]);
  });

  it("expires what a lot still holds at its end date, lazily", () => {
    const lot = row(3000, "earn", "2026-01-01", { expiresAt: D("2026-06-30") });
    const rows = [lot, row(-1000, "redeem", "2026-02-01")];
    expect(evaluateLedger(rows, D("2026-06-29")).balance).toBe(2000);
    const after = evaluateLedger(rows, D("2026-07-01"));
    expect(after.balance).toBe(0);
    expect(after.toExpire).toEqual([{ lotId: lot.id, amount: 2000 }]);
  });

  it("spends the lot that expires first", () => {
    const late = row(5000, "earn", "2026-01-01", { expiresAt: D("2026-12-01") });
    const early = row(2000, "earn", "2026-02-01", { expiresAt: D("2026-04-01") });
    const rows = [late, early, row(-2500, "redeem", "2026-03-01")];
    // The early lot is used up entirely; 500 came from the late one; nothing is lost on 1 April.
    const s = evaluateLedger(rows, D("2026-05-01"));
    expect(s.balance).toBe(4500);
    expect(s.toExpire).toEqual([]);
  });

  it("cannot spend points that had already expired", () => {
    const lot = row(2000, "earn", "2026-01-01", { expiresAt: D("2026-02-01") });
    const fresh = row(1000, "earn", "2026-03-01");
    const rows = [lot, fresh, row(-1000, "redeem", "2026-03-02")];
    const s = evaluateLedger(rows, D("2026-03-03"));
    expect(s.balance).toBe(0);
    expect(s.toExpire).toEqual([{ lotId: lot.id, amount: 2000 }]);
  });

  it("treats 'expire' rows as bookkeeping: the plain sum matches once written", () => {
    const lot = row(2000, "earn", "2026-01-01", { expiresAt: D("2026-02-01") });
    const rows = [lot, row(-2000, "expire", "2026-02-05", { refId: lot.id })];
    const s = evaluateLedger(rows, D("2026-03-01"));
    expect(s.balance).toBe(0);
    expect(ledgerSum(rows)).toBe(0);
    expect(s.toExpire).toEqual([]);
  });

  it("a reversal of spent points leaves a debt the next lot pays first", () => {
    const earn = row(3000, "earn", "2026-01-01");
    const rows = [
      earn,
      row(-3000, "redeem", "2026-01-10"),
      row(-3000, "reverse", "2026-01-20", { refId: earn.id }),
    ];
    expect(evaluateLedger(rows, D("2026-01-21")).balance).toBe(-3000);
    const repaid = evaluateLedger([...rows, row(4000, "earn", "2026-02-01")], D("2026-02-02"));
    expect(repaid.balance).toBe(1000);
    expect(repaid.debt).toBe(0);
  });

  it("a refund is a new lot with its own end date", () => {
    const rows = [
      row(5000, "earn", "2026-01-01"),
      row(-2000, "redeem", "2026-01-05"),
      row(2000, "reverse", "2026-01-06", { refId: 999, expiresAt: D("2026-07-06") }),
    ];
    expect(evaluateLedger(rows, D("2026-02-01")).balance).toBe(5000);
    expect(evaluateLedger(rows, D("2026-08-01")).balance).toBe(3000);
  });

  it("lists what expires soon, earliest first", () => {
    const rows = [row(1000, "earn", "2026-01-01", { expiresAt: D("2026-03-20") }), row(500, "earn", "2026-01-02", { expiresAt: D("2026-03-10") })];
    expect(evaluateLedger(rows, D("2026-03-01")).expiringSoon.map((e) => e.amount)).toEqual([500, 1000]);
  });
});

describe("reversibleAmount", () => {
  it("takes back what the lot earned minus what it already lost to expiry", () => {
    const earn = row(3000, "earn", "2026-01-01", { expiresAt: D("2026-02-01") });
    const rows = [earn, row(-1000, "redeem", "2026-01-10")];
    // 1000 spent (taken back), 2000 expired (not taken twice).
    expect(reversibleAmount(rows, earn.id, D("2026-03-01"))).toBe(1000);
    expect(reversibleAmount(rows, earn.id, D("2026-01-15"))).toBe(3000);
    expect(reversibleAmount(rows, 12345, D("2026-01-15"))).toBe(0);
  });
});
