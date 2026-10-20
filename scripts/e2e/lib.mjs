import { chromium } from "playwright";
import postgres from "postgres";
import { mkdir, writeFile } from "node:fs/promises";

export const BASE = process.env.BASE_URL ?? "http://localhost:3000";
export const DB_URL = process.env.DATABASE_URL ?? "postgres://postgres@127.0.0.1:5434/postgres";
export const SHOTS = process.env.E2E_SHOTS ?? "/tmp/e2e-shots";
export const CHROME = process.env.PLAYWRIGHT_CHROMIUM_PATH ?? "/tmp/chromium";
export const E2E_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@govita.local";
export const E2E_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "lokal-parol-123456";

let failures = 0;
const results = [];

export function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "  FAIL"} ${name}${detail && !ok ? ` — ${detail}` : ""}`);
  return ok;
}

export function summary() {
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log("\nFailed:");
    for (const f of failed) console.log(` - ${f.name}${f.detail ? ` — ${f.detail}` : ""}`);
  }
  return failed.length === 0;
}

export async function openBrowser() {
  /*
    The sandbox's Chromium is a Lambda-style build whose NSS libraries are
    stubs (plain-http work is all these tests need); `--no-sandbox` and
    `--disable-dev-shm-usage` are its usual requirements. It is deliberately
    NOT run `--single-process`: in that mode closing one context tears down the
    browser and the next flow's page hangs forever. LD_LIBRARY_PATH is supplied
    by the caller, so a developer with a normal Chromium is unaffected.
  */
  return chromium.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    ...(process.env.E2E_CHROME_ENV ? { env: { ...process.env, ...JSON.parse(process.env.E2E_CHROME_ENV) } } : {}),
  });
}

export async function newPage(browser, { width = 1440, height = 900, storage } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, storageState: storage });
  const page = await ctx.newPage();
  /*
    The sandbox cannot reach the public internet. An external font or script
    would otherwise hang the request and `networkidle` would never fire, which
    looks like a broken site. Anything not served by the site under test is
    refused immediately instead.
  */
  const localHost = new URL(BASE).hostname;
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== localHost && url.hostname !== "127.0.0.1" && url.hostname !== "localhost") return route.abort();
    /*
      The headless Chromium in this sandbox is a single-process Lambda build.
      Its image optimiser never answers (a raw `/_next/image` request stays
      pending forever), so the optimised URL is served the original file
      instead: the layout and every image are still exercised, and only the
      resizing is skipped.
    */
    if (url.pathname === "/_next/image") {
      const raw = url.searchParams.get("url");
      if (!raw || !raw.startsWith("/")) return route.abort();
      return route.fulfill({ response: await route.fetch({ url: new URL(raw, BASE).href }) });
    }
    return route.continue();
  });
  const errors = [];
  page.on("console", (m) => {
    const t = m.text();
    if (m.type() === "error" && !t.includes("upgrade-insecure-requests")) errors.push(t);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.errors = errors;
  return { ctx, page };
}

export async function db() {
  return postgres(DB_URL, { max: 2, prepare: false });
}

export async function shot(page, name) {
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
  return `${SHOTS}/${name}.png`;
}

export async function login(page) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  if (!page.url().includes("/admin/login")) return;
  await page.fill('input[name="email"]', process.env.E2E_ADMIN_EMAIL ?? "admin@govita.local");
  await page.fill('input[name="password"]', process.env.E2E_ADMIN_PASSWORD ?? "lokal-parol-123456");
  await Promise.all([page.waitForURL("**/admin", { timeout: 30000 }), page.click('button[type="submit"]')]);
}

/** Adds one unit of the first listed product and goes to the cart. */
export async function addFirstProduct(page, locale = "uz") {
  await page.goto(`${BASE}/${locale}/products`, { waitUntil: "networkidle" });
  const href = await page.locator(`a[href*="/${locale}/product/"]`).first().getAttribute("href");
  await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" });
  const add = page.getByRole("button", { name: /savatga qoʻshish|savatga qo'shish|в корзину/i }).first();
  await add.click();
  await page.waitForTimeout(900);
  return href;
}

export async function fillCheckout(page, { name = "Aziza Karimova", phone = "+998901112233", email = "aziza@example.com", method = "courier", address = "Chilonzor 9-42", region = "Toshkent shahri", note = "" } = {}) {
  await page.locator('input[autocomplete="name"]').fill(name);
  await page.locator('input[autocomplete="tel"]').fill(phone);
  await page.locator('input[autocomplete="email"]').fill(email);
  /*
    The radios are `sr-only` inside their label, so a real customer clicks the
    label. Clicking the input directly works only while the label happens to
    sit exactly over it — which broke once the font metrics changed.
  */
  const pick = async (value) => {
    const label = page.locator(`label:has(input[type="radio"][value="${value}"])`).first();
    if (await label.count()) return label.click();
    return page.locator(`input[type="radio"][value="${value}"]`).check({ force: true });
  };
  if (method === "courier") {
    await pick("courier");
    const sel = page.locator("#checkout-form select").first();
    await sel.selectOption({ label: region }).catch(async () => {
      await sel.selectOption({ index: 1 });
    });
    await page.locator('input[autocomplete="street-address"]').fill(address);
  } else {
    // Pickup asks for no address at all: the form shows the collection point.
    await pick("pickup");
    if (await page.locator('input[autocomplete="street-address"]').isVisible()) {
      await page.locator('input[autocomplete="street-address"]').fill(address || "Doʻkon: Toshkent, Amir Temur 107");
    }
  }
  if (note) await page.locator("#checkout-form input[placeholder*='izoh' i]").fill(note).catch(() => {});
}

export async function submitOrder(page) {
  // The form has a desktop button and a mobile one; only one is ever visible.
  const buttons = page.locator('#checkout-form button[type="submit"]');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    if (await buttons.nth(i).isVisible()) {
      await buttons.nth(i).click();
      break;
    }
  }
  await page.waitForURL("**/checkout/success**", { timeout: 45000 });
  const url = new URL(page.url());
  return url.searchParams.get("order");
}

export async function writeReport(data) {
  await mkdir(SHOTS, { recursive: true });
  await writeFile(`${SHOTS}/report.json`, JSON.stringify(data, null, 2));
}

/** The form's own save button, by its label — the sidebar's logout is also a submit. */
export async function clickSave(page, label = /^(Saqlash|Mahsulotni yaratish|Kategoriyani yaratish)$/) {
  await page.getByRole("button", { name: label }).first().click();
  await page.waitForTimeout(1800);
}
