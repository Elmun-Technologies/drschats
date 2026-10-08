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

### 1. Postgres — Fly.io

**Fakt:** sayt Vercel'da, baza Fly'da bo'lsa, Vercel serverlari bazaga
internet orqali ulanadi — bazaga tashqi (public) ulanish va TLS kerak.

1. Fly'da Postgres yarating (Fly Managed Postgres yoki `fly postgres create`).
   Region — Vercel funksiyalari bilan bir joyda (masalan Frankfurt `fra` va
   Vercel'da Function Region `fra1`). O'zbekistonga ham eng yaqin variant.
2. Tashqi ulanishni yoqing (Fly hujjati: "Connect to Postgres from outside
   Fly"). **Taxmin:** odatda alohida IPv4 va 5432 port xizmati kerak — aniq
   buyruqlar Fly hujjatida.
3. Ulanish satri: `postgres://user:parol@host:5432/db?sslmode=require`.

Muqobil: saytni ham Fly'ga ko'chirish (Dockerfile) — baza ichki tarmoqda
qoladi. Bu alohida qaror; hozirgi kod ikkalasida ham ishlaydi.

### 2. Rasm saqlash — Tigris (ixtiyoriy)

```bash
fly storage create          # ommaviy o'qish uchun bucket'ni public qiling
```

Buyruq chiqargan qiymatlarni Vercel'ga qo'ying: `AWS_ENDPOINT_URL_S3`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BUCKET_NAME`, `AWS_REGION`.
CDN qo'yilsa — `STORAGE_PUBLIC_URL`. Tigris bo'lmasa panel rasm URL'larini
qo'lda qabul qiladi.

### 3. Vercel environment (faqat **Production**)

| o'zgaruvchi | qiymat |
|---|---|
| `DATABASE_URL` | 1-qadamdagi satr |
| `ADMIN_SESSION_SECRET` | tasodifiy, ≥ 32 belgi (`openssl rand -base64 48`) |
| `ADMIN_SETUP_TOKEN` | tasodifiy, ≥ 16 belgi — birinchi admin yaratilgach **o'chiring** |
| Tigris o'zgaruvchilari | 2-qadam |

`DATABASE_URL` ni **Preview** muhitiga qo'ymang: preview build migratsiya
qilmaydi (`VERCEL_ENV` tekshiriladi), lekin production bazaga yozishi mumkin.

Maxfiy qiymatlarni chatga yoki kodga yozmang — faqat Vercel/Fly sozlamalariga.

### 4. Deploy

`npm run build` avval `db/migrations/*.sql` ni qo'llaydi (faqat production,
har biri bir marta, `schema_migrations` jadvali). Qo'lda: `npm run db:migrate`.

### 5. Birinchi kirish

1. `https://www.govita.uz/admin/setup` — sozlash kaliti (`ADMIN_SETUP_TOKEN`),
   ism, email, parol (≥ 12 belgi). Sahifa birinchi admin yaratilgach yopiladi.
2. Bosh sahifada **«Import qilish»** — mavjud katalog (30 mahsulot, 15 kategoriya,
   7 brend) bazaga ko'chadi. Takror bosish xavfsiz.
3. `ADMIN_SETUP_TOKEN` ni Vercel'dan o'chiring.

## Bo'limlar

| bo'lim | nima qiladi |
|---|---|
| Bosh sahifa | bugungi/ochiq/7 kunlik buyurtmalar, tushum, katalog soni, import |
| Buyurtmalar | ro'yxat (holat bo'yicha filtr), tafsilot, holat va ichki izoh |
| Mahsulotlar | qidiruv, yangi, tahrir (uz/ru), rasm yuklash, o'chirish |
| Kategoriyalar | qo'shish, tahrir (slug o'zgarsa mahsulotlar ham ko'chadi), bo'shini o'chirish |
| Brendlar | qo'shish, nomi, o'chirish (mahsulotlar brendsiz qoladi) |
| Administratorlar | qo'shish, o'chirish (o'zini emas) |

**Mahsulotni yashirish** — o'chirmang, «Holat» → «Sotuvdan olingan»: sahifa
havolalari ishlashda davom etadi, ro'yxatlarda ko'rinmaydi.

## Xavfsizlik

- Parol — scrypt (`node:crypto`), sessiya — HMAC imzolangan cookie
  (`/admin` path, httpOnly, SameSite=Strict, Secure), 7 kun.
- Har sahifa va har server action `requireAdmin()` dan boshlanadi.
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
| `src/lib/admin/` | auth, forma codec (test bilan), so'rovlar, saqlash |
| `src/app/admin/` | sahifalar va server action'lar |
