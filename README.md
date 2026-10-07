# Go Vita — health commerce storefront

Multilingual (UZ / RU) storefront for **Go Vita** — vitamins, dietary
supplements and med-cosmetics for the Uzbek market. The site's job is to attract
customers via SEO + context ads and sell on-site.

Navigation is organised around health goals, not just the product tree: goals,
symptoms and vitamin guides (`/goals`, `/symptoms`, `/vitamins`), a rule-based
consultant quiz (`/quiz`) and multi-week programs (`/programs`) sit alongside
the catalogue and feed into it.

Commerce data (products, prices, promotions, upsells, orders) comes from a
catalog backend behind a single adapter interface — see
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the platform plan and
[`docs/SHOPFLOW_API.md`](docs/SHOPFLOW_API.md) for the exact API contract.

## See it live (one-click deploy)

The fastest way to view the UI on a shareable URL — Next.js runs on Vercel with
no extra config:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FElmun-Technologies%2Fdrschats&env=SHOPFLOW_MODE,NEXT_PUBLIC_SITE_URL&envDescription=SHOPFLOW_MODE%3Dmock%20for%20sample%20data%3B%20NEXT_PUBLIC_SITE_URL%3Dyour%20vercel%20url)

Set `SHOPFLOW_MODE=mock` and `NEXT_PUBLIC_SITE_URL=https://<your>.vercel.app`,
deploy, and open `/uz`. Switch `SHOPFLOW_MODE=http` (+ API url/key) later for the
real Shopflow data.

Two parts of the UI stay hidden on a demo deploy until you ask for them, because
both show data that is not real — see [Demo flags](#demo-flags).

## Stack

- **Next.js 15** (App Router) + **TypeScript** (strict) — SSR/SSG/ISR for SEO
- **next-intl** — `/uz` `/ru` routing, hreflang, localized metadata
- **Tailwind CSS v4** — CSS-first design tokens (`src/styles/globals.css`)
- **CSS animations** for anything on the critical path (reveals, accordion,
  hero, card hover); **Framer Motion** only for interactive overlays
  (drawers, modals, toasts) and **Lenis** for smooth scroll
- **Zustand** — persisted cart / wishlist / profile; **Zod** — runtime validation
- **react-hook-form** — checkout (zayavka) form
- **FastAPI + SQLAlchemy + Alembic** (`backend/`) — accounts, orders,
  subscriptions, marketing queue
- **Sanity** — optional CMS layer; every content module falls back to the
  built-in static seed when Sanity env vars are absent

## Getting started

```bash
npm install
cp .env.example .env      # defaults to SHOPFLOW_MODE=mock
npm run dev               # http://localhost:3000  -> /uz
```

Scripts:

| command | what it does |
|---|---|
| `npm run dev` / `build` / `start` | development, production build, serve |
| `npm run lint` | ESLint |
| `npm test` | unit tests (vitest) |
| `npm run audit` | rendered-quality audit — needs a **production** build running, see [Quality](#quality) |
| `npm run audit:deps` | dependency audit against a tracked baseline |
| `npm run assets:ingest` | normalize real product photos into the catalogue |
| `npm run videos:doctor` | refresh the doctor-video pipeline |

Backend: `cd backend && pip install -r requirements.txt && python -m pytest`.

## Demo flags

Both default to **off**, and both exist because showing invented data on a
pharmacy storefront is a claim that is expensive to be caught making.

| flag | what it turns on |
|---|---|
| `NEXT_PUBLIC_SAMPLE_SOCIAL_PROOF=on` | built-in reviews, star ratings, "just bought" toasts |
| `NEXT_PUBLIC_ACCOUNT_DEMO=on` | the mock account cabinet when no API is configured |

Without the second one, `/account` returns 404 until `NEXT_PUBLIC_API_URL` is
set — a sign-in form that accepts any phone and any code and then shows someone
else's orders is worse than no sign-in form.

## Shopflow integration

The whole app depends only on the `ShopflowClient` interface
(`src/lib/shopflow/types.ts`). A factory (`src/lib/shopflow/index.ts`) selects
the implementation by env:

- `SHOPFLOW_MODE=mock` → built-in sample catalogue (`mock.ts`), works offline.
- `SHOPFLOW_MODE=http` → real platform (`http.ts`), via `SHOPFLOW_API_URL` /
  `SHOPFLOW_API_KEY`. Endpoint paths in `http.ts` are placeholders to confirm
  against the Shopflow API docs; responses are validated with Zod
  (`schemas.ts`). **Switching to the real API is a change to `http.ts` only.**

Orders (zayavka) are submitted via the `submitOrder` server action
(`src/app/[locale]/checkout/actions.ts`) → `shopflow.createOrder`. UTM/referrer
attribution is captured for ad reporting.

## Product pages: bespoke + template

`src/app/[locale]/product/[slug]/page.tsx` renders a hand-crafted **bespoke**
page when one is registered in `src/components/bespoke/registry.tsx`
(`omega-3-premium`, `vitamin-d3-k2`), otherwise the rich animated
`ProductTemplate`. Either way the data comes from Shopflow, so new products
added in the platform render automatically via the template.

## SEO & ads

- Localized metadata + canonical/hreflang (`src/lib/seo/metadata.ts`). `x-default`
  points at the default locale (`uz`) and is built the same way in the sitemap,
  so the two never disagree.
- JSON-LD: Organization, LocalBusiness/PharmacyOrDrugstore, WebSite,
  MedicalWebPage, Product, Article, FAQPage, BreadcrumbList
  (`src/lib/seo/jsonld.tsx`). Every image URL is absolute, as Google's Product
  and Article rich results require.
- `sitemap.ts` (multi-locale, all products) + `robots.ts`
- Conversion tracking: GTM / GA4 / Meta Pixel / Yandex Metrika, gated on env IDs
  (`src/components/analytics/Analytics.tsx`, `src/lib/analytics/events.ts`)
- `/[locale]/lp/[campaign]` — focused landing pages for context ads (noindex)

## Quality

Three gates run in CI on every pull request (`.github/workflows/ci.yml`):

1. **Lint, typecheck, unit tests, production build** — 113 unit tests plus 51
   backend tests.
2. **Rendered-quality audit** (`npm run audit`) — Playwright checks against a
   *production* build: WCAG contrast, accessible names, `alt` text, heading
   order, tap targets, clipped text, horizontal overflow, elements trapped
   under the bottom bars, dialog semantics, and that every URL which should 404
   actually answers 404. It exits non-zero on any finding.
3. **Dependency audit** (`npm run audit:deps`) — fails on any high/critical
   advisory that has a fix. Advisories whose only fix is a major upgrade are
   held in a documented baseline that **fails when a row goes stale**, so the
   list can only shrink.

The current state of gate 2 is recorded in [`CLAUDE.md`](CLAUDE.md#sifat-darajasi--nolda-turadi).

Run the rendered audit locally:

```bash
npm run build
npx next start -p 3000 &
BASE_URL=http://localhost:3000 npm run audit
```

A production build is required — a dev build has different CSS and different
timing, so it measures something else.

## Brand assets

Product photography is real: 129 normalized images in `public/products/`, wired
per-slug through `src/lib/content/product-photos.ts`. Add more by dropping
files into `public/products/inbox/` and running `npm run assets:ingest` — the
script transliterates Cyrillic filenames, matches them to catalogue products
and leaves anything unmatched for a human rather than guessing.

Brand wiring is centralised in **`src/lib/brand.ts`** (name, legal identifiers,
contacts, socials, per-product photo overrides) and **`public/brand/`** — see
that folder's README. Colours and type live as `@theme` tokens in
`src/styles/globals.css`; fonts are self-hosted Exo 2 (`src/fonts/exo2/`).

Still a placeholder: the **logo**. `<Logo>` renders the text wordmark until a
file is placed at `public/brand/logo.svg` and `BRAND.logo` points at it.
`BRAND.legal.licence` is also intentionally empty and renders a labelled
"being updated" row — an invented licence number is worse than a missing one.

Legal identifiers are taken from the state registry (orginfo.uz, INN 307895851)
and are facts, not copy: they do not change with the language, so they live in
`brand.ts` rather than in the translation files.
