import { BASE, check, db, login, newPage, openBrowser, shot, summary } from "./lib.mjs";

/*
  The bot's own path, end to end: an order placed through /api/bot/shop/order
  (the exact call bot/shop.py makes) must land in the same `orders` table the
  site writes, carry source "telegram_bot", be visible in the panel with that
  channel, and queue a confirmation for the chat.

  Telegram itself is not involved — the bot is the part under test, and its
  handlers are covered separately by govita-vip-bot/scripts/live_shop_ui.py.
*/

const KEY = process.env.BOT_API_KEY ?? "local-bot-api-key-0123456789abcdef0123456789abcdef";
const CHAT = 515151;
const PHONE = "+998935556677";

const api = async (method, path, body) => {
  const res = await fetch(`${BASE}/api/bot${path}`, {
    method,
    headers: { authorization: `Bearer ${KEY}`, ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const sql = await db();
const browser = await openBrowser();

try {
  // The bot links the phone when the customer shares their contact.
  await api("POST", "/contacts", { telegramUserId: CHAT, contactUserId: CHAT, chatId: CHAT, phone: PHONE, name: "Bot Order" });
  await api("POST", "/shop/cart/clear", { chatId: CHAT });

  const cats = await api("GET", "/shop/categories?locale=uz");
  check("the bot API lists categories from the site", (cats.body?.categories ?? []).length > 0, JSON.stringify(cats.body).slice(0, 120));

  const catalog = await api("GET", "/shop/catalog?locale=uz&page=1");
  const product = catalog.body?.items?.[0];
  check("the bot API lists products with real prices", Boolean(product?.price > 0), JSON.stringify(product).slice(0, 120));

  const added = await api("POST", "/shop/cart/add", { chatId: CHAT, slug: product.slug, qty: 2 });
  check("the cart is kept on the server", (added.body?.lines ?? []).some((l) => l.slug === product.slug && l.qty === 2), JSON.stringify(added.body).slice(0, 160));

  const quote = await api("POST", "/shop/quote", { chatId: CHAT, locale: "uz", method: "courier", promoCode: null });
  const total = quote.body?.totals?.total ?? 0;
  check("the quote totals are computed by the server", total > 0, String(total));

  const key = `e2e-${Date.now()}`;
  const placed = await api("POST", "/shop/order", {
    chatId: CHAT,
    locale: "uz",
    name: "Bot Order",
    phone: PHONE,
    method: "courier",
    region: "Toshkent shahri",
    address: "Chilonzor 9-42",
    idempotencyKey: key,
  });
  check("the bot order is created", Boolean(placed.body?.orderId), JSON.stringify(placed.body).slice(0, 200));
  const number = placed.body?.orderId;

  const again = await api("POST", "/shop/order", {
    chatId: CHAT,
    locale: "uz",
    name: "Bot Order",
    phone: PHONE,
    method: "courier",
    region: "Toshkent shahri",
    address: "Chilonzor 9-42",
    idempotencyKey: key,
  });
  check("a repeated confirm does not create a second order", again.body?.orderId === number, JSON.stringify(again.body).slice(0, 120));

  const [row] = await sql`select number, source, telegram_chat_id, total, totals from orders where number = ${number}`;
  check("the order is tagged as the bot channel", row?.source === "telegram_bot", row?.source);
  check("the order remembers the chat", Number(row?.telegram_chat_id) === CHAT, String(row?.telegram_chat_id));
  check("the stored total is the quoted one", Number(row?.total) === Number(total), `${row?.total} vs ${total}`);

  const [job] = await sql`select kind, payload from bot_jobs where chat_id = ${CHAT} and kind = 'order_status' order by id desc limit 1`;
  check("the customer's confirmation is queued in the bot", Boolean(job) && String(job.payload?.text ?? "").includes(number), JSON.stringify(job).slice(0, 160));

  // ── the panel sees the same order and the channel ───────────────────────
  const admin = await newPage(browser);
  await login(admin.page);
  await admin.page.goto(`${BASE}/admin/orders`, { waitUntil: "networkidle" });
  const list = await admin.page.locator("main").innerText();
  check("the order is listed in the panel", list.includes(number), list.slice(0, 200).replace(/\n/g, " "));
  check("the panel shows the bot as the channel", /Telegram bot/i.test(list), list.slice(0, 200).replace(/\n/g, " "));
  await shot(admin.page, "flow9-bot-order");
  await admin.ctx.close();
} finally {
  await sql.end();
  await browser.close();
}

process.exit(summary() ? 0 : 1);
