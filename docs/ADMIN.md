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
Maxfiy qiymatlarni chatga yoki kodga yozmang.

### 5. Birinchi kirish

1. `https://www.govita.uz/admin/setup` — sozlash kaliti (`ADMIN_SETUP_TOKEN`),
   ism, email, parol (≥ 12 belgi). Sahifa birinchi admin yaratilgach yopiladi.
2. Bosh sahifada **«Import qilish»** — mavjud katalog (30 mahsulot, 15 kategoriya,
   7 brend) bazaga ko'chadi. Takror bosish xavfsiz.
3. `fly secrets unset ADMIN_SETUP_TOKEN -a govita`.

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
