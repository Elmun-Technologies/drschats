# Dizayn V3 — koʻchirish rejasi

Manba: `design/` (`TASKS.md` bosqichlari). Bu fayl — 0-bosqich natijasi: mavjud
holat, dizayn bilan taqqoslash, qarorlar va ochiq savollar. Har bosqich
tugaganda yangilanadi.

## 0-bosqichda qilingan

| Ish | Qayerda | Koʻrinishga taʼsiri |
|---|---|---|
| Tokenlar ayni nomlar bilan | `src/styles/globals.css`, ikkinchi `@theme` | yoʻq — hali hech kim ishlatmaydi |
| Toʻqnashgan eski tokenlar → `legacy-*` (116 fayl, 635 qator) | `src/**` | yoʻq — kompilyatsiya qilingan CSS qoidama-qoida bir xil |
| Onest + Playfair Display | `public/fonts/`, `globals.css` (`@font-face`), `[locale]/layout.tsx` (preload) | yoʻq — `--font-sans` hali Exo 2, `preload: false` |
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

**Yangilandi (3-bosqichdan keyin):** shu xavf amalga oshdi — CI build'ida
Google Fonts CSS'i kelmadi va `next/font` yiqildi. Shriftlar endi
`public/fonts/` da (Google'ning oʻsha woff2 subset fayllari, OFL) va oddiy
`@font-face` bilan ulanadi; build tarmoqqa bogʻliq emas.

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

## 4-bosqich — katalog va filtrlar (bajarildi)

CatalogV3 / CatalogMobileV3 / FiltersMobileV3: breadcrumb, sarlavha + soni,
kategoriya plitkalari, chapda filtrlar (narx, sotuvda bor, chegirmadagilar,
sogʻliq maqsadlari, brend, shakli, mamlakat — har birida jonli son), saralash,
faol filtr chiplari, setkada test va obuna bannerlari, "N tadan M tasi
koʻrsatildi" + "Yana N ta koʻrsatish", kategoriya SEO matni. Telefonda sticky
"Filtrlar / Ommabop" va pastdan chiqadigan sheet (jonli "N ta mahsulotni
koʻrsatish"). Filtrlar URL'da (`stock`, `sale`, `brand`, `form`, `origin`,
`goal`, `min`, `max`, `sort`, `page`), eski `origin`/`goal` havolalari ishlaydi.
Audit: 0 (filtr sheet ochilgan holat ham auditga qoʻshildi).

| Joy | Dizayn | Kodda | Sabab |
|---|---|---|---|
| Subkategoriya plitkalari | kategoriya ichidagi boʻlimlar | barcha kategoriyalar (joriysi qora) | katalogda subkategoriya yoʻq |
| "Kim uchun" filtri | Kattalar / Bolalar / Homiladorlar | **Sogʻliq maqsadlari** (mavjud mavzular) | "kim uchun" maʼlumoti yoʻq; maqsadlar real va sogʻliq yoʻli saqlanadi |
| "Obuna bilan arzonroq" | filtr | yoʻq | obuna sotuvdagi har bir mahsulotga ochiq — "Sotuvda bor" bilan bir xil |
| Shakli | kapsula / shipuchi / kukun | kapsula / shipuchi tabletka | shakl faqat 12 mahsulotda maʼlum (`product-units.ts`) |
| Narx slayderi | ikki tutqichli | faqat ikki maydon | maydonlar aniqroq; slayder keyin qoʻshilishi mumkin |
| Plitka / roʻyxat tugmalari | bor | yoʻq | roʻyxat kartasi dizaynda yoʻq |
| "Shu boʻlimda koʻp qidiriladi" | teglar | yoʻq | qidiruv statistikasi yoʻq — oʻylab topilgan teglar boʻlardi |
| "Ommabop" tartibi | — | kesma rasmli qoʻshimchalar oldinda | sotuv tarixi yoʻq; bosh sahifa bilan bir xil qoida |
| "Aksiyalar" havolasi | `/sale` | `/products?sale=1&sort=deals` | endi haqiqatan faqat chegirmadagilar chiqadi; `/sale` 8-bosqichda |

Filtrlash Shopflow'dan sahifalab olingan barcha mos mahsulotlar ustida bajariladi (kategoriya va
qidiruv serverda; `lib/shop/all-products.ts`, 20 sahifagacha). Katalog minglab mahsulotga yetsa, filtrlarni backend'ga oʻtkazish kerak.

## 5-bosqich — mahsulot sahifasi (bajarildi)

ProductV3 / ProductMobileV3: breadcrumb, sarlavha, meta qator (sharhlar soni —
real, savol-javob soni, brend → katalog filtri, sevimlilar, ulashish);
vertikal thumbnaillar + tile ustida kesma rasm; oʻrta ustun (qadoq hajmi,
nuqtali xususiyatlar, tarkib qisqasi); xarid kartasi (narx, eski narx, −%,
birlik narxi + tejash, «Bir martalik» / «Obuna bilan — arzonroq» + 30/45/60/90
kun, miqdor, «Savatga qoʻshish», «Hozir buyurtma berish», «Sotuvda bor»);
yetkazish va toʻlov paneli (`COMMERCE` + sozlangan provayderlar). Sticky
tablar (scrollspy) va oʻngda sticky mini karta. Telefonda bitta DOM `order-*`
bilan qayta tartiblanadi; Tavsif / Barcha xususiyatlar / Savol-javob /
Hujjatlar — akkordeon (`Collapsible`, `<details>` emas; anchor ochadi).
Pastki xarid paneli tab bar ustida `fixed`.

Uchala «qoʻshish» tugmasi (karta, mobil panel, mini karta) bitta holatni
oʻqiydi — `product/purchase.ts` (zustand, persist emas): kartada obuna
tanlansa, panel ham obunani qoʻshadi. Savatga qoʻshish, analytics va JSON-LD
oʻzgarmadi.

| Joy | Dizayn | Kodda | Sabab |
|---|---|---|---|
| «Taqqoslash» | meta qatorda | yoʻq | `/compare` 8-bosqichda |
| «Kunlik doza», «Yosh», «Rasmiy import qiluvchi» | xususiyatlarda | yoʻq | katalogda bu maydonlar yoʻq — oʻylab topilmaydi |
| Qabul qilish | 3 panel (Qancha/Qachon/Qanday) | bitta panel (`howToUse` matni) | maʼlumot strukturalanmagan |
| «Sotuvda bor · Toshkentdagi omborda» | — | «Sotuvda bor» | ombor maʼlumoti yoʻq |
| «Bu mahsulot bilan birga olishadi» | sarlavha | «Oʻxshash mahsulotlar» | sotuv tarixi yoʻq — daʼvo boʻlardi |
| Upsell taklifi | yoʻq | «Birga qoʻshsangiz — arzonroq» (real chegirma) | biznes-logika saqlanadi; «Koʻpincha birga olishadi» izohi olib tashlandi |
| «Savol berish», «Sharh yozish» | tugma | `/contact` havolasi | savol/sharh backend'i yoʻq |
| Eski narx | `89 000` | `89 000` (valyutasiz) | dizayndagidek |

**Tibbiy vaʼdalar** `mock.ts` dan olib tashlandi (uz + ru): «davolaydi»,
«stressni kamaytiradi», «kuchaytiradi», «mustahkamlaydi», «samarali»,
«Stressga qarshi vitaminlar» va h.k. Oʻrniga tarkib va «… normal faoliyatiga
hissa qoʻshadi» shaklidagi neytral iboralar. Namuna sharhlar (`NEXT_PUBLIC_SAMPLE_SOCIAL_PROOF`
bilan yoqiladigan) tegilmadi — ular default'da koʻrinmaydi.

**Oʻchirildi:** `components/bespoke/` (6 ta qoʻlda yozilgan sahifa — birortasining
slug'i katalogda yoʻq edi, ya'ni hech qachon ochilmagan), `StickyBuyBar`
(yuqoridagi panel — dizaynda mini karta va mobil panel), `ProductTabs`,
`SimilarProducts` (oʻxshashlar endi serverda hisoblanadi).

**Yangi tokenlar** (`globals.css`): `--tab-bar` (faqat tab bar), `--buy-bar`
(`[data-buy-bar]` sahifada boʻlsa 4.5rem), `--bottom-nav` = ikkalasining
yigʻindisi — footer, toast va «yuqoriga» tugmasi panelni oʻzi chetlab oʻtadi.
`--header-sticky` (lg: 130px) — scroll qilingan desktop header balandligi.
Audit: 0 (mobil akkordeonlar ochilgan holat ham qoʻshildi).

## 6-bosqich — savat va buyurtma (bajarildi)

CartV3 / CartMobileV3 / CartEmptyV3 / OrderSuccessV3: savat va rasmiylashtirish
**bitta sahifada** (`/cart`) — savol 2 ga default javob, dizayn shunday;
`/checkout` → `/cart` redirect (eski havolalar ishlaydi), `/checkout/success`
oʻz joyida. Bepul yetkazishgacha progress, qatorlar (miqdor ≥ 1, sevimlilarga,
oʻchirish), «Buyurtmangizga qoʻshing va tejang» (upsell ladder), 3 qadam
(aloqa, yetkazish, toʻlov), oʻngda sticky xulosa, telefonda pastda fixed
«Jami + Buyurtmani yuborish». Butun sahifa bitta `<form>`.

**Oʻzgarmadi:** Zod sxemasi, `OrderRequest` payload, `submitOrder` server
action, `computeTotals`, upsell ladder'ga beriladigan mahsulotlar roʻyxati
(popular, 20), `trackLead`, `trackBeginCheckout` (drawer tugmasi endi `/cart`
ga olib boradi), `PurchaseTracker`.

| Joy | Dizayn | Kodda | Sabab |
|---|---|---|---|
| «Hammasini tanlash» / tanlanganlarni oʻchirish | bor | yoʻq | tanlash buyurtma tarkibini oʻzgartirmaydi — bu yangi logika boʻlardi; har qatorda «Olib tashlash» bor |
| «Aksiya chegirmasi», «Birinchi buyurtma −10%» | alohida qatorlar | bitta «Chegirma» qatori | `computeTotals` chegirmani yigʻindi qaytaradi; boʻlish — biznes-logika |
| Payme / Click / Uzum | tanlanadi | merchant id yoʻq boʻlsa «tez orada», tanlanmaydi | ishlamaydigan toʻlov yoʻlini vaʼda qilmaslik |
| Kabinetga biriktirish matni | bor | faqat «Hisobsiz ham buyurtma berishingiz mumkin» | backend deploy qilinmagan |
| Boʻsh savat: «−10% avtomatik qoʻllanadi» | bor | yoʻq | −10% faqat obunaga tegishli — umumiy vaʼda notoʻgʻri |
| Boʻsh savat: «Koʻp sotib olinadi» | sarlavha | «Sara mahsulotlar» | sotuv tarixi yoʻq |
| Natija: «Payme · toʻlandi», «Toʻlov tasdiqlandi» | bor | yoʻq; 1-qadam «Buyurtma qabul qilindi» | naqd toʻlovda bu yolgʻon; sahifa toʻlov holatini bilmaydi |
| Natija: buyurtma tarkibi, manzil | oʻng panel | yoʻq | savat redirect'dan oldin tozalanadi; maʼlumot faqat buyurtma raqami |
| Natija: «Telegram orqali kuzatish» | bot | «Telegramda yozish» → `BRAND.social.telegram` | bot nomi hali yoʻq (OPEN-QUESTIONS #9); eski `@drschatsstorebot` olib tashlandi |

**Topilgan nuqson (tuzatilmadi — biznes-logika):** «Oʻzi olib ketish»
tanlanganda ham `computeTotals` 30 000 soʻm yetkazish qoʻshadi; usul narxga
taʼsir qilmaydi. Yetkazish sahifasi esa olib ketishni «bepul» deydi.
Tuzatish `computeTotals` ga `method` qoʻshishni va backend bilan
kelishishni talab qiladi.

Oʻchirildi: `CartPageView`, `SuccessCheckmark`. Audit: 0 (toʻldirilgan savat
holati ham qoʻshildi).

## 7-bosqich — qidiruv (bajarildi)

SearchV3 / SearchEmptyV3 / SearchMobileV3. Yangi **`/search?q=`** sahifasi
(`noindex, follow`): sarlavha + soni, natijadagi kategoriyalar chiplari
(sonlari bilan, `&category=`), setka, «Kerakli mahsulotni topmadingizmi?»
paneli (Telegram + test), «Sara mahsulotlar». Natija yoʻq: «Qidirib koʻring»
chiplari, «Mahsulot kelganda xabar beramiz» formasi (`notifyRestock` —
operatorning Telegram kanaliga; analytics `search_notify`), «Balki sizga
kerakdir». Header takliflari: kategoriyalar chiplari, 3 ta mahsulot (rasm,
nom, brend, narx), «Barcha N ta natijani koʻrsatish» (`/api/search` endi
`total` qaytaradi). Telefonda qidiruv ekrani: chapda «orqaga», roʻyxat ekran
ichida, pastda tugma. `/products?q=` ham ishlashda davom etadi.

**Tuzatilgan xato:** JSON-LD `SearchAction` `/products?search=` ga yoʻnaltirardi,
sahifa esa `?q=` ni oʻqiydi — Google sitelinks qidiruvi boʻsh natija berardi.
Endi `/search?q=`.

| Joy | Dizayn | Kodda | Sabab |
|---|---|---|---|
| Soʻrov variantlari («vitamin C 550 mg») | bor | yoʻq | soʻrovlar statistikasi yoʻq — oʻylab topilgan boʻlardi |
| «Mashhur soʻrovlar» | bor | «Qidirib koʻring» — faqat bugun natija beradigan atamalar | mashhurlik maʼlumoti yoʻq |
| «Boshqa xaridorlar koʻp izlaydi» | sarlavha | «Sara mahsulotlar» | xaridorlar statistikasi yoʻq |
| Shakl chiplari («Kapsulalar») | bor | faqat kategoriyalar | shakl 12 mahsulotda maʼlum |
| Ochiq takliflar ostida sahifani qoraytirish | bor | yoʻq | header'dagi qatlam bilan ziddiyat; keyin qoʻshish mumkin |

`OutOfStockNotify` V3 ga oʻtkazildi va umumlashtirildi (`label`, `submitLabel`,
`event`, `bare`). Audit: 0 (yangi: `/search` natija va boʻsh holatlari,
telefonda soʻrov yozilgan qidiruv ekrani).

## 8-bosqich — aksiyalar, brendlar, sevimlilar, taqqoslash (bajarildi)

Foydalanuvchi qarori: zip'dagi dizayn 1:1, taqqoslash ham.

- **`/sale`** (SaleV3): aksiya kartalari, chegirmadagi mahsulotlar
  (`byDeepestDiscount`), «Bir xil qoidalar», Telegram paneli. `SALE_HREF` →
  `/sale` (katalogdagi `?sale=1` ishlayveradi).
- **`/brands`** (BrandsV3): mamlakat chiplari (`?country=`), kesma rasmli brend
  plitkalari, «Hujjat kerakmi?». Brend maʼlumoti `lib/content/brand-info.ts`:
  nom — slug'dan, mamlakat/matn — Sanity yoki i18n, mahsulotlar — katalogdan.
- **`/brands/[slug]`** (BrandV3, yangi): qora hero (katalogdagi soni, yetkazish
  muddati, 3 ta kesma rasm), shakl chiplari (`?form=`), setka, 3 ta fakt.
  Nomaʼlum yoki mahsulotsiz brend → 404. PDP'dagi brend havolasi shu yerga.
- **`/wishlist`** (FavoritesV3): «Hammasini savatga · summa», Hammasi /
  Chegirmadagilar / Sotuvda bor chiplari, qurilma haqida panel, tavsiyalar.
- **`/compare`** (CompareV3, yangi): `lib/compare/store.ts` (`govita-compare`,
  4 tagacha, testli), header'da «Taqqoslash» ikonkasi, PDP'da tugma; jadvalda
  farqli qatorlar `tile` fonida, «Faqat farqlar». Telefonda ustunlar 150px,
  yonga scroll.

| Joy | Dizayn | Kodda | Sabab |
|---|---|---|---|
| «Birinchi buyurtma −10%» kartasi | bor | yoʻq | `computeTotals` da −10% faqat obunaga — savat bu narxni olmaydi |
| «Chegirmalar qoʻshilmaydi — eng kattasi» | qoida | yoʻq | upsell va aksiyalar qoʻshiladi — qoida notoʻgʻri boʻlardi |
| 2+1 kartasi | doim | faqat `buy_x_get_y` aksiya ishlayotganda, matni aksiyaning oʻzidan | real maʼlumot |
| Klub: «Telegram-bot» | bot | Telegram kanal | bot nomi hali yoʻq (OPEN-QUESTIONS #9) |
| Sevimlilar: «Ulashish» | tugma | yoʻq | roʻyxat brauzerda — havola boshqa odamda boʻsh roʻyxat ochadi |
| Sevimlilar: «Kabinetga kiring — raqamga biriktiriladi» | bor | «Brauzer tozalansa, roʻyxat oʻchadi» | sevimlilar backend'ga sinxron qilinmaydi (OPEN-QUESTIONS #14) |
| Taqqoslash: «Yosh» qatori | bor | yoʻq | katalogda maydon yoʻq |
| Brend sahifasi: «Saralash: Ommabop» | bor | yoʻq | brendda 14 tagacha mahsulot — kesma rasmlilar oldinda |

Audit: 0 (yangi yoʻllar: `/sale`, `/brands/swiss-energy`, `/compare`;
holatlar: mahsulotli taqqoslash + «Faqat farqlar», mahsulotli sevimlilar).

## Route'lar: dizayn ↔ loyiha

| Dizayn | Taklif URL | Loyihada | Qaror |
|---|---|---|---|
| HomeV3 | `/` | bor | qayta chiziladi |
| CatalogV3 | `/catalog/[category]` | `/products`, `/products/[category]` | **mavjud URL qoladi** (SEO, sitemap, ichki havolalar) |
| SearchV3 / SearchEmptyV3 | `/search?q=` | bor | ✅ 7-bosqich |
| SaleV3 | `/sale` | yoʻq | **yangi route** — `oldPrice` bor mahsulotlar filtri |
| BrandsV3 | `/brands` | bor | qayta chiziladi |
| BrandV3 | `/brands/[slug]` | yoʻq | **yangi route** |
| ProductV3 | `/product/[slug]` | bor | qayta chiziladi |
| CompareV3 | `/compare` | yoʻq, **store ham yoʻq** | yangi funksiya — savol 3 |
| FavoritesV3 | `/wishlist` | bor | qayta chiziladi |
| CartV3 (savat + checkout bitta sahifada) | `/cart` | `/cart`; `/checkout` → redirect | ✅ 6-bosqich |
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
| 4 | Katalog ✅ | yuqorida | — |
| 5 | Mahsulot ✅ | yuqorida | — |
| 6 | Savat ✅ | yuqorida | — |
| 7 | Qidiruv ✅ | yuqorida | — |
| 8 | Aksiya, brend, sevimli, taqqoslash ✅ | yuqorida | — |
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
