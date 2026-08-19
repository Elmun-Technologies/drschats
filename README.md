# Go Vita — health commerce storefront

Multilingual (UZ / RU / EN) storefront for **Go Vita** — vitamins, dietary
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

## Stack

- **Next.js 15** (App Router) + **TypeScript** — SSR/SSG/ISR for SEO
- **next-intl** — `/uz` `/ru` `/en` routing, hreflang, localized metadata
- **Tailwind CSS v4** — CSS-first design tokens (`src/styles/globals.css`)
- **CSS animations** for anything on the critical path (reveals, accordion,
  hero, card hover); **Framer Motion** only for interactive overlays
  (drawers, modals, toasts) and **Lenis** for smooth scroll
- **Zustand** — persisted cart; **Zod** — runtime validation
- **react-hook-form** — checkout (zayavka) form
- **Sanity** — optional CMS layer; every content module falls back to the
  built-in static seed when Sanity env vars are absent

## Getting started

```bash
npm install
cp .env.example .env      # defaults to SHOPFLOW_MODE=mock
npm run dev               # http://localhost:3000  -> /uz
```

Other scripts: `npm run build`, `npm start`, `npm test`, `npm run lint`.

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

- Localized metadata + hreflang/canonical (`src/lib/seo/metadata.ts`)
- JSON-LD: Organization, Product, FAQPage, BreadcrumbList (`src/lib/seo/jsonld.tsx`)
- `sitemap.ts` (multi-locale, all products) + `robots.ts`
- Conversion tracking: GTM / GA4 / Meta Pixel / Yandex Metrika, gated on env IDs
  (`src/components/analytics/Analytics.tsx`, `src/lib/analytics/events.ts`)
- `/[locale]/lp/[campaign]` — focused landing pages for context ads (noindex)

## Brand assets

A light token system (`@theme` in `src/styles/globals.css`) plus placeholder
imagery. Real logo, brand colours, fonts and product photos plug into those
tokens and the product image host in `next.config.ts`.

Brand wiring is centralised in **`src/lib/brand.ts`** (logo path, wordmark,
per-product photo overrides) and **`public/brand/`** — see that folder's README.
The `<Logo>` component falls back to the text wordmark until a logo file is set.
