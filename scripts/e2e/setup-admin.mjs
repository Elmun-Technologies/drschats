import { BASE, E2E_EMAIL, E2E_PASSWORD, openBrowser, shot } from "./lib.mjs";
import { mkdir, writeFile } from "node:fs/promises";

/*
  Creates the first administrator through the real setup page and saves the
  browser session the other flows reuse. Run once per fresh database:

    node scripts/e2e/setup-admin.mjs

  ADMIN_SETUP_TOKEN must be the same value the server has in .env.local.
*/

const TOKEN = process.env.ADMIN_SETUP_TOKEN;
if (!TOKEN) {
  console.error("ADMIN_SETUP_TOKEN is not set — export the server's value first.");
  process.exit(2);
}

const browser = await openBrowser();
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/admin/setup`, { waitUntil: "networkidle" });
  const heading = await page.locator("h1").first().innerText().catch(() => "");
  if (!/Birinchi administrator/i.test(heading)) {
    console.log(`setup page is closed (${heading || page.url()}) — an admin already exists`);
  } else {
    await page.fill('input[name="token"]', TOKEN);
    await page.fill('input[name="name"]', "Local Admin");
    await page.fill('input[name="email"]', E2E_EMAIL);
    await page.fill('input[name="password"]', E2E_PASSWORD);
    await Promise.all([
      page.waitForURL("**/admin", { timeout: 30000 }),
      page.click('button[type="submit"]'),
    ]);
    console.log(`admin created: ${E2E_EMAIL}`);
  }
  await shot(page, "admin-dashboard");
  await mkdir("/home/user/e2e", { recursive: true });
  await writeFile("/home/user/e2e/admin-state.json", JSON.stringify(await ctx.storageState(), null, 2));
  console.log("session saved to /home/user/e2e/admin-state.json");
  await ctx.close();
} finally {
  await browser.close();
}
