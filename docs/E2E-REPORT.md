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
         flow-admin-ui flow-merch flow-points flow-strip flow-bot-order; do
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

Bot side:

```bash
cd govita-vip-bot && pytest -q                              # 36 passed
GOVITA_LIVE_API=http://localhost:3000/api/bot \
  GOVITA_LIVE_KEY=… .venv/bin/python scripts/live_smoke.py  # 20/20
GOVITA_LIVE_API=http://localhost:3000/api/bot \
  GOVITA_LIVE_KEY=… .venv/bin/python scripts/live_shop_ui.py # 16 screens, clean
```

Project gates on the same tree: `tsc` 0, `eslint` 0, `vitest` 662/662,
`next build` OK, `npm run audit` → “clean — 680 s”.

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
6. **The bot API client refused the local site.** `GoVitaBackend` rejected
   plain `http://` even on loopback, so no bot flow could be tested locally.

## Known gaps

- Eskiz delivery is only exercised against the fake gateway
  (`SMS_FAKE=1`); a real account is still needed to confirm the live payload.
- The Mini App was driven with an `initData` signed by the test (the real
  signature algorithm), not inside the Telegram client.
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
