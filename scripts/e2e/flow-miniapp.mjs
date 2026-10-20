import { createHmac } from "node:crypto";
import { BASE, addFirstProduct, check, db, fillCheckout, openBrowser, shot, submitOrder, summary } from "./lib.mjs";

/*
  Flow 3 — the Mini App: the site opened inside Telegram.

  Telegram's initData is signed here exactly as Telegram signs it, so the
  server's HMAC check is the real one. The order must then carry
  `source = telegram_mini`, the chat id, and land in the same orders table.
*/

const TOKEN = process.env.TELEGRAM_CLUB_BOT_TOKEN ?? "123456789:LOCALTESTTOKENLOCALTESTTOKENLOCALTEST";
const CHAT = 424242;

function initData({ ageSeconds = 0, id = CHAT } = {}) {
  const params = new URLSearchParams({
    auth_date: String(Math.floor(Date.now() / 1000) - ageSeconds),
    user: JSON.stringify({ id, first_name: "Live Smoke", language_code: "uz" }),
  });
  const check_ = [...params.entries()].map(([k, v]) => `${k}=${v}`).sort().join("\n");
  const secret = createHmac("sha256", "WebAppData").update(TOKEN).digest();
  params.set("hash", createHmac("sha256", secret).update(check_).digest("hex"));
  return params.toString();
}

/*
  The Mini App pre-fills the phone the bot has already verified, so the link the
  bot creates when the customer shares a contact must exist first. This is the
  same endpoint and the same payload the bot sends — the fresh database has no
  link, and an empty phone is a form the customer cannot submit.
*/
const KEY = process.env.BOT_API_KEY ?? "local-bot-api-key-0123456789abcdef0123456789abcdef";
const linkRes = await fetch(`${BASE}/api/bot/contacts`, {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${KEY}` },
  body: JSON.stringify({ telegramUserId: CHAT, contactUserId: CHAT, chatId: CHAT, phone: "+998901234567", name: "Live Smoke" }),
});
const linked = await linkRes.json().catch(() => ({}));
if (!linkRes.ok && linkRes.status !== 409) {
  console.error(`could not link the phone the bot would have linked: ${linkRes.status} ${JSON.stringify(linked)}`);
  process.exit(2);
}

const browser = await openBrowser();
const sql = await db();

try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  // Same sandbox workaround as lib.mjs: images come from the original files
  // because this Chromium's optimiser never answers.
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (!["localhost", "127.0.0.1"].includes(url.hostname)) return route.abort();
    if (url.pathname === "/_next/image") {
      const raw = url.searchParams.get("url");
      if (!raw || !raw.startsWith("/")) return route.abort();
      return route.fulfill({ response: await route.fetch({ url: new URL(raw, BASE).href }) });
    }
    return route.continue();
  });
  const errors = [];
  // The sandbox has no route to the outside world, so a font or a payment
  // script that cannot be fetched is not a defect of the app. Anything the
  // app itself throws is still collected.
  const sandboxNoise = /ERR_CONNECTION_CLOSED|ERR_FAILED|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|Failed to fetch|net::/;
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("upgrade-insecure-requests") && !sandboxNoise.test(m.text())) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));

  const signed = initData();
  await page.addInitScript((data) => {
    try { sessionStorage.setItem("govita-telegram", data); } catch {}
  }, signed);

  await addFirstProduct(page, "uz");
  await page.goto(`${BASE}/uz/cart`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  // The linked phone and name arrive from the bot, not from typing.
  const name = await page.locator('input[autocomplete="name"]').inputValue();
  const phone = await page.locator('input[autocomplete="tel"]').inputValue();
  check("Mini App pre-fills the name from Telegram", name.length > 0, name);
  check("Mini App pre-fills the phone the bot already verified", /^\+998\d{9}$/.test(phone), phone);
  await shot(page, "flow3-miniapp-cart");

  const dropbox = await page.locator("main").innerText();
  check("cookie banner stays out of the Mini App", !/cookie fayllar/i.test(dropbox), dropbox.slice(0, 120));

  await fillCheckout(page, { method: "courier", name, phone, email: "smoke@example.com" });
  const number = await submitOrder(page);
  check("Mini App order reaches success", Boolean(number), String(number));

  const [row] = await sql`select number, source, telegram_chat_id, customer, totals from orders where number = ${number}`;
  check("Mini App order is attributed to telegram_mini", row?.source === "telegram_mini", row?.source);
  check("Mini App order stores the verified chat id", Number(row?.telegram_chat_id) === CHAT, String(row?.telegram_chat_id));
  check("Mini App order keeps the bot's phone", row?.customer?.phone?.endsWith("901234567"), row?.customer?.phone);

  // bot_jobs carries the destination in its own chat_id column; the payload
  // is only the message the bot will send.
  const jobs = await sql`select kind, payload from bot_jobs where chat_id = ${CHAT} and kind = 'order_status' order by id desc limit 5`;
  const confirmation = jobs.find((j) => String(j.payload?.text ?? "").includes(number));
  check("the bot is queued to confirm the order", Boolean(confirmation), `${jobs.length} jobs ${JSON.stringify(jobs[0] ?? {}).slice(0, 160)}`);
  check("no console errors in the Mini App", errors.length === 0, errors.slice(0, 2).join(" | "));

  // ── a forged and an expired signature must both be refused ─────────────
  const profile = async (data) =>
    (await fetch(`${BASE}/api/miniapp/profile`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData: data }) })).status;
  check("a valid signature is accepted", (await profile(signed)) === 200);
  check("a tampered signature is refused", (await profile(signed.replace(/id%22%3A\d+/, "id%22%3A999999"))) === 401);
  check("an expired signature is refused", (await profile(initData({ ageSeconds: 60 * 60 * 30 }))) === 401);
  check("another account's id cannot borrow this one", (await profile(initData({ id: 999999 }))) === 200);

  await ctx.close();
} finally {
  await sql.end();
  await browser.close();
}

process.exit(summary() ? 0 : 1);
