import { BASE, check, db, login, newPage, openBrowser, shot, summary } from "./lib.mjs";
import { readFile } from "node:fs/promises";

/*
  Flow 4 — the two automations docs/QOLGAN-ISHLAR.md calls open:

  1. "Omborga keldi": a waitlist request, the product coming back, and the
     message arriving through the flow engine (quiet hours, opt-out, outbox)
     rather than only on the operator's call list.
  2. "Bugungi taklif boshlanishi": a scheduled deal opening and the
     "narxi tushsa xabar bering" request being answered exactly once.

  The worker is driven by POST /api/cron/messages, the same endpoint an
  external cron uses, so no test waits five minutes for a timer.
*/

const CRON = process.env.CRON_SECRET ?? "local-cron-secret";
const SMS_LOG = process.env.SMS_FAKE_LOG ?? "/tmp/sms.jsonl";
const tick = async (at) => {
  const url = new URL(`${BASE}/api/cron/messages`);
  // `?at=` is the worker's own test hook: it pretends it is another moment, so
  // quiet hours and a step's due time can be exercised without waiting.
  if (at) url.searchParams.set("at", at);
  const res = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${CRON}` } });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const sql = await db();
const browser = await openBrowser();
const started = Date.now();

try {
  // ── 1. restock ─────────────────────────────────────────────────────────
  // The restock flow is seeded off; an admin turns it on in /admin/flows.
  await sql`update flows set active = true where id = 'restock'`;
  const [product] = await sql`
    select id, slug, content->'name'->>'uz' as name from products
    where kind = 'core' and in_stock = true and jsonb_array_length(images) > 0
    order by sort limit 1`;

  const { ctx, page } = await newPage(browser);
  await login(page);

  // Out of stock, through the admin panel — the panel clears the catalogue cache.
  await page.goto(`${BASE}/admin/products/${encodeURIComponent(product.id)}`, { waitUntil: "networkidle" });
  await page.locator('input[name="stockQty"]').fill("0");
  await page.getByRole("button", { name: /^Saqlash$/ }).first().click();
  await page.waitForTimeout(2500);

  await page.goto(`${BASE}/uz/product/${product.slug}`, { waitUntil: "networkidle" });
  const field = page.locator('input[name="phone"]').first();
  await field.fill("+998 90 555 44 33");
  await page.locator("form:has(input[name='phone']) button[type='submit']").first().click();
  await page.waitForTimeout(2500);
  const [request] = await sql`select id, phone9, kind, status from restock_requests where product_slug = ${product.slug}`;
  check("a waitlist request is stored", Boolean(request), "no row");
  check("the request is for the restock kind", request?.kind === "restock", request?.kind);
  check("the phone is stored normalised, not raw", request?.phone9 === "905554433", request?.phone9);

  // The product comes back — through the admin panel, like the team does it.
  const [{ max: outboxMark }] = await sql`select coalesce(max(id), 0)::int as max from outbound_messages`;
  await page.goto(`${BASE}/admin/products/${encodeURIComponent(product.id)}`, { waitUntil: "networkidle" });
  await page.locator('input[name="stockQty"]').fill("12");
  await page.getByRole("button", { name: /^Saqlash$/ }).first().click();
  await page.waitForTimeout(3000);
  await shot(page, "flow4-stock-back");

  const [after] = await sql`select notified_via, status from restock_requests where id = ${request.id}`;
  check("the waitlist row is marked as told", after?.status === "notified", JSON.stringify(after));
  check("the restock flow took it (not a manual channel)", after?.notified_via === "flow", after?.notified_via);
  const [enrollment] = await sql`select id, flow_id, subject, status from flow_enrollments where flow_id = 'restock' and subject = '905554433' order by id desc limit 1`;
  check("the customer is enrolled in the restock flow", Boolean(enrollment), "no enrollment");

  /*
    Advance the flow on a simulated clock: the next 22:00 in Tashkent. Using
    the real clock made this check pass only while the test itself ran at
    night — the message was already due at 09:00 otherwise.
  */
  const HOUR = 3600_000;
  let night = new Date();
  night = new Date(Date.UTC(night.getUTCFullYear(), night.getUTCMonth(), night.getUTCDate(), 17, 0, 0));
  if (night.getTime() <= Date.now()) night = new Date(night.getTime() + 24 * HOUR);
  const morningAt = new Date(night.getTime() + 11 * HOUR + 60_000);
  const realtime = await tick(night.toISOString());
  check("the message worker tick runs", realtime.status === 200 && realtime.body?.ok !== false, JSON.stringify(realtime).slice(0, 200));

  // The message is queued, not sent: it is ~22:30 in Tashkent, inside the
  // 21:00–09:00 silence, so the engine moves it to 09:00 instead of waking
  // somebody up. That rule is asserted, not assumed.
  const [queued] = await sql`select status, scheduled_at, text from outbound_messages
                             where id > ${outboxMark} and phone9 = '905554433' order by id desc limit 1`;
  const tashkentHour = (new Date(queued.scheduled_at).getUTCHours() + 5) % 24;
  check("quiet hours push the message to 09:00 Tashkent", tashkentHour === 9 && queued.status === "pending", `${queued.scheduled_at} (${tashkentHour}h)`);

  const morning = await tick(morningAt.toISOString());
  check("the morning tick delivers what the night held", morning.status === 200 && morning.body?.ok !== false, JSON.stringify(morning).slice(0, 200));
  await page.waitForTimeout(2500);
  const log = await readFile(SMS_LOG, "utf8").catch(() => "");
  const sent = log.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return {}; } });
  const mine = sent.filter((m) => String(m.text ?? "").includes(product.name));
  check("the customer gets a real SMS through the fake gateway", mine.length > 0, `log lines: ${sent.length}`);
  const smsText = String(mine[0]?.text ?? "");
  check("the SMS ends with a STOP link", /STOP: \S+\/s\//.test(smsText), smsText.slice(-80));
  check("no template placeholder reaches the customer", !/\{(ism|savat|summa|mahsulot|kod|muddat|havola)\}/.test(smsText), smsText);

  // Quiet hours are a property of the engine: the same queue outside 21:00–09:00
  // is held, not dropped. Checked by unit tests (lib/messaging/quiet-hours); here
  // we only confirm the flow wrote through the outbox, not straight to the gateway.
  const [outbox] = await sql`select status, channel from outbound_messages where phone9 = '905554433' order by id desc limit 1`;
  check("the message goes through the shared outbox", Boolean(outbox), "no outbound row");

  // ── 2. a deal opening notifies 'narxi tushsa' waiters once ──────────────
  const [dealProduct] = await sql`select id, slug, price from products where in_stock = true and kind = 'core' order by sort limit 1`;
  await sql`delete from restock_requests where phone9 = '907776655'`;
  await sql`insert into restock_requests (product_id, product_slug, phone9, phone, locale, kind, target_price, status)
            values (${dealProduct.id}, ${dealProduct.slug}, '907776655', '+998907776655', 'ru', 'price_drop', ${Math.round(dealProduct.price * 1.2)}, 'waiting')`;
  const target = Math.max(1000, Math.round(dealProduct.price * 0.5));
  // A fresh deal per run: a deal that already started was told about once, by
  // design — the test must exercise a *new* start, not re-claim an old one.
  await sql`delete from deal_notifications`;
  await sql`delete from deals where product_slug = ${dealProduct.slug}`;
  // A daytime tick after the restock's morning, so the price-drop SMS is not
  // deferred by quiet hours: 10:00 Tashkent on the same simulated day.
  const dealAt = new Date(morningAt.getTime() + HOUR);
  await sql`
    insert into deals (product_slug, price, percent, starts_at, ends_at)
    values (${dealProduct.slug}, ${target}, null, ${new Date(dealAt.getTime() - 60_000).toISOString()}::timestamptz, ${new Date(dealAt.getTime() + 24 * HOUR).toISOString()}::timestamptz)`;
  const afterDeal = await tick(dealAt.toISOString());
  await page.waitForTimeout(2000);
  const [dealNote] = await sql`select deal_id from deal_notifications order by deal_id desc limit 1`;
  check("the deal sweep claims the deal once", Boolean(dealNote), JSON.stringify(afterDeal.body).slice(0, 200));
  const [told] = await sql`select status, notified_via from restock_requests where phone9 = '907776655' and kind = 'price_drop' order by id desc limit 1`;
  check("the price-drop request is answered", told?.status === "notified", JSON.stringify(told));
  const dealLog = (await readFile(SMS_LOG, "utf8").catch(() => "")).split("\n").filter(Boolean);
  check("the price-drop message is in the gateway log", dealLog.some((l) => l.includes("907776655")), `${dealLog.length} lines`);

  const second = await tick(new Date(dealAt.getTime() + 30_000).toISOString());
  const [stillOnce] = await sql`select count(*)::int as n from deal_notifications where deal_id = ${dealNote?.deal_id}`;
  check("a second tick does not repeat the message", stillOnce?.n === 1, `${stillOnce?.n} rows, tick ${JSON.stringify(second.body).slice(0, 120)}`);

  await ctx.close();
} finally {
  await sql.end();
  await browser.close();
}

process.exit(summary() ? 0 : 1);
