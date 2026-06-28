# Alimkhanov Pharm — Storefront

Next.js 15 App Router e-commerce sayt. Vitaminlar va sog'liqni saqlash mahsulotlari, O'zbekiston bozori.

## Loyiha haqida

- **Stack**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Zustand, next-intl, Zod, react-hook-form
- **Tillar**: `uz` (default), `ru`, `en` — barcha content tarjima qilingan
- **Backend**: Shopflow (`SHOPFLOW_MODE=mock` — mock data; `SHOPFLOW_MODE=http` — real API)
- **Deploy**: Vercel

## Muhim buyruqlar

```bash
npm run dev      # development server
npm run build    # production build (TypeScript + ESLint tekshiradi)
npm run lint     # ESLint
```

Build har doim `npm run build` orqali tekshirilsin — `npx next build` boshqa Next.js versiyasini yuklab olishi mumkin.

## Arxitektura

### Routing
```
src/app/[locale]/          # barcha sahifalar locale prefix bilan
  page.tsx                 # bosh sahifa
  products/page.tsx        # mahsulotlar katalogi (filter, sort, pagination)
  products/[category]/     # kategoriya sahifasi
  product/[slug]/          # mahsulot detail sahifasi
  checkout/page.tsx        # buyurtma berish
  checkout/success/        # muvaffaqiyatli buyurtma
  cart/page.tsx            # savatcha sahifasi
  blog/                    # blog
  experts/                 # ekspertlar
  lp/[campaign]/           # landing pages (kampaniyalar)
```

### Lib katalogi (`src/lib/`)

| Papka | Vazifa |
|---|---|
| `shopflow/` | Backend klient (mock/http), types, schemas, Zod validation |
| `cart/` | Zustand store (localStorage TTL 30 kun), pricing (discount, shipping, upsell) |
| `upsell/` | Savings Ladder algoritmi, Zustand upsell store |
| `personalization/` | Viewtracker, recency-decay engine, recommendation scoring |
| `wishlist/` | Zustand persist store (`alimkhanov-wishlist`) |
| `analytics/` | GTM dataLayer, Meta Pixel, Yandex Metrika events |
| `i18n/` | next-intl routing, navigation helpers |
| `seo/` | Metadata builder, JSON-LD (WebSite, LocalBusiness, Product, FAQ, Breadcrumb) |
| `content/` | Blog, ekspertlar, ingredientlar — static content |
| `ui/` | Toast Zustand store |

### Components katalogi (`src/components/`)

| Papka | Asosiy komponentlar |
|---|---|
| `layout/` | Header, Footer, CookieConsent |
| `nav/` | MobileBottomNav (4 tab, cart badge, md:hidden) |
| `cart/` | CartDrawer (Framer Motion slide-in) |
| `product/` | ProductCard, ProductTemplate, BuyBox, ProductGallery, WishlistButton, ShareButton, OutOfStockNotify |
| `shop/` | ShopView (server), FilterBar, Pagination |
| `checkout/` | CheckoutForm (react-hook-form + Zod) |
| `upsell/` | UpsellLadderModal (step-by-step, free gift), UpsellSavingsBar |
| `personalization/` | ViewTracker, PurchaseTracker, PersonalizedRail, RecentlyViewed, SimilarProducts |
| `social-proof/` | LivePurchaseToast (har 35s, Framer Motion) |
| `exit-intent/` | ExitIntentPopup (mouseleave + visibilitychange, sessionStorage once) |
| `pwa/` | ServiceWorkerRegistration |
| `ui/` | Button, Badge, Skeleton, ProductGridSkeleton, CountdownTimer, Price, StarRating, ScrollProgress, BackToTop |
| `analytics/` | Analytics (GTM Script) |

## State Management

### Cart Store (`alimkhanov-cart`)
```typescript
// src/lib/cart/store.ts
useCart() → { lines, isOpen, add, remove, setQuantity, clear, open, close, toggle }
// _savedAt: 30 kunlik TTL, merge paytida tekshiriladi
```

### Upsell Store
```typescript
// src/lib/upsell/store.ts
useUpsell() → { steps, currentStep, isOpen, cumulativeSavings, shown, openLadder, nextStep, skipStep, closeLadder }
```

### Wishlist Store (`alimkhanov-wishlist`)
```typescript
// src/lib/wishlist/store.ts
useWishlist() → { items, toggle, has }
```

## Shopflow Backend

```typescript
// src/lib/shopflow/index.ts
shopflow.getProducts(params)     // list, filter, sort, pagination
shopflow.getProduct(slug, locale)
shopflow.getCategories(locale)
shopflow.getUpsells(productId, locale)
shopflow.getPromotions(locale)
shopflow.createOrder(payload)
```

**Real API-ga o'tish:**
```env
SHOPFLOW_MODE=http
SHOPFLOW_API_URL=https://api.shopflow.uz
SHOPFLOW_API_KEY=your_key
```

## Tarjimalar

```
src/messages/uz.json   # default til
src/messages/ru.json
src/messages/en.json
```

**Namespace-lar:** `nav`, `common`, `home`, `product`, `cart`, `checkout`, `shop`, `upsell`, `exit`, `outOfStock`, `wishlist`, `socialProof`, `countdown`, `meta`, `blog`, `contact`, `legal`, `upsell`

## SEO

- **JSON-LD**: WebSite (SearchAction), LocalBusiness (PharmacyOrDrugstore), Product, FAQ, BreadcrumbList — `src/lib/seo/jsonld.tsx`
- **Sitemap**: reyting ≥4.5 → priority 0.9; boshqalar 0.8; kategoriyalar 0.7 — `src/app/sitemap.ts`
- **hreflang**: next-intl orqali avtomatik
- **robots.txt**: `/cart`, `/checkout` — noindex

## Analytics

```typescript
// src/lib/analytics/events.ts
trackViewProduct(slug, price)
trackAddToCart(slug, price, quantity)
trackBeginCheckout(value)
trackLead(orderId, value)
trackUpsellView(step, total, productId)
trackUpsellAccept(step, productId, savedAmount)
trackUpsellSkip(step, productId)
track(event, payload)   // generic GTM push
getAttribution()        // UTM params
```

GTM ID: `NEXT_PUBLIC_GTM_ID`

## Checkout va Buyurtmalar

**Server Action** (`src/app/[locale]/checkout/actions.ts`):
- Zod validation (server-side)
- Rate limiting: 10 ta / IP / 10 daqiqa
- Shopflow `createOrder()` chaqiradi
- Muvaffaqiyatli buyurtmadan keyin Telegram-ga xabar yuboradi

**Telegram sozlash:**
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## PWA

- `public/manifest.json` — name, icons (192/512), theme `#0ea5e9`, display `standalone`
- `public/sw.js` — cache-first static, network-first API/data
- `public/icons/icon-192.png`, `icon-512.png`
- `ServiceWorkerRegistration` — layout-da, faqat client-side

## Security

`next.config.ts` headers:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Upsell Savings Ladder

```
src/lib/upsell/ladder.ts — buildUpsellLadder(cartLines, allProducts)
```

**Algoritm:**
1. Step 1 — cart subtotal × 30–90% narxdagi mahsulot, **−10%**
2. Step 2 — boshqa kategoriyadan, **−15%**
3. Step 3 — narx ≤ saved₁+saved₂ bo'lsa → **BEPUL 🎁**, aks holda eng arzon mahsulot **−20%**

Modal: bir vaqtda bitta taklif. Faqat birinchi `add()` da ochiladi.

## Personalizatsiya

```
src/lib/personalization/tracker.ts — trackView(), trackPurchase()
src/lib/personalization/engine.ts  — scoreProduct(), getRecommendations(), getSimilarProducts()
```

- `alimkhanov-user` localStorage kaliti
- Recency decay: `weight = Math.exp(-0.05 * hoursAgo)`
- Content-based filtering: category + ingredient affinity

## Environment Variables

```env
# Majburiy (production)
NEXT_PUBLIC_SITE_URL=https://alimkhanov.uz

# Analytics (ixtiyoriy)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=xxxxxxxxxx
NEXT_PUBLIC_YANDEX_METRIKA_ID=xxxxxxxx

# Backend (real API uchun)
SHOPFLOW_MODE=http
SHOPFLOW_API_URL=https://api.shopflow.uz
SHOPFLOW_API_KEY=your_key

# Telegram bot (buyurtma xabarlari)
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
```

## Ishlab chiqish qoidalari

- Barcha yangi komponentlar TypeScript strict mode bilan yoziladi
- `"use client"` faqat kerak bo'lganda — default server component
- Stil: Tailwind utility classes, `cn()` helper (`src/lib/utils.ts`)
- i18n: `useTranslations()` client-da, `getTranslations()` server-da
- Rasm: `next/image` bilan, `fill` + `sizes` prop majburiy
- Cart, wishlist, upsell — Zustand persist (localStorage)
- Server actions — `"use server"` + Zod validation + try/catch
- Komment yozmaslik (obvious bo'lmasa) — kod o'zi gapirsin
- Build tekshirish: `npm run build` — 0 xatolik
