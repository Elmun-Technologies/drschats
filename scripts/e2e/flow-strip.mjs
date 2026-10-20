import { BASE, check, db, login, newPage, openBrowser, shot, summary } from "./lib.mjs";

/*
  Flow 8 — the promo strip and the first-order offer.

  A banner created in the panel (placement "strip") must appear on the site
  without a rebuild, in both languages, and the first-order discount must be
  offered to a customer who has never ordered — as a note, because the default
  mode is "operator" (the operator applies it when confirming).
*/

const TITLE_UZ = "E2E: bepul yetkazish";
const TITLE_RU = "E2E: бесплатная доставка";
const href = "/catalog".replace("/catalog", "/products");

const sql = await db();
const browser = await openBrowser();

try {
  await sql`delete from banners where title->>'uz' = ${TITLE_UZ}`;

  // ── the panel writes the banner ─────────────────────────────────────────
  const admin = await newPage(browser);
  await login(admin.page);
  await admin.page.goto(`${BASE}/admin/storefront/banners/new`, { waitUntil: "networkidle" });
  await admin.page.locator('select[name="placement"]').selectOption("strip");
  await admin.page.locator('input[name="uz.title"]').fill(TITLE_UZ);
  await admin.page.locator('input[name="ru.title"]').fill(TITLE_RU);
  await admin.page.locator('input[name="href"]').fill("/products");
  await admin.page.getByRole("button", { name: /Bannerni yaratish/ }).first().click();
  await admin.page.waitForTimeout(2500);
  const [row] = await sql`select id, placement, active from banners where title->>'uz' = ${TITLE_UZ}`;
  check("the banner is stored by the panel", row?.placement === "strip" && row?.active === true, JSON.stringify(row));
  await admin.ctx.close();

  // ── and the storefront shows it ─────────────────────────────────────────
  for (const [locale, title] of [["uz", TITLE_UZ], ["ru", TITLE_RU]]) {
    const { ctx, page } = await newPage(browser);
    await page.goto(`${BASE}/${locale}`, { waitUntil: "networkidle" });
    const body = await page.locator("body").innerText();
    check(`the ${locale} storefront shows the strip`, body.includes(title), body.slice(0, 160).replace(/\n/g, " "));
    if (locale === "uz") await shot(page, "flow8-promo-strip");
    await ctx.close();
  }

  // ── the first-order offer is visible before the first order ────────────
  const { ctx, page } = await newPage(browser);
  await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });
  const listing = await page.locator("main").innerText();
  const firstOrderNote = /birinchi buyurtma|первый заказ|−10%|10%/i.test(listing);
  check("the first-order offer is stated somewhere the customer can see", firstOrderNote, listing.slice(0, 200).replace(/\n/g, " "));
  await ctx.close();

  await sql`delete from banners where title->>'uz' = ${TITLE_UZ}`;
} finally {
  await sql.end();
  await browser.close();
}

process.exit(summary() ? 0 : 1);
