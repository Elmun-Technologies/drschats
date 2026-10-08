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

## 1-bosqich — layout (bajarildi)

Header (utility qator, Katalog + mega-menyu, qidiruv, ikonlar, kategoriya
qatori), mobil header + toʻliq ekranli qidiruv, 5 tabli tab bar + katalog
ekrani (MenuMobileV3), Footer (desktop ustunlar, mobil akkordeon). Butun sayt
shrifti Onest, fon oq, fokus halqasi qora. Audit: barcha qatorlar 0.

**Dizayndan ongli farqlar:**

| Joy | Dizayn | Kodda | Sabab |
|---|---|---|---|
| Header ikonlari | Taqqoslash, Kirish | Taqqoslash yoʻq; Kirish faqat API yoki demo yoqilganda | `/compare` yoʻq (8-bosqich); havola 404 ga olib bormasin |
| Kategoriya qatori | 10 ta qotirilgan nom | real kategoriyalar (13 ta), gorizontal skroll | faqat real maʼlumot |
| Mega-menyu oʻrta ustun | Shakli / Tarkib / Kim uchun + brend chiplari | Sogʻliq maqsadlari + Doʻkon havolalari | bu filtrlar maʼlumotda hali yoʻq (4-bosqich) — savol 1 boʻyicha default |
| Aksiyalar havolasi | `/sale` | `/products?sort=deals` | `/sale` 8-bosqichda |
| Savat (header va tab) | savat sahifasi | savat drawer'i | mavjud oqim saqlandi |
| Kabinet tabi | kabinet | `/account` yoki (API yoʻq boʻlsa) `/profile` | `/account` API'siz 404 |
| Footer toʻlov | Payme, Click, Uzum, Naqd | faqat merchant id bor provayderlar + Naqd/karta | hozir hech biri sozlanmagan |
| Footer "Xaridorlarga" | 6 havola | + Maqsadlar, Belgilar, Vitaminlar, Dasturlar | sogʻliq sahifalari yetim qolmasin |
| Mobil header til | UZ | boshqa til (RU/UZ) | bosilganda nima boʻlishi koʻrinsin |
| Narx valyutasi | soʻm (ʻ) | so’m | narx yordamchisi 2-bosqichda |

**Tuzatilgan eski xato:** global `* { border-color }` layer'siz edi va
barcha `border-*` rang utility'larini bosib ketardi. Endi `@layer base` da —
eski sahifalarda ayrim chegaralar oʻz rangini oldi (masalan qora panellardagi
`border-white/15`).

## 2-bosqich — mahsulot kartasi va UI elementlar (bajarildi)

`ProductCard` dizayn bo'yicha qayta yozildi va hamma joyda (12 ta chaqiruv)
shu komponent ishlatiladi. `Price`, `DiscountBadge`, `Badge`, `Button`
kit.css'ga moslandi; yangi: `Chip`, `Field`/`Input`, `Checkbox`, `RadioCard`.
`formatMoney` endi `soʻm` yozadi. Audit: 0.

| Joy | Dizayn | Kodda | Sabab |
|---|---|---|---|
| "Xit" belgisi | namuna maʼlumotda Vitamin C | faqat katalogda `Bestseller`/`Хит продаж` belgisi boʻlsa | oʻylab topilgan daʼvo yoʻq |
| Birlik narxi | 19 mahsulotning 12 tasida | shu 12 ta (tabletka/kapsula) | suyuqlik, jihoz, krem uchun birlik yoʻq |
| Checkbox/radio chegarasi | #A9AEB3 | #8A8F95 | boshqaruv elementi chegarasi oqda ≥ 3:1 (WCAG 1.4.11) |
| Karta reytingi | yoʻq | olib tashlandi | dizaynda yoʻq, sharhlar hali real emas |
| "24 soatda yetkazish" | har kartada | har kartada | saytdagi mavjud vaʼda (Toshkent, 24 soat) — OPEN-QUESTIONS #4 javobi kelsa matn bitta kalitda |

`Button` variantlari: `dark` va `gold` endi `primary` (qora) bilan bir xil —
eski chaqiruvlar buzilmasligi uchun alias sifatida qoldi.

## 3-bosqich — bosh sahifa (bajarildi)

HomeV3 / HomeMobileV3 bloklari dizayn tartibida: hero slayder + "Haftaning
taklifi", kategoriya plitkalari, ishonch qatori, aksiyadagi mahsulotlar,
Swiss Energy paneli, mahsulotlar setkasi, 2+1 banner, "Kim uchun tanlaysiz",
xizmat kartalari, "Mahsulot qayerdan keladi", yangiliklar, FAQ + yordam,
SEO matn. Telefonda dizayndagidek: tezkor chiplar, 6 kategoriya, swipe
rail'lar; ishonch qatori, kelib chiqish va yangiliklar faqat desktopda.
Audit: 0.

| Joy | Dizayn | Kodda | Sabab |
|---|---|---|---|
| "Koʻp sotib olinadi" | shu sarlavha | "Sara mahsulotlar" (mavjud kalit) | sotuv tarixi yoʻq — sarlavha daʼvo boʻlib qolardi |
| Rail tartibi | qoʻlda tanlangan | kesma rasmi bor mahsulotlar oldinda, aksiyadagilar setkada takrorlanmaydi | katalogdan, qotirilgan roʻyxat emas |
| Haftaning taklifi | bitta mahsulot | real chegirmalar, strelkalar ular boʻylab yuradi | chegirma boʻlmasa plitka chizilmaydi |
| 2+1 banner | doim | faqat katalogda `buy_x_get_y` promo boʻlsa; matn promodan | OPEN-QUESTIONS #10 — promo hozir har bir qatorga qoʻllanadi, matnda "tanlangan" deyilgan |
| Auditoriya | katalogga | testga (`/quiz?who=…`), yorliqlar testdan | mavjud oqim; ikkalasi ajralib ketmaydi |
| Auditoriya rasmlari | stok foto | stok foto (`st-aud-*`) | eski AI-generatsiya rasmlar oʻchirildi (`public/images/audience`, `hero/hand.jpg`) |
| Xizmat matnlari | "2 daqiqada" | "Savollarga javob bering…" | test davomiyligi oʻlchanmagan |
| Brend tugmasi | brend sahifasi | `/brands` | `/brands/[slug]` 8-bosqichda |
| SEO matn | faqat desktop | telefonda ham | Google mobil versiyani indekslaydi |
| H1 | yoʻq | `sr-only` (meta sarlavha) | sahifada bitta h1 boʻlishi kerak |

Oʻchirildi: eski bosh sahifa komponentlari (HeroBento, TopCategories,
DealOfDay, QuizPromo, AudienceDoors, HomeFaq, NewsletterSignup,
ScienceSection) va `CountdownTimer` — dizayn qoidasi taymerni taqiqlaydi va u
faqat DealOfDay'da ishlatilgan edi. `FaqAccordion` V3 ga moslandi
(`defaultOpen` prop) — FAQ ishlatiladigan hamma sahifada ko'rinadi.

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
| — | `LivePurchaseToast`, `ExitIntentPopup` (`CountdownTimer` 3-bosqichda oʻchirildi) | dizayn qoidasi (taymer va "N kishi sotib oldi" yoʻq) bilan zid — savol 5 |

Saqlanadigan qoidalar: `useDialog` (modal/drawer/sheet), `--bottom-nav`
offseti, `next/image` `fill` + `sizes`, `loading.tsx` yoʻq.

## Keyingi bosqichlar (TASKS.md tartibida)

| # | Bosqich | Asosiy ish | Eʼtibor |
|---|---|---|---|
| 1 | Layout ✅ | yuqorida | — |
| 2 | ProductCard + UI ✅ | yuqorida | — |
| 3 | Bosh sahifa ✅ | yuqorida | — |
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
