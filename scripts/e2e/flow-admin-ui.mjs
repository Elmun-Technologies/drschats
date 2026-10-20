import { BASE, check, db, login, newPage, openBrowser, shot, summary } from "./lib.mjs";

/*
  Flow 5 — the admin panel as a surface of its own: every section opens, the
  layout holds at 1440 and at 390, the same defanged-browser rules as the
  storefront apply, and a handful of screens are written out for the PR.

  The audit script only walks the storefront, so admin pages had never been
  measured at 390 px; the tables and the sidebar were exactly where a clipped
  button or a sideways page would hide.
*/

/* Every route under /admin/(panel) — the dashboard is the empty one. */
const SECTIONS = [
  "",
  "orders",
  "products",
  "brands",
  "categories",
  "waitlist",
  "customers",
  "promocodes",
  "promotions",
  "campaigns",
  "segments",
  "flows",
  "messages",
  "bot",
  "content",
  "storefront",
  "commerce",
  "loyalty",
  "analytics",
  "funnel",
  "visitors",
  "search",
  "integrations",
  "users",
];

const browser = await openBrowser();
const sql = await db();

try {
  for (const [label, viewport] of [
    ["desktop", { width: 1440, height: 900 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const { ctx, page } = await newPage(browser, viewport);
    await login(page);
    check(`${label}: admin login reaches the panel`, page.url().includes("/admin"), page.url());

    const failures = [];
    for (const section of SECTIONS) {
      const res = await page.goto(`${BASE}/admin/${section}`, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const main = await page.locator("main").innerText().catch(() => "");
      if (res?.status() !== 200) failures.push(`${section}: ${res?.status()}`);
      else if (overflow > 1) failures.push(`${section}: overflow ${overflow}px`);
      else if (main.trim().length < 20) failures.push(`${section}: empty main`);
      else if (page.errors.length) failures.push(`${section}: console ${page.errors[0].slice(0, 80)}`);
      page.errors.length = 0;
    }
    check(`${label}: all ${SECTIONS.length} admin sections render without overflow or console errors`, failures.length === 0, failures.slice(0, 3).join(" | "));
    if (label === "mobile") await shot(page, "flow5-admin-mobile");
    if (label === "desktop") await shot(page, "flow5-admin-desktop");
    await ctx.close();
  }

  // The dashboard must separate the channels an order can arrive through.
  const { ctx, page } = await newPage(browser);
  await login(page);
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  const dashboard = await page.locator("main").innerText();
  check("the dashboard names the Telegram channel", /Telegram/i.test(dashboard), dashboard.slice(0, 120).replace(/\n/g, " "));
  const [{ count }] = await sql`select count(*)::int as count from orders where source = 'telegram_mini'`;
  check("a Mini App order exists to be counted", count > 0, String(count));
  await ctx.close();
} finally {
  await sql.end();
  await browser.close();
}

process.exit(summary() ? 0 : 1);
