# Admin panel — `/admin`

Saytning o'z boshqaruv paneli: mahsulotlar, kategoriyalar, brendlar,
buyurtmalar va administratorlar. Shopflow ishlatilmaydi.

## Qanday ishlaydi

```
Sayt (Next.js)  ──►  CatalogEngine  ──►  Postgres (DATABASE_URL)
                         │                 └─ bo'sh yoki ishlamasa ↓
                         └──────────────►  o'rnatilgan katalog (shopflow/mock.ts)
Buyurtma  ──►  orders jadvali (GV-000123)  ──►  Telegram xabari (operatorga)
Admin     ──►  /admin  ──►  saqlash  ──►  revalidateTag + revalidatePath ──► sayt darhol yangilanadi
Rasm      ──►  Tigris (Fly object storage)  ──►  https://<bucket>.fly.storage.tigris.dev/...
```

- **Hech qachon bo'sh do'kon yo'q.** Baza o'qilmasa yoki unda hali mahsulot
  bo'lmasa, sayt o'rnatilgan katalogni ko'rsatadi va log'ga yozadi
  (`src/lib/catalog/db.ts`). 2026-10 dagi "hamma narsa o'chib ketdi" xatosi aynan
  "hech narsa" deb javob bergan manbaga ishonishdan bo'lgan.
- **Buyurtma avval bazaga yoziladi**, keyin Telegram'ga. Baza bo'lsa Telegram —
  ogohlantirish, yozuvning o'zi emas.
- **Narx serverda** bazadagi qiymat bo'yicha qayta hisoblanadi
  (`lib/cart/reprice.ts`) — admin narxni o'zgartirsa, eski savatdagi narx o'tmaydi.
- `DATABASE_URL` yo'q bo'lsa `/admin` 404 qaytaradi va sayt avvalgidek ishlaydi.

## Ishga tushirish (bir marta)

Sayt, baza va rasmlar Fly.io'da — qadamlar: **[`DEPLOY-FLY.md`](DEPLOY-FLY.md)**
(`fly mpg create` → `fly mpg attach` → `fly storage create` → `fly secrets set`
→ `fly deploy`). Migratsiyalar har deploy'da `release_command` bilan yuradi.

Kerakli secret'lar: `DATABASE_URL` (`fly mpg attach` qo'yadi),
`ADMIN_SESSION_SECRET` (≥ 32 belgi), `ADMIN_SETUP_TOKEN` (≥ 16 belgi, birinchi
admin yaratilgach o'chiriladi), ixtiyoriy Tigris (`AWS_*`, `BUCKET_NAME`).
`/admin/integrations` ichidan Telegram operator yoki Resend Email sozlamalarini
saqlamoqchi bo'lsangiz, `INTEGRATION_ENCRYPTION_KEY` ni `openssl rand -hex 32`
bilan yarating va deploy secret sifatida qo'ying. Keyin uni o'zgartirmang yoki
yo'qotmang: u Postgresdagi maxfiy qiymatlarni ochish uchun kerak. Analytics
ID’larini paneldan boshqarish uchun build vaqtida `ADMIN_ANALYTICS_CSP=on` ni
qo'ying va qayta deploy qiling; bu CSP’da faqat qo'llab-quvvatlangan analytics
vendor hostlarini ochadi. Maxfiy qiymatlarni chatga yoki kodga yozmang.

### 5. Birinchi kirish

1. `https://www.govita.uz/admin/setup` — sozlash kaliti (`ADMIN_SETUP_TOKEN`),
   ism, email, parol (≥ 12 belgi). Sahifa birinchi admin yaratilgach yopiladi.
2. Katalog **o'zi** bazaga ko'chadi: server birinchi marta baza bilan ishga
   tushganda, `products` bo'sh bo'lsa, o'rnatilgan katalog (30 mahsulot,
   15 kategoriya, brendlar) yoziladi va `site_settings.catalog.seededAt` belgisi
   qo'yiladi (`src/lib/admin/seed.ts`, `instrumentation.ts`). Belgi bor ekan bu
   qayta ishlamaydi — admin o'chirgan mahsulot qaytib kelmaydi. Yetishmaganini
   qo'lda olib kelish: `/admin/products` dagi «Saytdagi N ta mahsulot hali
   panelda yo'q» kartasi → «Panelga olish» (takror bosish xavfsiz: faqat
   yo'g'ini qo'shadi, rasmi ham kesmasi ham bo'sh mahsulotga saytdagi rasmni
   yozadi, boshqa hech narsani o'zgartirmaydi). Ataylab o'chirilgan bo'lsa —
   «Kerak emas» (`site_settings.catalog.importDismissed`).
3. `fly secrets unset ADMIN_SETUP_TOKEN -a govita`.

## Bo'limlar

Dizayn — saytning V3 uslubi: oq fon, `tile` kartalar, qora (`ink`) tugmalar,
yashil yo'q (`src/components/admin/ui.tsx`).

| bo'lim | nima qiladi |
|---|---|
| Bosh sahifa | hozir saytdagilar, tashrif / konversiya / buyurtma / savdo / o'rtacha chek (oldingi davr bilan), «E'tibor talab qiladi» (yangi buyurtmalar, tashlab ketilgan savatlar, kursi tugayotganlar, ochiq murojaatlar), kunlik grafiklar, sayt voronkasi, kanallar |
| Analitika | tashrif, sessiya, sahifa ko'rish, konversiya; kanallar jadvali (tashrif → xaridor → savdo), mahsulot qiziqishi (ko'rdi / savatga / sotildi), qurilmalar, sahifalar, saytdagi qidiruvlar |
| Buyurtmalar | holat chiplari (sonlari bilan), qidiruv, manba; tafsilotda mijoz profili va «Saytdagi yo'li» havolasi |
| Mijozlar | telefon bo'yicha birlashtirilgan mijozlar: bosqich (yangi / qayta / VIP / faolligi pasaygan), jami xarid, oxirgi xariddan beri kunlar; profilda buyurtmalar, xarid oralig'i, saytdagi harakatlari (barcha qurilmalar), izohlar |
| Mijozlar yo'li | saytga kirgan har bir odam: manba, bosqich (kirdi → mahsulot ko'rdi → savat → rasmiylashtirish → sotib oldi), savatdagi mahsulotlar, tashriflar bo'yicha harakatlar tarixi |
| Voronka | sayt voronkasi va har bosqichdagi yo'qotish (retarget segmentiga havola) + buyurtma bajarilishi va holatlar kanbani |
| Segmentlar va retarget | avtomatik auditoriyalar: kursi tugayapti (25–40 kun), bir marta sotib olgan, 60+ kun, yo'qotilgan (180+), VIP, yangi (7 kun), savatni tashlab ketgan, rasmiylashtirishda to'xtagan, ko'rib ketgan. CSV (jamoa), Meta Custom Audience va Google Customer Match (SHA-256) eksporti, Telegram orqali shaxsiy xabar (`{ism}`) |
| Vitrina | bannerlar (bosh sahifa slayderi, header ostidagi qator, katalog sahifalari — muddat, taymer, bosishlar soni), eʼlon qatori (TopBar), bugungi taklif (hozirgi + navbat). Pastda batafsil |
| Aksiyalar | foizli chegirma, 2+1, summadan bepul yetkazish — mahsulotlar, boshlanish/tugash, yoqish/o'chirish. Jadvalda qator bo'lmasa kod ichidagi aksiyalar ishlaydi; «Panelga olish» ularni tahrirlanadigan qiladi. Pastda mahsulot chegirmalari (eski narx + muddat) |
| Promokodlar | kodlar ro'yxati (holat: faol / tugagan / shaxsiy; manba bo'yicha), ishlatildi / limit, kod keltirgan buyurtma va tushum, 30 kunlik ko'rsatkichlar; yaratish (kod qo'lda yoki avtomatik `GV-7K3P9Q`), tahrir, o'chirish (faqat ishlatilmagan — ishlatilgani faqat faolsizlantiriladi), N ta bir martalik kod toʻplami → CSV (SMS/Telegram uchun); «Birinchi buyurtma chegirmasi» kartasi (yoqish, foiz). Buyurtma sahifasida promokod / birinchi buyurtma qatori. Pastda [Promokodlar](#promokodlar) |
| Kampaniyalar | yuborilgan xabarlar: auditoriya, yuborildi / navbatda / yetmadi |
| UTM havolalar | havola yaratish + `utm_campaign` bo'yicha natija (tashrif, xaridor, savdo) |
| Mahsulotlar | Mahsulotlar / Kategoriyalar / Brendlar — bitta tab qatori. Holat chiplari (sotuvda / tugagan / chegirmada / rasmsiz / sotuvdan olingan), kategoriya va brend filtri, saralash (tartib, nom, narx, yangi), o'rnatilgan katalogdan import, yangi, tahrir (uz/ru). Rasmlar: saytdagi rasmlardan tanlash oynasi (`public/products`, `public/images/products/c-*.png`, `public/images/stock` — so'rov paytida o'qiladi, `lib/admin/repo-images.server.ts`), tartib strelkalari, Tigris bo'lsa yuklash. Kategoriya selekti yonida «+ Yangi kategoriya». Saqlash saytni darhol yangilaydi |
| Ombor | mahsulot formasida «Ombordagi soni» (bo'sh — kuzatilmaydi) va «Kam qoldi chegarasi»; ro'yxatda ombor tugmasi («12 ta», «kam: 3», «tugagan», «kuzatilmaydi») → ± / aniq son / kuzatmaslik oynasi (izoh bilan), «Kam qolganlar» chipi, standart chegara kartasi; tahrir sahifasida «Ombor tarixi» |
| Kutayotganlar | `/admin/waitlist`: mahsulot × omborni / narxni kutayotganlar soni, «Hozir xabar yuborish», so'rovlar (telefon yashirin, bosilganda to'liq), holat va tur chiplari, bekor qilish, CSV |
| Kategoriyalar | kartalar setkasi (rasm, uz/ru nom, mahsulot soni), `categories/new`, `categories/[slug]` tahrir; slug bo'sh bo'lsa uz nomdan; mahsuloti bor kategoriya o'chirilmaydi |
| Brendlar | qo'shish (slug nomdan), tahrir, o'chirish, mahsulot soni |
| Telegram klub | [`BOT-ADMIN.md`](BOT-ADMIN.md) |
| Savdo qoidalari | `/admin/commerce` — yetkazish (bepul yetkazish chegarasi, kuryer narxi, viloyatlar muddati uz/ru, bugun yetkazish chegarasi SS:DD), upsell zinapoyasi (yoqish, 3 qadam foizi xavfsiz to'plamdan, bepul sovg'a), obuna (birinchi / keyingi %), savat takliflari (bepul yetkazishgacha qancha qolsa), pop-up'lar (welcome / exit / quiz: yoqish, kechikish, qayta ko'rsatish kuni, sarlavha/matn uz/ru). Har kartada «Mijoz ko'radi» qatori, «Standartga qaytarish», «Oxirgi o'zgartirgan». Pastda [Savdo qoidalari](#savdo-qoidalari) |
| Integratsiyalar | GA4, GTM, Yandex Metrika (+ Vebvizor), Meta Pixel, Google Search Console / Yandex Webmaster / Bing tasdiqlash kodi, Telegram operator, Resend; saytning o'z kuzatuvi holati |
| Administratorlar | qo'shish, o'chirish (o'zini va oxirgisini emas), parol almashtirish, barcha qurilmalardan chiqish |

## Vitrina — `/admin/storefront`

Uchta tab, hammasi saqlash bilan saytni darhol yangilaydi (`revalidateTag("merch")`,
taklifda `catalog` ham, + `revalidatePath("/", "layout")`). Saytdagi o'qish
`src/lib/merch/store.ts` (kesh, tag `merch`, xato bo'lsa jim — o'rnatilgan
ko'rinish), sof qism `src/lib/merch/model.ts` (testli).

- **Bannerlar** (`banners`, 0008). Joyi: `hero` (bosh sahifa slayderi),
  `strip` (header ostidagi ingichka qator, har sahifada), `category` (katalog
  va kategoriya sahifasida setka ustida; qidiruvda yo'q). uz/ru sarlavha,
  qo'shimcha matn, tugma; havola — saytdagi yo'l yoki `https://` (`safeHref`,
  boshqasi rad etiladi); rasm — saytdagi rasmlar oynasi yoki Tigris yuklash,
  telefon uchun alohida rasm ixtiyoriy; fon ochiq/qora; muddat (Toshkent vaqti).
  **Taymer faqat tugash sanasi bilan** — baza `check` bilan ham ushlaydi.
  Banner muddatidan oldin ko'rinmaydi, tugash daqiqasida ochiq sahifadan ham
  yo'qoladi (`useUnexpired`). **Faol slayder banneri bo'lmasa — `home.slides`
  dagi o'rnatilgan slaydlar aynan avvalgidek**; oxirgi banner sahifada tugasa
  ham o'rnatilgan slaydlar qaytadi: hero hech qachon bo'sh emas.
  Bosishlar: `trackPromotionClick` (`lib/analytics/events.ts`, GA4
  `select_promotion`) + `POST /api/b/:id` beacon — bot UA, boshqa sayt
  so'rovi va bitta manzildan 30 daqiqada takror bosish sanalmaydi.
- **Eʼlon qatori** — `site_settings` → `storefront.announcements` (JSON,
  ≤ 5 qator: uz/ru matn, havola, tugash vaqti, taymer, yoqilgan). Kompyuterda
  TopBar o'rtasida (havolalar o'rnida), telefonda header ustida; bir nechta
  bo'lsa 6 soniyada almashadi (hover/fokusda to'xtaydi, pauza tugmasi,
  reduced-motion'da aylanmaydi). Yoqilgan qator bo'lmasa — odatiy TopBar.
- **Bugungi taklif** (`deals`, 0008) — mahsulot + foiz yoki yangi narx +
  boshlanish/tugash (sukut: hozir → bugun 23:59 Toshkent). Navbatga keyingi
  kunlar uchun ham qo'yiladi; ikki taklif vaqti **ustma-ust tushmaydi**
  (`exclude using gist`).

### Bugungi taklif narxi qanday ishlaydi (qaror)

Mahsulot qatori (`price`/`old_price`/`sale_ends_at`) **o'zgartirilmaydi**.
Taklif — jadvaldagi yozuv; narx har o'qishda o'sha paytdagi soat bilan
hisoblanadi (`lib/catalog/deals.ts` → `dealPrice`, `CatalogEngine.resolveProduct`
ichida). Sabablar:

- Taklif boshlanishi/tugashi paytida hech qanday jarayon uyg'oq turishi shart
  emas (cron yo'q) — keshdagi ro'yxatda kelgusi taklif bor, oyna o'qishda tekshiriladi.
- Qatorni o'zgartirish varianti taklif tugagach eski narxni «tiklash»ni talab
  qilardi; admin shu orada narxni o'zgartirsa, tiklash uni bosib ketardi.
- Buyurtma action'i narxni o'sha engine'dan oladi (`shopflow.getProduct` →
  `repriceOrder`), shuning uchun checkout aynan sahifadagi narxni oladi va
  oynadan tashqarida taklif narxida sotib bo'lmaydi.

Taklif davomida: `oldPrice` = taklifdan oldingi **haqiqiy** narx (mahsulotning
o'z chegirmasi bo'lsa, o'sha chegirma narxi — o'ylab topilgan «eski narx»
yo'q), `price` = foiz (yuzlikkacha yaxlitlanadi) yoki yangi narx, `saleEndsAt`
= taklif tugashi — PDP'dagi haqiqiy taymer va brauzerdagi `livePrice` narxni
aynan o'sha soniyada qaytaradi. Yangi narx hozirgidan past bo'lmasa taklif
hech narsa qilmaydi. Bosh sahifadagi «Bugungi taklif» bloki faqat taklif
amalda bo'lganda (va mahsulot sotuvda bo'lsa) chiziladi. Kesh: katalog 60 s,
sahifalar ISR 300 s — boshlanish bosh sahifada 5 daqiqagacha kechikishi
mumkin, lekin **narx serverda har doim to'g'ri**.

## Saytning o'z kuzatuvi (mijozlar yo'li)

- Brauzer: `src/lib/journey/client.ts`. `lib/analytics/events.ts` dagi har bir
  GA4 hodisasi (`view_item`, `add_to_cart`, `begin_checkout`, `search`…) va har
  bir sahifa ko'rish shu yerga ham yoziladi; savat holati `CartJourney` orqali.
  Sessiya — `sessionStorage` (30 daqiqa jimlik), kirish manbasi (landing +
  referrer) har paket bilan yuboriladi. Bot va `navigator.webdriver` sanalmaydi.
- Server: `POST /api/t` (`src/lib/journey/collect.ts`) — `gv_vid` httpOnly
  cookie (1 yil), `visitors` + `visitor_events` (0006 migratsiya). Bosqich faqat
  oldinga siljiydi. 400 kundan eski hodisalar o'chiriladi.
- Buyurtma: checkout `linkOrderToVisitor` — telefon, ism, `orders.visitor_id`,
  server tomonidagi `purchase` hodisasi. Shu tufayli bitta mijozning bir nechta
  qurilmasi telefon bo'yicha birlashadi.
- O'qish: `src/lib/admin/crm.ts` (voronka, kanallar, mahsulot qiziqishi),
  `segments.ts` (auditoriyalar), `segment-export.ts` (CSV, xesh).

## Promokodlar

Migratsiya `0007_promo_codes.sql`: `promo_codes` (kod — katta harf, PK),
`promo_redemptions` (kod × buyurtma unikal, `(code, phone9)` indeks),
`orders.promo_code`. Chegirma qatori `orders.totals.adjustments` da
(`{kind:"promo",code,amount}` yoki `{kind:"first_order",percent,amount}`), u
`totals.discount` va `total` ga allaqachon kiritilgan.

**Qoidalar** (`src/lib/promo/rules.ts`, sof, testli):

- Promokod taklif (upsell, dastur, sovg'a) yoki obuna narxidagi qatorga
  **qo'shilmaydi** — `promotionApplies` tamoyili. Sayt aksiyasi (foiz, 2+1)
  qatorga avval qo'llanadi, kod qolgan narxdan hisoblanadi.
- Foiz — mos qatorlar summasidan; qat'iy summa — mos qatorlar summasidan oshmaydi.
- `min_subtotal` — taklif va aksiyalardan keyingi savat summasi (yetkazishsiz).
- Buyurtmaga **bitta** kod. Birinchi buyurtma chegirmasi va kod **qo'shilmaydi** —
  kattasi qo'llanadi; teng bo'lsa birinchi buyurtma (shaxsiy kod behuda sarflanmaydi).
- Bepul yetkazish chegarasi bu chegirmadan **oldin** o'lchanadi.
- Bekor qilingan buyurtma kodni qaytarmaydi (`uses` kamaymaydi).

**Atomiklik** (`src/lib/promo/server.ts` → `placeOrder`): bitta tranzaksiyada
telefon bo'yicha `pg_advisory_xact_lock`, kod qatori `for update`, limitlar
qayta tekshiriladi, buyurtma yoziladi, `promo_redemptions` qatori, `uses + 1`.
`max_uses = 1` kodni ikki parallel buyurtma ololmaydi — ikkinchisi
`promo_invalid` (`exhausted`) oladi, savat kodni olib tashlab sababini aytadi,
mijoz qayta yuboradi. Savatdagi tekshiruv (`app/actions/promo.ts`) faqat
maslahat: narxlar katalogdan, rate limit — kodli 15 / telefonli 40 ta / 10 daq / IP.

**Birinchi buyurtma chegirmasi** — `site_settings` `discount.firstOrder`
(`{"enabled":true,"percent":10}`, default `COMMERCE.discounts.firstOrderPercent`).
Baza bo'lsa (`ORDERS_IN_DB`): telefonning bekor qilinmagan oldingi buyurtmasi
bo'lmasa avtomatik qo'llanadi, savat telefon kiritilgach ko'rsatadi. Baza
bo'lmasa — avvalgidek: faqat eslatma, operator qo'llaydi. Welcome kartasi,
`/loyalty` va savat matni rejimga qarab (`lib/promo/offer.ts` → `FirstOrderOffer`:
`auto` / `operator` / `off`); o'chirilgan bo'lsa hech narsa va'da qilinmaydi.

**Keyingi bosqichlar uchun API:**

```ts
import { issuePromoCode, issuePromoCodeBatch } from "@/lib/promo/server";
const code = await issuePromoCode({
  kind: "percent", value: 10,          // yoki "fixed", soʻmda
  phone: "+998 90 123 45 67",          // ixtiyoriy — shaxsiy kod
  ttlHours: 72, source: "birthday",    // manual|campaign|flow|referral|birthday|first-order
  campaignId: "bd-2026-10", minSubtotal: 200_000, // ixtiyoriy
}); // → "GV-7K3P9Q" (default: bir martalik, 1 telefon — 1 marta)
```

## Ombor va kutayotganlar (0009)

- `products.stock_qty` `null` — son kuzatilmaydi, mahsulot avvalgidek faqat
  `in_stock` bilan ishlaydi. Son kiritilsa `in_stock` undan aniqlanadi (0 → tugagan).
- **Buyurtma**: `saveOrderToDb` bitta tranzaksiyada buyurtmani yozadi va har
  mahsulotdan `update … set stock_qty = stock_qty - n where stock_qty >= n`
  bilan oladi (mahsulotlar id bo'yicha tartibda — deadlock yo'q). Yetmasa
  tranzaksiya qaytadi va savat «Faqat N ta qoldi» deb qator sonini tushiradi.
  Keyin `catalog` tegi va mahsulot sahifalari yangilanadi.
- **Bekor qilish** (admin holat → «Bekor qilindi»): buyurtma qatori qulflanadi,
  uning `stock_movements` netosi qaytariladi — ikki marta bosilsa ham bir marta.
  Bekor qilingan buyurtma qayta ochilsa son yana olinadi (0 dan pastga emas).
- Har bir o'zgarish `stock_movements` da: `order`, `cancel`, `manual` (izoh bilan), `import`.
- Forma sonni faqat admin maydonni o'zgartirganda yozadi (`stockQtyBefore`) —
  forma ochiq turganda tushgan buyurtma qaytarib yozilmaydi.
- **So'rovlar**: «Xabar ber» (tugagan) va «Narxi tushsa xabar bering» (sotuvda,
  ko'rgan narxi saqlanadi) — `restock_requests`, telefon + mahsulot + tur bo'yicha
  bitta kutayotgan qator. Telefon klub botiga bog'langan bo'lsa chat id yoziladi.
- **Xabar**: mahsulot sotuvga qaytsa (forma, «Omborga keldi», ± oynasi, bekor
  qilish) yoki narxi saqlangan narxdan tushsa `afterProductChange` →
  `notifyWaitlist` (`lib/notify/waitlist.ts`): qatorlar band qilinadi, kanallar
  ketma-ket — Telegram (`bot_jobs`, dedupe `restock:<id>`, havola
  `utm_source=telegram&utm_medium=restock`), SMS (hozircha `not_configured`,
  keyingi bosqich shu `Notifier` ga ulanadi), qolganlar operatorga qo'ng'iroq
  ro'yxati bo'lib boradi. Hech bir kanal qabul qilmasa qator yana «kutmoqda».

## Savdo qoidalari

`site_settings` `commerce.rules` — bitta JSON: `{ settings: {delivery, ladder,
subscription, cart, popups}, meta: {<bo'lim>: {by, at}} }`. Faqat saqlangan
bo'limlar yoziladi; «Standartga qaytarish» bo'limni o'chiradi va u yana
standartga ergashadi. **Standartlar = eski kod konstantalari**
(`lib/config/commerce.ts`, zinapoya 10/15/20 + sovg'a, pop-up 30/3/7 kun,
savat taklifi 150 000, cut-off — `NEXT_PUBLIC_DELIVERY_CUTOFF`), ya'ni qator
bo'lmasa yoki buzilgan bo'lsa sayt avvalgidek ishlaydi: har bir maydon o'z
standartiga alohida qaytadi (`coerceCommerceSettings`).

- **O'qish**: server — `getCommerceSettings()` (`lib/commerce/server.ts`,
  `unstable_cache`, teg `SITE_SETTINGS_TAG`); klient — `[locale]/layout.tsx`
  `CommerceProvider` orqali `useCommerce()` / `usePricingRules()`. Klient fayl
  server modulni import qilmaydi. Saqlash `revalidateTag` + `revalidatePath("/", "layout")`.
  ISR sahifa saqlangandan keyingi birinchi so'rovda eski nusxani berib, fonda
  yangilanadi (Next.js stale-while-revalidate) — keyingisi yangi; buyurtma narxi
  esa har doim yangi qiymat bilan hisoblanadi.
- **Narx**: `computeTotals(lines, promotions, { pickup, rules })` sof; savat
  (`CheckoutForm`, `CartDrawer`, exit popup) va server (`repriceOrder(..., { pricing,
  ladder })` checkout action'da, `promo/server.ts` `min_subtotal`) bitta
  qiymatdan. Bepul yetkazish chegarasi endi **hamma** buyurtmaga (bir martalik ham);
  `free_shipping_over` aksiyasi uni faqat pasaytira oladi — panel shunday aksiya
  faol bo'lsa ogohlantiradi.
- **Zinapoya**: foizlar `LADDER_PERCENT_CHOICES` (5, 10, 12, 15, 20, 25, 30)
  dan, o'suvchi. Server qabul qiladigan to'plam `ladderPercentsAccepted(ladder)` —
  savat qurgan to'plamning o'zi; o'chirilgan zinapoya — hech qanday foiz. Foiz
  o'zgarganda eski taklif qatori bor savat `invalid_offer` + `slug` oladi va
  qatorni olib tashlaydi (mavjud mexanizm).
- **Pop-up'lar**: o'chirilgani `DeferredUi` da yuklanmaydi ham; `usePopups.request(id, rule)`
  va `popupAllowed(id, rule)` o'chirilganini rad etadi, cool-down — sozlamadan.
- **Matnlar**: tarjimalar raqamni placeholder bilan oladi; `copy-literals.test.ts`
  standart chegarani/narxni qo'lda yozilgan tarjimani topsa yiqiladi.
- Testlar: `lib/commerce/settings.test.ts` (parse, fallback, forma),
  `pricing-agreement.test.ts` (generatsiya qilingan savatlar × 5 qoida to'plami —
  klient = server; zinapoya quriladi = qabul qilinadi), `lib/ui/popups.test.ts`.

## Integratsiya sozlamalari

- Ommaviy qiymatlar (analytics ID, Vebvizor, tasdiqlash kodlari) —
  `site_settings` jadvali, **shifrlash kalitisiz** (`src/lib/integrations/site-settings.ts`).
  Saqlash bilan `/api/public/analytics` va `<head>` meta-teglari yangilanadi.
- Maxfiylari (bot tokeni, Resend kaliti) — `integration_settings`, AES-256-GCM,
  `INTEGRATION_ENCRYPTION_KEY` kerak.
- CSP: `ADMIN_ANALYTICS_CSP=on` Dockerfile va `fly.toml` da yoqilgan — to'rtta
  vendorning hostlari va Vebvizor uchun `frame-ancestors` (metrika.yandex.*, webvisor.com).

## Xavfsizlik

- Parol — scrypt (`node:crypto`), sessiya — HMAC imzolangan cookie
  (`/admin` path, httpOnly, SameSite=Strict, Secure), 7 kun.
- Har sahifa va har server action `requireAdmin()` dan boshlanadi.
- Admin orqali saqlangan Telegram bot tokeni va Resend API key `INTEGRATION_ENCRYPTION_KEY`
  bilan AES-256-GCM formatida shifrlanadi; ciphertext va setting nomi
  autentifikatsiyalangan. Kalit hech qachon brauzerga yuborilmaydi.
- Kirish: email bo'yicha 5 ta **noto'g'ri** urinish / 10 daqiqa (muvaffaqiyatli
  kirish sanalmaydi), IP bo'yicha 20; noto'g'ri email va parolga bir xil javob.
- Sessiya `session_epoch` bilan: parol almashtirish yoki «barcha qurilmalardan
  chiqish» oldingi barcha cookie'larni bekor qiladi.
- `/admin` — `robots.txt` da disallow, `noindex`.

## Kod

| fayl | vazifa |
|---|---|
| `db/migrations/*.sql` | sxema (haqiqat manbai) |
| `src/lib/db/` | ulanish, Drizzle sxema turlari |
| `src/lib/catalog/engine.ts` | katalog o'qish mantig'i (ikkala manba uchun bitta) |
| `src/lib/catalog/db.ts` | bazadan o'qish (kesh, fallback), buyurtma yozish |
| `src/lib/catalog/product-facts.ts` | kesma rasm / birlik / brend — mahsulotdan, bo'lmasa jadvaldan |
| `src/lib/admin/` | auth, forma codec, order reporting, mijoz lifecycle va so'rovlar |
| `src/app/admin/` | sahifalar va server action'lar |
| `db/migrations/0004_admin_customer_notes.sql` | mijozga biriktirilgan ichki xizmat izohlari |
| `db/migrations/0005_admin_integration_settings.sql` | panel sozlamalari uchun shifrlangan integration ciphertext jadvali |
| `db/migrations/0006_crm_marketing.sql` | `visitors`, `visitor_events`, `orders.visitor_id`, `promotions`, `campaigns`, `site_settings`, `admin_users.session_epoch` |
| `db/migrations/0007_promo_codes.sql` | `promo_codes`, `promo_redemptions`, `orders.promo_code` |
| `src/lib/promo/` | promokod qoidalari (`rules.ts`, testli), tranzaksiya va `issuePromoCode` (`server.ts`), birinchi buyurtma sozlamasi (`settings.ts`, `offer.ts`), savat store'i (`store.ts`, `govita-promo`) |
| `db/migrations/0009_stock_waitlist.sql` | `products.stock_qty`, `products.low_stock_at`, `stock_movements`, `restock_requests` |
| `src/lib/catalog/stock-rules.ts`, `stock.ts`, `order-stock.ts` | ombor qoidalari (sof, testli), bazadagi o'zgarishlar, buyurtma holati → ombor |
| `src/lib/notify/` | kutayotganlar: `Notifier` interfeysi, kanallar, xabar matnlari (uz/ru), dispatch |
| `db/migrations/0008_storefront_merchandising.sql` | `banners`, `deals` (Vitrina) |
| `src/lib/merch/` | Vitrina: `model.ts` (sof, testli), `store.ts` (saytdagi o'qish, kesh `merch`) |
| `src/lib/catalog/deals.ts` | bugungi taklif narxi (sof, testli) |
| `src/lib/commerce/` | savdo qoidalari: model, standartlar, parse (`settings.ts`), admin forma (`form.ts`), o'qish/yozish (`server.ts`), klient context (`context.tsx`) |
| `src/lib/journey/` | kuzatuv: brauzer klienti, server yig'uvchi, sof qoidalar (`model.ts`, testli) |
