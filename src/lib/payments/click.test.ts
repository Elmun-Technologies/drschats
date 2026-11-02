import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { clickComplete, clickPayUrl, clickPrepare, clickSign, parseClickForm, type ClickContext, type ClickOrder, type ClickPayment, type ClickRequest } from "./click";

const SECRET = "click-secret";
const md5 = (s: string) => createHash("md5").update(s).digest("hex");

function setup(order: Partial<ClickOrder> = {}) {
  const orders: ClickOrder[] = [{ number: "GV-000123", total: 150_000, status: "new", paymentStatus: "pending", ...order }];
  const rows: ClickPayment[] = [];
  const ctx: ClickContext = {
    serviceId: "111",
    secretKey: SECRET,
    store: {
      async findOrder(n) { return orders.find((o) => o.number === n) ?? null; },
      async findByClickId(id) { return rows.find((r) => r.clickTransId === id) ?? null; },
      async findById(id) { return rows.find((r) => r.id === id) ?? null; },
      async prepare(p) { const row: ClickPayment = { id: rows.length + 1, clickTransId: p.clickTransId, orderNumber: p.orderNumber, state: 1 }; rows.push(row); return row; },
      async complete(id) {
        const row = rows.find((r) => r.id === id)!;
        const o = orders.find((x) => x.number === row.orderNumber)!;
        if (o.paymentStatus === "paid") return "already_paid";
        row.state = 2;
        o.paymentStatus = "paid";
        return row;
      },
      async cancel(id) { rows.find((r) => r.id === id)!.state = -1; },
    },
  };
  return { orders, rows, ctx };
}

function req(action: "0" | "1", over: Partial<ClickRequest> = {}): ClickRequest {
  const r: ClickRequest = {
    click_trans_id: "9001",
    service_id: "111",
    click_paydoc_id: "55",
    merchant_trans_id: "GV-000123",
    merchant_prepare_id: action === "1" ? "1" : "",
    amount: "150000.00",
    action,
    error: "0",
    error_note: "Success",
    sign_time: "2026-11-02 10:00:00",
    sign_string: "",
    ...over,
  };
  return { ...r, sign_string: over.sign_string ?? clickSign(r, SECRET) };
}

describe("Click signature", () => {
  it("matches the documented md5 layout for prepare and complete", () => {
    const p = req("0");
    expect(p.sign_string).toBe(md5(`9001111${SECRET}GV-000123150000.0002026-11-02 10:00:00`));
    const c = req("1");
    expect(c.sign_string).toBe(md5(`9001111${SECRET}GV-0001231150000.0012026-11-02 10:00:00`));
  });

  it("parses the form body and rejects one without required fields", () => {
    const r = req("0");
    const body = new URLSearchParams(r as unknown as Record<string, string>);
    expect(parseClickForm(body)?.merchant_trans_id).toBe("GV-000123");
    body.delete("sign_string");
    expect(parseClickForm(body)).toBeNull();
  });
});

describe("Prepare", () => {
  it("prepares an open order once, idempotently", async () => {
    const s = setup();
    const a = await clickPrepare(req("0"), s.ctx);
    expect(a).toMatchObject({ error: 0, merchant_prepare_id: 1, click_trans_id: "9001", merchant_trans_id: "GV-000123" });
    expect(await clickPrepare(req("0"), s.ctx)).toEqual(a);
    expect(s.rows).toHaveLength(1);
  });

  it("refuses a bad signature, wrong service, wrong action, unknown order and wrong amount", async () => {
    const s = setup();
    expect((await clickPrepare({ ...req("0"), sign_string: "0".repeat(32) }, s.ctx)).error).toBe(-1);
    expect((await clickPrepare(req("0", { service_id: "222" }), s.ctx)).error).toBe(-8);
    expect((await clickPrepare(req("1"), s.ctx)).error).toBe(-3);
    expect((await clickPrepare(req("0", { merchant_trans_id: "GV-404" }), s.ctx)).error).toBe(-5);
    expect((await clickPrepare(req("0", { amount: "149999.00" }), s.ctx)).error).toBe(-2);
    expect((await clickPrepare(req("0", { amount: "150000" }), s.ctx)).error).toBe(0);
  });

  it("refuses a paid (-4) or cancelled (-9) order", async () => {
    expect((await clickPrepare(req("0"), setup({ paymentStatus: "paid" }).ctx)).error).toBe(-4);
    expect((await clickPrepare(req("0"), setup({ status: "cancelled" }).ctx)).error).toBe(-9);
  });
});

describe("Complete", () => {
  it("marks the order paid and repeats as already paid", async () => {
    const s = setup();
    await clickPrepare(req("0"), s.ctx);
    expect(await clickComplete(req("1"), s.ctx)).toMatchObject({ error: 0, merchant_confirm_id: 1 });
    expect(s.orders[0].paymentStatus).toBe("paid");
    expect((await clickComplete(req("1"), s.ctx)).error).toBe(-4);
  });

  it("cancels when Click reports a failed charge", async () => {
    const s = setup();
    await clickPrepare(req("0"), s.ctx);
    expect((await clickComplete(req("1", { error: "-5017", error_note: "Insufficient funds" }), s.ctx)).error).toBe(-9);
    expect(s.rows[0].state).toBe(-1);
    expect(s.orders[0].paymentStatus).toBe("pending");
    expect((await clickComplete(req("1"), s.ctx)).error).toBe(-9);
  });

  it("refuses an unknown prepare id (-6) and a second payment for a paid order", async () => {
    const s = setup();
    expect((await clickComplete(req("1", { merchant_prepare_id: "77" }), s.ctx)).error).toBe(-6);
    await clickPrepare(req("0"), s.ctx);
    await clickPrepare(req("0", { click_trans_id: "9002" }), s.ctx);
    expect((await clickComplete(req("1"), s.ctx)).error).toBe(0);
    expect((await clickComplete(req("1", { click_trans_id: "9002", merchant_prepare_id: "2" }), s.ctx)).error).toBe(-4);
    expect(s.rows[1].state).toBe(-1);
  });
});

describe("pay link", () => {
  it("carries service, merchant, amount, order and return URL", () => {
    const url = new URL(clickPayUrl({ serviceId: "111", merchantId: "222", orderNumber: "GV-1", amount: 150000, returnUrl: "https://x.uz/uz/track/t" }));
    expect(url.origin + url.pathname).toBe("https://my.click.uz/services/pay");
    expect(Object.fromEntries(url.searchParams)).toEqual({ service_id: "111", merchant_id: "222", amount: "150000.00", transaction_param: "GV-1", return_url: "https://x.uz/uz/track/t" });
  });
});
