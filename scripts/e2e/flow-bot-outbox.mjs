import { BASE, check, db, login, newPage, openBrowser, shot, summary } from "./lib.mjs";

/*
  Flow 13 — the bot's outbox contract, as the bot actually uses it.

  The site queues a message in `bot_jobs`; the bot claims a batch with a
  short lease, reports the outcome, and the site records it. Three outcomes
  matter to a customer:

  * `failed` — Telegram refused the payload for good (too long, broken HTML,
    chat gone). The row must be closed at once with the reason, not retried
    eight times while the customer waits for nothing;
  * `retry` — the lease is released and the job stays pending for the next
    tick;
  * `sent` — the job is closed.

  The panel is the operator's view of the same rows: "Yuborilmadi" with the
  reason, and "Qayta yuborish" puts the job back in the queue with its
  attempts and error cleared. Telegram itself is not involved.
*/

const KEY = process.env.BOT_API_KEY ?? "local-bot-api-key-0123456789abcdef0123456789abcdef";
const CHAT = 818181;

const api = async (method, path, body) => {
  const res = await fetch(`${BASE}/api/bot${path}`, {
    method,
    headers: { authorization: `Bearer ${KEY}`, ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const sql = await db();
const browser = await openBrowser();
/** Jobs this flow creates are recognised by their dedupe key. */
const KEYS = ["e2e-outbox-failed", "e2e-outbox-retry", "e2e-outbox-sent"];

try {
  await sql`delete from bot_jobs where dedupe_key in ${sql(KEYS)}`;
  await sql`insert into bot_jobs (dedupe_key, chat_id, kind, payload) values
    ('e2e-outbox-failed', ${CHAT}, 'broadcast', ${sql.json({ text: "E2E: Telegram bu xabarni qabul qilmaydi" })}),
    ('e2e-outbox-retry', ${CHAT}, 'broadcast', ${sql.json({ text: "E2E: vaqtincha xato" })}),
    ('e2e-outbox-sent', ${CHAT}, 'broadcast', ${sql.json({ text: "E2E: yuborildi" })})`;
  const rows = await sql`select id, dedupe_key from bot_jobs where dedupe_key in ${sql(KEYS)} order by id`;
  const idOf = (key) => Number(rows.find((r) => r.dedupe_key === key)?.id);

  // ── the bot claims a batch and gets a lease for each job ───────────────
  const ids = new Set(rows.map((r) => Number(r.id)));
  const claim = await api("POST", "/outbox/claim", { limit: 10 });
  const mine = (claim.body?.items ?? []).filter((j) => ids.has(Number(j.id)));
  check("the bot can claim its queue", claim.status === 200 && mine.length === 3, `${claim.status} ${mine.length} of 3`);
  check("every claimed job carries a lease token", mine.every((j) => String(j.leaseToken ?? "").length >= 16), JSON.stringify(mine[0] ?? {}).slice(0, 140));
  const lease = (key) => mine.find((j) => Number(j.id) === idOf(key))?.leaseToken;

  // A claimed job is invisible to the next claim until its lease runs out.
  const second = await api("POST", "/outbox/claim", { limit: 10 });
  check("a claimed job is not handed out twice", !(second.body?.items ?? []).some((j) => ids.has(Number(j.id))), JSON.stringify(second.body).slice(0, 120));

  // ── failed: closed at once, with the reason ────────────────────────────
  const failed = await api("POST", `/outbox/${idOf("e2e-outbox-failed")}/receipt`, { leaseToken: lease("e2e-outbox-failed"), result: "failed", error: "telegram_refused" });
  check("the site accepts a failed receipt", failed.status === 200, JSON.stringify(failed.body).slice(0, 120));
  const [dead] = await sql`select status, error, attempts from bot_jobs where id = ${idOf("e2e-outbox-failed")}`;
  check("a refused message is failed, not pending", dead?.status === "failed" && dead?.error === "telegram_refused", JSON.stringify(dead));

  // ── retry: back in the queue ───────────────────────────────────────────
  const retry = await api("POST", `/outbox/${idOf("e2e-outbox-retry")}/receipt`, { leaseToken: lease("e2e-outbox-retry"), result: "retry", retryAfter: 60 });
  check("the site accepts a retry receipt", retry.status === 200, JSON.stringify(retry.body).slice(0, 120));
  const [again] = await sql`select status, attempts, due_at > now() as later from bot_jobs where id = ${idOf("e2e-outbox-retry")}`;
  check("a retried job stays pending with a later due time", again?.status === "pending" && again?.attempts === 1 && again?.later, JSON.stringify(again));

  const [leak] = await sql`select count(*)::int n from bot_jobs where id = ${idOf("e2e-outbox-retry")} and lease_token is not null`;
  check("the lease is released after the receipt", leak?.n === 0, `${leak?.n} still leased`);

  // A stale lease cannot close a job that has already been answered.
  const stale = await api("POST", `/outbox/${idOf("e2e-outbox-retry")}/receipt`, { leaseToken: lease("e2e-outbox-retry") ?? "z".repeat(32), result: "sent" });
  check("a stale lease is refused", stale.status === 409, `${stale.status} ${JSON.stringify(stale.body).slice(0, 100)}`);

  // ── sent ───────────────────────────────────────────────────────────────
  const sent = await api("POST", `/outbox/${idOf("e2e-outbox-sent")}/receipt`, { leaseToken: lease("e2e-outbox-sent"), result: "sent" });
  check("the site accepts a sent receipt", sent.status === 200, JSON.stringify(sent.body).slice(0, 120));
  const [done] = await sql`select status, sent_at is not null as stamped, error from bot_jobs where id = ${idOf("e2e-outbox-sent")}`;
  check("a sent job is closed and stamped", done?.status === "sent" && done?.stamped && done?.error === null, JSON.stringify(done));

  // ── the panel shows the failure and can retry it ───────────────────────
  const admin = await newPage(browser);
  await login(admin.page);
  await admin.page.goto(`${BASE}/admin/bot/outbox`, { waitUntil: "networkidle" });
  const list = await admin.page.locator("main").innerText();
  check("the panel lists the refused message", list.includes("E2E: Telegram bu xabarni qabul qilmaydi"), list.slice(0, 200).replace(/\n/g, " "));
  check("the panel shows why it was not sent", /Yuborilmadi/.test(list) && /Telegram qabul qilmadi/.test(list), list.slice(0, 400).replace(/\n/g, " "));
  await shot(admin.page, "flow13-bot-outbox");

  const row = admin.page.locator("li", { hasText: "E2E: Telegram bu xabarni qabul qilmaydi" }).first();
  await row.getByRole("button", { name: "Qayta yuborish" }).click();
  await admin.page.waitForTimeout(2500);
  const [requeued] = await sql`select status, attempts, error from bot_jobs where id = ${idOf("e2e-outbox-failed")}`;
  check("“Qayta yuborish” puts the job back in the queue", requeued?.status === "pending" && requeued?.attempts === 0 && requeued?.error === null, JSON.stringify(requeued));
  await admin.ctx.close();
} finally {
  await sql`delete from bot_jobs where dedupe_key in ${sql(KEYS)}`;
  await sql.end();
  await browser.close();
}

process.exit(summary() ? 0 : 1);
