import { BASE, addFirstProduct, check, db, fillCheckout, login, newPage, openBrowser, shot, submitOrder, summary } from "./lib.mjs";
import { readFile } from "node:fs/promises";

/*
  Flow 7 — cashback spent with an SMS code.

  The panel turns the programme on, a balance is put on a phone the way a
  delivered order would (a ledger row), and the customer in the cart asks for
  a code. The code itself only exists in the SMS the gateway "sent": it is
  read back from the fake gateway's log, typed into the form, and the order is
  then checked for the points actually spent.
*/

const PHONE = "+998907778899";
const PHONE9 = "907778899";
const SMS_LOG = process.env.SMS_FAKE_LOG ?? "/tmp/sms.jsonl";

const sql = await db();
const browser = await openBrowser();

const lastSmsCode = async () => {
  const raw = await readFile(SMS_LOG, "utf8").catch(() => "");
  const lines = raw.trim().split("\n").filter(Boolean);
  for (const line of lines.reverse()) {
    try {
      const row = JSON.parse(line);
      if (!String(row.to ?? "").endsWith(PHONE9)) continue;
      const m = String(row.text ?? "").match(/\b(\d{6})\b/);
      if (m) return m[1];
    } catch {
      /* a half-written line is skipped */
    }
  }
  return null;
};

try {
  // ── programme on, through the panel ────────────────────────────────────
  const admin = await newPage(browser);
  await login(admin.page);
  await admin.page.goto(`${BASE}/admin/loyalty`, { waitUntil: "networkidle" });
  const enabled = admin.page.locator('input[name="enabled"]').first();
  if (!(await enabled.isChecked())) await enabled.check();
  await admin.page.getByRole("button", { name: /^Saqlash$/ }).first().click();
  await admin.page.waitForTimeout(2000);
  await admin.ctx.close();

  await sql`delete from loyalty_otps where phone9 = ${PHONE9}`;
  await sql`delete from loyalty_ledger where phone9 = ${PHONE9} and note = 'e2e cashback'`;
  // `earn` rows must name the order that earned them, so a seeded balance is
  // an adjustment — the same kind the panel's own correction writes.
  await sql`insert into loyalty_ledger (phone9, delta, kind, note, expires_at)
            values (${PHONE9}, 50000, 'adjust', 'e2e cashback', now() + interval '120 days')`;

  // ── the customer spends them ───────────────────────────────────────────
  const { ctx, page } = await newPage(browser);
  await addFirstProduct(page, "uz");
  await page.goto(`${BASE}/uz/cart`, { waitUntil: "networkidle" });

  await page.locator('input[autocomplete="tel"]').fill(PHONE);
  await page.waitForTimeout(2500);
  const offer = page.getByRole("button", { name: /ishlatish|использовать/i }).first();
  check("the cart offers the balance it found", (await offer.count()) > 0, (await page.locator("main").innerText()).slice(0, 220));
  await offer.click();
  await page.waitForTimeout(2500);

  const code = await lastSmsCode();
  check("the code arrives by SMS", Boolean(code), `no 6-digit code for ${PHONE9} in ${SMS_LOG}`);
  const codeInput = page.locator("input[inputmode='numeric'], input[maxlength='6']").last();
  await codeInput.fill(code ?? "000000");
  const confirm = page.getByRole("button", { name: /tasdiq|подтверд|ok/i }).last();
  await confirm.click();
  await page.waitForTimeout(2500);
  const afterCode = await page.locator("main").innerText();
  check("the code is accepted", /ball|балл/i.test(afterCode), afterCode.slice(0, 200).replace(/\n/g, " "));
  await shot(page, "flow7-points-verified");

  await fillCheckout(page, { method: "courier", phone: PHONE, email: "points@example.com" });
  const number = await submitOrder(page);
  const [order] = await sql`select number, total, totals, customer from orders where number = ${number}`;
  const spent = await sql`select delta from loyalty_ledger where phone9 = ${PHONE9} and kind = 'redeem' and order_id = (select id from orders where number = ${number})`;
  check("the order spends the points", spent.length === 1 && spent[0].delta < 0, JSON.stringify(spent));
  check("the points reduce the money owed", Number(order?.totals?.points ?? 0) > 0 || Number(order?.totals?.discount ?? 0) > 0, JSON.stringify(order?.totals).slice(0, 200));
  await shot(page, "flow7-points-order");
  await ctx.close();

  // ── tidy: remove the seeded balance and the test's own rows ────────────
  await sql`delete from loyalty_ledger where phone9 = ${PHONE9}`;
  await sql`delete from loyalty_otps where phone9 = ${PHONE9}`;
} finally {
  await sql.end();
  await browser.close();
}

process.exit(summary() ? 0 : 1);
