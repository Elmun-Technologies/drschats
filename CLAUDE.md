# Go Vita — Storefront

Next.js 15 App Router sayt. Vitaminlar, BAD va med-kosmetika, O'zbekiston bozori.

Oddiy internet-magazin emas: navigatsiya mahsulotlarga emas, foydalanuvchining
sog'liq maqsadlariga quriladi (`/goals`, `/symptoms`, `/vitamins`, `/quiz`), va
katalog o'sha yo'lning oxirida turadi.

## Loyiha haqida

- **Stack**: Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion, Zustand, next-intl, Zod, react-hook-form
- **Tillar**: `uz` (default) va `ru`. **`en` yo'q** — `locales = ["ru", "uz"]` (`src/lib/i18n/routing.ts`), `src/messages/` ichida faqat shu ikkitasi
- **Katalog backend**: Shopflow adapteri (`SHOPFLOW_MODE=mock` — mock data; `SHOPFLOW_MODE=http` — real API)
- **Akkaunt backend**: `backend/` — FastAPI + SQLAlchemy + Alembic (auth, orders). **Deploy qilinmagan**; `NEXT_PUBLIC_API_URL` bo'sh bo'lsa `/account` `notFound()` qaytaradi va header'da havola chizilmaydi. Demo kabinet kerak bo'lsa `NEXT_PUBLIC_ACCOUNT_DEMO=on` (`src/lib/config/demo.ts`)
- **CMS**: Sanity — sxemalar `src/sanity/schemas/` da tayyor, ma'lumot kiritilmagan, shuning uchun sayt i18n fallback'idan o'qiydi. `/studio` production'da **yopiq** (`SANITY_STUDIO_ENABLED=on` + haqiqiy project id talab qilinadi; `src/app/studio/layout.tsx`)
- **Deploy**: Vercel

## Hozirgi bo'shliqlar

Kod emas, kontent va konfiguratsiya bo'shliqlari. To'liq ro'yxat va har birining
qadamlari: **[`docs/QOLGAN-ISHLAR.md`](docs/QOLGAN-ISHLAR.md)**.

Qisqacha (ishlab turgan saytdan sanaldi): `/vitamins` **10**, `/symptoms` **7**,
`/goals` **10** mavzu; `/programs` 7, `/blog` 3, `/experts` 3, `/ingredients` 12,
`/where-to-buy` 11 ta dorixona tarmog'i. Mahsulot rasmlari **haqiqiy** — 129 ta
fayl `public/products/` da. `BRAND.contact` va `BRAND.social` Go Vita
manzillariga o'tkazilgan.

Hali bo'sh: `/reviews` (halol bo'sh holat ko'rsatadi — o'ylab topilgan sharh
yo'q), `BRAND.logo` (matnli wordmark chiziladi) va `BRAND.legal.licence`
("yangilanmoqda" qatori chiziladi). Ikkalasi ham atayin: o'ylab topilgan
litsenziya raqami yo'q raqamdan yomon.

Uchta qoida shu bo'shliqlardan kelib chiqadi va kodda yozilgan. Uchalasining
umumiy tamoyili: **o'ylab topilgan ma'lumot default'da ko'rinmaydi** — uni
ko'rsatish uchun bayroqni atayin yoqish kerak.

- **Bo'sh bo'lim menyuda ko'rinmaydi** (`src/lib/content/nav-sections.ts`).
  Header, mobil menyu, footer, katalog paneli va sitemap bitta manbadan o'qiydi;
  birinchi mavzu yozilishi bilan bo'lim o'zi qaytadi.
- **Namuna sharh/reyting/"sotib oldi" xabarlari default'da chiqmaydi**
  (`src/lib/content/sample-social-proof.ts`). Yoqish uchun
  `NEXT_PUBLIC_SAMPLE_SOCIAL_PROOF=on`. Filtr mock katalogda turadi, shuning
  uchun Sanity va real API'dan kelgan haqiqiy sharhlar undan o'tmaydi.
- **Demo akkaunt kabineti default'da yo'q** (`src/lib/config/demo.ts`).
  `NEXT_PUBLIC_API_URL` bo'sh va `NEXT_PUBLIC_ACCOUNT_DEMO=on` yo'q bo'lsa
  `/account` `notFound()` qaytaradi. Mock kabinet istalgan telefon va istalgan
  kodni qabul qilib, birovning buyurtmalarini ko'rsatadi — demo uchun yaxshi,
  ishlayotgan do'kon uchun yolg'on. Havola va marshrut **bitta** predikatni
  o'qiydi (`accountAreaAvailable`), shuning uchun havola hech qachon 404 ga
  olib bormaydi.

## Muhim buyruqlar

```bash
npm run dev         # development server
npm run build       # production build (TypeScript + ESLint tekshiradi)
npm run lint        # eslint . (flat config: eslint.config.mjs)
npm test            # unit testlar (vitest)
npm run audit       # render sifati auditi — production build kerak
npm run audit:deps  # dependency auditi (baseline bilan)
```

Build har doim `npm run build` orqali tekshirilsin — `npx next build` boshqa Next.js versiyasini yuklab olishi mumkin.

**Lint `next lint` emas, `eslint .`.** `next lint` Next 16 da olib tashlanadi va
15.5.27 da ham har ishga tushishda migratsiya xabarini chop etardi. Konfiguratsiya
ESLint 9 flat config (`eslint.config.mjs`); `eslint-config-next` hali faqat
eslintrc shaklida chiqadi, shuning uchun `FlatCompat` ko'prigi ishlatiladi va
faqat `next/core-web-vitals` extends qilinadi — `.eslintrc.json` dagidek,
qoidalar to'plami o'zgarmagan.

Qamrov **kengaygan**: `next lint` faqat `/src`, `/app`, `/pages`, `/components`,
`/lib` ni ko'rardi; ESLint CLI ignore qilinmagan hammani ko'radi, ya'ni
`scripts/` (audit harness va dep ratchet) va ildizdagi konfiguratsiyalar ham
endi lint qilinadi. Yangi fayl qo'shganda buni hisobga oling.

`eslint.config.mjs` `@eslint/eslintrc` ni import qiladi — u `devDependencies`
da **ochiq e'lon qilingan**. U faqat `eslint` orqali keladigan bo'lsa (phantom
dependency), ESLint yangilanishi lint'ni va CI'ni sindirishi mumkin edi.

## Arxitektura

### Routing
```
src/app/[locale]/          # barcha sahifalar locale prefix bilan
  page.tsx                 # bosh sahifa
  quiz/                    # AI konsultant (savol → tavsiya), quiz/result/
  goals/ symptoms/ vitamins/   # sog'liq mavzulari — [slug] bilan
  programs/                # 30 kunlik dasturlar, [slug] bilan
  products/page.tsx        # mahsulotlar katalogi (filter, sort, pagination)
  products/[category]/     # kategoriya sahifasi
  product/[slug]/          # mahsulot detail sahifasi
  cart/ checkout/          # savatcha, buyurtma, checkout/success/
  account/                 # kabinet — API sozlanmagan bo'lsa notFound()
  profile/                 # sog'liq profili — API'siz ham ishlaydi (brauzerda)
  email/preferences/       # obuna sozlamalari (xatdagi havolalar shu yerga tushadi)
  blog/ news/ experts/ brands/ ingredients/ reviews/ loyalty/
  lp/[campaign]/           # landing pages (kampaniyalar)
  [...rest]/               # catch-all → lokalizatsiyalangan 404
  not-found.tsx error.tsx
```

`app/layout.tsx` — passthrough; haqiqiy `<html lang>` `[locale]/layout.tsx` da.
`loading.tsx` **qo'shmang**: Suspense chegarasi status'ni `notFound()` dan oldin
yuboradi va soft-404 hosil qiladi. Bu qoida bir marta buzildi va
`/uz/products/<istalgan-narsa>` 200 qaytara boshladi; endi
`scripts/audit/checks/soft404.mjs` har bir PR'da tekshiradi va buzilsa CI
yiqiladi. Skeleton kerak bo'lsa — uni sahifaning o'zida, `notFound()`
chaqirilgandan **keyin** chizing.

### Lib katalogi (`src/lib/`)

| Papka | Vazifa |
|---|---|
| `shopflow/` | Backend klient (mock/http), types, schemas, Zod validation |
| `cart/` | Zustand store (localStorage TTL 30 kun), pricing (discount, shipping, upsell) |
| `upsell/` | Savings Ladder algoritmi, Zustand upsell store |
| `personalization/` | Viewtracker, recency-decay engine, recommendation scoring, katalogni sog'liq signallariga solishtirish |
| `profile/` | Sog'liq profili — foydalanuvchi o'zi kiritgan ma'lumot, eslatma qoidalari |
| `email/` | Provayder, imzolangan havolalar, kampaniya matnlari (uz + ru) |
| `subscription/` | Subscribe & Save shartlari — oraliqlar, chegirmalar |
| `marketing/` | Backend'ning navbatiga server-to-server klient |
| `notifications/` | Telegram — operator va mijoz kanallari |
| `wishlist/` | Zustand persist store (`govita-wishlist`) |
| `analytics/` | GTM dataLayer, Meta Pixel, Yandex Metrika events |
| `i18n/` | next-intl routing, navigation helpers |
| `seo/` | Metadata builder, JSON-LD (WebSite, LocalBusiness, Product, FAQ, Breadcrumb) |
| `content/` | Blog, ekspertlar, ingredientlar — static content. **Ekspert kengashi atayin bo'sh**: `/experts` dagi 3 ta profil `demo` belgili va `reviewerForKey()` ularni hech qachon tibbiy tekshiruvchi qaytarmaydi, shuning uchun `MedicalWebPage` JSON-LD `reviewedBy`/`author` ni umuman chiqarmaydi. Haqiqiy ekspert qo'shilganda ikkalasi o'zi paydo bo'ladi (`docs/QOLGAN-ISHLAR.md` §2) |
| `ui/` | Toast Zustand store |

### Components katalogi (`src/components/`)

| Papka | Asosiy komponentlar |
|---|---|
| `layout/` | Header (desktop + mobil, V3), CatalogMenu (mega-menyu), TopBar (utility qator), SearchBox, Footer (+ FooterAccordion), CookieConsent. Umumiy havolalar `nav-links.ts` da — server komponent `"use client"` moduldan konstanta ololmaydi |
| `nav/` | MobileBottomNav — 5 tab (V3 TabBar), `lg:hidden`; "Katalog" tabi katalog ekranini (dialog) ochadi, "Savat" — drawer |
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

Barcha localStorage kalitlari `src/lib/storage-keys.ts` da. Rebrendda
`alimkhanov-*` → `govita-*` o'zgardi; eski qiymatlar birinchi yuklashda
ko'chiriladi, aks holda qaytgan mijozning savatchasi bo'shab qolardi.
Migratsiya test qilingan (`src/lib/storage-keys.test.ts`).

### Cart Store (`govita-cart`)
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

### Wishlist Store (`govita-wishlist`)
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
```

**`en.json` yo'q** — sayt ikki tilli (`locales = ["ru", "uz"]`). Ikkala faylda
ham 953 ta kalit va ular teng: bitta tarjima qo'shilsa, ikkinchisiga ham
qo'shiladi.

**Namespace-lar** (38 ta, ikkala faylda bir xil): `about`, `account`, `badges`, `blog`, `cart`, `categoryNames`, `checkout`, `common`, `contact`, `cookie`, `countdown`, `delivery`, `emailPreferences`, `exit`, `experts`, `footer`, `header`, `health`, `home`, `ingredients_page`, `legal`, `loyalty`, `meta`, `nav`, `outOfStock`, `pages`, `privacy`, `product`, `profile`, `programs`, `quiz`, `reviews`, `shop`, `socialProof`, `subscription`, `topbar`, `upsell`, `wishlist`

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

`next.config.ts` headers (barcha marshrutlarga, `/studio` bundan mustasno):
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains` — `preload`
  atayin yo'q: u amalda qaytarib bo'lmaydigan va domen qaroriga tegishli
- `Content-Security-Policy` (yoki `-Report-Only`) — `src/lib/security/csp.ts`
  tomonidan **hisoblanadi**, pastda

**CSP qotirilgan ro'yxat emas.** Har bir uchinchi tomon origin'i uni kerak
qiladigan integratsiya yoqilgan bo'lsagina paydo bo'ladi: analytics host'i faqat
o'z ID'si (`NEXT_PUBLIC_GTM_ID` va h.k.) o'rnatilganda, API origin'i faqat
`NEXT_PUBLIC_API_URL` bo'lsa. Shuning uchun **yangi teg qo'shganda CSP'ni qo'lda
yangilash shart emas** — ID'ni o'rnatishning o'zi siyosatni ham kengaytiradi.
Aksincha, ID'ni o'chirish origin'ni siyosatdan ham olib tashlaydi.

Rasm hostlari `images.remotePatterns` bilan bitta ro'yxatdan (`REMOTE_IMAGE_HOSTS`)
olinadi, shuning uchun optimizator va `img-src` zid kela olmaydi. `csp.test.ts`
buni drift ga qarshi ushlab turadi: `next.config.ts` da `hostname: "` literal
qayta paydo bo'lsa, test qizil bo'ladi.

`CSP_MODE` — `report-only` (sukut) | `enforce` | `off`. **Build paytida
o'qiladi**: `headers()` build vaqtida yechilib routes manifest'iga yoziladi,
shuning uchun ishlayotgan serverda o'zgartirish qayta build'gacha hech narsa
qilmaydi. `src/instrumentation.ts` boot'da build rejimini runtime rejimi bilan
taqqoslaydi va farq qilsa ogohlantiradi — ko'rinadigan lekin ishlamaydigan
o'zgaruvchi bo'lmasligi uchun. Vercel har deploy'da qayta build qiladi, shuning
uchun u yerda bu muammo emas.

Siyosat `'unsafe-inline'` talab qiladi (sahifada 1000+ inline RSC skripti va
400+ inline `style=` bor), ya'ni **u ichkariga kiritilgan inline skriptni
to'xtatmaydi** — faqat boshqa joydan yuklanadigan skriptni, clickjacking'ni,
`<base>` hijack'ni, plaginlarni va forma ma'lumotini tashqariga chiqarishni.
`enforce` ga o'tishdan oldin haqiqiy analytics teglari bilan bir necha kun
DevTools konsolini kuzatish kerak: GTM/Pixel/Metrika o'z resurslarini runtime'da
o'zi yuklaydi va ularni build'dan sanab bo'lmaydi.

`/studio` header ro'yxatidan chetlatilgan, chunki Studio o'z frame'lari bilan
ishlaydi. Shu sababli u production'da **umuman xizmat qilmaydi** —
`src/app/studio/layout.tsx` `SANITY_STUDIO_ENABLED=on` va haqiqiy
`NEXT_PUBLIC_SANITY_PROJECT_ID` bo'lmasa `notFound()` qaytaradi. Development'da
har doim ochiq. `@sanity/vision` (GROQ konsoli) production konfiguratsiyasida
ro'yxatdan o'tkazilmaydi (`sanity.config.ts`).

**Shaxsiy ma'lumotlar log'ga yozilmaydi.** Telefon va email manzili
`src/lib/privacy.ts` dagi `redactPhone` / `redactEmail` orqali o'tadi. Server
log'i so'rovdan uzoq yashaydi va uchinchi tomon panelida turadi — mijoz
aloqa ma'lumotini saqlash uchun joy emas. Backend'dagi yagona istisno
`OTP_DEBUG_ECHO` — `main.py` uni production'da rad etadi.

**Dependency holati:** `npm run audit:deps` CI'da yuradi. Hozir tuzatishga
mumkin bo'lgan high/critical **0 ta**. Qolgan 19 tasi `sanity` 3.x zanjiriga
teginadi (yagona tuzatish — `sanity@6` major migratsiyasi) va
`scripts/audit/deps.mjs` dagi baseline'da sababi bilan yozilgan. Baseline
**faqat bir tomonga** ishlaydi: qator eskirsa (paket tuzatilsa yoki daraxtdan
chiqsa) audit yiqiladi va qatorni o'chirishni talab qiladi.

Backend xavfsizligi `backend/app/` da: OTP kodi HMAC bilan va telefon bilan
tuzilgan holda saqlanadi (`app/otp.py`), `hmac.compare_digest` — constant-time,
`main.py` esa production'da uchta narsani **boot paytida** tekshiradi:
`JWT_SECRET` placeholder bo'lmasligi, `OTP_DEBUG_ECHO` yopiqligi va
`OTP_HMAC_KEY` o'rnatilgan hamda kamida 32 bayt ekanligi.

**OTP kaliti JWT kalitidan ajratilgan.** `JWT_SECRET` 30 kun yashaydigan token'ni
imzalaydi, `OTP_HMAC_KEY` esa 5 daqiqada o'ladigan kodni kalitlaydi — bitta
kalit sizsa ikkala tizim ham zararlanadi, va `JWT_SECRET` har bir autentifikatsiya
so'rovida ishlatilgani uchun u "eng uzoqqa sayohat qiladigan" kalit. Development'da
`OTP_HMAC_KEY` bo'sh qoldirilsa, kalit `JWT_SECRET` dan domen ajratish belgisi
ostida keltirib chiqariladi (`docker compose up` konfiguratsiyasiz ishlashi uchun).
Keltirib chiqarish ikki kalitning **qiymatini** ajratadi, lekin **taqdirini** emas:
`JWT_SECRET` ni bilgan odam keltirilgan kalitni ham hisoblay oladi. Shuning uchun
production'da bu fallback rad etiladi. Batafsil: `backend/README.md`.

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

- `govita-user` localStorage kaliti
- Recency decay: `weight = Math.exp(-0.05 * hoursAgo)`
- Content-based filtering: category + ingredient affinity

**Ikkinchi profil — `src/lib/profile/`** (`govita-profile`). Bu foydalanuvchi
**o'zi aytgan** ma'lumot: ism, tug'ilgan kun, oila a'zolari, maqsadlar, kanal
ruxsatlari. Ikkalasi atayin ajratilgan — birinchisi klikdan kelib chiqadi va
hech qachon ko'rsatilmaydi, ikkinchisi `/profile` da to'liq ko'rinadi va
o'chiriladi.

Maqsadlar → mahsulot moslashuvi bitta joyda: `personalization/catalogue.ts`.
Uni ham quiz, ham profil ishlatadi, shuning uchun "nega bu mahsulot" javobi
har doim aniq ingredient yoki mavzu nomiga tayanadi.

## Email va eslatmalar

To'liq hujjat: **[`docs/MARKETING.md`](docs/MARKETING.md)**.

- Matnlar: `src/lib/email/campaigns.ts` (uz + ru, bitta faylda — cron'da
  next-intl konteksti yo'q)
- Eslatma qoidalari: `src/lib/profile/reminders.ts` — sof funksiyalar, `now`
  argument sifatida. Panel, email va Telegram **bir xil qoidani** o'qiydi
- `RESEND_API_KEY` bo'lmasa `sendCampaign` log yozadi va davom etadi — checkout
  hech qachon pochta tufayli sinmaydi
- Marketing xatida har doim obunani bekor qilish havolasi bor, tranzaksionda —
  yo'q

## Obuna (Subscribe & Save)

```
src/lib/subscription/plans.ts — oraliqlar, chegirmalar, bepul yetkazish chegarasi
```

Birinchi buyurtmada −10%, keyingi yetkazishlarda −15%. Takrorlanadigan narx
mahsulot sahifasidayoq ko'rsatiladi. `CartLine.subscription` → checkout →
backend'da `subscriptions` jadvali. Boshqaruv `/account` da: to'xtatish,
o'tkazib yuborish, oraliqni o'zgartirish, bekor qilish.

## Environment Variables

```env
# Majburiy (production)
NEXT_PUBLIC_SITE_URL=https://www.govita.uz

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
# Mijozning o'z Telegram kanali (bo'lmasa /profile da bu kanal ko'rsatilmaydi)
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=govita_bot

# Email (bittasi butun dasturni yoqadi)
RESEND_API_KEY=re_...
EMAIL_FROM=Go Vita <no-reply@govita.uz>
EMAIL_REPLY_TO=info@govita.uz
EMAIL_TOKEN_SECRET=...        # production'da majburiy — bo'lmasa kod ishga tushmaydi

# Eslatmalar cron'i
CRON_SECRET=...               # bo'lmasa endpoint yopiq turadi
MARKETING_API_KEY=...         # backend'da ham xuddi shu qiymat

# Namuna ijtimoiy-isbot (default: o'chiq)
NEXT_PUBLIC_SAMPLE_SOCIAL_PROOF=on   # faqat demo deploy uchun

# Demo akkaunt kabineti (default: o'chiq)
NEXT_PUBLIC_ACCOUNT_DEMO=on          # faqat demo deploy uchun

# Sanity Studio (production'da default: yopiq)
SANITY_STUDIO_ENABLED=on             # + haqiqiy NEXT_PUBLIC_SANITY_PROJECT_ID kerak
```

## Dizayn tizimi (GoVita V3 — 2026-10)

UI `design/` dagi yakuniy dizaynga bosqichma-bosqich koʻchirilmoqda. Bosqichlar:
`design/TASKS.md`; holat va qarorlar: [`docs/DIZAYN-V3-REJA.md`](docs/DIZAYN-V3-REJA.md).
**Bosqichlar faqat foydalanuvchi aytganda, bittadan.** Biznes-logika (store'lar,
i18n kalitlari, checkout oqimi, SEO/JSON-LD, analytics) oʻzgarmaydi — faqat
koʻrinish qatlami.

**Har UI ishining tartibi:**
1. Oldin `design/pages/<Sahifa>.html` va `design/screenshots/<Sahifa>.jpg` ni oʻqing.
2. Oxirida Playwright bilan 1440 va 390 kenglikda skrinshot olib, dizayn
   skrinshoti bilan solishtiring va farqlarni roʻyxat qiling.
3. Dizayn audit nolini buzsa (kontrast, tap-target, fokus…) — audit yutadi va
   farq foydalanuvchiga aytiladi.

**`legacy-*` tokenlar.** Dizayndagi `ink`, `line`, `line-strong`, `muted`, `gold`,
`shadow-pop` nomlari eski tokenlarda boshqa maʼnoda band edi (eski `ink` — och
sahifa foni, yangisi — deyarli qora). Eski tokenlar `legacy-*` ga mexanik
koʻchirildi (koʻrinish oʻzgarmadi — kompilyatsiya qilingan CSS solishtirildi),
yangilari ayni nomni oldi. **Yangi kodda `legacy-*` ishlatilmaydi**; 12-bosqich
oxirida `grep -r legacy- src` boʻsh boʻlishi va eski `@theme` bloki oʻchishi kerak.

**Breakpoint:** desktop header va footer ustunlari `lg` (1024px) dan; undan
pastda mobil header + tab bar. `--bottom-nav` ham 1023.98px gacha nolmas.
Faqat desktop header sticky — telefonda tab bar doim ko'rinadi.

**Yopiq akkordeon kontentini chizmang** (`<details>` emas). Chrome yopiq
`details` ichidagi havolalarni `content-visibility: hidden` bilan joylashtirib
qo'yadi va bottom-edge/tap-target auditi ko'rinmaydigan havolalarni sanaydi
(`FooterAccordion` shu sabab client komponent).

**Global `border-color` `@layer base` ichida.** U layer'siz turganda har qanday
`border-*` rang utility'sini bosib ketardi (layer'siz qoida har doim yutadi).

`design/` Tailwind skaneridan (`@source not`) va ESLint'dan chiqarilgan — u
maʼlumot, kod emas.

**Kesma rasmlar:** `public/images/products/c-*.png`, slug → fayl
`src/lib/content/product-cutouts.ts` da (test fayllar mavjudligini tekshiradi).
Stok foto: `public/images/stock/st-*`.

Manba: `design/` papkasi. Har bir UI ishi oldidan tegishli `design/pages/<Sahifa>.html` va `design/screenshots/<Sahifa>.jpg` ni oʻqing. Dizayndan chetga chiqish faqat kelishilgan holda.

### Qatʼiy qoidalar
- **Yashil rang yoʻq.** Asosiy harakat — `ink` (#17191B) tugma, oq matn. Brend ranglari `forest` (#0F2D24) va `gold` (#B8954F) faqat logoda.
- **Qizil (#C8161D)** faqat chegirma uchun (pill badge «−11%», «Aksiyalar» havolasi). **Sariq (#FFD43B)** faqat «Xit» / «Arzon narx kafolati».
- **Faqat real maʼlumot.** Taymer, toʻqima sharh/reyting, «N kishi sotib oldi», oʻylab topilgan eski narx — yoʻq. Sharh boʻlmasa: «Hali sharh yoʻq» + «Sharh yozish».
- **AI-generatsiya rasm ishlatilmaydi.** Mahsulot — haqiqiy packshotning fonidan ajratilgan PNG (`c-*.png`), `tile` (#F1F3F0) fonida `object-fit: contain`. Lifestyle — litsenziyali stok foto.
- **BAD ogohlantirishi** mahsulot, test va maqola sahifalarida: «Biologik faol qoʻshimcha. Dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing.»
- **Tibbiy vaʼda yoʻq:** «davolaydi», «stressni kamaytiradi», «100% natija» kabi soʻzlar ishlatilmaydi.
- **Oʻzbek apostrofi** — `ʻ` (U+02BB): oʻ, gʻ, soʻm. Oddiy `'` emas.
- **Narx formati:** `79 000 soʻm` (minglik boʻsh joy bilan). Birlik narxi kartada: `3 950 soʻm / tabletka`.

### Tokenlar (`design/tokens.json` → `src/styles/globals.css` ikkinchi `@theme` bloki)
- Ranglar: `bg #FFFFFF`, `tile #F1F3F0`, `tile-hover #E6E8E5`, `chip-strong #E3E6E9`, `line #E4E6E8`, `line-strong #D9DCDF`, `ink #17191B`, `ink-2 #44494E`, `muted #63686E`, `dark-panel #1C1F22`, `on-dark-2 #C9CDD1`, `red #C8161D`, `yellow #FFD43B`, `yellow-banner #FFE58A`, `forest #0F2D24`, `gold #B8954F`.
- Shrift: **Onest** 400/500/600/700 (`next/font/google`, `latin` + `cyrillic`) → `font-onest`. Logo — Playfair Display 500 → `font-logo`. Ikkalasi `src/styles/fonts.ts` da; `preload: false` — 1-bosqichda `--font-sans` Onest'ga oʻtganda yoqiladi.
- Radius: badge `9999px`, tugma/input/chip `12px`, mahsulot rasmi `16px`, karta/panel `20px`, plitka/banner `24–28px`.
- Soya: faqat strelka tugmalari, xarid bloki va popoverlarda (`tokens.json` → `shadow`).
- Konteyner: `max-width: 1296px; padding: 0 24px`. Mobil gutter 16px.

### Tipografiya (desktop / mobil)
- Sahifa sarlavhasi 36/42 bold · mobil 28/34.
- Boʻlim sarlavhasi 30/36 bold · mobil 22/28.
- Asosiy matn 15–17px, `ink-2`. Meta 13–14px, `muted`.
- Narx: kartada 20px bold, PDP'da 34px bold.

### Komponentlar (dizayn fayli → React)
| Dizayn | React komponenti | Eslatma |
|---|---|---|
| `HeaderV3` | `Header` | utility qator + logo + qora «Katalog» + qidiruv + ikonlar + kategoriya qatori; `active`, `cartCount` props |
| `HeaderMobileV3` | `MobileHeader` | logo, shahar, til, telefon, qidiruv maydoni (bosilganda qidiruv ekrani) |
| `TabBarV3` | `MobileTabBar` | `position: fixed; bottom: 0` + `env(safe-area-inset-bottom)`; kontentga pastdan joy |
| `FooterV3` / `FooterMobileV3` | `Footer` | mobilda ustunlar akkordeon |
| `ProductCardV3` | `ProductCard` | props: product, inCart/qty, fav; rasm `contain` + 9% padding; `onCard` (qora panel ichida oq fon) |
| `AccountNavV3` | `AccountSidebar` | kabinet sahifalari |
| `InfoNavV3` | `InfoSidebar` | maʼlumot sahifalari |

### Mobil pastki panellar
Tab bar va PDP/savatdagi xarid paneli — **`position: fixed`**. Hech qachon `position: absolute; top: Npx` bilan emas (avvalgi «sahifa boʻsh koʻrinadi» xatosi shundan edi). Dizayndagi «birinchi ekran» (390×844) artboardlari panelning ekrandagi oʻrnini koʻrsatadi.

### Accessibility
- Interaktiv elementlar — `<button>` / `<a href>`; ikon tugmalarida `aria-label`.
- Teginish maydoni ≥ 44px. Matn kontrasti ≥ 4.5:1 (muted oqda 5.6:1).

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

## Sifat darajasi — nolda turadi

```bash
npm run build
npx next start -p 3000 &
BASE_URL=http://localhost:3000 npm run audit
```

`scripts/audit/` — CI'da har bir PR'da yuradi (`audit` job). **Production build
kerak**: dev build boshqa CSS va boshqa vaqtlash bilan ishlaydi, ya'ni boshqa
narsani o'lchaydi. Nuqson topilsa `npm run audit` nolmas kod bilan chiqadi.

Quyidagilar o'lchangan va **nol** holatga keltirilgan. Yangi ish ularni buzmasin.
Birinchi qator boshqalardan farq qiladi: u sahifaning qanday **ko'rinishini**
emas, qanday **javob berishini** o'lchaydi va shu sababli brauzersiz, oddiy
`fetch` bilan yuradi (`scripts/audit/checks/soft404.mjs`).

| tekshiruv | holat |
|---|---|
| WCAG kontrast (uz + ru) | 0 ta muvaffaqiyatsiz uslub |
| Nomsiz interaktiv element | 0 |
| `alt` yo'q rasm | 0 |
| Sarlavha darajasi sakrashi | 0 |
| Gorizontal overflow | 0 |
| Tap-target (WCAG 2.2 + spacing istisnosi) | 0 |
| Fokus ko'rinmaydigan element | 0 |
| Kesilgan matn (uz + ru) | 0 |
| Pastki chekka elementlari kesishuvi | 0 |
| 404 bo'lishi kerak URL 404 qaytaradi (soft-404 yo'q) | 0 |

Amaliy qoidalar, har biri haqiqiy nuqsondan chiqqan:

- **Pastga biriktirilgan har qanday element** `--bottom-nav` tokenidan offset olsin
  (`globals.css`). Beshta element o'z offsetini alohida tanlagani uchun
  "yuqoriga" tugmasi mobil tab-barning ustida turgan edi.
- **Modal/drawer/overlay** — `useDialog` hookiga ulansin (`src/lib/ui/useDialog.ts`):
  Escape, fokusni ichkariga olish va qaytarish, Tab tuzog'i. Ustiga
  `role="dialog"`, `aria-modal`, nom.
- **Grid ichidagi karta** — o'ramchada `h-full` bo'lsin, aks holda grid o'ramchani
  cho'zadi, karta esa o'z balandligida qoladi.
- **Audit faqat o'zi yetgan holatni qamraydi.** Sahifa yuklanishini tekshirish
  yetarli emas — menyu, drawer, modal ochilgan holatda ham tekshiring. Bir
  klaviatura tuzog'i aynan shu sabab uzoq vaqt sezilmay qolgan.
- **"Oldin/keyin" o'lchashda** eski `next start` serveriga qaytmang: u bir xil
  `.next` papkasini o'qiydi va siz orada qayta build qilgan bo'lasiz. To'g'ri
  yo'l — o'zgarishni stash qilib, qayta build qilib o'lchash.
