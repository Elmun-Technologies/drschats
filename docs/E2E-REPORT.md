# End-to-end report — launch verification

Everything below ran against a real PostgreSQL 16 database, the production
build (`next build` → `next start`) and a Chromium controlled by Playwright.
Each check reads the database afterwards: a green line means the row the
server stored agrees with what the customer saw.

## How to run

```bash
# once per fresh database
node scripts/e2e/setup-admin.mjs

# storefront, admin catalogue, Mini App, automation, admin UI,
# merchandising, cashback, promo strip
for f in flow-storefront flow-admin-catalog flow-miniapp flow-automation \
         flow-admin-ui flow-merch flow-points flow-strip flow-bot-order \
         flow-bot-settings flow-abandoned flow-bot-customer flow-bot-outbox; do
  node scripts/e2e/$f.mjs
done
```

The scripts read `BASE_URL`, `DATABASE_URL`, `E2E_ADMIN_EMAIL`,
`E2E_ADMIN_PASSWORD`, `CRON_SECRET`, `SMS_FAKE_LOG`, `E2E_SHOTS` (where the
screenshots land) and, on a machine without Playwright's own browser,
`PLAYWRIGHT_CHROMIUM_PATH`. Screenshots are written to `E2E_SHOTS`.

## Results

| Flow | Script | Checks |
| --- | --- | --- |
| 1. Storefront, courier + pickup, admin list | `flow-storefront.mjs` | 15/15 |
| 2. Admin creates a product and a category, both live | `flow-admin-catalog.mjs` | 21/21 |
| 3. Mini App order with a signed `initData` | `flow-miniapp.mjs` | 13/13 |
| 4. Restock message and deal-start message through the worker | `flow-automation.mjs` | 17/17 |
| 5. Admin panel at 1440 and 390, all 24 sections | `flow-admin-ui.mjs` | 6/6 |
| 6. Promo code, 2+1, stock cap, deal of the day, cancellation | `flow-merch.mjs` | 13/13 |
| 7. Cashback spent with an SMS code | `flow-points.mjs` | 5/5 |
| 8. Promo strip and first-order offer | `flow-strip.mjs` | 4/4 |
| 9. Bot API → order → admin list | `flow-bot-order.mjs` | 12/12 |
| 10. `/admin/bot` settings and menu switches reach the bot | `flow-bot-settings.mjs` | 15/15 |
| 11. A bot cart enters the site's abandoned-cart flow, on Telegram | `flow-abandoned.mjs` | 12/12 |
| 12. Bot customer: status messages, cashback, quiet hours, opt-out, restock, first-purchase, course-ending | `flow-bot-customer.mjs` | 45/45 |
| 13. Bot outbox: claim, lease, failed/retry/sent, panel retry | `flow-bot-outbox.mjs` | 14/14 |

Bot side:

```bash
cd govita-vip-bot && pytest -q                              # 59 passed
GOVITA_LIVE_API=http://localhost:3000/api/bot \
  GOVITA_LIVE_KEY=… .venv/bin/python scripts/live_smoke.py  # 20/20
GOVITA_LIVE_API=http://localhost:3000/api/bot \
  GOVITA_LIVE_KEY=… .venv/bin/python scripts/live_shop_ui.py # 16 screens, clean
```

Project gates on the same tree: `tsc` 0, `eslint` 0, `vitest` 667/667,
`next build` OK, `npm run audit` → “clean — 674 s”.

## Production pipeline (checked 2026-10-20)

- The `Deploy to Fly` workflow succeeded on `main` at `4412cc9` (run
  `39291787016`), so `FLY_API_TOKEN` is present and the deploy job works. The
  secrets list itself is not readable with this integration token (HTTP 403).
- `https://govita.fly.dev/uz` and `/admin` were **not reachable from the E2E
  sandbox** — `govita.fly.dev` does not resolve here — so the owner should
  open them after this branch merges.
- Migrations in the repo: `0001`–`0012` (0012 is the bot shop); all of them
  were applied to the local PostgreSQL used for these flows.

## Bugs this run found and fixed

1. **Pickup could not be ordered.** The checkout required a region and a
   street address for every order, including “Olib ketaman”, where the
   customer collects at the shop. Both fields are now required only for a
   courier delivery; pickup shows the collection point and sends it.
2. **One half-written product blanked the whole shop.** A catalogue row whose
   `name`/`tagline` lacked a language threw inside the mapping and the
   resilient read answered with an empty list. Missing text now falls back to
   the other language, and a single undrawable row is skipped and logged
   instead of taking the catalogue with it.
3. **The hero widened the page for half a second.** The entering slide is
   animated from `translateX(30px)`; at 390 px that made the document 404 px
   wide until the animation ended. The rotator now clips on the x axis; the
   mobile check samples the first second as well as the settled page.
4. **The success page cut the order number** (`V-000001`) — the page now uses
   the shared `displayOrderNumber`.
5. **Bot summaries repeated the courier icon** (`🚚 🚚 Kuryer`) and tried to
   send `http://` photos, which Telegram always rejects; the bot now skips the
   photo call for non-https URLs and falls back to text.
6. **Half of `/admin/bot` never reached the bot.** The shop address and the
   club name were copied once at startup (an edit needed a restart) and the
   support phone and working hours never at all — «Yordam» kept printing the
   compiled-in values. `bot/settings.py` now re-reads `GET /config` from the
   outbox loop every five minutes (and on every `/start`), updates `cfg`, and
   re-sets the Telegram menu button when the address changes; blanks never
   overwrite a good value, a failed fetch keeps the last known one.
7. **The bot API client refused the local site.** `GoVitaBackend` rejected
   plain `http://` even on loopback, so no bot flow could be tested locally.
8. **A bot cart was counted from the sweep, not from the abandonment.**
   `sweepBotCarts` enrolled the cart with the default anchor (`now`), so the
   first message waited an extra hour after the sweep and the conversion
   check (“an order since the anchor”) ignored any order placed between the
   last cart touch and the sweep — the customer could be messaged about a
   cart they had already ordered. The enrolment is now anchored at the
   cart's `updated_at`, exactly like the site's visitor trigger; the flow's
   delays count from the abandonment.
9. **Course-ending and lapsed reminders never went out.** `advance` reads the
   enrollment's anchor back as a JavaScript `Date` (milliseconds) while the
   order's `created_at` keeps microseconds. The conversion check — “an order
   since the anchor” — therefore saw the very order that triggered the flow
   as *later* than its anchor, closed the enrollment as `converted` and the
   first step was never sent. Both conversion checks (`advance` and the bulk
   pass) now compare at millisecond precision; flow 12 proves the
   course-ending message reaches the bot.

10. *(test harness)* **Flow 10's cleanup corrupted the greeting.** It wrote
    the original text back with `JSON.stringify(text)::jsonb`, which the
    driver JSON-encodes a second time: the row held `"\"Assalomu…\""` and the
    bot would have sent a greeting wrapped in quotes and backslashes. The
    restore now uses `to_jsonb(text)` (and `sql.json` for the menu map), and
    the flow fails if the stored greeting opens with a quote or if the value
    after the restore differs from the value before it.

11. **A message Telegram will never accept was retried eight times.** The bot
    could only report `retry` or `blocked`, so a payload over 4096 characters
    (or with broken markup, or a chat that no longer exists) spent eight
    minutes in the queue and then showed as "Yuborilmadi" with no reason.
    The bot now reports `failed` with the reason on the first refusal; the
    panel shows it and «Qayta yuborish» clears it. Long queued texts are split
    at a paragraph, line, sentence or word boundary — never truncated — with
    the open HTML tags closed and reopened so each part is valid markup, and
    the buttons stay on the last part.

## Known gaps

- Eskiz delivery is only exercised against the fake gateway
  (`SMS_FAKE=1`); a real account is still needed to confirm the live payload.
- The Mini App was driven with an `initData` signed by the test (the real
  signature algorithm), not inside the Telegram client.
- Flow 11 drives the worker with its `?at=` hook (10:00 and 11:00 Tashkent)
  rather than waiting in real time; delivery to Telegram itself is read from
  `bot_jobs`/`outbound_messages`, not from the Telegram API.
- Flow 12 back-dates its own order by 26 days to drive course-ending; lapsed
  shares the same candidate query and the same channel rules but its 60-day
  delay is not driven.
- The Lighthouse/performance budget and the payment providers are unchanged
  by this work.

## Screenshots

- `docs/e2e-shots/flow1-cart-desktop.png` — the cart, before ordering
- `docs/e2e-shots/flow1-success-desktop.png` — the success page, full number
- `docs/e2e-shots/flow3-miniapp-cart.png` — the Mini App, phone pre-filled
- `docs/e2e-shots/flow5-admin-mobile.png` — the panel at 390 px
- `docs/e2e-shots/flow6-deal-of-day.png` — “Bugungi taklif” on the home page
- `docs/e2e-shots/flow7-points-verified.png` — cashback verified with a code
- `docs/e2e-shots/flow8-promo-strip.png` — the promo strip under the header
- `docs/e2e-shots/flow9-bot-order.png` — the bot order in the panel
- `docs/e2e-shots/flow10-bot-settings.png` — the settings and menu switches the bot reads
- `docs/e2e-shots/flow12-bot-customer-status.png` — a bot order delivered, with its messages
- `docs/e2e-shots/flow13-bot-outbox.png` — a refused message and its reason in the panel
