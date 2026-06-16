# Alimkhanov — Cinematic SEO Storefront

Premium, animation-rich, multilingual (UZ / RU / EN) storefront for **Alimkhanov
Pharm Group** (vitamins & dietary supplements). The site's job is to attract
customers via SEO + context ads and sell on-site. Commerce data (products,
prices, promotions, upsells, orders) lives in the **Shopflow platform**; this
app is the cinematic, SEO-optimized storefront layer that integrates with it.

> Visual benchmark: [whoop.com](https://www.whoop.com). Structure benchmarks:
> Thorne, Vitamin World, Nature Made, Carlson Labs, NutraChamps.

## Stack

- **Next.js 15** (App Router) + **TypeScript** — SSR/SSG/ISR for SEO
- **next-intl** — `/uz` `/ru` `/en` routing, hreflang, localized metadata
- **Tailwind CSS v4** — CSS-first design tokens (`src/styles/globals.css`)
- **Framer Motion + Lenis** — cinematic scroll animations & smooth scroll
- **Zustand** — persisted cart; **Zod** — runtime validation
- **react-hook-form** — checkout (zayavka) form

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

Currently a premium dark token system + placeholder imagery (Picsum). Real
logo, brand colours, fonts and product photos plug into
`src/styles/globals.css` (tokens) and the product image host in `next.config.ts`.
