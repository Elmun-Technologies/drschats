# Shopflow API — Specification for the Alimkhanov storefront

This document is the **exact contract** the storefront expects from the Shopflow
platform. It is generated from the code:

- Interface: `src/lib/shopflow/types.ts` (`ShopflowClient`)
- Runtime validation: `src/lib/shopflow/schemas.ts` (Zod — responses are
  validated against these; a mismatch throws at the boundary)
- HTTP adapter: `src/lib/shopflow/http.ts` (the calls below)

When these endpoints exist, set `SHOPFLOW_MODE=http`, `SHOPFLOW_API_URL`,
`SHOPFLOW_API_KEY` and the site uses the real platform with no other code change.

---

## Conventions

| Topic | Rule |
|-------|------|
| Base URL | `SHOPFLOW_API_URL` (e.g. `https://api.shopflow.uz/v1`) |
| Auth | `Authorization: Bearer <SHOPFLOW_API_KEY>` on every request |
| Content type | `application/json` (request & response) |
| Locale | Every GET takes `?locale=` ∈ `uz` \| `ru` \| `en`. **The API returns text already resolved to that locale** (single strings, not multilingual objects). |
| Money | Integer amount of **Uzbek so'm (UZS)**. No decimals. e.g. `189000`. Field `currency` is always the literal `"UZS"`. |
| IDs & slugs | `id` is a stable internal id; `slug` is the URL-safe identifier used in product/category URLs and **must be stable** (changing it breaks SEO/links). |
| Images | Absolute HTTPS URLs. The image host must be allow-listed in `next.config.ts` (`uzum.uz` already is). |
| Errors | Non-2xx → the storefront treats the call as failed. Return a JSON body `{ "message": "..." }` where useful. |
| Caching | GET responses are cached and revalidated every 300s by the storefront. `POST /orders` is never cached. |
| Unknown locale/slug | `GET /products/{slug}` for a missing product should return **404** (storefront renders not-found). Lists return empty arrays, not 404. |

---

## Endpoints (6)

### 1. `GET /categories?locale={locale}`
Returns all product categories.

**Response:** `Category[]`

```jsonc
[
  {
    "id": "cat-omega",            // string, required
    "slug": "omega",              // string, required (URL)
    "name": "Omega va baliq yog‘i", // string, required (localized)
    "description": "Yurak...",    // string, optional (localized)
    "image": "https://.../x.jpg", // string, optional (absolute URL)
    "productCount": 1             // number, optional
  }
]
```

---

### 2. `GET /products`
List/search/filter products. **All query params except `locale` are optional.**

| Param | Type | Notes |
|-------|------|-------|
| `locale` | `uz\|ru\|en` | required |
| `category` | string | category **slug** |
| `search` | string | free-text (name/tagline) |
| `origin` | string | country of manufacture, must match `Product.origin` exactly (localized value) |
| `minPrice` | integer | UZS, inclusive |
| `maxPrice` | integer | UZS, inclusive |
| `sort` | `popular\|price_asc\|price_desc\|new` | default `popular` |
| `page` | integer | 1-based |
| `pageSize` | integer | storefront requests up to 100 for facet pools, 24 for grids |

**Response:** `ProductListResult`

```jsonc
{
  "items": [ /* Product[] — see §3 */ ],
  "total": 6,        // total matching BEFORE pagination
  "page": 1,
  "pageSize": 24
}
```

> Note: `origin`, `minPrice`, `maxPrice` filtering and `total` must reflect the
> applied filters. The storefront also derives the origin filter options from a
> `pageSize=100` (unfiltered-by-origin/price) call, so that call should return
> the full pool for the category.

---

### 3. `GET /products/{slug}?locale={locale}`
Single product by slug. **404 if not found.**

**Response:** `Product`

```jsonc
{
  "id": "p-omega3",                 // string, required
  "slug": "omega-3-premium",        // string, required (stable)
  "name": "Omega-3 Premium",        // string, required (localized)
  "tagline": "Yurak, miya...",      // string, required (localized, short)
  "description": "Omega-3 Premium...", // string, required (localized, long)
  "categoryId": "cat-omega",        // string, required
  "categorySlug": "omega",          // string, required
  "price": 189000,                  // integer UZS, required
  "oldPrice": 249000,               // integer UZS, optional (for discount %)
  "currency": "UZS",                // literal "UZS", required
  "rating": 4.9,                    // number, required (0–5)
  "reviewCount": 412,               // number, required
  "inStock": true,                  // boolean, required
  "images": [                       // array, required (≥1 recommended)
    { "url": "https://.../1.jpg", "alt": "Omega-3 Premium" }
  ],
  "highlights": [                   // string[], required (quick facts/chips)
    "1000 mg EPA+DHA", "Hidsiz"
  ],
  "benefits": [                     // array, required
    { "icon": "heart", "title": "Yurak sog‘lig‘i", "description": "..." }
    // icon: optional string key; title/description: required (localized)
  ],
  "ingredients": [                  // array, required
    { "name": "EPA", "amount": "660 mg", "dailyValue": "*" }
    // name/amount required (localized), dailyValue optional
  ],
  "howToUse": "Kuniga 1 kapsula...", // string, required (localized)
  "faq": [                          // array, required (may be empty)
    { "question": "...", "answer": "..." }  // both localized
  ],
  "reviews": [                      // array, required (may be empty)
    { "author": "Dilnoza A.", "rating": 5, "date": "2026-04-12", "text": "..." }
    // date: ISO date string (YYYY-MM-DD)
  ],
  "badges": ["Bestseller"],         // string[], required (may be empty, localized)
  "servings": "60 kapsula",         // string, optional (localized)
  "origin": "Shveytsariya",         // string, optional (localized country)
  "bespoke": true                   // boolean, required — informational only;
                                    // the storefront maps slugs to bespoke
                                    // designs internally regardless of this flag
}
```

---

### 4. `GET /products/{productId}/upsells?locale={locale}`
Cross-sell offers for a product ("frequently bought together / get a discount").
Note the path uses **`productId`** (the `Product.id`), not the slug.

**Response:** `UpsellOffer[]`

```jsonc
[
  {
    "product": { /* full Product object — see §3 */ },
    "discountPercent": 15,    // number, required (applied as a line discount)
    "reason": "Ko‘pincha shu bilan birga olishadi" // string, required (localized)
  }
]
```

---

### 5. `GET /promotions?locale={locale}`
Active cart-level promotions / bonuses (aksiya). Drive the cart's discount,
free-shipping progress bar and bonus logic.

**Response:** `Promotion[]`

```jsonc
[
  {
    "id": "promo-shipping",
    "type": "free_shipping_over",  // enum, required (see below)
    "title": "Bepul yetkazib berish",   // localized
    "description": "300 000 so‘mdan ortiq...", // localized
    "threshold": 300000,           // integer UZS — required for free_shipping_over
    "percent": 10                  // number — required for percent_off
  }
]
```

**`type` values and the field each needs:**
| type | meaning | extra field |
|------|---------|-------------|
| `free_shipping_over` | free delivery above a cart subtotal | `threshold` (UZS) |
| `percent_off` | % off the whole cart | `percent` |
| `buy_x_get_y` | buy 2 get the 3rd free (per identical line) | — |

> The storefront's pricing engine (`src/lib/cart/pricing.ts`) computes the cart
> total client-side from these. The operator/Shopflow remains the source of
> truth on confirmation — the cart total is a preview that mirrors this logic.

---

### 6. `POST /orders`
Submit an order request (**zayavka**). Operator calls the customer to confirm;
no online payment in this phase.

**Request body:** `OrderRequest`

```jsonc
{
  "customer": {
    "name": "Ism Familiya",        // required, min 2 chars
    "phone": "+998901234567"       // required, min 7 chars
  },
  "delivery": {
    "region": "Toshkent",          // required
    "address": "Ko‘cha, uy",       // required, min 3 chars
    "note": "...",                 // optional
    "method": "courier"            // "courier" | "pickup"
  },
  "items": [                       // required, ≥1
    {
      "productId": "p-omega3",
      "slug": "omega-3-premium",
      "name": "Omega-3 Premium",
      "quantity": 2,               // integer > 0
      "unitPrice": 189000          // integer UZS (price at time of order)
    }
  ],
  "appliedUpsells": ["p-d3k2"],    // product ids added via an upsell offer
  "appliedPromotions": ["promo-shipping"], // promotion ids applied
  "totals": {                      // storefront's computed preview (UZS)
    "subtotal": 378000,
    "discount": 28350,
    "shipping": 0,
    "total": 349650
  },
  "locale": "uz",                  // uz | ru | en
  "attribution": {                 // optional — for ad/UTM reporting
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "omega_uz",
    "landing": "/uz/lp/omega",
    "referrer": "https://google.com"
  }
}
```

**Response:** `OrderResult`

```jsonc
{
  "ok": true,            // boolean, required
  "orderId": "SF-10421", // string, required when ok=true (shown to customer)
  "message": "..."       // optional (used as error text when ok=false)
}
```

On validation/processing failure return `{ "ok": false, "message": "..." }`
(HTTP 200 or 4xx both handled).

---

## Summary checklist for the Shopflow team

- [ ] `GET /categories`
- [ ] `GET /products` (+ filters: category, search, origin, minPrice, maxPrice, sort, page, pageSize)
- [ ] `GET /products/{slug}` (404 on missing)
- [ ] `GET /products/{productId}/upsells`
- [ ] `GET /promotions`
- [ ] `POST /orders`
- [ ] Bearer-token auth
- [ ] Per-`locale` resolved text (uz/ru/en)
- [ ] Prices as integer UZS; stable slugs; absolute HTTPS image URLs

Once available, send us `SHOPFLOW_API_URL` + `SHOPFLOW_API_KEY` and a couple of
sample responses; wiring is a change to `src/lib/shopflow/http.ts` only.
