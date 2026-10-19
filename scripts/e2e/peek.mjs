import { BASE, login, newPage, openBrowser, shot } from "./lib.mjs";

const paths = (process.env.PATHS ?? "/admin/products").split(",");
const width = Number(process.env.W ?? 1440);
const browser = await openBrowser();
const { ctx, page } = await newPage(browser, { width, height: width < 500 ? 844 : 900 });
await login(page);
for (const p of paths) {
  await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
  const name = p.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
  console.log(await shot(page, `${name}-${width}`));
  console.log("title:", await page.locator("h1").first().innerText().catch(() => "-"));
}
await ctx.close();
await browser.close();
