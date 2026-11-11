import { describe, expect, it } from "vitest";
import { PAYME_ERRORS, PAYME_TIMEOUT_MS, PaymeFault, handlePayme, paymeAuthorized, paymeCheckoutUrl, type PaymeContext, type PaymeOrder, type PaymeStore, type PaymeTx } from "./payme";

const KEY = "secret&key";
const auth = `Basic ${Buffer.from(`Paycom:${KEY}`).toString("base64")}`;

function memoryStore(orders: PaymeOrder[]) {
  const txs = new Map<string, PaymeTx>();
  let seq = 0;
  let key = KEY;
  const store: PaymeStore = {
    async findOrder(n) { return orders.find((o) => o.number === n) ?? null; },
    async findTx(id) { return txs.get(id) ?? null; },
    async pendingTxForOrder(n) { return [...txs.values()].find((t) => t.orderNumber === n && t.state === 1) ?? null; },
    async createTx(t) {
      const tx: PaymeTx = { ...t, transaction: String(++seq), state: 1, reason: null, performTime: null, cancelTime: null };
      txs.set(t.id, tx);
      const o = orders.find((x) => x.number === t.orderNumber)!;
      o.paymentStatus = "pending";
      return tx;
    },
    async performTx(id, time) {
      const tx = txs.get(id)!;
      Object.assign(tx, { state: 2, performTime: time });
      orders.find((o) => o.number === tx.orderNumber)!.paymentStatus = "paid";
      return tx;
    },
    async cancelTx(id, time, reason, state) {
      const tx = txs.get(id)!;
      Object.assign(tx, { state, cancelTime: time, reason });
      if (state === -2) orders.find((o) => o.number === tx.orderNumber)!.paymentStatus = "refunded";
      return tx;
    },
    async statement(from, to) { return [...txs.values()].filter((t) => t.createTime >= from && t.createTime <= to); },
    async changeKey(p) { key = p; },
  };
  return { store, txs, key: () => key };
}

function setup(order: Partial<PaymeOrder> = {}) {
  const orders: PaymeOrder[] = [{ number: "GV-000123", amount: 15_000_000, status: "new", paymentStatus: "pending", ...order }];
  const mem = memoryStore(orders);
  let now = 1_700_000_000_000;
  const ctx: PaymeContext = { key: KEY, account: "order_id", store: mem.store, now: () => now };
  const call = (method: string, params: object, header: string | null = auth) =>
    handlePayme(JSON.stringify({ jsonrpc: "2.0", id: 7, method, params }), header, ctx);
  return { orders, mem, ctx, call, tick: (ms: number) => (now += ms), now: () => now };
}

const account = { order_id: "GV-000123" };
const errorOf = (r: Awaited<ReturnType<typeof handlePayme>>) => ("error" in r ? r.error : null);
const resultOf = (r: Awaited<ReturnType<typeof handlePayme>>) => ("result" in r ? (r.result as Record<string, unknown>) : null);

describe("Payme auth and envelope", () => {
  it("rejects a missing or wrong key with -32504 before reading the request", async () => {
    const { call } = setup();
    expect(errorOf(await call("CheckPerformTransaction", { amount: 15_000_000, account }, null))?.code).toBe(-32504);
    const wrong = `Basic ${Buffer.from("Paycom:other").toString("base64")}`;
    expect(errorOf(await call("CheckPerformTransaction", { amount: 15_000_000, account }, wrong))?.code).toBe(-32504);
    expect(paymeAuthorized(auth, KEY)).toBe(true);
    expect(paymeAuthorized(auth, "")).toBe(false);
  });

  it("answers parse errors, bad requests and unknown methods", async () => {
    const { ctx, call } = setup();
    expect(errorOf(await handlePayme("{not json", auth, ctx))?.code).toBe(-32700);
    expect(errorOf(await handlePayme(JSON.stringify({ id: 1 }), auth, ctx))?.code).toBe(-32600);
    expect(errorOf(await call("Nope", {}))?.code).toBe(-32601);
    const r = await call("Nope", {});
    expect(r.id).toBe(7);
    expect(r.jsonrpc).toBe("2.0");
  });
});

describe("CheckPerformTransaction", () => {
  it("allows the exact amount for an open order", async () => {
    const { call } = setup();
    expect(resultOf(await call("CheckPerformTransaction", { amount: 15_000_000, account }))).toEqual({ allow: true });
  });

  it("refuses a wrong amount (-31001) and an unknown order (-310xx, data = field)", async () => {
    const { call } = setup();
    expect(errorOf(await call("CheckPerformTransaction", { amount: 14_999_900, account }))?.code).toBe(-31001);
    const missing = errorOf(await call("CheckPerformTransaction", { amount: 15_000_000, account: { order_id: "GV-999" } }));
    expect(missing?.code).toBe(-31050);
    expect(missing?.data).toBe("order_id");
    expect(missing?.message.uz).toBeTruthy();
  });

  it("refuses a paid or cancelled order", async () => {
    expect(errorOf(await setup({ paymentStatus: "paid" }).call("CheckPerformTransaction", { amount: 15_000_000, account }))?.code).toBe(-31051);
    expect(errorOf(await setup({ status: "cancelled" }).call("CheckPerformTransaction", { amount: 15_000_000, account }))?.code).toBe(-31051);
  });

  it("sends the fiscal detail when the context builds one", async () => {
    const s = setup();
    s.ctx.detail = async () => ({ receipt_type: 0, items: [] });
    expect(resultOf(await s.call("CheckPerformTransaction", { amount: 15_000_000, account }))).toEqual({ allow: true, detail: { receipt_type: 0, items: [] } });
  });
});

describe("Create → Perform → Cancel", () => {
  it("runs the sandbox happy path with idempotent repeats", async () => {
    const s = setup();
    const create = resultOf(await s.call("CreateTransaction", { id: "p1", time: 1, amount: 15_000_000, account }));
    expect(create).toMatchObject({ state: 1, transaction: "1" });
    // Repeated create returns the same transaction.
    expect(resultOf(await s.call("CreateTransaction", { id: "p1", time: 1, amount: 15_000_000, account }))).toEqual(create);
    // A second transaction for the same order waits for the first.
    const busy = errorOf(await s.call("CreateTransaction", { id: "p2", time: 2, amount: 15_000_000, account }));
    expect(busy?.code).toBe(-31008);
    expect(busy?.data).toBe("order_id");

    s.tick(1000);
    const perform = resultOf(await s.call("PerformTransaction", { id: "p1" }));
    expect(perform).toMatchObject({ state: 2, transaction: "1", perform_time: s.now() });
    expect(s.orders[0].paymentStatus).toBe("paid");
    s.tick(1000);
    expect(resultOf(await s.call("PerformTransaction", { id: "p1" }))).toEqual(perform);

    const check = resultOf(await s.call("CheckTransaction", { id: "p1" }));
    expect(check).toMatchObject({ state: 2, cancel_time: 0, reason: null });

    // Refund while the order is not delivered: -2, order refunded.
    const cancel = resultOf(await s.call("CancelTransaction", { id: "p1", reason: 5 }));
    expect(cancel).toMatchObject({ state: -2 });
    expect(s.orders[0].paymentStatus).toBe("refunded");
    expect(resultOf(await s.call("CancelTransaction", { id: "p1", reason: 5 }))).toEqual(cancel);
    expect(resultOf(await s.call("CheckTransaction", { id: "p1" }))).toMatchObject({ state: -2, reason: 5 });
  });

  it("cancels an unpaid transaction with -1 and then refuses to perform it", async () => {
    const s = setup();
    await s.call("CreateTransaction", { id: "p1", time: 1, amount: 15_000_000, account });
    expect(resultOf(await s.call("CancelTransaction", { id: "p1", reason: 3 }))).toMatchObject({ state: -1 });
    expect(errorOf(await s.call("PerformTransaction", { id: "p1" }))?.code).toBe(-31008);
    expect(errorOf(await s.call("CreateTransaction", { id: "p1", time: 1, amount: 15_000_000, account }))?.code).toBe(-31008);
    // The order is free for a new attempt.
    expect(resultOf(await s.call("CreateTransaction", { id: "p2", time: 3, amount: 15_000_000, account }))).toMatchObject({ state: 1 });
  });

  it("refuses to refund a delivered order (-31007)", async () => {
    const s = setup();
    await s.call("CreateTransaction", { id: "p1", time: 1, amount: 15_000_000, account });
    await s.call("PerformTransaction", { id: "p1" });
    s.orders[0].status = "delivered";
    expect(errorOf(await s.call("CancelTransaction", { id: "p1", reason: 5 }))?.code).toBe(-31007);
  });

  it("expires a transaction after 12 hours (reason 4) and frees the order", async () => {
    const s = setup();
    await s.call("CreateTransaction", { id: "p1", time: 1, amount: 15_000_000, account });
    s.tick(PAYME_TIMEOUT_MS + 1);
    expect(errorOf(await s.call("PerformTransaction", { id: "p1" }))?.code).toBe(-31008);
    expect(resultOf(await s.call("CheckTransaction", { id: "p1" }))).toMatchObject({ state: -1, reason: 4 });
    expect(resultOf(await s.call("CreateTransaction", { id: "p2", time: 2, amount: 15_000_000, account }))).toMatchObject({ state: 1 });
  });

  it("does not take money for an order the shop cancelled meanwhile", async () => {
    const s = setup();
    await s.call("CreateTransaction", { id: "p1", time: 1, amount: 15_000_000, account });
    s.orders[0].status = "cancelled";
    expect(errorOf(await s.call("PerformTransaction", { id: "p1" }))?.code).toBe(-31008);
    expect(s.mem.txs.get("p1")?.state).toBe(-1);
  });

  it("answers -31003 for unknown transactions", async () => {
    const s = setup();
    for (const m of ["PerformTransaction", "CancelTransaction", "CheckTransaction"]) {
      expect(errorOf(await s.call(m, { id: "nope", reason: 1 }))?.code).toBe(-31003);
    }
  });

  it("maps a store fault to its error and anything else to a system error", async () => {
    const s = setup();
    s.mem.store.createTx = async () => { throw new PaymeFault({ ...PAYME_ERRORS.orderBusy, data: "order_id" }); };
    expect(errorOf(await s.call("CreateTransaction", { id: "p9", time: 1, amount: 15_000_000, account }))?.code).toBe(-31008);
    s.mem.store.findTx = async () => { throw new Error("db down"); };
    expect(errorOf(await s.call("CheckTransaction", { id: "p9" }))?.code).toBe(-32400);
  });
});

describe("GetStatement and ChangePassword", () => {
  it("lists transactions in the window with the account field", async () => {
    const s = setup();
    await s.call("CreateTransaction", { id: "p1", time: 11, amount: 15_000_000, account });
    const r = resultOf(await s.call("GetStatement", { from: s.now() - 10, to: s.now() + 10 })) as { transactions: Record<string, unknown>[] };
    expect(r.transactions).toHaveLength(1);
    expect(r.transactions[0]).toMatchObject({ id: "p1", time: 11, amount: 15_000_000, account: { order_id: "GV-000123" }, state: 1 });
  });

  it("stores the new key", async () => {
    const s = setup();
    expect(resultOf(await s.call("ChangePassword", { password: "new-key" }))).toEqual({ success: true });
    expect(s.mem.key()).toBe("new-key");
  });
});

describe("checkout link", () => {
  it("encodes merchant, account, amount, language and return URL", () => {
    const url = paymeCheckoutUrl({ merchantId: "m1", account: "order_id", orderNumber: "GV-1", amount: 500_000, locale: "uz", returnUrl: "https://x.uz/uz/track/a.b", testMode: false });
    expect(url.startsWith("https://checkout.paycom.uz/")).toBe(true);
    const decoded = Buffer.from(url.split("/").pop()!, "base64").toString();
    expect(decoded).toBe("m=m1;ac.order_id=GV-1;a=500000;l=uz;c=https://x.uz/uz/track/a.b");
    expect(paymeCheckoutUrl({ merchantId: "m1", account: "order_id", orderNumber: "GV-1", amount: 1, locale: "ru", returnUrl: "r", testMode: true })).toMatch(/^https:\/\/test\.paycom\.uz\//);
  });
});
