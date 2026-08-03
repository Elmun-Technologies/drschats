# Qolgan ishlar — sizdan nima kerak

Bu fayl **faqat sizdan kelishi mumkin bo'lgan** ishlarni sanaydi. Kod tomondan
o'lchanadigan nuqson qolmadi (holat: `CLAUDE.md` → "Sifat darajasi"). Sayt ishga
tushmayotgan bo'lsa, sabab quyidagilarning birida.

Har bo'lim: **nima kerak → qayerga qo'yiladi → tayyor bo'lgani qanday bilinadi.**

Ustuvorlik: 🔴 ishga tushirishni to'sadi · 🟡 sifatga jiddiy ta'sir · 🟢 keyin bo'lsa ham bo'ladi

---

## 🔴 1. Sog'liq mavzulari matnlari

**Eng katta bo'shliq.** Sayt "mahsulot bo'yicha emas, maqsad bo'yicha tanlang"
g'oyasi ustiga qurilgan — lekin maqsadlarning o'zi yozilmagan.

Hozirgi holat (ishlab turgan saytdan sanaldi):

| bo'lim | hozir | asosiy menyuda? |
|---|---|---|
| `/vitamins` | **0 ta** | ha |
| `/symptoms` | **1 ta** | ha |
| `/goals` | **2 ta** | ha |
| `/programs` | 7 ta | ha |
| `/ingredients` | 5 ta | yo'q |
| `/blog` | 3 ta | ha |
| `/news` | **0 ta** | yo'q |
| `/brands` | **0 ta** | ha |

Ya'ni foydalanuvchi menyudan "Vitaminlar"ga bosganda bo'sh sahifaga tushadi.
(Hozir u yerda hech bo'lmasa "AI konsultant" va "Katalog" tugmalari chiqadi —
boshi berk ko'cha emas, lekin bo'sh.)

### Har bir mavzu uchun nima yozilishi kerak

Struktura `src/sanity/schemas/healthTopic.ts` da belgilangan. Har bir mavzu:

| maydon | nima | uzunlik |
|---|---|---|
| `name` | mavzu nomi | 1–3 so'z |
| `headline` | bir jumlalik va'da | ~60 belgi |
| `intro` | kirish matni | 2–4 jumla |
| `bullets` | asosiy nutriyentlar, har biri "nima uchun" bilan | 3–5 ta |
| `body` | asosiy matn | 300–600 so'z |
| `faq` | savol-javob | 3–5 ta |

**Ikkala tilda: uz va ru.**

### Tavsiya qilinadigan ro'yxat

Quiz mexanizmi allaqachon shu slug'larga vazn beradi
(`src/lib/quiz/questions.ts` → `topics`), shuning uchun avval shularni yozish
eng katta samara beradi:

**Maqsadlar (`/goals`)** — bor: `immunity`, `sleep`
`energy` · `beauty` · `stress` · `digestion` · `heart` · `joints` · `brain` ·
`weight` · `sport` · `pregnancy`

**Belgilar (`/symptoms`)** — bor: 1 ta
`charchoq` · `uyqusizlik` · `soch to'kilishi` · `tirnoq siniqligi` ·
`bosh og'rig'i` · `qorin damlashi` · `tez-tez shamollash` · `diqqat pasayishi`

**Vitaminlar (`/vitamins`)** — bor: 0 ta
`vitamin-d` · `vitamin-c` · `vitamin-b12` · `magniy` · `sink` · `temir` ·
`omega-3` · `kollagen` · `probiotik` · `kaltsiy`

Jami ~30 ta. **Boshlash uchun 10 tasi ham yetadi** — har bo'limda 3–4 tadan.

### ⚠️ Muhim: bu matnni men yozmadim va yozmayman

Matn tibbiy. Men vitamin nima qilishi haqida ishonchli ko'ringan, lekin
manbasiz jumlalar yoza olaman — bu esa dorixona uchun **yuridik va insoniy
xavf**. O'zbekiston "Reklama to'g'risida"gi qonuni 35-moddasi BAD reklamasiga
alohida talab qo'yadi.

Kerak: **farmatsevt yoki shifokor yozgan/tasdiqlagan matn.** Saytda ekspertlar
kengashi bo'limi (`/experts`) allaqachon bor — matnni o'shalar imzolashi mantiqiy.

### Qayerga qo'yiladi

Ikki yo'l bor:

1. **Sanity CMS** (tavsiya qilinadi) — `/studio` sahifasi orqali. Sxema tayyor.
2. **Kod ichida** — `src/lib/content/health-topics.ts`.

Sanity ma'lumot topsa, o'shani ishlatadi; topmasa kod ichidagi fallback'ga
qaytadi. Ikkalasi ham ishlaydi.

**Tayyor bo'lgani qanday bilinadi:** `/uz/vitamins` va `/ru/vitamins` da
kartalar chiqadi, bo'sh holat paneli ko'rinmaydi.

---

## 🔴 2. Mahsulot rasmlari

Hozir **barcha rasmlar** generatsiya qilingan SVG gradientlar
(`/placeholders/p1.svg` … `p6.svg`). Vitamin sotadigan saytda mahsulot rasmi
yo'qligi konversiyaga to'g'ridan-to'g'ri uradi — odam ko'rmagan narsani sotib
olmaydi.

### Kerak

- Har bir mahsulot uchun **kamida 1**, yaxshisi **3–4 ta** foto
  (old tomon, orqa/tarkib, o'lcham uchun qo'lda, qadoq ochilgan)
- Oq yoki neytral fonda, kvadrat kadr
- Kamida 1200×1200 px
- WebP yoki JPEG

### Qayerga qo'yiladi

`src/lib/brand.ts` → `productImageOverrides`:

```ts
productImageOverrides: {
  "swiss-energy-immunovit-30": [
    "https://cdn.example.com/immunovit-1.webp",
    "https://cdn.example.com/immunovit-2.webp",
  ],
}
```

Tashqi host ishlatilsa, uni `next.config.ts` → `images.remotePatterns` ga
qo'shish kerak. Ayting — men qo'shaman.

Mahsulot slug'lari ro'yxati: `src/lib/shopflow/mock.ts` (28 ta mahsulot).

**Tayyor bo'lgani qanday bilinadi:** katalogda gradient o'rniga haqiqiy fotolar.

---

## 🔴 3. Server va env o'zgaruvchilari

Siz aytgandingiz — oxirida ulaysiz. Mana aniq ro'yxat.

### 3a. Katalog backend (Shopflow)

```env
SHOPFLOW_MODE=http
SHOPFLOW_API_URL=https://api.shopflow.uz
SHOPFLOW_API_KEY=...
```

Hozir `mock` rejimida — 28 ta mahsulot kod ichida. Adapter tayyor
(`src/lib/shopflow/`), rejim almashtirilsa real API'ga o'tadi.

### 3b. Akkaunt backend (FastAPI) — yozilgan, deploy qilinmagan

`backend/` papkasida: FastAPI + SQLAlchemy + Alembic, auth va orders, testlari
bilan. `docker-compose.yml` da `api` xizmati bor.

Deploy qilingandan keyin:

```env
NEXT_PUBLIC_API_URL=https://api.govita.uz
```

Bu bitta o'zgaruvchi **kabinet, buyurtmalar tarixi va sodiqlik dasturini**
yoqadi. Hozir `isApiConfigured()` false → o'sha UI umuman chizilmaydi (shuning
uchun `/uz/account` 404 beradi — bu xato emas, ataylab).

Backend uchun alohida kerak: `DATABASE_URL`, `JWT_SECRET`.

### 3c. Telegram (buyurtma xabarlari)

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

@BotFather orqali bot yarating, guruhga qo'shing, chat ID'ni oling. Bularsiz
buyurtma qabul qilinadi, lekin sizga xabar bormaydi.

### 3d. Analitika

```env
NEXT_PUBLIC_GTM_ID=GTM-...
NEXT_PUBLIC_META_PIXEL_ID=...
NEXT_PUBLIC_YANDEX_METRIKA_ID=...
```

Kod tomondan hodisalar allaqachon yuboriladi (`src/lib/analytics/events.ts`):
mahsulot ko'rish, savatga qo'shish, checkout boshlash, buyurtma, upsell qabul/rad.
ID qo'yilmasa — hech narsa yozilmaydi.

### 3e. Sayt manzili

```env
NEXT_PUBLIC_SITE_URL=https://govita.uz
```

Bu sitemap, canonical va hreflang uchun. **Domenni qo'ymasangiz SEO ishlamaydi.**

### 3f. Sanity CMS

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...
SANITY_REVALIDATE_SECRET=...
```

---

## 🟡 4. Brend ma'lumotlari

`src/lib/brand.ts` da **hali eski brend** ma'lumotlari turibdi. Men ularni
ataylab o'zgartirmadim: ular hozir **ishlaydigan** manzillar, men esa yo'q
manzilni o'ylab topa olmayman.

| maydon | hozir | kerak |
|---|---|---|
| `legalName` | `"Go Vita"` | haqiqiy yuridik nom (MChJ …) |
| `contact.email` | `info@alimkhanov.com` | Go Vita pochtasi |
| `contact.b2bEmail` | `b2b@alimkhanov.com` | Go Vita B2B pochtasi |
| `contact.phone` | `+998 71 200 00 00` | haqiqiy raqam |
| `social.telegram` | `t.me/alimkhanov_pharm` | Go Vita kanali |
| `social.instagram` | `instagram.com/alimkhanov_pharm` | Go Vita profili |
| `social.facebook` | `facebook.com/alimkhanov.pharm` | Go Vita sahifasi |
| `logo` | `null` (matn wordmark) | `/public/brand/logo.svg` |

Logotip qo'ysangiz `BRAND.logo` ga yo'lni yozing — `<Logo>` avtomatik rasmga
o'tadi. Hozir "GO**VITA**" matn wordmark ishlatiladi va u yomon ko'rinmaydi,
shoshilinch emas.

**Rekvizitlar sahifasi** (`/requisites`) ham to'ldirilishi kerak: STIR, bank
hisob raqami, yuridik manzil.

---

## 🟡 5. Litsenziya va sertifikatlar

`/licenses` sahifasi bor, lekin haqiqiy hujjatlar yo'q. Saytda `cGMP`, `ISO
22000`, `Halal`, `IFOS` belgilari ko'rsatiladi.

**Bu belgilar haqiqiy sertifikatlarga asoslanishi shart.** Aks holda bu yolg'on
reklama. Sertifikat skanlarini bering — sahifaga qo'yaman. Yoki sertifikat
yo'q bo'lsa — belgilarni olib tashlash kerak, ayting.

Xuddi shu `/uz/about` dagi ishlab chiqarish da'volari uchun ham.

---

## 🟡 6. Sharhlar — kelib chiqishi

`/reviews` da 18 ta sharh bor, mahsulotlarda ham reyting/sharhlar ko'rsatiladi.
**Ular kod ichidagi namuna ma'lumot.**

Haqiqiy mijoz sharhlari bilan almashtirilishi kerak. Sotuv boshlanmagan bo'lsa —
sharhlarni vaqtincha yashirish to'g'riroq bo'ladi. Ayting, qaysi biri.

Men o'ylab topilgan mijoz sharhi yozmayman.

---

## 🟢 7. Bosh sahifadagi ijtimoiy-isbot

Pastki chap burchakda "Malika S. — Samarqand, Vitamin D3+K2 sotib oldi" kabi
xabarlar chiqadi (`LivePurchaseToast`). **Bu ham namuna ma'lumot.**

Ikki yo'l:
1. Haqiqiy buyurtmalarga ulash (backend tayyor bo'lgach)
2. O'chirish

Hozirgi holat — sotuv boshlanmagan saytda soxta sotuvlar ko'rsatish — uzoq
muddatda ishonchga zarar. Ayting, qaysi biri.

---

## 🟢 8. Mening qo'limdan keladigan, lekin ruxsat kutayotgan ishlar

Bularni men qila olaman — faqat "ha" deng:

| ish | nima o'zgaradi |
|---|---|
| 404 sahifasiga `lang` atributi | root layout qayta quriladi — biroz xavfliroq o'zgarish |
| Playwright'ni `devDependencies`ga | audit skriptlari CI'da yuradi, regressiya avtomatik tutiladi |
| `en` tilini qo'shish | 638 ta kalit × 1 til tarjima kerak (yoki men taxminiy qilaman, siz tekshirasiz) |
| Bo'sh menyu bo'limlarini vaqtincha yashirish | kontent tayyor bo'lguncha `/vitamins` menyudan olinadi |
| Sharh/ijtimoiy-isbot namunalarini o'chirish | soxta ma'lumot yo'qoladi |

---

## Ishga tushirishdan oldin minimal ro'yxat

Eng qisqa yo'l — shu 6 tasi:

- [ ] `NEXT_PUBLIC_SITE_URL` = haqiqiy domen
- [ ] `SHOPFLOW_MODE=http` + API kalitlari (yoki mock bilan qolish qarori)
- [ ] Telegram bot — buyurtma xabarlari borishi uchun
- [ ] Kamida 10 ta sog'liq mavzusi matni (shifokor tasdig'i bilan)
- [ ] Mahsulot fotolari
- [ ] `BRAND.contact` — haqiqiy manzillar

Qolganini keyin ham qo'shsa bo'ladi.

---

*Bu fayl 2026-08-03 da yozilgan. Raqamlar o'sha kuni ishlab turgan production
build'dan o'lchangan, taxmin emas.*
