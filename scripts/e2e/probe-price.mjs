import { BASE, clickSave, db, login, newPage, openBrowser } from "./lib.mjs";

const id = process.env.ID;
const browser = await openBrowser();
const sql = await db();
const { page } = await newPage(browser);
await login(page);
await page.goto(`${BASE}/admin/products/${encodeURIComponent(id)}`, { waitUntil: "networkidle" });
await page.locator('input[name="price"]').fill(process.env.PRICE ?? "131313");
await clickSave(page);
console.log("saved url", page.url());
console.log("db", (await sql`select price from products where id = ${id}`)[0]);
for (const wait of [0, 3000, 10000, 65000]) {
  await new Promise((r) => setTimeout(r, wait));
  const html = await (await fetch(`${BASE}/uz/product/${process.env.SLUG}`)).text();
  const m = html.match(/(\d[\d\u00a0 ]{4,})\s*soʻm/);
  console.log(`after ${wait}ms:`, m?.[1]);
}
await sql.end();
await browser.close();
