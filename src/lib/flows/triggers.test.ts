import { describe, expect, it } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import { botJobKey, campaignMessageKey, flowMessageKey } from "@/lib/messaging/keys";
import { enrollmentWindow } from "./schedule";
import { candidateQuery, conversionQuery } from "./triggers";
import { FLOW_TRIGGERS } from "./types";

const dialect = new PgDialect();
const render = (q: Parameters<PgDialect["sqlToQuery"]>[0]) => dialect.sqlToQuery(q);
const window = { from: new Date("2026-10-15T11:00:00Z"), to: new Date("2026-10-17T11:00:00Z") };

describe("candidateQuery", () => {
  it("has a query for every ready trigger and none for restock / birthday", () => {
    for (const trigger of FLOW_TRIGGERS) {
      const q = candidateQuery(trigger, window);
      if (trigger === "restock" || trigger === "birthday") expect(q).toBeNull();
      else expect(q).not.toBeNull();
    }
  });

  it("binds the window bounds as parameters, never as SQL text", () => {
    for (const trigger of ["cart_abandoned", "checkout_dropped", "first_order_delivered", "course_ending", "lapsed"] as const) {
      const { sql, params } = render(candidateQuery(trigger, window)!);
      expect(params).toEqual(expect.arrayContaining([window.from.toISOString(), window.to.toISOString()]));
      expect(sql).not.toContain("2026-10");
      expect(sql).toMatch(/as subject/);
      expect(sql).toMatch(/as cycle/);
      expect(sql).toMatch(/as anchor/);
    }
  });

  it("needs a known phone and no order after the cart for abandoned carts", () => {
    const { sql } = render(candidateQuery("cart_abandoned", window)!);
    expect(sql).toContain("v.phone9 is not null");
    expect(sql).toContain("v.cart_value > 0");
    expect(sql).toContain("last_order_at is null or v.last_order_at < v.cart_at");
    expect(sql).toMatch(/not exists \(select 1 from orders o where o\.created_at > v\.cart_at/);
  });

  it("only counts the first non-cancelled order as a first purchase", () => {
    const { sql } = render(candidateQuery("first_order_delivered", window)!);
    expect(sql).toContain("o.status <> 'cancelled'");
    expect(sql).toContain("order by phone9, o.created_at asc");
    expect(sql).toContain("f.status = 'delivered'");
  });

  it("matches conversions by phone tail or the cart's browser", () => {
    const withVisitor = render(conversionQuery("901234567", window.from, "8d6c0d2e-0000-4000-8000-000000000000"));
    expect(withVisitor.params).toEqual(expect.arrayContaining(["901234567", "8d6c0d2e-0000-4000-8000-000000000000", window.from.toISOString()]));
    expect(withVisitor.sql).toContain("o.visitor_id");
    expect(render(conversionQuery("901234567", window.from, null)).sql).not.toContain("visitor_id");
  });

  it("windows the anchor by the first step's delay", () => {
    const now = new Date("2026-10-17T12:00:00Z");
    expect(enrollmentWindow("cart_abandoned", 60, now).to.toISOString()).toBe("2026-10-17T11:00:00.000Z");
  });
});

describe("dedupe keys", () => {
  it("are stable per flow step and per campaign recipient", () => {
    expect(flowMessageKey("cart-abandoned", 42, 0)).toBe("flow:cart-abandoned:42:0");
    expect(flowMessageKey("cart-abandoned", 42, 0)).toBe(flowMessageKey("cart-abandoned", 42, 0));
    expect(flowMessageKey("cart-abandoned", 42, 1)).not.toBe(flowMessageKey("cart-abandoned", 42, 0));
    expect(campaignMessageKey(7, "901234567")).toBe("campaign:7:901234567");
  });

  it("keeps the pre-outbox bot job key for campaigns", () => {
    expect(botJobKey({ id: 9, campaignId: 7, chatId: 555 })).toBe("campaign:7:555");
    expect(botJobKey({ id: 9, campaignId: null, chatId: 555 })).toBe("msg:9");
  });
});
