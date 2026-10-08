# Qolgan ishlar — sizdan nima kerak

Bu fayl **faqat sizdan kelishi mumkin bo'lgan** ishlarni sanaydi. Kod tomondan
o'lchanadigan nuqson qolmadi (holat: `CLAUDE.md` → "Sifat darajasi"). Sayt ishga
tushmayotgan bo'lsa, sabab quyidagilarning birida.

Har bo'lim: **nima kerak → qayerga qo'yiladi → tayyor bo'lgani qanday bilinadi.**

Ustuvorlik: 🔴 ishga tushirishni to'sadi · 🟡 sifatga jiddiy ta'sir · 🟢 keyin bo'lsa ham bo'ladi

---

## ⚡ Ishga tushirish uchun minimal to'plam (2026-10-08)

Kod tomoni tayyor. Mijozga ochishdan oldin **shu beshtasi** shart — qolganlari
pastdagi bo'limlarda:

1. 🔴 **Telegram** — `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`. Real backend
   ulanmaguncha buyurtmaning **yagona yozuvi** shu xabar; live deploy'da kanal
   bo'lmasa sayt buyurtmani qabul qilmaydi (mijozga telefon aytiladi). 1c-bo'lim.
2. 🔴 **Katalog** — `SHOPFLOW_MODE=http` + API hujjati/kaliti, yoki real narx va
   qoldiq ro'yxati. Hozirgi 30 ta mahsulotning narxlari mock. 1a-bo'lim.
3. 🔴 **To'lov** — Payme/Click/Uzum merchant ID'lari (`NEXT_PUBLIC_*_MERCHANT_ID`).
   Bo'lmasa sayt "Tez kunda" deydi va faqat yetkazishda to'lov ishlaydi.
4. 🟡 **Ommaviy oferta** — yuristdan matn. Hozir `/offer` buni ochiq aytadi.
5. 🟡 **Litsenziya raqami** — `NEXT_PUBLIC_LICENCE_NUMBER`.

Tasdiqlash kerak bo'lgan matn: yetkazish muddati hamma joyda **Toshkent 24 soat,
viloyatlar 1–3 kun** (`COMMERCE`); birinchi buyurtmaga −10% ni operator qo'llaydi.

---

## ✅ Bajarilgan — endi sizdan hech narsa kerak emas

Avval bu ro'yxatda turgan, hozir yopilgan ishlar. Raqamlar ishlab turgan
production build'dan o'lchangan.

| bo'lim | hozirgi holat |
|---|---|
| `/vitamins` | **10 ta mavzu** — menyu, footer va sitemap'da ko'rinadi |
| `/symptoms` | **7 ta mavzu** |
| `/goals` | **10 ta mavzu** |
| `/programs` | 7 ta dastur |
| `/blog` | 3 ta maqola + turkumlar |
| `/experts` | **bo'sh → 404** (demo profillar va AI portretlar olib tashlandi; haqiqiy ekspert kerak — 2-bo'lim) |
| `/ingredients` | 12 ta faol modda |
| `/where-to-buy` | **11 ta dorixona tarmog'i**, manzillar `2026-10-04` da tekshirilgan |
| `/news` | **bo'sh → 404** (3 ta o'ylab topilgan yangilik olib tashlandi; haqiqiy e'lon yozilsa qaytadi) |
| `/brands` | to'ldirilgan |
| Mahsulot rasmlari | haqiqiy fotolar `public/products/` da, har bir SKU qamrab olingan (test); AI-generatsiya rasmlar o'chirildi |
| Katalog | 30 mahsulot, 29 tasi ro'yxatda (bittasi atayin `kind: "unlisted"`) |
| Brend manzillari | `contact.email`, `contact.b2bEmail`, `contact.phone`, uchala ijtimoiy tarmoq — Go Vita manzillariga o'tkazilgan |
| Yuridik rekvizitlar | `legalName`, STIR `307895851`, manzil (lotin + kirill), direktor, ro'yxatdan o'tgan sana, OKED — orginfo.uz dan, o'qilgan sanasi bilan |

Sog'liq mavzulari matnlari yozilgan va 27 tasi ham ikkala tilda to'liq.
Lekin **tibbiy imzo hali yo'q** — buni quyida, 2-bo'limda ko'ring.

---

## 🔴 1. Server va env o'zgaruvchilari

Siz aytgandingiz — oxirida ulaysiz. Mana aniq ro'yxat.

### 1a. Katalog backend (Shopflow)

```env
SHOPFLOW_MODE=http
SHOPFLOW_API_URL=https://api.shopflow.uz
SHOPFLOW_API_KEY=...
```

Hozir `mock` rejimida — 30 ta mahsulot kod ichida. Adapter tayyor
(`src/lib/shopflow/`), rejim almashtirilsa real API'ga o'tadi. **O'zgarish
faqat `http.ts` ga tegishli** — qolgan sayt `ShopflowClient` interfeysidan
boshqa hech narsani bilmaydi.

`http.ts` dagi endpoint yo'llari **tasdiqlanishi kerak**: ular Shopflow API
hujjatlariga qarab tekshirilmagan placeholder. Javoblar Zod bilan
validatsiya qilinadi (`schemas.ts`), shuning uchun noto'g'ri shakl jim
o'tib ketmaydi.

**Kerak:** Shopflow API hujjatlari yoki test kaliti.

### 1b. Akkaunt backend (FastAPI) — yozilgan, deploy qilinmagan

`backend/` papkasida: FastAPI + SQLAlchemy + Alembic; auth, orders, profile,
subscriptions, marketing navbati va Telegram webhook — **64 ta test bilan**.
`docker-compose.yml` da `api` xizmati bor.

Deploy qilingandan keyin:

```env
NEXT_PUBLIC_API_URL=https://api.govita.uz
```

Bu bitta o'zgaruvchi **kabinet, buyurtmalar tarixi va sodiqlik dasturini**
yoqadi. Hozir `isApiConfigured()` false → `/uz/account` **404** beradi va
header'da havola chizilmaydi (bu xato emas, ataylab; marshrut va havola bitta
predikatni o'qiydi, `src/lib/config/demo.ts`).

Kabinetni backend'siz **demo** uchun ko'rsatmoqchi bo'lsangiz:

```env
NEXT_PUBLIC_ACCOUNT_DEMO=on
```

Production'da buni qo'ymang: mock kabinet istalgan telefon va istalgan kodni
qabul qilib, birovning buyurtmalarini ko'rsatadi.

Backend uchun alohida kerak: `DATABASE_URL`, `JWT_SECRET`, **`OTP_HMAC_KEY`**,
`MARKETING_API_KEY`, `OTP_DEBUG_ECHO=false`.

Uchala kalit ham production'da **majburiy** — bo'lmasa server ishga tushmaydi
(boot paytida rad etiladi, birinchi so'rovda emas):

| O'zgaruvchi | Nima uchun ajratilgan |
|---|---|
| `JWT_SECRET` | 30 kun yashaydigan kirish token'ini imzalaydi |
| `OTP_HMAC_KEY` | 5 daqiqada o'ladigan kirish kodini kalitlaydi; **kamida 32 bayt** |
| `MARKETING_API_KEY` | Do'kon serverlararo chaqiruvlarini tekshiradi |

`OTP_HMAC_KEY` ni `JWT_SECRET` dan ajratishning sababi: bitta kalit sizsa,
ikkala tizim ham zararlanadi — va `JWT_SECRET` har bir autentifikatsiya so'rovida
ishlatilgani uchun u eng ko'p "sayohat qiladigan" kalit. Development'da bo'sh
qoldirsangiz bo'ladi (kalit `JWT_SECRET` dan keltirib chiqariladi), lekin
production'da bu rad etiladi.

Yaratish:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Kalitni almashtirish shu paytgacha berilgan kodlarni bekor qiladi — 5 daqiqalik
TTL bilan bu uzilish emas, faqat noqulaylik.

### 1c. Telegram (buyurtma xabarlari)

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

@BotFather orqali bot yarating, guruhga qo'shing, chat ID'ni oling. Bularsiz
buyurtma qabul qilinadi, lekin sizga xabar bormaydi.

⚠️ Bu kanal endi **ikkita** narsani tashiydi: yangi buyurtmalar va
"mahsulot kelganda xabar bering" so'rovlari (`/product/*` dagi forma). Kanal
sozlanmagan bo'lsa forma buni mijozga **ochiq aytadi** — "so'rovni qabul qila
olmadik" — va soxta "rahmat" ko'rsatmaydi.

### 1c-bis. Pochta — email dasturi shusiz umuman yubormaydi 🔴

```env
RESEND_API_KEY=re_...
EMAIL_FROM=Go Vita <no-reply@govita.uz>
EMAIL_REPLY_TO=info@govita.uz
EMAIL_TOKEN_SECRET=...
```

Kod tayyor: obunani tasdiqlash, xush kelibsiz, buyurtma tasdig'i, tug'ilgan
kun, o'quv yili, kurs tugashi, obuna eslatmasi, pochtani tasdiqlash —
ikkala tilda. Kalit qo'yilmaguncha `[email] skipped …` log'ga yoziladi va
**hech kimga hech narsa bormaydi**.

Domenga **SPF, DKIM, DMARC** yozuvlari kerak, aks holda xatlar spamga tushadi.
`EMAIL_TOKEN_SECRET` production'da majburiy — bo'lmasa server ishga tushmaydi.

Eslatmalar navbati uchun qo'shimcha: `CRON_SECRET`, `MARKETING_API_KEY` (backend
bilan bir xil). To'liq yo'riqnoma: **[`docs/MARKETING.md`](MARKETING.md)**.

### 1c-ter. Telegram bot — mijozlar uchun

```env
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=govita_bot
```

Bot allaqachon bor — saytga kirish o'sha bot yuboradigan kod orqali ishlaydi,
ya'ni kirgan har bir mijozning `chat_id` si bazada turadi. Eslatmalar navbati
shuni o'qiydi, qo'shimcha ish kerak emas. O'zgaruvchi qo'yilmasa kanal
`/profile` da ko'rsatilmaydi.

### 1d. Analitika

```env
NEXT_PUBLIC_GTM_ID=GTM-...
NEXT_PUBLIC_META_PIXEL_ID=...
NEXT_PUBLIC_YANDEX_METRIKA_ID=...
```

Kod tomondan hodisalar allaqachon yuboriladi (`src/lib/analytics/events.ts`):
mahsulot ko'rish, savatga qo'shish, checkout boshlash, buyurtma, upsell qabul/rad.
ID qo'yilmasa — hech narsa yozilmaydi.

### 1e. Sayt manzili

```env
NEXT_PUBLIC_SITE_URL=https://www.govita.uz
```

Bu sitemap, canonical, hreflang va JSON-LD rasmlari uchun. Kod fallback sifatida
`https://www.govita.uz` ni ishlatadi, shuning uchun o'zgaruvchini unutgan
deployment ham to'g'ri canonical chiqaradi — lekin **apex domenni `www` ga
yo'naltirish** hosting panelida qo'lda qilinadi, aks holda bitta sahifa ikkita
hostda javob beradi va Google signallarni bo'lib yuboradi.

### 1f. Sanity CMS

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...
SANITY_REVALIDATE_SECRET=...
SANITY_STUDIO_ENABLED=on        # /studio ni production'da ochish uchun
```

Sxemalar tayyor (`src/sanity/schemas/`) va har bir kontent moduli Sanity bo'sh
bo'lsa kod ichidagi static seed'ga qaytadi — sayt Sanity'siz ham to'liq ishlaydi.

`/studio` production'da **yopiq**, chunki ochiq admin sahifasi 1.52 MB vazn va
keraksiz yuza. Ochish uchun `SANITY_STUDIO_ENABLED=on` **va** haqiqiy project id
kerak — placeholder project'ga qaragan Studio "CMS buzilgan"dek ko'rinadi.
Development'da har doim ochiq.

---

## 🟡 2. Tibbiy imzo — ekspert kengashi bo'sh

`/experts` sahifasida 3 ta ekspert turadi, lekin ularning hammasi `demo` deb
belgilangan va **hech qaysi sahifaning tibbiy tekshiruvchisi sifatida
ko'rsatilmaydi**. Ekspert kengashi atayin bo'sh.

Buning sababi kodda yozilgan (`src/lib/content/experts.ts`): avval bu faylda
o'ylab topilgan uchta shifokor bor edi — "Dr. Jasur Alimov", "Dr. Nodira
Karimova", "Dr. Bekzod Yusupov" — har biriga 15 yillik tarjimai hol, hech
kimga tegishli bo'lmagan LinkedIn/PubMed havolalari va generatsiya qilingan
portret. `reviewerForKey()` ularni har bir mahsulot va maqolaning tekshiruvchisi
qilib tayinlar, mahsulot sahifasi esa "Tekshirilgan" ostida shu ismni chop
etardi.

Bu **o'ylab topilgan tibbiy kafolat** — odamga qo'shimchalarni qanday qabul
qilishni aytadigan sahifalarda, "Reklama to'g'risida"gi qonunning 35-moddasi
BAD da'volarini aniq tartibga soladigan mamlakatda.

Mexanizm to'liq tayyor va hozir **jim** pasayadi: komponentlar ixtiyoriy
ekspertni qabul qiladi, `MedicalWebPage` JSON-LD esa `reviewedBy` /
`author` ni umuman chiqarmaydi (o'rniga notanish odamni ko'rsatishdan ko'ra).
O'lchandi: `/uz/goals/immunity`, `/uz/vitamins/vitamin-d3` va mahsulot
sahifalarida `reviewedBy` ham, `author` ham yo'q.

**Kerak:** kamida bitta haqiqiy mutaxassis — ism, haqiqiy fotosurat, mutaxassislik,
ish joyi va **yozma roziligi**. Har bir yozuvda nima kerakligi:
`docs/GOVITA-TAVSIYALAR.md` §Ekspertlar.

**Qayerga:** Sanity (`expert` sxemasi) yoki `src/lib/content/experts.ts`.

**Tayyor bo'lgani qanday bilinadi:** sahifada "Tekshirilgan: <ism>" bloki
paydo bo'ladi va `MedicalWebPage` JSON-LD'ida `reviewedBy` chiqadi. Bu Google
uchun E-E-A-T signali va YMYL kontent uchun eng kuchli ishonch belgilaridan biri.

---

## 🟡 3. Logotip

`BRAND.logo` hali `null`, shuning uchun `<Logo>` "GO**VITA**" matn wordmark'ini
chizadi. U yomon ko'rinmaydi va shoshilinch emas — lekin bu brendning o'zi
beradigan fayl.

**Kerak:** SVG yoki kamida 512 px balandlikdagi PNG, ochiq va to'q fonda
ishlaydigan varianti.

**Qayerga:** `public/brand/logo.svg`, keyin `src/lib/brand.ts` da
`logo: "/brand/logo.svg"`.

**Tayyor bo'lgani qanday bilinadi:** header va footer'da rasm chiqadi;
`Organization` JSON-LD'dagi `logo` ham yangi faylga o'tadi (hozir u
`/icons/icon-512.png` — PWA ikonkasi, chunki `/brand/logo.png` mavjud emas va
buzilgan rasm Google'da rad etiladi).

---

## 🟡 4. Litsenziya va sertifikatlar

`/licenses` sahifasi bor, lekin haqiqiy hujjatlar yo'q. Saytda `cGMP`, `ISO
22000`, `Halal`, `IFOS` belgilari ko'rsatiladi.

**Bu belgilar haqiqiy sertifikatlarga asoslanishi shart.** Aks holda bu yolg'on
reklama. Sertifikat skanlarini bering — sahifaga qo'yaman. Yoki sertifikat
yo'q bo'lsa, belgini olib tashlaymiz.

`BRAND.legal.licence` atayin **bo'sh** va `/requisites` sahifasi o'rniga
"yangilanmoqda" deb belgilangan qator chizadi:

```env
NEXT_PUBLIC_LICENCE_NUMBER=...
```

O'ylab topilgan litsenziya raqami yo'q raqamdan yomon — shuning uchun raqam
kodga yozilmagan, env orqali keladi.

---

## 🟡 5. Sharhlar va ijtimoiy-isbot — o'chirilgan holatda

`/reviews` dagi sharhlar, mahsulot reytinglari va pastki chap burchakdagi
"Malika S. — Samarqand, Vitamin D3+K2 sotib oldi" xabarlari (`LivePurchaseToast`)
— hammasi **kod ichidagi namuna ma'lumot** edi. Endi **default holatda
ko'rsatilmaydi** va `/reviews` halol bo'sh holatni chizadi ("Hozircha sharhlar
yo'q. Birinchi bo'lib fikr qoldiring.").

Bitta o'zgaruvchi ikkalasini ham boshqaradi:

```env
NEXT_PUBLIC_SAMPLE_SOCIAL_PROOF=on
```

Qo'yilmasa (production'dagi to'g'ri holat): sharhlar yo'q, yulduzchalar yo'q,
"sotib oldi" xabarlari yo'q, `Product` JSON-LD ichida `aggregateRating` yo'q.
Demo deploy'da ko'rsatmoqchi bo'lsangiz — `on` qiling.

Nima uchun shunday: sotuv boshlanmagan saytda o'ylab topilgan sotuvlar va
sharhlar ko'rsatish — optimizatsiya emas, yolg'on da'vo. Dorixona auditoriyasi
uchun bu eng qimmat turadigan yolg'on. Google'ning structured-data siyosati ham
soxta `aggregateRating` uchun jarima beradi.

**Nima kerak:** haqiqiy mijoz sharhlari. Ular kelganda — Sanity'ga yoki
`SHOPFLOW_MODE=http` orqali real API'dan. Ikkalasi ham bu filtrdan o'tmaydi,
ya'ni haqiqiy sharh darrov ko'rinadi va `aggregateRating` o'zi paydo bo'ladi.
`LivePurchaseToast` uchun esa `src/components/social-proof/LivePurchaseToast.tsx`
dagi ro'yxatni haqiqiy buyurtmalar oqimiga almashtirish kerak.

**Diqqat:** `/about` sahifasidagi "2000+ dorixona", "50 000+ mijoz" kabi
raqamlar — bu sizning brend da'volaringiz, men ularni o'chirmadim. Ular
haqiqatga mos bo'lishi kerak (3-bo'limga qarang).

---

## 🟡 6. Sanity'ni 6-versiyaga o'tkazish

Production dependency daraxtida **19 ta** high/critical maslahat qolgan va
ularning hammasi bitta joyga borib taqaladi: `sanity` 3.x o'zi bilan Sanity
CLI va deploy zanjirini (`@sanity/runtime-cli` → `@architect/*` → `adm-zip`,
`decompress`) olib keladi. Yagona tuzatish — `sanity@6`, ya'ni **major CMS
migratsiyasi**.

Bu xavfli emas, chunki zanjir **build/admin vositasi**: xizmat qilinadigan
saytda ishlamaydi. Runtime'da kerak bo'lgani — `next-sanity` (`createClient`,
`groq`). Shunga qaramay, CI buni ko'zdan qochirmaydi:

```bash
npm run audit:deps
```

Skript tuzatishga mumkin bo'lgan har qanday high/critical uchun **yiqiladi**
(hozir 0 ta), qolganlarini esa `scripts/audit/deps.mjs` dagi baseline'da sababi
bilan ushlab turadi. Baseline faqat bir tomonga ishlaydi: qator eskirsa audit
yiqiladi va uni o'chirishni talab qiladi — ro'yxat o'z-o'zidan qisqaradi.

**Kerak:** migratsiyaga ruxsat va vaqt oynasi. Sanity'ga ma'lumot kiritilmagan
paytda qilish eng arzon — hozir ko'chiradigan kontent yo'q.

---

## 🟢 7. Qaror kutayotgan ishlar

| ish | nima kerak |
|---|---|
| SMS zaxira kanali | **provayder tanlash kerak** (Eskiz.uz, Play Mobile — API'lari har xil) + akkaunt. Hozir kirish faqat Telegram orqali; Telegramsiz odam kira olmaydi |
| `en` tilini qo'shish | loyiha ataylab `uz` + `ru` ga qurilgan (`CLAUDE.md`). **919 ta kalit** tarjima kerak (ikkala fayl hozir teng). Sizning "ha"ngizsiz qilmayman — bu arxitektura qarori |

---

## Ishga tushirishdan oldin minimal ro'yxat

Eng qisqa yo'l — shu 7 tasi:

- [ ] `NEXT_PUBLIC_SITE_URL` = haqiqiy domen + apex'ni `www` ga yo'naltirish
- [ ] `SHOPFLOW_MODE=http` + API kalitlari (yoki mock bilan qolish qarori)
- [ ] Telegram bot — buyurtma **va** restock so'rovlari borishi uchun
- [ ] `RESEND_API_KEY` + SPF/DKIM/DMARC — buyurtma tasdig'i mijozga borishi uchun
- [ ] `EMAIL_TOKEN_SECRET` — bo'lmasa server ishga tushmaydi
- [ ] Litsenziya raqami va sertifikat skanlari (yoki belgilarni olib tashlash qarori)
- [ ] Kamida bitta haqiqiy tibbiy ekspert — ism, foto, mutaxassislik, yozma rozilik
- [ ] Analytics ID'lari (GTM / GA4 / Meta Pixel / Yandex Metrika) — CSP ularning
      origin'ini ID o'rnatilganda **o'zi** qo'shadi, qo'lda yangilash shart emas
- [ ] Bir necha kun `report-only` konsolini kuzatib, jim bo'lsa
      `CSP_MODE=enforce` ga o'tkazish va **qayta build qilish** (siyosat build
      paytida pishadi — ishlayotgan serverda o'zgartirish ishlamaydi;
      `src/instrumentation.ts` boot'da nomuvofiqlik haqida ogohlantiradi)

Qolgani — logotip, real sharhlar, Sanity migratsiyasi — keyin ham qo'shsa
bo'ladi; hech biri sotishni to'smaydi. Tibbiy imzo (2-bo'lim) sotishni
to'smaydi, lekin YMYL kontent uchun ishonch signalini yoqadi va reklama
qonuni nuqtai nazaridan eng arzon sug'urta — uni imkon qadar erta bering.

---

## Sifat darajasi — tekshiriladigan narsa

Bu fayl yozilgandan beri da'volar o'lchanadigan bo'ldi. CI'da har bir PR'da
uchta gate yuradi (`.github/workflows/ci.yml`):

1. lint + typecheck + **139** unit test + **64** backend test + production build
2. `npm run audit` — Playwright bilan render sifati: kontrast, nomlar, `alt`,
   sarlavha tartibi, tap-target, kesilgan matn, overflow, dialog semantikasi va
   **404 bo'lishi kerak URL'lar haqiqatan 404 qaytarishi**
3. `npm run audit:deps` — yuqoridagi 6-bo'lim

Holat jadvali: `CLAUDE.md` → "Sifat darajasi — nolda turadi".

*Raqamlar ishlab turgan production build'dan o'lchangan, taxmin emas.*
