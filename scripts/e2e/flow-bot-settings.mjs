import { BASE, check, db, login, newPage, openBrowser, shot, summary } from "./lib.mjs";

/*
  Flow 10 — /admin/bot settings actually drive the bot.

  The panel is the only place these values live. The bot reads them through
  GET /api/bot/config: the greeting on every /start, the rest within five
  minutes (the outbox loop re-reads them). This flow changes them in the
  panel, then reads the same endpoint the bot calls, and finally runs the
  bot's own refresh against it — so a value the panel dropped, or a field the
  bot ignores, fails here and not in a customer's chat.
*/

const KEY = process.env.BOT_API_KEY ?? "local-bot-api-key-0123456789abcdef0123456789abcdef";
const GREETING_UZ = "E2E salom: qanday yordam beramiz?";
const GREETING_RU = "E2E привет: чем помочь?";
const PHONE = "+998 71 200 70 80";
const HOURS = "Du–Sha, 09:00–18:00";

const botConfig = async () => {
  const res = await fetch(`${BASE}/api/bot/config`, { headers: { authorization: `Bearer ${KEY}` } });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const sql = await db();
const browser = await openBrowser();

try {
  const before = await botConfig();
  check("the bot can read the club settings", before.status === 200, `${before.status} ${JSON.stringify(before.body).slice(0, 120)}`);

  // ── the admin edits them ───────────────────────────────────────────────
  const { ctx, page } = await newPage(browser);
  await login(page);
  await page.goto(`${BASE}/admin/bot`, { waitUntil: "networkidle" });
  await page.locator('input[name="shopUrl"]').fill("https://govita.uz");
  await page.locator('textarea[name="greetingUz"]').fill(GREETING_UZ);
  await page.locator('textarea[name="greetingRu"]').fill(GREETING_RU);
  await page.getByRole("button", { name: /^Saqlash$/ }).first().click();
  await page.waitForTimeout(2500);
  await shot(page, "flow10-bot-settings");
  await ctx.close();

  const [row] = await sql`select data from bot_config where id = 1`;
  check("the panel stored the settings", row?.data?.greeting?.uz === GREETING_UZ, JSON.stringify(row?.data).slice(0, 160));

  const after = await botConfig();
  check("the bot API serves the new greeting (uz)", after.body?.greeting?.uz === GREETING_UZ, JSON.stringify(after.body?.greeting));
  check("the bot API serves the new greeting (ru)", after.body?.greeting?.ru === GREETING_RU, JSON.stringify(after.body?.greeting));
  check("the bot API serves the shop address", after.body?.shopUrl === "https://govita.uz", after.body?.shopUrl);

  // ── the bot's own code applies them ────────────────────────────────────
  const { execFileSync } = await import("node:child_process");
  const out = execFileSync(
    "govita-vip-bot/.venv/bin/python",
    ["-c", `
import asyncio, json, os, sys
sys.path.insert(0, "govita-vip-bot")
from bot import settings as s
from bot.config import cfg
from bot.backend import GoVitaBackend

async def main():
    api = await GoVitaBackend(os.environ["GOVITA_LIVE_API"], os.environ["GOVITA_LIVE_KEY"]).open()
    try:
        s.reset()
        changed = await s.refresh(api, max_age=0)
        print(json.dumps({
            "changed": sorted(changed),
            "shop": cfg.shop_url,
            "phone": cfg.operator_phone,
            "hours": cfg.support_hours,
            "club": cfg.club_name,
        }))
    finally:
        await api.close()

asyncio.run(main())
`],
    {
      env: { ...process.env, GOVITA_LIVE_API: `${BASE}/api/bot`, GOVITA_LIVE_KEY: KEY, PYTHONPATH: "govita-vip-bot" },
      encoding: "utf8",
    },
  );
  const applied = JSON.parse(out);
  check("the bot applies the shop address from the panel", applied.shop === "https://govita.uz", applied.shop);
  check("the bot applies the support phone from the panel", applied.phone.length > 0, applied.phone);
  check("the bot applies the working hours from the panel", applied.hours === HOURS, applied.hours);

  // ── put the original greeting back ─────────────────────────────────────
  const kept = before.body?.greeting ?? {};
  await sql`update bot_config set data = jsonb_set(jsonb_set(data, '{greeting,uz}', ${JSON.stringify(kept.uz ?? "")}::jsonb), '{greeting,ru}', ${JSON.stringify(kept.ru ?? "")}::jsonb) where id = 1`;
} finally {
  await sql.end();
  await browser.close();
}

process.exit(summary() ? 0 : 1);
