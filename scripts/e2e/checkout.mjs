import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const log = (...a) => console.log(...a);
const browser = await chromium.launch({
  executablePath: "/tmp/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("upgrade-insecure-requests")) errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));

await page.goto(`${BASE}/uz/products`, { waitUntil: "networkidle" });
// open the first product card
const firstCard = page.locator('a[href*="/uz/product/"]').first();
const href = await firstCard.getAttribute("href");
log("product href", href);
await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" });
log("pdp title", await page.locator("h1").first().innerText());
await page.screenshot({ path: "/home/user/e2e/pdp.png", fullPage: false });

// add to cart
const add = page.getByRole("button", { name: /savatga|qoʻshish|qo'shish/i }).first();
log("add button", await add.innerText().catch(() => "n/a"));
await add.click();
await page.waitForTimeout(1500);
await page.screenshot({ path: "/home/user/e2e/after-add.png" });
log("toast/url", page.url());
// go to cart
await page.goto(`${BASE}/uz/cart`, { waitUntil: "networkidle" });
log("cart h1", await page.locator("h1").first().innerText());
await page.screenshot({ path: "/home/user/e2e/cart.png", fullPage: false });

// fill the form
await page.locator('input[autocomplete="name"]').fill("Aziza Karimova");
await page.locator('input[autocomplete="tel"]').fill("+998901234567");
await page.locator('input[autocomplete="email"]').fill("aziza@example.com");
await page.locator('select').first().selectOption({ index: 1 });
await page.locator('input[autocomplete="street-address"]').fill("Chilonzor 9-42");
await page.screenshot({ path: "/home/user/e2e/cart-filled.png", fullPage: false });
const submit = page.locator('#checkout-form button[type="submit"]').first();
log("submit label", await submit.innerText());
await submit.click();
await page.waitForTimeout(6000);
log("after submit url", page.url());
await page.screenshot({ path: "/home/user/e2e/after-submit.png", fullPage: false });
log("ERRORS", errors.slice(0, 5));
await browser.close();
