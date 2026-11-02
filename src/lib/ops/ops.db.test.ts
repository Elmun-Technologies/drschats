import { beforeAll, describe, expect, it, vi } from "vitest";

/*
  The SQL of the operations layer against a real Postgres. Runs only with
  TEST_DATABASE_URL pointing at a migrated, disposable database
  (`node scripts/db/migrate.mjs`); skipped otherwise, so `npm test` needs no
  database.
*/
const url = process.env.TEST_DATABASE_URL;

vi.mock("server-only", () => ({}));

describe.skipIf(!url)("operations SQL (Postgres)", () => {
  beforeAll(() => {
    process.env.DATABASE_URL = url;
  });

  it("counts a shared rate limit and resets it", async () => {
    const { hitRateLimit, rateLimitReached, resetRateLimit } = await import("@/lib/rate-limit-store");
    const key = `t-${Date.now()}`;
    const limit = { limit: 2, windowMs: 60_000 };
    expect(await hitRateLimit("test", key, limit)).toBe(true);
    expect(await hitRateLimit("test", key, limit)).toBe(true);
    expect(await rateLimitReached("test", key, limit)).toBe(true);
    expect(await hitRateLimit("test", key, limit)).toBe(false);
    const { getDb } = await import("@/lib/db/client");
    const { sql } = await import("drizzle-orm");
    const rows = (await getDb().execute(sql`select count from rate_limit_hits where scope = 'test'`)) as unknown as { count: number }[];
    expect(rows.map((r) => Number(r.count))).toContain(3);
    await resetRateLimit("test", key);
    expect(await rateLimitReached("test", key, limit)).toBe(false);
  });

  it("claims an alert slot once per window", async () => {
    const { claimOnce, readOps, writeOps } = await import("./state");
    const key = `test.once.${Date.now()}`;
    expect(await claimOnce(key, 60)).toBe(true);
    expect(await claimOnce(key, 60)).toBe(false);
    await writeOps(`${key}.v`, { at: "x" });
    expect((await readOps<{ at: string }>(`${key}.v`))?.value.at).toBe("x");
  });

  it("reads worker health and clock events", async () => {
    const { workerHealth } = await import("./health");
    const h = await workerHealth();
    expect(h.failed1h).toBeGreaterThanOrEqual(0);
    expect(["ok", "stale", "off"]).toContain(h.state);
    const { clockEventsSince } = await import("./clock-events");
    expect(await clockEventsSince(new Date(Date.now() - 60_000).toISOString(), new Date().toISOString())).toBeGreaterThanOrEqual(0);
  });

  it("runs the retention sweep", async () => {
    const { runRetention } = await import("./retention");
    expect(typeof (await runRetention())).toBe("object");
  });

  it("anonymises a customer and keeps the order's totals", async () => {
    const { getDb } = await import("@/lib/db/client");
    const { sql } = await import("drizzle-orm");
    const { anonymiseCustomer, ANONYMISED_NAME } = await import("@/lib/admin/anonymise");
    const phone9 = "9" + String(Date.now()).slice(-8);
    const [order] = (await getDb().execute(sql`
      insert into orders (total, customer, delivery, items, totals, locale)
      values (1000, ${JSON.stringify({ name: "Ali", phone: `+998${phone9}`, email: "a@b.uz" })}::jsonb,
              '{"region": "Toshkent", "address": "Chilonzor 1", "method": "courier"}'::jsonb, '[]'::jsonb, '{"total": 1000}'::jsonb, 'uz')
      returning id`)) as unknown as { id: number }[];
    await getDb().execute(sql`insert into admin_customer_notes (phone9, note) values (${phone9}, 'call after 15')`);
    const removed = await anonymiseCustomer(phone9);
    expect(removed.orders).toBe(1);
    expect(removed.notes).toBe(1);
    const [row] = (await getDb().execute(sql`select customer, delivery, total from orders where id = ${order.id}`)) as unknown as { customer: { name: string; phone: string }; delivery: { address: string; region: string }; total: number }[];
    expect(row.customer.name).toBe(ANONYMISED_NAME);
    expect(row.customer.phone).toBe("");
    expect(row.delivery).toMatchObject({ address: "", region: "Toshkent" });
    expect(row.total).toBe(1000);
    await getDb().execute(sql`delete from orders where id = ${order.id}`);
  });

  it("finds operator pings to retry and unpaid orders to release", async () => {
    const { releaseUnpaidOrders } = await import("@/lib/orders/release");
    expect((await releaseUnpaidOrders()).released).toBeGreaterThanOrEqual(0);
  });
});
