/*
  The database-backed paths, end to end, against a production build:

    BASE_URL=http://localhost:3000 DATABASE_URL=… ADMIN_SETUP_TOKEN=… \
    PAYME_TEST_KEY=… CLICK_SECRET_KEY=… node scripts/e2e/ci.mjs

  The server must run with the same DATABASE_URL, ADMIN_SETUP_TOKEN and the
  Payme/Click env keys (PAYME_MERCHANT_ID, PAYME_TEST_KEY, CLICK_SERVICE_ID,
  CLICK_MERCHANT_ID, CLICK_SECRET_KEY). The script switches the gateways on
  in site_settings itself. Run on an empty database (CI): it creates the first
  admin. Exit code 1 when any check fails.
*/
import { createHash, createHmac } from "node:crypto";
import { BASE, check, db, openBrowser, summary } from "./lib.mjs";

const SETUP = process.env.ADMIN_SETUP_TOKEN ?? "";
const PAYME_KEY = process.env.PAYME_TEST_KEY ?? "";
const CLICK_SECRET = process.env.CLICK_SECRET_KEY ?? "";
const CLICK_SERVICE = process.env.CLICK_SERVICE_ID ?? "";
const OWNER = { email: "owner@e2e.local", password: "owner-parol-123456", name: "E2E Owner" };
const OPERATOR = { email: "operator@e2e.local", password: "operator-parol-123456", name: "E2E Operator" };

const sql = await db();
const browser = await openBrowser();

/* ---------- helpers ---------- */

function totp(base32, now = Date.now()) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const ch of base32.replace(/\s/g, "").toUpperCase()) {
    value = (value << 5) | alphabet.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(Math.floor(now / 30000)));
  const mac = createHmac("sha1", Buffer.from(bytes)).update(msg).digest();
  const offset = mac[mac.length - 1] & 0xf;
  return String((mac.readUInt32BE(offset) & 0x7fffffff) % 1e6).padStart(6, "0");
}

async function page(width = 1440) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const p = await ctx.newPage();
  // Nothing outside the site under test; the gateways are caught, not visited.
  await p.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (/paycom\.uz|click\.uz/.test(url.hostname)) return route.fulfill({ status: 200, body: "gateway" });
    if (url.hostname !== new URL(BASE).hostname && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return route.abort();
    return route.continue();
  });
  return p;
}

async function dismissConsent(p) {
  const accept = p.getByRole("button", { name: /qabul qilaman|rad etish|принять|отклонить/i }).first();
  if (await accept.isVisible().catch(() => false)) await accept.click().catch(() => {});
}

/** One product into the cart and a pickup order with the given payment choice; returns the gateway URL if any. */
async function placeOrder({ phone, pay }) {
  const p = await page();
  let gateway = null;
  p.on("request", (r) => {
    if (/paycom\.uz|click\.uz/.test(r.url())) gateway = r.url();
  });
  await p.goto(`${BASE}/uz/products`, { waitUntil: "domcontentloaded" });
  await dismissConsent(p);
  const href = await p.locator('a[href*="/uz/product/"]').first().getAttribute("href");
  await p.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
  await dismissConsent(p);
  await p.getByRole("button", { name: /savatga qoʻshish|savatga qo'shish/i }).first().click();
  await p.waitForTimeout(800);
  await p.goto(`${BASE}/uz/cart`, { waitUntil: "networkidle" });
  await dismissConsent(p);
  await p.locator('input[autocomplete="name"]').fill("E2E Mijoz");
  await p.locator('input[autocomplete="tel"]').fill(phone);
  const pick = async (name, value) => {
    const label = p.locator(`label:has(input[type="radio"][name="${name}"][value="${value}"])`).first();
    if (await label.count()) await label.click();
    else await p.locator(`input[type="radio"][value="${value}"]`).first().check({ force: true });
  };
  await pick("method", "pickup");
  await pick("pay-choice", pay);
  // Desktop and phone each draw a submit button; the visible one is the customer's.
  await p.locator('button[type="submit"]:visible', { hasText: /buyurtmani yuborish/i }).first().click();
  await p.waitForTimeout(6000);
  const url = p.url();
  await p.context().close();
  return { gateway, url };
}

async function latestOrder(phoneTail) {
  const [row] = await sql`
    select number, total, status, payment_status, payment from orders
    where right(regexp_replace(customer->>'phone', '\\D', '', 'g'), 9) = ${phoneTail}
    order by id desc limit 1`;
  return row ?? null;
}

async function payme(method, params, key = PAYME_KEY) {
  const res = await fetch(`${BASE}/api/payments/payme`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(`Paycom:${key}`).toString("base64")}` },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return res.json();
}

async function click(step, fields) {
  const r = { click_paydoc_id: "1", error: "0", error_note: "Success", sign_time: "2026-11-02 12:00:00", service_id: CLICK_SERVICE, merchant_prepare_id: "", ...fields };
  const prep = step === "complete" ? r.merchant_prepare_id : "";
  r.sign_string = createHash("md5").update(`${r.click_trans_id}${r.service_id}${CLICK_SECRET}${r.merchant_trans_id}${prep}${r.amount}${r.action}${r.sign_time}`).digest("hex");
  const res = await fetch(`${BASE}/api/payments/click/${step}`, { method: "POST", body: new URLSearchParams(r) });
  return res.json();
}

async function signIn(p, who, code) {
  await p.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await p.fill('input[name="email"]', who.email);
  await p.fill('input[name="password"]', who.password);
  await p.click('button[type="submit"]');
  await p.waitForURL(/\/admin(\/login\/verify|\/orders|$|\?)/, { timeout: 20000 }).catch(() => {});
  if (p.url().includes("/login/verify") && code) {
    await p.fill('input[name="code"]', code());
    await p.click('button[type="submit"]');
    await p.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 20000 }).catch(() => {});
  }
}

/* ---------- 1. health and the admin wall ---------- */

const health = await fetch(`${BASE}/api/health`);
check("health answers 200 with the database up", health.status === 200, `status ${health.status}`);

/* ---------- 2. cash order ---------- */

const cash = await placeOrder({ phone: "+998901110001", pay: "cod" });
const cashOrder = await latestOrder("901110001");
check("cash order is saved", Boolean(cashOrder), cash.url);
check("cash order stays unpaid", cashOrder?.payment_status === "unpaid", cashOrder?.payment_status);
check("cash order lands on the success page", cash.url.includes("/checkout/success"), cash.url);
const trackParam = new URL(cash.url).searchParams.get("t");
if (trackParam) {
  const track = await fetch(`${BASE}/uz/track/${trackParam}`);
  const html = await track.text();
  check("signed tracking page opens", track.status === 200 && html.includes(cashOrder?.number ?? "∅"), `status ${track.status}`);
  check("tracking page shows no phone", !html.includes("901110001"));
} else check("success page carries a tracking link", false, cash.url);
const forged = await fetch(`${BASE}/uz/track/${cashOrder?.number}.AAAAAAAAAAAA`);
check("forged tracking link is a 404", forged.status === 404, `status ${forged.status}`);

/* ---------- 3. Payme ---------- */

await sql`insert into site_settings (key, value) values ('payments.payme', 'on'), ('payments.payme.test', 'on'), ('payments.click', 'on')
          on conflict (key) do update set value = excluded.value`;
// Cached pages revalidate on their own; the checkout reads the switch fresh.
const pay = await placeOrder({ phone: "+998901110002", pay: "payme" });
const payOrder = await latestOrder("901110002");
check("Payme order is saved as pending", payOrder?.payment_status === "pending", payOrder?.payment_status);
check("checkout hands off to the Payme sandbox", Boolean(pay.gateway?.startsWith("https://test.paycom.uz/")), pay.gateway ?? pay.url);
if (pay.gateway && payOrder) {
  const decoded = Buffer.from(pay.gateway.split("/").pop(), "base64").toString();
  check("Payme link carries the saved total in tiyin", decoded.includes(`a=${payOrder.total * 100}`) && decoded.includes(`ac.order_id=${payOrder.number}`), decoded);
}
if (payOrder) {
  const account = { order_id: payOrder.number };
  const amount = payOrder.total * 100;
  check("Payme: wrong key is refused", (await payme("CheckPerformTransaction", { amount, account }, "wrong")).error?.code === -32504);
  check("Payme: wrong amount is refused", (await payme("CheckPerformTransaction", { amount: amount - 100, account })).error?.code === -31001);
  check("Payme: check allows", (await payme("CheckPerformTransaction", { amount, account })).result?.allow === true);
  const created = await payme("CreateTransaction", { id: "e2e-payme-1", time: Date.now(), amount, account });
  check("Payme: create", created.result?.state === 1, JSON.stringify(created));
  check("Payme: a second transaction waits", (await payme("CreateTransaction", { id: "e2e-payme-2", time: Date.now(), amount, account })).error?.code === -31099);
  const performed = await payme("PerformTransaction", { id: "e2e-payme-1" });
  check("Payme: perform", performed.result?.state === 2, JSON.stringify(performed));
  check("Payme: repeated perform returns the same answer", JSON.stringify((await payme("PerformTransaction", { id: "e2e-payme-1" })).result) === JSON.stringify(performed.result));
  check("Payme: order is paid", (await latestOrder("901110002"))?.payment_status === "paid");
}

/* ---------- 4. Click ---------- */

const clk = await placeOrder({ phone: "+998901110003", pay: "click" });
const clickOrder = await latestOrder("901110003");
check("checkout hands off to Click", Boolean(clk.gateway?.startsWith("https://my.click.uz/services/pay")), clk.gateway ?? clk.url);
if (clickOrder) {
  const base = { click_trans_id: "e2e-c1", merchant_trans_id: clickOrder.number, amount: `${clickOrder.total}.00` };
  check("Click: wrong amount is refused", (await click("prepare", { ...base, click_trans_id: "e2e-c0", amount: "1.00", action: "0" })).error === -2);
  const prepared = await click("prepare", { ...base, action: "0" });
  check("Click: prepare", prepared.error === 0 && prepared.merchant_prepare_id > 0, JSON.stringify(prepared));
  const done = await click("complete", { ...base, action: "1", merchant_prepare_id: String(prepared.merchant_prepare_id) });
  check("Click: complete", done.error === 0, JSON.stringify(done));
  check("Click: order is paid", (await latestOrder("901110003"))?.payment_status === "paid");
  const bad = await click("complete", { ...base, action: "1", merchant_prepare_id: String(prepared.merchant_prepare_id), sign_time: "2026-11-02 12:00:01" });
  check("Click: a repeat is already paid", bad.error === -4, JSON.stringify(bad));
}

/* ---------- 5. admin: wall, setup, 2FA, roles, audit ---------- */

const anon = await fetch(`${BASE}/admin/orders`, { redirect: "manual" });
const anonBody = await anon.text();
check("anonymous /admin/orders is sent to the login", anon.status === 307 && (anon.headers.get("location") ?? "").includes("/admin/login"), `status ${anon.status}`);
check("anonymous admin response carries no customer data", !anonBody.includes("901110001") && !anonBody.includes("E2E Mijoz"));

const admin = await page();
await admin.goto(`${BASE}/admin/setup`, { waitUntil: "networkidle" });
await admin.fill('input[name="token"]', SETUP);
await admin.fill('input[name="name"]', OWNER.name);
await admin.fill('input[name="email"]', OWNER.email);
await admin.fill('input[name="password"]', OWNER.password);
await admin.click('button[type="submit"]');
await admin.waitForURL((u) => !u.pathname.startsWith("/admin/setup"), { timeout: 20000 }).catch(() => {});
check("first admin is created as owner", (await sql`select role from admin_users where email = ${OWNER.email}`)[0]?.role === "owner");

// Two-factor sign-in: enrol with the secret the page shows, then sign in again with a code.
await admin.goto(`${BASE}/admin/security`, { waitUntil: "networkidle" });
await admin.getByRole("button", { name: /ikki bosqichli kirishni sozlash/i }).click();
await admin.waitForURL(/setup=1/, { timeout: 20000 });
const secret = (await admin.locator("code").first().innerText()).replace(/\s/g, "");
check("security page shows a QR code and the key", (await admin.locator('img[alt*="QR"]').count()) === 1 && /^[A-Z2-7]{32}$/.test(secret), secret);
await admin.fill('input[name="code"]', totp(secret));
await admin.getByRole("button", { name: /tasdiqlash va yoqish/i }).click();
await admin.locator("ul.font-mono li").first().waitFor({ timeout: 15000 }).catch(() => {});
const codes = await admin.locator("ul.font-mono li").allInnerTexts();
check("enrolment shows ten recovery codes", codes.filter((c) => /^[a-z2-9]{5}-[a-z2-9]{5}$/.test(c.trim())).length === 10, codes.join(","));
await admin.context().close();

// The next code window, so the enrolment code is not replayed.
const nextCode = () => totp(secret, Date.now() + 30_000);
const owner = await page();
await owner.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await owner.fill('input[name="email"]', OWNER.email);
await owner.fill('input[name="password"]', OWNER.password);
await owner.click('button[type="submit"]');
await owner.waitForURL(/\/admin\/login\/verify/, { timeout: 20000 }).catch(() => {});
check("password alone stops at the code step", owner.url().includes("/admin/login/verify"), owner.url());
const half = await owner.context().cookies();
const pending = half.find((c) => c.name === "govita_admin_2fa");
const noSession = !half.some((c) => c.name === "govita_admin");
check("no session before the code", Boolean(pending) && noSession);
await owner.fill('input[name="code"]', "000000");
await owner.click('button[type="submit"]');
await owner.waitForTimeout(1000);
check("a wrong code is refused", owner.url().includes("/admin/login/verify"));
await owner.fill('input[name="code"]', nextCode());
await owner.click('button[type="submit"]');
await owner.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 20000 }).catch(() => {});
check("the code completes the sign-in", !owner.url().includes("/admin/login"), owner.url());

// The owner adds an operator; the operator cannot open owner pages.
await owner.goto(`${BASE}/admin/users`, { waitUntil: "networkidle" });
const add = owner.locator("form", { has: owner.locator('input[name="password"]') }).last();
await add.locator('input[name="name"]').fill(OPERATOR.name);
await add.locator('input[name="email"]').fill(OPERATOR.email);
await add.locator('input[name="password"]').fill(OPERATOR.password);
await add.locator('select[name="role"]').selectOption("operator");
await add.locator('button[type="submit"]').click();
await owner.waitForTimeout(1500);
check("operator is added", (await sql`select role from admin_users where email = ${OPERATOR.email}`)[0]?.role === "operator");
await owner.context().close();

const op = await page();
await signIn(op, OPERATOR);
await op.goto(`${BASE}/admin/integrations`, { waitUntil: "networkidle" });
check("operator is turned away from integrations", !op.url().endsWith("/admin/integrations") && (await op.content()).includes("rolingiz uchun yopiq"), op.url());
await op.goto(`${BASE}/admin/orders`, { waitUntil: "networkidle" });
check("operator works the orders", op.url().endsWith("/admin/orders") && (await op.content()).includes(cashOrder?.number ?? "∅"));
const keys = await fetch(`${BASE}/admin/users`, { headers: { cookie: (await op.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ") }, redirect: "manual" });
check("operator gets no admin list", keys.status !== 200 || !(await keys.text()).includes(OWNER.email));
await op.context().close();

const audit = await sql`select action from admin_audit_log`;
const actions = new Set(audit.map((r) => r.action));
check("audit log records sign-in, 2FA and the new admin", ["login", "account.2fa_on", "admin.add"].every((a) => actions.has(a)), [...actions].join(","));

await browser.close();
await sql.end();
process.exit(summary() ? 0 : 1);
