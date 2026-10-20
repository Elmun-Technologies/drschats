import { BASE, check, db, summary } from "./lib.mjs";

/*
  Flow 11 — a bot customer who leaves a cart joins the site's own
  "Tashlab ketilgan savat" flow, and the message goes to Telegram when the
  chat is linked (SMS is only the fallback).

  The cart is built through the real bot API, then back-dated by three hours —
  the sweep only picks up carts idle for two. The worker is driven with its
  `?at=` hook, so quiet hours and due times are exercised without waiting.
*/

const KEY = process.env.BOT_API_KEY ?? "local-bot-api-key-0123456789abcdef0123456789abcdef";
const CRON = process.env.CRON_SECRET ?? "local-cron-secret";
const CHAT = 616161;
const PHONE = "+998901112244";
const PHONE9 = "901112244";

const api = async (method, path, body) => {
  const res = await fetch(`${BASE}/api/bot${path}`, {
    method,
    headers: { authorization: `Bearer ${KEY}`, ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const tick = async (at) => {
  const url = new URL(`${BASE}/api/cron/messages`);
  url.searchParams.set("at", at);
  const res = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${CRON}` } });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const sql = await db();

/* Orders this flow itself places (identified by the test phone) must go, or
   the next run's sweep sees "an order after the cart" and skips it. */
const cleanup = async () => {
  const ids = (await sql`select id from orders where customer->>'phone' = ${PHONE}`).map((r) => r.id);
  if (ids.length) {
    for (const t of ["bot_order_events", "loyalty_ledger", "referrals", "promo_redemptions", "stock_movements"]) {
      await sql`delete from ${sql(t)} where order_id in ${sql(ids)}`;
    }
    await sql`update flow_enrollments set converted_order_id = null where converted_order_id in ${sql(ids)}`;
    await sql`delete from orders where id in ${sql(ids)}`;
  }
};

try {
  await cleanup();
  await sql`update flows set active = true where id = 'cart-abandoned'`;
  await sql`delete from flow_enrollments where flow_id = 'cart-abandoned' and subject = ${PHONE9}`;
  await sql`delete from outbound_messages where phone9 = ${PHONE9}`;
  await sql`update bot_members set blocked_at = null where chat_id = ${CHAT}`;
  await sql`delete from marketing_optouts where phone9 = ${PHONE9}`;
  await sql`delete from bot_members where chat_id = ${CHAT} and not exists (select 1 from telegram_links where chat_id = ${CHAT})`;

  // The customer presses /start, links the phone, then fills a cart and leaves.
  await api("POST", `/members/${CHAT}/start`, { locale: "uz", source: "e2e" });
  await api("POST", "/contacts", { telegramUserId: CHAT, contactUserId: CHAT, chatId: CHAT, phone: PHONE, name: "Savat Tashlab" });
  await api("POST", "/shop/cart/clear", { chatId: CHAT });
  const catalog = await api("GET", "/shop/catalog?locale=uz&page=1");
  const product = catalog.body?.items?.[0];
  const added = await api("POST", "/shop/cart/add", { chatId: CHAT, slug: product.slug, qty: 2 });
  check("the bot cart holds the product", (added.body?.lines ?? []).length > 0, JSON.stringify(added.body).slice(0, 120));

  // Three hours later (the sweep looks for 2–26 h of silence).
  const touched = new Date(Date.now() - 3 * 3600_000);
  await sql`update bot_carts set updated_at = ${touched.toISOString()}::timestamptz where chat_id = ${CHAT}`;

  // Morning tick: quiet hours must not delay a message sent at 10:00.
  const at = new Date();
  at.setUTCHours(5, 0, 0, 0); // 10:00 Tashkent
  const first = await tick(at.toISOString());
  check("the worker runs the cart sweep", first.status === 200 && Boolean(first.body), JSON.stringify(first.body).slice(0, 160));

  const [enrolment] = await sql`
    select id, subject, cycle, status from flow_enrollments
    where flow_id = 'cart-abandoned' and subject = ${PHONE9} order by id desc limit 1`;
  check("the bot cart is enrolled in the site's abandoned-cart flow", Boolean(enrolment), JSON.stringify(enrolment));
  check("the cycle is keyed to the bot cart, not just the phone", String(enrolment?.cycle ?? "").includes(`bot:${CHAT}`), enrolment?.cycle);

  const messages = await sql`
    select channel, phone9, chat_id, flow_id, flow_step, status, scheduled_at
    from outbound_messages where phone9 = ${PHONE9} order by id`;
  check("a message is queued for the customer", messages.length > 0, JSON.stringify(messages).slice(0, 200));
  check("it goes to Telegram, not SMS, because the chat is linked", messages[0]?.channel === "telegram", messages[0]?.channel);
  // flow_step is zero-based: 0 is the flow's first step.
  check("it is the abandoned-cart flow's first step", messages[0]?.flow_id === "cart-abandoned" && Number(messages[0]?.flow_step) === 0, JSON.stringify(messages[0]));

  const [job] = await sql`select kind, payload from bot_jobs where chat_id = ${CHAT} order by id desc limit 1`;
  const text = String(job?.payload?.text ?? "");
  check("the bot has the text to deliver", text.length > 0, JSON.stringify(job).slice(0, 160));
  check("the message names the product the customer left", text.includes(product.name), text.slice(0, 120));
  check("no placeholder is left in the text", !/\{[a-zA-Z]+\}/.test(text), text.slice(0, 160));

  // ── a second tick must not send it twice ───────────────────────────────
  await tick(new Date(at.getTime() + 5 * 60_000).toISOString());
  const [{ n }] = await sql`select count(*)::int n from outbound_messages where phone9 = ${PHONE9} and flow_step = 0`;
  check("the first step is queued once", n === 1, String(n));

  // ── and an order after the cart ends the flow ─────────────────────────
  await api("POST", "/shop/order", {
    chatId: CHAT,
    locale: "uz",
    name: "Savat Tashlab",
    phone: PHONE,
    method: "courier",
    region: "Toshkent shahri",
    address: "Chilonzor 1-1",
    idempotencyKey: `abandon-${Date.now()}`,
  });
  const later = new Date(at.getTime() + 24 * 3600_000);
  await tick(later.toISOString());
  const [after] = await sql`select status from flow_enrollments where id = ${enrolment?.id}`;
  check("placing the order takes the customer out of the flow", after?.status === "converted", after?.status);

  await sql`update flows set active = false where id = 'cart-abandoned'`;
  await sql`delete from flow_enrollments where flow_id = 'cart-abandoned' and subject = ${PHONE9}`;
  await sql`delete from outbound_messages where phone9 = ${PHONE9}`;
  await sql`update bot_carts set lines = '[]'::jsonb where chat_id = ${CHAT}`;
  await cleanup();
} finally {
  await sql.end();
}

process.exit(summary() ? 0 : 1);
