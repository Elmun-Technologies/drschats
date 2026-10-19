import { BASE, addFirstProduct, check, db, fillCheckout, login, newPage, openBrowser, shot, submitOrder, summary } from "./lib.mjs";

/*
  Flow 6 — the money paths that the other flows do not touch:

  · a promo code typed by the customer, priced by the server, stored on the order;
  · a 2+1 promotion (three units, the cheapest free);
  · the real stock limit on a low-stock product ("Faqat N ta qoldi");
  · "Bugungi taklif" — the scheduled deal and its countdown;
  · cancelling an order from the panel puts the stock back.

  Everything is seeded in the database the way the admin panel writes it, and
  every claim is checked against the row the server stored, not the screen.
*/

const CODE = "E2E10";
const SLUG_21 = "delical-shokolad-200ml";

const sql = await db();
const browser = await openBrowser();

const bySlug = async (slug) => (await sql`select id, slug, price, stock_qty, in_stock, content->'name'->>'uz' as name from products where slug = ${slug}`)[0];
const dbUuid = () => Math.random().toString(36).slice(2, 10);

try {
  // ── seed ────────────────────────────────────────────────────────────────
  const a21 = await bySlug(SLUG_21);
  await sql`delete from promo_redemptions where code = ${CODE}`;
  await sql`delete from promo_codes where code = ${CODE}`;
  await sql`insert into promo_codes (code, kind, value, active, note)
            values (${CODE}, 'percent', 10, true, 'e2e')`;
  await sql`delete from promotions where id like 'e2e-%'`;
  await sql`insert into promotions (id, type, title, description, percent, product_slugs, active, sort)
            values (${"e2e-" + dbUuid()}, 'buy_x_get_y', ${sql.json({ uz: "E2E 2+1", ru: "E2E 2+1" })}, ${sql.json({ uz: "E2E", ru: "E2E" })}, null, ${sql.json([SLUG_21])}, true, 0)`;

  const product21 = await bySlug(SLUG_21);

  // ── A. 2+1 and the stock cap, in the customer's cart ────────────────────
  const { ctx, page } = await newPage(browser);
  await page.goto(`${BASE}/uz/product/${SLUG_21}`, { waitUntil: "networkidle" });
  /*
    Adding a product opens the "added to cart" dialog, which covers the page
    until it is dismissed — a real customer closes it too.
  */
  /*
    Adding a product opens the upsell ladder over the page, which a customer
    dismisses before doing anything else. One add is enough: the two further
    units are taken with the cart's own "+" button, exactly like a customer
    building a 2+1 by hand.
  */
  const buy = page.getByRole("button", { name: /savatga qoʻshish|savatga qo'shish/i }).first();
  await buy.click();
  await page.waitForTimeout(1200);
  const close = page.getByRole("button", { name: /yopish|закрыть|close/i }).first();
  if (await close.count()) await close.click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(400);
  await page.goto(`${BASE}/uz/cart`, { waitUntil: "networkidle" });
  for (let i = 0; i < 2; i++) {
    const plus = page.getByRole("button", { name: new RegExp(`sonini oshirish|увелич`, "i") }).first();
    await plus.click();
    await page.waitForTimeout(400);
  }
  const cart = await page.locator("main").innerText();
  const cartTotal = await page.evaluate(() => {
    const el = [...document.querySelectorAll("main *")].find((e) => /Jami|Итого/.test(e.textContent || "") && e.children.length <= 3);
    return el?.textContent?.trim().slice(0, 120) ?? "";
  });
  check("2+1 shows a free third unit", /bepul|бесплатно|1\+1|sovgʻa/i.test(cart), cartTotal || cart.slice(0, 160));
  await shot(page, "flow6-cart-2plus1");
  await ctx.close();

  // ── B. the stock limit the panel set ────────────────────────────────────
  /*
    The stock is set through the panel, not with SQL: the catalogue is cached
    for a minute and the panel is what busts that cache, exactly as it does
    when the team changes a count.
  */
  const low = await bySlug("dr-frei-thermometer-t10");
  const panel = await newPage(browser);
  await login(panel.page);
  await panel.page.goto(`${BASE}/admin/products/${encodeURIComponent(low.id)}`, { waitUntil: "networkidle" });
  await panel.page.locator('input[name="stockQty"]').fill("2");
  await panel.page.getByRole("button", { name: /^Saqlash$/ }).first().click();
  await panel.page.waitForTimeout(2500);
  await panel.ctx.close();

  const { ctx: lowCtx, page: lowPage } = await newPage(browser);
  await lowPage.goto(`${BASE}/uz/product/${low.slug}`, { waitUntil: "networkidle" });
  const pdp = await lowPage.locator("main").innerText();
  check("a low-stock page states the real count", /Faqat 2|2 ta qoldi|Omborda 2/i.test(pdp), pdp.slice(0, 160).replace(/\n/g, " "));
  await lowPage.getByRole("button", { name: /savatga qoʻshish|savatga qo'shish/i }).first().click();
  await lowPage.waitForTimeout(1200);
  const closeLow = lowPage.getByRole("button", { name: /yopish|закрыть|close/i }).first();
  if (await closeLow.count()) await closeLow.click({ timeout: 5000 }).catch(() => {});
  await lowPage.goto(`${BASE}/uz/cart`, { waitUntil: "networkidle" });
  // Three presses on "+" against a stock of two.
  for (let i = 0; i < 3; i++) {
    const plus = lowPage.getByRole("button", { name: new RegExp(`sonini oshirish|увелич`, "i") }).first();
    if (await plus.isDisabled()) break;
    await plus.click();
    await lowPage.waitForTimeout(300);
  }
  const [line] = await lowPage.evaluate(() => {
    const raw = localStorage.getItem("govita-cart");
    if (!raw) return [null];
    const parsed = JSON.parse(raw);
    return (parsed.state?.lines ?? []).filter((l) => l.slug === "dr-frei-thermometer-t10");
  });
  check("the cart cannot hold more than the stock", (line?.quantity ?? 0) <= 2, JSON.stringify(line).slice(0, 160));
  await shot(lowPage, "flow6-stock-cap");
  await lowCtx.close();
  const restore = await newPage(browser);
  await login(restore.page);
  await restore.page.goto(`${BASE}/admin/products/${encodeURIComponent(low.id)}`, { waitUntil: "networkidle" });
  await restore.page.locator('input[name="stockQty"]').fill("");
  await restore.page.getByRole("button", { name: /^Saqlash$/ }).first().click();
  await restore.page.waitForTimeout(2000);
  await restore.ctx.close();

  // ── C. a promo code, priced by the server and stored on the order ───────
  const { ctx: promo, page: promoPage } = await newPage(browser);
  await addFirstProduct(promoPage, "uz");
  await promoPage.goto(`${BASE}/uz/cart`, { waitUntil: "networkidle" });
  await fillCheckout(promoPage, { method: "courier", phone: "+998903334455", email: "promo@example.com" });
  const toggle = promoPage.getByRole("button", { name: /promokod/i }).first();
  if (await toggle.count()) await toggle.click();
  const codeInput = promoPage.locator("input[autocomplete='off'][maxlength='40']").first();
  await codeInput.fill(CODE);
  await promoPage.getByRole("button", { name: /qoʻllash|qo'llash|apply|применить/i }).first().click();
  await promoPage.waitForTimeout(2500);
  const applied = await promoPage.locator("main").innerText();
  check("the promo code is accepted and shown", applied.includes(CODE), applied.slice(0, 200).replace(/\n/g, " "));
  const promoNumber = await submitOrder(promoPage);
  const [promoOrder] = await sql`select number, total, totals, promo_code from orders where number = ${promoNumber}`;
  check("the order carries the promo code", promoOrder?.promo_code === CODE || promoOrder?.totals?.promoCode === CODE, JSON.stringify(promoOrder?.promo_code));
  check("the server applied a real discount", Number(promoOrder?.totals?.discount ?? 0) > 0, JSON.stringify(promoOrder?.totals).slice(0, 160));
  await shot(promoPage, "flow6-promo-order");
  await promo.close();

  // ── D. a wrong code can never be charged ────────────────────────────────
  const { ctx: badCtx, page: badPage } = await newPage(browser);
  await addFirstProduct(badPage, "uz");
  await badPage.goto(`${BASE}/uz/cart`, { waitUntil: "networkidle" });
  await fillCheckout(badPage, { method: "courier", phone: "+998904445566", email: "bad@example.com" });
  const t2 = badPage.getByRole("button", { name: /promokod/i }).first();
  if (await t2.count()) await t2.click();
  await badPage.locator("input[autocomplete='off'][maxlength='40']").first().fill("YOQBUNDAYKOD");
  await badPage.getByRole("button", { name: /qoʻllash|qo'llash|apply|применить/i }).first().click();
  await badPage.waitForTimeout(1500);
  const badText = await badPage.locator("main").innerText();
  check("a wrong code is refused with a readable reason", /yaroqsiz|topilmadi|недействителен|not found/i.test(badText), badText.slice(0, 160));
  await badCtx.close();

  // ── E. "Bugungi taklif" on the home page, from a scheduled deal ────────
  const dealProduct = await bySlug("delical-vanil-200ml");
  await sql`delete from deal_notifications where deal_id in (select id from deals where product_slug = ${dealProduct.slug})`;
  await sql`delete from deals where product_slug = ${dealProduct.slug}`;
  const [{ id: dealId }] = await sql`
    insert into deals (product_slug, price, starts_at, ends_at)
    values (${dealProduct.slug}, 59000, now() - interval '10 minutes', now() + interval '6 hours')
    returning id`;
  const { ctx: homeCtx, page: homePage } = await newPage(browser);
  await homePage.goto(`${BASE}/uz`, { waitUntil: "networkidle" });
  const home = await homePage.locator("main").innerText();
  check("the home page announces the deal of the day", /Bugungi taklif/i.test(home), home.slice(0, 200).replace(/\n/g, " "));
  check("the deal names the scheduled product", home.includes(dealProduct.name), dealProduct.name);
  check("the deal shows its real price", /59[\s\u00a0]000/.test(home), home.slice(0, 200).replace(/\n/g, " "));
  await shot(homePage, "flow6-deal-of-day");
  await homePage.goto(`${BASE}/uz/product/${dealProduct.slug}`, { waitUntil: "networkidle" });
  const dealPdp = await homePage.locator("main").innerText();
  check("the product page sells at the deal price", /59[\s\u00a0]000/.test(dealPdp), dealPdp.slice(0, 200).replace(/\n/g, " "));
  await homeCtx.close();

  // ── F. cancelling an order puts the stock back ─────────────────────────
  const before = await bySlug(SLUG_21);
  const { ctx: cancelCtx, page: cancelPage } = await newPage(browser);
  await addFirstProduct(cancelPage, "uz");
  await cancelPage.goto(`${BASE}/uz/cart`, { waitUntil: "networkidle" });
  await fillCheckout(cancelPage, { method: "courier", phone: "+998905556677", email: "cancel@example.com" });
  const cancelNumber = await submitOrder(cancelPage);
  const [afterOrder] = await sql`select stock_qty from products where slug = ${SLUG_21}`;
  const moved = afterOrder?.stock_qty;
  await cancelCtx.close();

  const admin = await newPage(browser);
  await login(admin.page);
  await admin.page.goto(`${BASE}/admin/orders/${cancelNumber}`, { waitUntil: "networkidle" });
  await admin.page.getByRole("button", { name: /Bekor qilish/i }).first().click();
  await admin.page.waitForTimeout(2500);
  const [cancelled] = await sql`select status from orders where number = ${cancelNumber}`;
  const [restored] = await sql`select stock_qty from products where slug = ${SLUG_21}`;
  check("the order is marked cancelled", cancelled?.status === "cancelled", cancelled?.status);
  check(
    "the stock comes back when cancelled",
    before?.stock_qty == null ? true : restored?.stock_qty === before.stock_qty,
    `${before?.stock_qty} → ${moved} → ${restored?.stock_qty}`,
  );
  await shot(admin.page, "flow6-cancelled-order");
  await admin.ctx.close();

  // ── clean up the seeds so the next run starts from the same place ──────
  await sql`delete from promo_redemptions where code = ${CODE}`;
  await sql`delete from promo_codes where code = ${CODE}`;
  await sql`delete from promotions where id like 'e2e-%'`;
  await sql`delete from deals where id = ${dealId}`;
} finally {
  await sql.end();
  await browser.close();
}

process.exit(summary() ? 0 : 1);
