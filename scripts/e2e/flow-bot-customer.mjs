import { BASE, check, db, login, newPage, openBrowser, shot, summary } from "./lib.mjs";

/*
  Flow 12 — a bot customer's whole life after the cart: the order, every
  status message, the night silence, the stop, and the two automations that
  must reach Telegram rather than SMS.

  1. An order placed through the bot API is confirmed in `bot_jobs`, then
     advanced in the admin panel (Tasdiqlash → Joʻnatildi → Yetkazildi).
     Each step must queue its own status message; delivery must also write
     the cashback ledger row, and the delivered message must say so.
     "Buyurtmalarim" (the bot's order list API) must show the final stage.
  2. A cart abandoned at 22:00 Tashkent must not produce a bot job at night:
     the outbox holds it until 09:00. A morning tick then delivers it.
  3. A customer who stopped marketing (`marketing_optouts`) is not messaged
     again — the enrollment closes as `opted_out`, nothing is queued.
  4. "Omborga keldi": the bot-linked customer joins the waitlist on the site
     and the restock flow reaches them on Telegram (not the SMS fallback).

  Telegram itself is not involved: `bot_jobs` is the bot's outbox, and the
  handlers are covered by govita-vip-bot/scripts/live_shop_ui.py.
*/

const KEY = process.env.BOT_API_KEY ?? "local-bot-api-key-0123456789abcdef0123456789abcdef";
const CRON = process.env.CRON_SECRET ?? "local-cron-secret";
const CHAT = 717171;
const PHONE = "+998902223355";
const PHONE9 = "902223355";
const HOUR = 3600_000;

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
  if (at) url.searchParams.set("at", at.toISOString());
  const res = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${CRON}` } });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const tashkentHour = (date) => new Date(new Date(date).getTime() + 5 * HOUR).getUTCHours();

const sql = await db();
const browser = await openBrowser();

let prevLoyalty = null;
let prevFlows = [];
let stock = null;
let stockBefore = null;

/* Everything this flow writes, in FK order. Orders are the flow's own, so the
   next run does not see "an order after the cart". */
const cleanupOrders = async () => {
  const ids = (await sql`select id from orders where customer->>'phone' = ${PHONE}`).map((r) => r.id);
  if (!ids.length) return;
  const moves = await sql`select product_id, delta from stock_movements where order_id in ${sql(ids)} and reason = 'order'`;
  for (const m of moves) {
    await sql`update products set stock_qty = stock_qty - ${m.delta}, in_stock = (stock_qty - ${m.delta}) > 0 where id = ${m.product_id} and stock_qty is not null`;
  }
  for (const t of ["bot_order_events", "loyalty_ledger", "referrals", "promo_redemptions", "stock_movements"]) {
    await sql`delete from ${sql(t)} where order_id in ${sql(ids)}`;
  }
  await sql`update flow_enrollments set converted_order_id = null where converted_order_id in ${sql(ids)}`;
  await sql`delete from orders where id in ${sql(ids)}`;
};

const cleanup = async () => {
  await cleanupOrders();
  await sql`delete from flow_enrollments where subject = ${PHONE9}`;
  await sql`delete from outbound_messages where phone9 = ${PHONE9}`;
  await sql`delete from bot_jobs where chat_id = ${CHAT}`;
  await sql`delete from marketing_optouts where phone9 = ${PHONE9}`;
  await sql`delete from restock_requests where phone9 = ${PHONE9}`;
  await sql`delete from loyalty_ledger where phone9 = ${PHONE9}`;
  await sql`delete from loyalty_otps where phone9 = ${PHONE9}`;
  await sql`delete from bot_carts where chat_id = ${CHAT}`;
  await sql`delete from telegram_links where chat_id = ${CHAT}`;
  await sql`delete from bot_members where chat_id = ${CHAT}`;
};

try {
  await cleanupOrders();
  await sql`delete from flow_enrollments where subject = ${PHONE9}`;
  await sql`delete from outbound_messages where phone9 = ${PHONE9}`;
  await sql`delete from bot_jobs where chat_id = ${CHAT}`;
  await sql`delete from marketing_optouts where phone9 = ${PHONE9}`;
  await sql`delete from restock_requests where phone9 = ${PHONE9}`;
  await sql`delete from loyalty_ledger where phone9 = ${PHONE9}`;
  await sql`delete from bot_carts where chat_id = ${CHAT}`;

  prevFlows = await sql`select id, active from flows where id in ('cart-abandoned', 'restock', 'first-purchase', 'course-ending')`;
  await sql`update flows set active = true where id in ('cart-abandoned', 'restock')`;
  const [loyaltyRow] = await sql`select value from site_settings where key = 'loyalty.rules'`;
  prevLoyalty = loyaltyRow?.value ?? null;
  const rules = { enabled: true, earnPercent: 3, minOrder: 0, maxSharePercent: 30, expiryDays: 180 };
  await sql`insert into site_settings (key, value) values ('loyalty.rules', ${JSON.stringify(rules)})
            on conflict (key) do update set value = excluded.value, updated_at = now()`;

  // ── 1. a bot customer's order ─────────────────────────────────────────
  await api("POST", `/members/${CHAT}/start`, { locale: "uz", source: "e2e" });
  await api("POST", "/contacts", { telegramUserId: CHAT, contactUserId: CHAT, chatId: CHAT, phone: PHONE, name: "Bot Mijoz" });
  await api("POST", "/shop/cart/clear", { chatId: CHAT });
  const catalog = await api("GET", "/shop/catalog?locale=uz&page=1");
  const product = catalog.body?.items?.[0];
  const added = await api("POST", "/shop/cart/add", { chatId: CHAT, slug: product.slug, qty: 1 });
  check("the bot customer can fill a cart", (added.body?.lines ?? []).length > 0, JSON.stringify(added.body).slice(0, 140));

  const placed = await api("POST", "/shop/order", {
    chatId: CHAT,
    locale: "uz",
    name: "Bot Mijoz",
    phone: PHONE,
    method: "courier",
    region: "Toshkent shahri",
    address: "Chilonzor 7-7",
    idempotencyKey: `bot-customer-${Date.now()}`,
  });
  const number = placed.body?.orderId;
  check("the bot order is created", Boolean(number), JSON.stringify(placed.body).slice(0, 160));
  const [order] = await sql`select id, number, total, totals, status, telegram_chat_id from orders where number = ${number}`;
  check("it is tagged to the bot channel", order?.status === "new" && Number(order?.telegram_chat_id) === CHAT, JSON.stringify(order).slice(0, 160));

  const [confirm] = await sql`select payload from bot_jobs where chat_id = ${CHAT} and kind = 'order_status' order by id desc limit 1`;
  const confirmText = String(confirm?.payload?.text ?? "");
  check("the confirmation names the order", confirmText.includes(number) && /qabul qilindi/i.test(confirmText), confirmText.slice(0, 120));

  // ── 2. every status change reaches the customer and the ledger ────────
  const admin = await newPage(browser);
  await login(admin.page);

  // The club dashboard separates the bot channel from the site.
  await admin.page.goto(`${BASE}/admin/bot`, { waitUntil: "networkidle" });
  const tileValue = await admin.page
    .getByText("Botdan (30 kun)", { exact: true })
    .locator("xpath=following-sibling::p[1]")
    .innerText();
  const [{ n: botOrders }] = await sql`select count(*)::int as n from orders
    where source = 'telegram_bot' and created_at > now() - interval '30 days'`;
  check("the panel's bot stats count the bot order", Number(tileValue.replace(/\D/g, "")) === botOrders && botOrders > 0, `${tileValue} vs ${botOrders}`);

  await admin.page.goto(`${BASE}/admin/orders/${encodeURIComponent(number)}`, { waitUntil: "networkidle" });
  const section = admin.page.locator('section[aria-label="Tezkor amallar"]');
  const steps = [
    { button: /Tasdiqlash/, status: "confirmed", word: /tasdiqlandi/i },
    { button: /Joʻnatildi/, status: "shipped", word: /yoʻlda/i },
    { button: /Yetkazildi/, status: "delivered", word: /yetkazildi/i },
  ];
  for (const step of steps) {
    const button = section.getByRole("button", { name: step.button }).first();
    const label = (await button.innerText().catch(() => "")).trim();
    check(`the panel offers “${step.status}” as the next step`, await button.count() > 0, label);
    await button.click();
    await admin.page.waitForTimeout(2600);
    const [row] = await sql`select status from orders where number = ${number}`;
    check(`the order is ${step.status}`, row?.status === step.status, row?.status);
  }
  check("the quick-action bar is gone once delivered", (await section.count()) === 0 || !(await section.first().isVisible()), "still visible");
  // Read the page once more, so the screenshot shows the delivered order and its
  // whole timeline, not the render from before the last quick action.
  await admin.page.reload({ waitUntil: "networkidle" });
  await shot(admin.page, "flow12-bot-customer-status");

  const jobs = await sql`select payload->>'text' as text from bot_jobs where chat_id = ${CHAT} and kind = 'order_status' order by id`;
  const texts = jobs.map((j) => String(j.text ?? ""));
  check("every status change queued a message", texts.length === 4, `${texts.length} messages`);
  for (const step of steps) {
    check(`the ${step.status} message is in the bot outbox`, texts.some((t) => t.includes(number) && step.word.test(t)), texts.at(-1)?.slice(0, 140));
  }
  const events = await sql`select status from bot_order_events where order_id = ${order.id} order by id`;
  check("the bot's own timeline records the same stages", events.map((e) => e.status).join(",") === "new,confirmed,shipped,delivered", events.map((e) => e.status).join(","));

  const [earned] = await sql`select delta, order_id from loyalty_ledger where phone9 = ${PHONE9} and kind = 'earn' and order_id = ${order.id}`;
  const expected = Math.floor(((Number(order.total) - Number(order.totals?.shipping ?? 0)) * 3) / 100);
  check("delivery earns cashback on the bot order", Number(earned?.delta) === expected && expected > 0, `${earned?.delta} vs ${expected}`);
  check("the delivered message tells the customer about it", /ball/i.test(texts.at(-1) ?? ""), texts.at(-1)?.slice(-140));

  const mine = await api("GET", `/customers/${CHAT}/orders?limit=5`);
  const listed = (mine.body?.items ?? []).find((o) => o.code === number);
  check("“Buyurtmalarim” shows the delivered order", listed?.status === "delivered" && listed?.stage === "Yetkazildi", JSON.stringify(listed).slice(0, 160));

  // ── 3. quiet hours: 22:00 in Tashkent is held until 09:00 ──────────────
  await api("POST", "/shop/cart/clear", { chatId: CHAT });
  await api("POST", "/shop/cart/add", { chatId: CHAT, slug: product.slug, qty: 2 });
  /* The next 22:00 in Tashkent. The order above was placed before it, which is
     what makes the cart genuinely abandoned — the sweep skips a cart that has
     an order after its last touch. */
  let night = new Date();
  night = new Date(Date.UTC(night.getUTCFullYear(), night.getUTCMonth(), night.getUTCDate(), 17, 0, 0));
  if (night.getTime() <= Date.now()) night = new Date(night.getTime() + 24 * HOUR);
  const morning = new Date(night.getTime() + 11 * HOUR); // 09:00 next day, Tashkent
  await sql`update bot_carts set updated_at = ${new Date(night.getTime() - 3 * HOUR).toISOString()}::timestamptz where chat_id = ${CHAT}`;

  const [{ max: jobMark }] = await sql`select coalesce(max(id), 0)::int as max from bot_jobs`;
  const nightTick = await tick(night);
  check("the worker runs at 22:00 Tashkent", nightTick.status === 200 && Boolean(nightTick.body), JSON.stringify(nightTick.body).slice(0, 140));
  const [held] = await sql`select channel, status, scheduled_at, chat_id from outbound_messages where phone9 = ${PHONE9} order by id desc limit 1`;
  check("the abandoned cart went to Telegram, not SMS", held?.channel === "telegram" && Number(held?.chat_id) === CHAT, JSON.stringify(held).slice(0, 160));
  check("the night message is held, not sent", held?.status === "pending" && tashkentHour(held?.scheduled_at) === 9, `${held?.status} at ${held?.scheduled_at}`);
  const [{ n: nightJobs }] = await sql`select count(*)::int as n from bot_jobs where chat_id = ${CHAT} and id > ${jobMark}`;
  check("nothing reaches the bot at night", nightJobs === 0, `${nightJobs} jobs`);

  await tick(new Date(night.getTime() + 5 * 60_000));
  const [{ n: stillHeld }] = await sql`select count(*)::int as n from outbound_messages where phone9 = ${PHONE9} and status = 'pending'`;
  check("a second night tick does not release it", stillHeld === 1, `${stillHeld} pending`);

  const morningTick = await tick(new Date(morning.getTime() + 60_000));
  const [morningRow] = await sql`select status, bot_job_id from outbound_messages where phone9 = ${PHONE9} order by id desc limit 1`;
  check("the 09:00 tick delivers the held message", morningTick.status === 200 && morningRow?.status === "sent" && morningRow?.bot_job_id, JSON.stringify(morningRow));
  const [morningJob] = await sql`select payload from bot_jobs where id = ${morningRow?.bot_job_id}`;
  check("the bot has the abandoned-cart text", String(morningJob?.payload?.text ?? "").includes(product.name), String(morningJob?.payload?.text ?? "").slice(0, 140));

  // ── 4. opt-out stops the flow ─────────────────────────────────────────
  await sql`update bot_carts set updated_at = ${new Date(morning.getTime() - 3 * HOUR).toISOString()}::timestamptz where chat_id = ${CHAT}`;
  await sql`insert into marketing_optouts (phone9, channel, source) values (${PHONE9}, 'all', 'e2e')
            on conflict (phone9, channel) do nothing`;
  const [{ max: outboxMark }] = await sql`select coalesce(max(id), 0)::int as max from outbound_messages`;
  const optTick = await tick(new Date(morning.getTime() + 15 * 60_000));
  check("the worker runs after the stop", optTick.status === 200, JSON.stringify(optTick.body).slice(0, 120));
  const [stopped] = await sql`select status, exit_reason from flow_enrollments where flow_id = 'cart-abandoned' and subject = ${PHONE9} order by id desc limit 1`;
  check("the stopped customer is taken out of the flow", stopped?.status === "exited" && stopped?.exit_reason === "opted_out", JSON.stringify(stopped));
  const [{ n: afterStop }] = await sql`select count(*)::int as n from outbound_messages where phone9 = ${PHONE9} and id > ${outboxMark}`;
  check("no message is queued after the stop", afterStop === 0, `${afterStop} rows`);
  await sql`delete from marketing_optouts where phone9 = ${PHONE9}`;
  await api("POST", "/shop/cart/clear", { chatId: CHAT });

  // ── 5. restock reaches a bot customer on Telegram ─────────────────────
  const [waitProduct] = await sql`
    select id, slug, stock_qty, content->'name'->>'uz' as name from products
    where kind = 'core' and in_stock = true and slug <> ${product.slug}
      and jsonb_array_length(images) > 0
    order by sort limit 1`;
  stock = waitProduct;
  stockBefore = waitProduct.stock_qty === null ? null : Number(waitProduct.stock_qty);
  await admin.page.goto(`${BASE}/admin/products/${encodeURIComponent(waitProduct.id)}`, { waitUntil: "networkidle" });
  await admin.page.locator('input[name="stockQty"]').fill("0");
  await admin.page.getByRole("button", { name: /^Saqlash$/ }).first().click();
  await admin.page.waitForTimeout(2500);

  await admin.page.goto(`${BASE}/uz/product/${waitProduct.slug}`, { waitUntil: "networkidle" });
  await admin.page.locator('input[name="phone"]').first().fill(PHONE);
  await admin.page.locator("form:has(input[name='phone']) button[type='submit']").first().click();
  await admin.page.waitForTimeout(2500);
  const [request] = await sql`select id, status, kind from restock_requests where phone9 = ${PHONE9} and product_slug = ${waitProduct.slug} order by id desc limit 1`;
  check("the bot customer joins the site waitlist", request?.status === "waiting" && request?.kind === "restock", JSON.stringify(request));

  const [{ max: restockMark }] = await sql`select coalesce(max(id), 0)::int as max from outbound_messages`;
  await admin.page.goto(`${BASE}/admin/products/${encodeURIComponent(waitProduct.id)}`, { waitUntil: "networkidle" });
  await admin.page.locator('input[name="stockQty"]').fill(String(stockBefore ?? 12));
  await admin.page.getByRole("button", { name: /^Saqlash$/ }).first().click();
  await admin.page.waitForTimeout(3000);
  const [told] = await sql`select status, notified_via from restock_requests where id = ${request?.id}`;
  check("the restock flow took the waitlist request", told?.status === "notified" && told?.notified_via === "flow", JSON.stringify(told));

  const restockTick = await tick(new Date(morning.getTime() + 20 * 60_000));
  check("the restock tick runs", restockTick.status === 200, JSON.stringify(restockTick.body).slice(0, 120));
  const [restockRow] = await sql`select channel, chat_id, status, bot_job_id from outbound_messages where id > ${restockMark} and phone9 = ${PHONE9} order by id desc limit 1`;
  check("“Omborga keldi” goes to the linked Telegram chat", restockRow?.channel === "telegram" && Number(restockRow?.chat_id) === CHAT, JSON.stringify(restockRow));
  const [restockJob] = await sql`select payload from bot_jobs where id = ${restockRow?.bot_job_id}`;
  check("the bot has the restock text with the product", String(restockJob?.payload?.text ?? "").includes(waitProduct.name), String(restockJob?.payload?.text ?? "").slice(0, 140));

  // ── 6. the delivered bot order feeds the other flows too ──────────────
  // `first-purchase` is the quick one to observe: it is anchored at the
  // delivery event announceOrderStatus wrote, and the text goes to the same
  // chat. Course-ending and lapsed read the same orders table.
  await sql`update flows set active = true where id = 'first-purchase'`;
  const afterTick = await tick(new Date(morning.getTime() + 30 * 60_000));
  check("the post-delivery tick runs", afterTick.status === 200, JSON.stringify(afterTick.body).slice(0, 120));
  const [first] = await sql`select status, cycle from flow_enrollments where flow_id = 'first-purchase' and subject = ${PHONE9} order by id desc limit 1`;
  check("the delivered bot order enters “first purchase”", first?.cycle === String(order.id), JSON.stringify(first));
  const [firstOut] = await sql`select channel, chat_id, bot_job_id, text from outbound_messages where flow_id = 'first-purchase' and phone9 = ${PHONE9} order by id desc limit 1`;
  check("it is queued for Telegram", firstOut?.channel === "telegram" && Number(firstOut?.chat_id) === CHAT, JSON.stringify(firstOut)?.slice(0, 160));
  check("its text is rendered, not a template", /yetib keldi/i.test(String(firstOut?.text ?? "")) && !/\{[a-z]+\}/i.test(String(firstOut?.text ?? "")), String(firstOut?.text ?? "").slice(0, 140));
  const [firstJob] = await sql`select payload from bot_jobs where id = ${firstOut?.bot_job_id}`;
  // `{ism}` is the first name, so the text opens with "Bot,".
  check("the bot has the first-purchase text", String(firstJob?.payload?.text ?? "").startsWith("Bot,"), String(firstJob?.payload?.text ?? "").slice(0, 140));

  // ── 7. course ending, 25 days after the order ─────────────────────────
  // The trigger is the latest order's date, and the first step is due 25 days
  // later. The order is back-dated (it is the test's own row), then the flow
  // is switched on and the worker ticked at a daytime hour.
  await sql`update orders set created_at = now() - interval '26 days' where id = ${order.id}`;
  await sql`update flows set active = true where id = 'course-ending'`;
  const courseTick = await tick(new Date(morning.getTime() + 45 * 60_000));
  check("the course-ending tick runs", courseTick.status === 200, JSON.stringify(courseTick.body).slice(0, 120));
  const [course] = await sql`select status, cycle from flow_enrollments where flow_id = 'course-ending' and subject = ${PHONE9} order by id desc limit 1`;
  check("the bot order enters “course ending”", course?.cycle === String(order.id), JSON.stringify(course));
  const [courseOut] = await sql`select channel, chat_id, bot_job_id, text from outbound_messages where flow_id = 'course-ending' and phone9 = ${PHONE9} order by id desc limit 1`;
  check("the course reminder goes to Telegram", courseOut?.channel === "telegram" && Number(courseOut?.chat_id) === CHAT, JSON.stringify(courseOut)?.slice(0, 160));
  check("the course text names the product and has no placeholder", String(courseOut?.text ?? "").includes(product.name) && !/\{[a-z]+\}/i.test(String(courseOut?.text ?? "")), String(courseOut?.text ?? "").slice(0, 160));
  const [courseJob] = await sql`select payload from bot_jobs where id = ${courseOut?.bot_job_id}`;
  check("the bot has the course-ending text", Boolean(courseJob), JSON.stringify(courseJob)?.slice(0, 140));

  await admin.ctx.close();
} finally {
  await cleanup();
  if (stock) {
    if (stockBefore === null) await sql`update products set stock_qty = null, in_stock = true where id = ${stock.id}`;
    else await sql`update products set stock_qty = ${stockBefore}, in_stock = ${stockBefore > 0} where id = ${stock.id}`;
  }
  for (const f of prevFlows) await sql`update flows set active = ${Boolean(f.active)} where id = ${f.id}`;
  if (prevLoyalty === null) await sql`delete from site_settings where key = 'loyalty.rules'`;
  else await sql`update site_settings set value = ${prevLoyalty} where key = 'loyalty.rules'`;
  await sql.end();
  await browser.close();
}

process.exit(summary() ? 0 : 1);
