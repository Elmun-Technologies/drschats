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
| Aksiyalar | foizli chegirma, 2+1, summadan bepul yetkazish — mahsulotlar, boshlanish/tugash, yoqish/o'chirish. Jadvalda qator bo'lmasa kod ichidagi aksiyalar ishlaydi; «Panelga olish» ularni tahrirlanadigan qiladi. Pastda mahsulot chegirmalari (eski narx + muddat) |
| Promokodlar | kodlar ro'yxati (holat: faol / tugagan / shaxsiy; manba bo'yicha), ishlatildi / limit, kod keltirgan buyurtma va tushum, 30 kunlik ko'rsatkichlar; yaratish (kod qo'lda yoki avtomatik `GV-7K3P9Q`), tahrir, o'chirish (faqat ishlatilmagan — ishlatilgani faqat faolsizlantiriladi), N ta bir martalik kod toʻplami → CSV (SMS/Telegram uchun); «Birinchi buyurtma chegirmasi» kartasi (yoqish, foiz). Buyurtma sahifasida promokod / birinchi buyurtma qatori. Pastda [Promokodlar](#promokodlar) |
| Kampaniyalar | yuborilgan xabarlar: auditoriya, yuborildi / navbatda / yetmadi |
| UTM havolalar | havola yaratish + `utm_campaign` bo'yicha natija (tashrif, xaridor, savdo) |
| Mahsulotlar | Mahsulotlar / Kategoriyalar / Brendlar — bitta tab qatori. Holat chiplari (sotuvda / tugagan / chegirmada / rasmsiz / sotuvdan olingan), kategoriya va brend filtri, saralash (tartib, nom, narx, yangi), o'rnatilgan katalogdan import, yangi, tahrir (uz/ru). Rasmlar: saytdagi rasmlardan tanlash oynasi (`public/products`, `public/images/products/c-*.png`, `public/images/stock` — so'rov paytida o'qiladi, `lib/admin/repo-images.server.ts`), tartib strelkalari, Tigris bo'lsa yuklash. Kategoriya selekti yonida «+ Yangi kategoriya». Saqlash saytni darhol yangilaydi |
| Kategoriyalar | kartalar setkasi (rasm, uz/ru nom, mahsulot soni), `categories/new`, `categories/[slug]` tahrir; slug bo'sh bo'lsa uz nomdan; mahsuloti bor kategoriya o'chirilmaydi |
| Brendlar | qo'shish (slug nomdan), tahrir, o'chirish, mahsulot soni |
| Telegram klub | [`BOT-ADMIN.md`](BOT-ADMIN.md) |
| Integratsiyalar | GA4, GTM, Yandex Metrika (+ Vebvizor), Meta Pixel, Google Search Console / Yandex Webmaster / Bing tasdiqlash kodi, Telegram operator, Resend; saytning o'z kuzatuvi holati |
| Administratorlar | qo'shish, o'chirish (o'zini va oxirgisini emas), parol almashtirish, barcha qurilmalardan chiqish |

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
| `src/lib/journey/` | kuzatuv: brauzer klienti, server yig'uvchi, sof qoidalar (`model.ts`, testli) |
