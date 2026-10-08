# Dizayn V3 — koʻchirish rejasi

Manba: `design/` (`TASKS.md` bosqichlari). Bu fayl — 0-bosqich natijasi: mavjud
holat, dizayn bilan taqqoslash, qarorlar va ochiq savollar. Har bosqich
tugaganda yangilanadi.

## 0-bosqichda qilingan

| Ish | Qayerda | Koʻrinishga taʼsiri |
|---|---|---|
| Tokenlar ayni nomlar bilan | `src/styles/globals.css`, ikkinchi `@theme` | yoʻq — hali hech kim ishlatmaydi |
| Toʻqnashgan eski tokenlar → `legacy-*` (116 fayl, 635 qator) | `src/**` | yoʻq — kompilyatsiya qilingan CSS qoidama-qoida bir xil |
| Onest + Playfair Display | `src/styles/fonts.ts`, `[locale]/layout.tsx` | yoʻq — `--font-sans` hali Exo 2, `preload: false` |
| 20 ta kesma + 12 ta stok foto | `public/images/products/`, `public/images/stock/` | yoʻq |
| slug → kesma xaritasi (19 ta, test bilan) | `src/lib/content/product-cutouts.ts` | yoʻq — 2-bosqichda ProductCard ulaydi |
| `design/` Tailwind va ESLint'dan chiqarildi | `globals.css`, `eslint.config.mjs` | yoʻq |

**Nega `legacy-*`:** topshiriq "ayni nomlar bilan qoʻsh, eskisini oʻchirma"
degan, lekin `ink` eski kodda och fon (#fffdf9), dizaynda deyarli qora
(#17191B). Ustidan yozish butun saytni teskari qilardi. Yangi tokenlarni
prefiks bilan qoʻshish esa har bosqichda vaqtinchalik nom yozib, oxirida yana
almashtirishni anglatardi. Eski nomni bir marta mexanik koʻchirish arzonroq
va yangi kod darhol yakuniy nom bilan yoziladi.

**Shrift:** loyiha avval `next/font/local` ishlatgan (Exo 2). Onest
topshiriqdagidek `next/font/google` bilan ulandi — u ham build vaqtida yuklab,
oʻz domenimizdan beradi (CSP oʻzgarmaydi). Narxi: build Google Fonts'ga
tarmoq talab qiladi (Vercel va GitHub Actions'da bor).

## Route'lar: dizayn ↔ loyiha

| Dizayn | Taklif URL | Loyihada | Qaror |
|---|---|---|---|
| HomeV3 | `/` | bor | qayta chiziladi |
| CatalogV3 | `/catalog/[category]` | `/products`, `/products/[category]` | **mavjud URL qoladi** (SEO, sitemap, ichki havolalar) |
| SearchV3 / SearchEmptyV3 | `/search?q=` | yoʻq (faqat header'dagi `SearchBox`) | **yangi route** |
| SaleV3 | `/sale` | yoʻq | **yangi route** — `oldPrice` bor mahsulotlar filtri |
| BrandsV3 | `/brands` | bor | qayta chiziladi |
| BrandV3 | `/brands/[slug]` | yoʻq | **yangi route** |
| ProductV3 | `/product/[slug]` | bor | qayta chiziladi |
| CompareV3 | `/compare` | yoʻq, **store ham yoʻq** | yangi funksiya — savol 3 |
| FavoritesV3 | `/wishlist` | bor | qayta chiziladi |
| CartV3 (savat + checkout bitta sahifada) | `/cart` | `/cart` va `/checkout` alohida | savol 2 |
| OrderSuccessV3 | `/checkout/success` | bor | qayta chiziladi |
| LoginV3 | `/account/login` | `/account` ichida `AuthForm` (Telegram OTP, 6 xona) | oqim saqlanadi; URL savol 4 |
| AccountV3, OrderDetailV3, SubscriptionsV3, ProfileV3 | `/account/...` | bitta `/account` sahifasi + alohida `/profile` (brauzerdagi sogʻliq profili) | savol 4 |
| QuizV3 / QuizResultV3 | `/quiz`, `/quiz/result` | bor | qayta chiziladi |
| Delivery, Payment, Guarantee, Loyalty, About, Licenses, Contact | shu nomlar | bor | qayta chiziladi |
| PartnersV3 | `/partners` | `/where-to-buy` | **mavjud URL qoladi** |
| BlogV3 / ArticleV3 | `/blog`, `/blog/[slug]` | bor | qayta chiziladi |
| NotFoundV3 | `not-found.tsx` | bor (+ `global-not-found.tsx`) | qayta chiziladi |

**Dizaynda yoʻq, loyihada bor:** `/goals`, `/symptoms`, `/vitamins`,
`/programs`, `/experts`, `/ingredients`, `/news`, `/reviews`, `/offer`,
`/privacy`, `/requisites`, `/lp/[campaign]`, `/email/preferences`, `/profile`.
Ular oʻchirilmaydi; 11-bosqichda InfoNav/umumiy layout'ga oʻtkaziladi — savol 1.

## Komponentlar

| Dizayn | Mavjud | Holat |
|---|---|---|
| HeaderV3 + MegaMenuV3 | `layout/Header`, `TopBar`, `CatalogMenu`, `SearchBox`, `CartButton`, `WishlistLink`, `AccountLink`, `LocaleSwitcher`, `Logo` | qayta chiziladi; maʼlumot/logika qoladi |
| HeaderMobileV3 | Header ichida | yangi `MobileHeader` |
| TabBarV3 | `nav/MobileBottomNav` (4 tab, `--bottom-nav`) | qayta chiziladi; `--bottom-nav` tokeni qoladi |
| FooterV3 / FooterMobileV3 | `layout/Footer` | qayta chiziladi, mobilda akkordeon |
| ProductCardV3 | `product/ProductCard` | qayta chiziladi + kesma rasm |
| kit.css (btn, chip, badge, inp, opt, cb) | `ui/Button`, `ui/Badge`, `ui/Price` … | qayta chiziladi; yangi: Chip, Input, RadioCard, Checkbox |
| AccountNavV3 | yoʻq | yangi `AccountSidebar` |
| InfoNavV3 | yoʻq | yangi `InfoSidebar` |
| — | `CountdownTimer`, `LivePurchaseToast`, `ExitIntentPopup` | dizayn qoidasi (taymer va "N kishi sotib oldi" yoʻq) bilan zid — savol 5 |

Saqlanadigan qoidalar: `useDialog` (modal/drawer/sheet), `--bottom-nav`
offseti, `next/image` `fill` + `sizes`, `loading.tsx` yoʻq.

## Keyingi bosqichlar (TASKS.md tartibida)

| # | Bosqich | Asosiy ish | Eʼtibor |
|---|---|---|---|
| 1 | Layout | `--font-sans` → Onest, body foni `bg`; Header, MegaMenu, MobileHeader, TabBar, Footer | Butun sayt shriftini oʻzgartiradi — kesilgan matn auditi; eski sahifalar yangi header bilan aralash koʻrinadi (kutilgan) |
| 2 | ProductCard + UI | kartaga kesma rasm, birlik narxi; Button/Chip/Badge/Input | birlik narxi uchun `units`/`unitLabel` maydoni kerak (`design/data/products.json` da bor, `Product` turida yoʻq) |
| 3 | Bosh sahifa | dizayn bloklari, real maʼlumot | mavjud sogʻliq-maqsad bloklari dizaynda yoʻq — savol 1 |
| 4 | Katalog | filtrlar (brend, shakl, kim uchun, mamlakat — soni bilan), mobil sheet | "shakl", "kim uchun" maydonlari maʼlumotda bor-yoʻqligini tekshirish |
| 5 | Mahsulot | galereya, xarid bloki, sticky tablar, mobil fixed panel | tibbiy vaʼdalarni matndan olib tashlash — kontent oʻzgarishi |
| 6 | Savat | progress, upsell, 3 qadam, sticky xulosa | savol 2; checkout server action va Zod sxemasi oʻzgarmaydi |
| 7 | Qidiruv | `/search` route + header takliflari | — |
| 8 | Aksiya, brend, sevimli, taqqoslash | `/sale`, `/brands/[slug]`, `/compare` | savol 3 |
| 9 | Kabinet | sidebar, buyurtma timeline, obunalar | backend'da yoʻq funksiyalar roʻyxati alohida beriladi |
| 10 | Test | savol/natija UI | quiz logikasi qoladi |
| 11 | Maʼlumot sahifalari, blog, 404 | InfoSidebar layout | — |
| 12 | Yakuniy | skrinshot taqqoslash, eski yashil/legacy tokenlarni oʻchirish, Lighthouse | `grep legacy-` = 0 |

## Xavflar

- **Audit nolda.** Har bosqichdan keyin `npm run audit` (production build).
  Dizayndagi 13px `muted` matn tile ustida 5.0:1 — chegara yaqin.
- **Aralash holat.** 1–11-bosqichlar orasida sayt ikki dizaynda boʻladi.
  Deploy qilinadigan boʻlsa, bosqichlarni alohida branch'da yigʻish mumkin.
- **AI rasm.** Dizayn qoidasi "AI-generatsiya rasm yoʻq" deydi, lekin
  `delical-vanil-200ml-white.jpg` va `dr-frei-turbo-base-ingalyator-white.jpg`
  kodda "generated" deb belgilangan; ularning kesmalari (`c-*-white.png`) ham
  shulardan boʻlishi mumkin.
- **Mahsulot maʼlumoti.** Dizayndagi 19 ta narx va eski narx mock bilan
  toʻliq mos (tekshirildi).

## Ochiq savollar (qaror sizda)

1. **Sogʻliq yoʻli.** CLAUDE.md: "navigatsiya sogʻliq maqsadlariga quriladi"
   (`/goals`, `/symptoms`, `/vitamins`, `/quiz`). Dizayn header'ida ular yoʻq —
   klassik kategoriya navigatsiyasi. Bu sahifalar qayerdan ochiladi: mega-menyu
   ichida alohida ustun, footer yoki faqat bosh sahifa bloki?
2. **Savat + checkout bitta sahifada.** `/checkout` ni `/cart` ga birlashtiramizmi
   (`/checkout` → redirect), yoki ikkalasi qoladi?
3. **Taqqoslash.** Yangi store (`govita-compare`, localStorage) — bu yangi
   funksiya, faqat UI emas. Qilamizmi?
4. **Kabinet URL'lari.** `/account/login`, `/account/orders/[id]`,
   `/account/subscriptions`, `/account/profile` ga boʻlamizmi? Mavjud
   `/profile` (API'siz, brauzerda) bilan `/account/profile` qanday bogʻlanadi?
5. **Taymer, "sotib oldi" toast, exit-popup.** Dizayn qoidasi taqiqlaydi.
   Komponentlarni oʻchiramizmi yoki bayroq ortida qoldiramizmi?
6. `design/OPEN-QUESTIONS.md` dagi 14 savol (Uzum, EMU narxi, 24 soat / 1–2
   kun, rekvizitlar, bot nomi va h.k.) — matnga taʼsir qiladi, 6- va
   11-bosqichdan oldin kerak.
