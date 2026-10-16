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
2. Bosh sahifada **«Import qilish»** — mavjud katalog (30 mahsulot, 15 kategoriya,
   7 brend) bazaga ko'chadi. Takror bosish xavfsiz.
3. `fly secrets unset ADMIN_SETUP_TOKEN -a govita`.

## Bo'limlar

| bo'lim | nima qiladi |
|---|---|
| Bosh sahifa | 7 / 30 / 90 kunlik bekor qilinmagan buyurtma summasi, buyurtmalar, o'rtacha chek, statuslar, katalog va manbalar |
| Analitika | buyurtma summasi, UTM / click ID manbalari, mahsulot kesimi va buyurtma statuslari. Tashrif / sessiya metrikasi GA4 yoki Yandex Metrikada qoladi |
| Savdo voronkasi | yangi → tasdiqlangan → yo'lda → yetkazilgan va bekor qilinganlar. Yangi buyurtma avtomatik kiradi; statusni operator o'zgartiradi. BTS / Yandex kuryer statusi hozircha avtomatik ulanmagan |
| Buyurtmalar | raqam, ism, telefon yoki email bo'yicha qidiruv; holat filtri, tafsilot, status tarixi va ichki izoh. Holat o'zgarsa Telegram klub botida xabar boradi (raqami bog'langan yoki Mini App'dan buyurtma bergan bo'lsa) |
| Mijozlar | buyurtma telefonining oxirgi 9 raqami bo'yicha birlashtirilgan profil, xaridlar tarixi, manba va jamoa izohlari. Izohga sog'liq yoki karta ma'lumotini yozmang |
| Mahsulotlar | qidiruv, yangi, tahrir (uz/ru), rasm yuklash, o'chirish |
| Kategoriyalar | qo'shish, tahrir (slug o'zgarsa mahsulotlar ham ko'chadi), bo'shini o'chirish |
| Brendlar | qo'shish, nomi, o'chirish (mahsulotlar brendsiz qoladi) |
| Marketing | UTM havola yaratish, buyurtma manbalarini ko'rish, email / Telegram / SMS konfiguratsiya holati |
| Blog va kontent | maqolalar ro'yxati va himoyalangan Go Vita admin ichida Sanity Studio. CMS ulanmagan bo'lsa statik maqolalar faqat ko'rish uchun |
| Integratsiyalar | GA4, GTM, Yandex Metrika, Meta Pixel, to'lov merchant ID holati, Telegram, email va Sanity. Analytics ID’lari, operator Telegram va Resend email qiymatlari panelda boshqariladi; Telegram chatni ko'rish testi va admin kiritgan manzilga bitta test emaili mavjud. Payme/Click/Uzum merchant ID’si checkout’ni yoqmaydi: toʻliq gateway handoff va tasdiqlangan callback hali mavjud emas |
| Telegram klub | bot sozlamalari, klubga xabar, murojaatlarga javob, a'zolar, xabarlar navbati — [`BOT-ADMIN.md`](BOT-ADMIN.md) |
| Administratorlar | qo'shish, o'chirish (o'zini emas) |

**Toʻlov cheklovi:** Payme, Click va Uzum faqat merchant ID kiritilganidan emas, server-side gateway handoff va tasdiqlangan callback oqimi toʻliq ishlagandan keyingina checkout’da yoqiladi. Hozir ular reja holatida; mijoz checkout’i yetkazishda naqd pul bilan ishlaydi.

**Mahsulotni yashirish** — o'chirmang, «Holat» → «Sotuvdan olingan»: sahifa
havolalari ishlashda davom etadi, ro'yxatlarda ko'rinmaydi.

## Xavfsizlik

- Parol — scrypt (`node:crypto`), sessiya — HMAC imzolangan cookie
  (`/admin` path, httpOnly, SameSite=Strict, Secure), 7 kun.
- Har sahifa va har server action `requireAdmin()` dan boshlanadi.
- Admin orqali saqlangan Telegram bot tokeni va Resend API key `INTEGRATION_ENCRYPTION_KEY`
  bilan AES-256-GCM formatida shifrlanadi; ciphertext va setting nomi
  autentifikatsiyalangan. Kalit hech qachon brauzerga yuborilmaydi.
- Kirish: 5 urinish / 10 daqiqa (IP va email bo'yicha), noto'g'ri email va
  parolga bir xil javob.
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
