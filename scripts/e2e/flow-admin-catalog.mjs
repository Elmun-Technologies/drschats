import { BASE, check, clickSave, db, login, newPage, openBrowser, shot, summary } from "./lib.mjs";

/*
  Flow 2 — the admin panel writes, the storefront (and the bot API) read it
  immediately: a new product, a new category, a price change and a stock
  threshold. Every assertion after an admin save reads the public site.
*/

const browser = await openBrowser();
const sql = await db();
const stamp = Date.now().toString().slice(-6);
const catSlug = `test-kat-${stamp}`;
const catName = `Test kategoriya ${stamp}`;
const slug = `test-mahsulot-${stamp}`;
const name = `Test mahsulot ${stamp}`;

try {
  const { ctx, page } = await newPage(browser);
  await login(page);

  // ── new category ────────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin/categories/new`, { waitUntil: "networkidle" });
  await page.locator('input[name="uz.name"]').fill(catName);
  await page.locator('input[name="ru.name"]').fill(`Тест категория ${stamp}`).catch(() => {});
  await page.locator('input[name="slug"]').fill(catSlug).catch(() => {});
  await clickSave(page);
  await page.waitForTimeout(2500);
  const [catRow] = await sql`select slug, name->>'uz' as name from categories where slug = ${catSlug}`;
  check("admin saves a new category", Boolean(catRow), page.url());
  await shot(page, "flow2-category");

  // ── new product in it, tracked stock, sale price ────────────────────────
  await page.goto(`${BASE}/admin/products/new`, { waitUntil: "networkidle" });
  await page.locator('input[name="uz.name"]').fill(name);
  await page.locator('textarea[name="uz.description"]').fill("Test tavsifi — biologik faol qoʻshimcha.");
  await page.locator('input[name="price"]').fill("150000");
  await page.locator('input[name="oldPrice"]').fill("200000");
  await page.locator('input[name="stockQty"]').fill("4");
  await page.locator('select[name="categorySlug"]').selectOption(catSlug);
  await page.locator('input[name="slug"]').fill(slug);
  await clickSave(page);
  await page.waitForTimeout(3000);
  const [prod] = await sql`select id, slug, price, old_price, stock_qty, in_stock, kind from products where slug = ${slug}`;
  check("admin saves a new product", Boolean(prod), page.url());
  check("price saved as entered", prod?.price === 150000, String(prod?.price));
  check("tracked stock saved", prod?.stock_qty === 4, String(prod?.stock_qty));

  // ── the storefront shows it immediately ─────────────────────────────────
  const pub = await newPage(browser);
  const pdp = `${BASE}/uz/product/${slug}`;
  const res = await pub.page.goto(pdp, { waitUntil: "networkidle" });
  check("product page answers 200", res?.status() === 200, String(res?.status()));
  const pdpText = await pub.page.locator("main").innerText();
  check("product page shows the name", pdpText.includes(name));
  check("product page shows the price", pdpText.includes("150 000"));
  check("product page shows the real old price", pdpText.includes("200 000"));
  check("product page shows the BAD disclaimer", /Biologik faol qoʻshimcha|БАД|dori vositasi emas/i.test(pdpText), pdpText.slice(0, 200));
  check("product page shows real low stock", /Faqat 4|4 ta qoldi/i.test(pdpText), "stock copy missing");
  await shot(pub.page, "flow2-pdp-new");

  const listRes = await pub.page.goto(`${BASE}/uz/products/${catSlug}`, { waitUntil: "networkidle" });
  check("category page answers 200", listRes?.status() === 200, String(listRes?.status()));
  check("category page lists the product", (await pub.page.locator("main").innerText()).includes(name));
  await shot(pub.page, "flow2-category-page");

  // ── the bot API sees the same catalogue ─────────────────────────────────
  const key = process.env.BOT_API_KEY ?? "local-bot-api-key-0123456789abcdef0123456789abcdef";
  const apiRes = await fetch(`${BASE}/api/bot/shop/product/${slug}?locale=uz`, {
    headers: { authorization: `Bearer ${key}` },
  });
  const apiJson = await apiRes.json();
  const card = apiJson?.product ?? apiJson;
  check("bot API returns the new product", apiRes.status === 200 && card?.name === name, JSON.stringify(apiJson).slice(0, 160));
  check("bot API price matches the panel", card?.price === 150000, String(card?.price));
  check("bot API carries the BAD disclaimer", typeof apiJson?.disclaimer === "string" && apiJson.disclaimer.length > 10, String(apiJson?.disclaimer));

  // ── an edit in the panel reaches the site without a rebuild ─────────────
  await page.goto(`${BASE}/admin/products/${prod.id}`, { waitUntil: "networkidle" });
  await page.locator('input[name="price"]').fill("140000");
  await clickSave(page);
  await page.waitForTimeout(2500);
  await pub.page.waitForTimeout(4000);
  await pub.page.goto(pdp, { waitUntil: "networkidle" });
  /*
    The price is asserted from the server's own HTML: Playwright's innerText
    can still hold the pre-navigation tree for a moment, which made this
    check fail on a page that was already correct (proven with probe-price.mjs).
  */
  const pdpHtml = await (await fetch(pdp)).text();
  check("price change is live on the product page", /140[\s\u00a0]000/.test(pdpHtml), /200[\s\u00a0]000/.test(pdpHtml) ? "old price still shown" : pdpHtml.slice(0, 120));
  const editedText = await pub.page.locator("main").innerText();
  check("the page a customer sees shows the new price", /140[\s\u00a0]000/.test(editedText), editedText.slice(0, 120).replace(/\n/g, " "));

  // ── and a product that goes out of stock says so ────────────────────────
  await page.goto(`${BASE}/admin/products/${prod.id}`, { waitUntil: "networkidle" });
  await page.locator('input[name="stockQty"]').fill("0");
  await clickSave(page);
  await page.waitForTimeout(2500);
  const [zero] = await sql`select stock_qty, in_stock from products where slug = ${slug}`;
  check("stock 0 turns in_stock off", zero?.in_stock === false, JSON.stringify(zero));
  await pub.page.goto(pdp, { waitUntil: "networkidle" });
  const outText = await pub.page.locator("main").innerText();
  check("out-of-stock page offers the waitlist", /Xabar ber|keldi|xabar bering/i.test(outText), outText.slice(0, 300));
  const apiOut = await (await fetch(`${BASE}/api/bot/shop/product/${slug}?locale=uz`, { headers: { authorization: `Bearer ${key}` } })).json();
  check("bot API reports it out of stock", (apiOut?.product ?? apiOut)?.inStock === false, JSON.stringify(apiOut).slice(0, 160));
  await shot(pub.page, "flow2-out-of-stock");

  check("no console errors in the storefront", pub.page.errors.length === 0, pub.page.errors.slice(0, 2).join(" | "));
  await pub.ctx.close();
  await ctx.close();
} finally {
  await sql.end();
  await browser.close();
}

process.exit(summary() ? 0 : 1);
