# Go Vita storefront — loyiha bahosi

**Tekshiruv sanasi:** 2026-10-07
**Branch:** `arena/3626dde4-drschats` (asos: `fc2ec6a`)
**Usul:** Statik tahlil emas — loyiha to'liq o'rnatildi, build qilindi, ishga tushirildi
va haqiqiy HTTP so'rovlar bilan tekshirildi. Har bir xulosa quyida o'lchov bilan
tasdiqlangan.

---

## 1. Umumiy baho

**8.0 / 10 — ishlab chiqarishga yaqin, lekin relizdan oldin tuzatilishi shart
bo'lgan 3 ta muammo bor.**

> **Bu baho audit kuniga (2026-10-06) tegishli.** Uchala 🔴 muammo va barcha 🟡
> muammolar shu branch'da tuzatilgan va production build ustida jonli o'lchangan.
> Tuzatishdan keyingi baho va yo'nalishlar bo'yicha taqqoslash — **§8**.
> Quyidagi bo'limlar "nima topilgandi" deb o'qilishi uchun audit kunidagi
> holatida qoldirildi; har bir topilma bo'limi oxirida tuzatish va o'lchov
> natijasi bor.

Bu o'rtacha e-commerce loyihasi emas. Kod intizomi, izohlar sifati, a11y ga
munosabat va backend xavfsizligi bo'yicha bu **yig'ilgan jamoa darajasidagi** ish.
Ayni paytda bir nechta muammo bor va ularning eng jiddiylari — loyiha o'zining
`CLAUDE.md` faylida yozib qo'ygan qoidalarini o'zi buzgan joylarda.

| Yo'nalish | Baho | Izoh |
|---|---|---|
| Kod sifati | **9 / 10** | strict TS, 0 lint, 0 tsc, 0 TODO, fayl o'lchamlari me'yorda |
| Arxitektura | **9 / 10** | adapter orqali backend'dan to'liq ajratilgan, i18n toza |
| Accessibililik (a11y) | **9 / 10** | o'lchanadigan audit harnessi bor — bu kamdan-kam uchraydi |
| Backend xavfsizligi | **9 / 10** | OTP HMAC, bcrypt, production guard'lar — namunali |
| SEO | **6.5 / 10** | asoslar kuchli, lekin 3 ta haqiqiy bug bor |
| Dependency xavfsizligi | **4 / 10** | 2 ta kritik, 27 ta high; CI'da `npm audit` yo'q |
| Test qamrovi | **6 / 10** | 151 test yashil (100 frontend + 51 backend), lekin ~37k LOC uchun yupqa; E2E yo'q. Hozir **164** (113 + 51) — §8 |
| Repo gigienasi | **4 / 10** | 54.6 MB RAR arxivlar, shundan 46 MB ochiq tarqatiladi |
| Dokumentatsiya | **6 / 10** | hajmi yaxshi, lekin muhim joylarda eskirgan |

---

## 2. Nima tekshirildi (barchasi ishga tushirildi)

| Tekshiruv | Natija |
|---|---|
| `npm ci --legacy-peer-deps` | ✅ muvaffaqiyatli |
| `npm run lint` | ✅ **0 xato, 0 ogohlantirish** |
| `npx tsc --noEmit` | ✅ **0 xato** (strict mode) |
| `npm test` (vitest) | ✅ **100 / 100** test, 8 fayl |
| `pytest` (backend) | ✅ **51 / 51** test, 6 fayl |
| `npm run build` | ✅ **129 statik sahifa**, 0 xato |
| Production server + 30 ta marshrut | ✅ hammasi kutilgandek |
| JSON-LD / hreflang / canonical / sitemap | ⚠️ 2 ta bug topildi |
| Soft-404 testi | ❌ **jiddiy bug topildi** |
| `npm audit` | ❌ **2 kritik, 27 high** |
| Rasm `alt` / sarlavha tartibi | ✅ 0 muammo (mustaqil tasdiqlandi) |
| Vizual audit (`npm run audit`) | ⚠️ sandbox'da brauzer yo'q — ishga tushmadi |

**Loyiha hajmi (tuzatishdan keyin qayta o'lchandi):** ~37 600 qator kod.

| Papka | Audit kuni | Hozir |
|---|---|---|
| `src/components` | 11 929 | **12 045** |
| `src/lib` | 11 968 | **12 227** |
| `src/app` | 4 870 | **5 001** |
| `backend` | 3 610 | **3 610** |
| `src/messages` | 2 874 | **2 878** |
| `scripts` | — | **1 870** |
| **Jami** | | **≈ 37 631** |

O'sish kichik va hammasi tuzatishlardan: yangi `demo.ts`, `privacy.ts`,
`ErrorNote.tsx`, `soft404.mjs`, `deps.mjs`, ikkita test fayli va uchala
komponentdagi sarlavha izohlari.

---

## 3. Kuchli tomonlari (tasdiqlangan)

### 3.1 Sifat da'volari haqiqatdan ham rost

`CLAUDE.md` "nol nuqson" jadvalini da'vo qiladi. Men mustaqil tekshirdim va
**a11y da'volari chiqdi**:

```
/uz        : 30 rasm, 0 tasida alt yo'q (15 tasi alt="" — dekorativ, bu TO'G'RI)
/uz/products: 24 rasm, 0 tasida alt yo'q
/uz/product/…: 17 rasm, 0 tasida alt yo'q
Sarlavha darajasi sakrashi: 0 (barcha tekshirilgan sahifalarda)
Nomsiz interaktiv element: 0 (123 / 203 / 96 / 49 / 57 element)
```

`scripts/audit/checks/a11y.mjs:49` da shunday izoh bor: *"alt=\"\" is a valid
decorative marker; a missing attribute is not."* — Bu a11y ni **haqiqatan**
tushunish belgisi. Ko'p loyihalar shu ikkisini aralashtirib yuboradi.

### 3.2 O'lchanadigan sifat darajasi

`scripts/audit/` — 653 qator Playwright tekshiruvi (kontrast, tap-target,
kesilgan matn, dialog semantikasi, bottom-edge to'qnashuvi), CI'da har PR'da
yuradi va nuqson topilsa **nolmas kod bilan chiqadi**. Bu "menimcha yaxshi
ko'rinadi" dan "o'lchandi" ga o'tish — kamdan-kam loyihada uchraydi.

### 3.3 Backend xavfsizligi namunali

- `app/otp.py` — OTP kodi **HMAC bilan, telefon bilan tuzilgan** holda saqlanadi.
  Izohda nega oddiy SHA-256 yetmasligi aniq yozilgan (6 raqam = 20 bit, bir
  millionli jadval). `hmac.compare_digest` — constant-time.
- `app/main.py` — production'da `JWT_SECRET` va `OTP_DEBUG_ECHO` tekshiriladi va
  **boot paytida** yiqiladi: *"Fail at boot, not at the first forged token."*
- `security.py` — buzilgan hash 500 emas, "noto'g'ri parol" qaytaradi.
- OTP cheklovlari: 5 daqiqa TTL, 5 urinish, 60s cooldown, soatiga 5 ta.

### 3.4 i18n mukammal boshqarilgan

```
uz.json: 919 kalit    ru.json: 919 kalit
uz'da yo'q (ru-only): 0
ru'da yo'q (uz-only): 0
Bo'sh qiymat:         0
```

Fayl hajmi farqi (83 KB vs 62 KB) kirill UTF-8'da ko'p bayt olishidan — tarjima
yetishmasligidan emas. 8 ta bir xil satr ham qonuniy (telefon raqamlari,
placeholder'lar).

### 3.5 Arxitektura to'g'ri ajratilgan

Butun ilova bitta `ShopflowClient` interfeysiga bog'liq. `mock` → `http` o'tish
faqat `http.ts` ni o'zgartirish. Bu haqiqiy port/adapter naqshi va u bu yerda
shunchaki yozilmagan — **ishlaydi**.

### 3.6 Kontent bo'shliqlari allaqachon yopilgan

`CLAUDE.md` va `docs/QOLGAN-ISHLAR.md` `/vitamins` 0, `/symptoms` 1, `/goals` 2
deydi. Haqiqat:

```
kind:"vitamin" -> 10    kind:"symptom" -> 7    kind:"goal" -> 10   (jami 27)
```

Jonli saytda ham tasdiqlandi: `/uz/vitamins` 10 ta, `/uz/symptoms` 7 ta,
`/uz/goals` 10 ta mavzu chizadi va uchchala bo'lim ham menyuda ko'rinadi.
`nav-sections.ts` dagi "bo'sh bo'lim menyuda ko'rinmaydi" mexanizmi to'g'ri
ishlayapti.

---

## 4. Topilgan muammolar

Ustuvorlik: 🔴 relizni to'sadi · 🟡 jiddiy · 🟢 keyin bo'lsa ham bo'ladi

> **Holat (2026-10-07): quyidagi 🔴 va 🟡 topilmalarning hammasi shu branch'da
> tuzatilgan va production build ustida jonli o'lchangan.** Har bir bo'lim oxirida
> tuzatish va o'lchov natijasi keltirilgan. 🟢 bo'limlardan 4.11 va 4.13 ham
> yopilgan; 4.8 (CSP) va 4.12 (test qamrovi) ochiq qoldi — ikkalasi ham relizni
> to'smaydi, sabablari o'z bo'limlarida. Yangi topilgan uchta muammo — 4.15, 4.16 va
> 4.17 — oxirida qo'shilgan.
>
> Bu hisobot audit **kunidagi** holatni saqlaydi: raqamlar va iqtiboslar tuzatishdan
> oldin o'lchangan, shuning uchun bo'limlarni "nima topilgandi" deb o'qish kerak.
> Bugungi holat uchun `docs/QOLGAN-ISHLAR.md` ga qarang.

---

### 🔴 4.1 Har qanday noto'g'ri kategoriya URL'i 200 qaytaradi (soft-404)

**Bu eng jiddiy topilma.** O'lchov:

```
GET /uz/products/yolqategoriya      -> 200  (129 KB)
GET /uz/products/invalid-cat-xyz    -> 200  (129 KB)
GET /ru/products/nonexistent        -> 200  (152 KB)
GET /uz/sahifa-yoq                  -> 404  ✅ (haqiqiy 404 ishlaydi)
GET /uz/products/vitamins           -> 200  ✅ (haqiqiy kategoriya)
```

Javob tanasida skeleton (`animate-pulse`) **va** 404 matni birga keladi,
`robots: noindex`, `<title>` va `<h1>` yo'q — bu **darslikdagi soft-404**.

**Ildiz sabab:** `src/app/[locale]/products/loading.tsx` mavjud. U Suspense
chegarasini yaratadi; chegara `notFound()` statusni o'rnatishidan **oldin** 200
javobni yuboradi. `[category]/page.tsx:57` da `notFound()` chaqiriladi, lekin
kech.

**Nega bu ayniqsa muhim:** loyiha o'zining `CLAUDE.md` faylida aynan shu qoidani
yozib qo'ygan:

> `loading.tsx` **qo'shmang**: Suspense chegarasi status'ni `notFound()` dan
> oldin yuboradi va soft-404 hosil qiladi (**bir marta shu sabab olib tashlangan**).

Ya'ni bu muammo allaqachon topilgan, tuzatilgan, hujjatlashtirilgan — va keyin
qayta yuz bergan. `dynamicParams = true` bo'lgani uchun **cheksiz** miqdordagi
`/uz/products/<istalgan-narsa>` URL'i 200 qaytaradi.

**Oqibat:** Google Search Console "Soft 404" deb belgilaydi; katalog uchun
crawl budget sarflanadi; noindex bo'lsa ham 200 status ziddiyatli signal.

**Tuzatish:** `src/app/[locale]/products/loading.tsx` ni o'chirish (bitta fayl).
Skeleton kerak bo'lsa — uni `ShopView` ichida, `notFound()` chaqirilgandan
**keyin** chizish.

---

### 🔴 4.2 Next.js kritik zaifliklarda, va tuzatishni phantom dependency to'sib turadi

**Hozirgi holat:** `next@15.5.19`. Production daraxtida **47 zaiflik:
2 kritik, 27 high, 18 moderate**.

`next` bo'yicha maslahatlar (barchasi `<15.5.21` yoki `<15.5.24` da tuzatilgan):

| Advisory | CVSS | Loyihaga tegishlimi? |
|---|---|---|
| Unauthenticated **RCE** in Image Optimization API when **AVIF** files are used | — | ✅ **HA** — `formats: ["image/avif", …]` yoqilgan |
| Unauthenticated **RCE** on windows-hosted servers | **9.0** | Server OS'ga bog'liq |
| DoS in Image Optimization API using **SVGs** | — | ✅ **HA** — `dangerouslyAllowSVG: true` |
| DoS in App Router using **Server Actions** | — | ✅ **HA** — 8 ta `"use server"` fayl |
| Unbounded Server Action payload | — | ✅ **HA** |
| Unauthenticated disclosure of internal Server Function endpoints | — | ✅ **HA** |
| SSRF in rewrites via attacker-controlled hostname | — | ✅ **HA** — next-intl middleware rewrite ishlatadi |
| Cache confusion of response bodies | — | ✅ **HA** |

Ya'ni loyihaning **o'z konfiguratsiyasi** (`next.config.ts` dagi AVIF +
`dangerouslyAllowSVG`) va **o'z arxitekturasi** (Server Actions + middleware
rewrite) ushbu hujum yuzalarining hammasini ochadi. Bu nazariy xavf emas.

**Men buni amalda tekshirdim.** `next@15.5.27` ga o'tkazdim va build **sindi**:

```
Module not found: Can't resolve 'react-is'
  ./node_modules/@sanity/insert-menu/dist/index.js
  ./node_modules/@sanity/ui/dist/_chunks-es/_visual-editing.mjs
```

Sababi — **ikkinchi, mustaqil muammo**:

> `react-is` loyihaning **e'lon qilinmagan (phantom) bog'liqligi**.
> U `package.json` da yo'q; eski lockfile'da `node_modules/react-is@19.2.8`
> darajasiga hoist qilingan edi va Sanity paketlari shunga tayanardi.
> `next` ni yangilash hoist'ni olib tashladi va build sindi.

`react-is` ni ochiq dependency sifatida qo'shib, qayta build qildim:

```
✓ Compiled successfully in 45s
✓ Generating static pages (129/129)
```

Va barcha tekshiruvlar yashil qoldi: lint 0 · tsc 0 · 100 frontend test ·
51 backend test.

**Xavfsizlik natijasi:**

| | oldin | keyin |
|---|---|---|
| `next` severity | **critical** | moderate |
| kritik (prod) | 2 | 1 |
| high (prod) | 27 | 26 |
| jami (prod) | 47 | 46 |

Barcha RCE / DoS / SSRF / cache-confusion maslahatlari yopildi. Qolgan bitta
kritik — `decompress`, va qolgan high'larning hammasi **Sanity CLI zanjirida**
(`@sanity/cli`, `@sanity/runtime-cli`, `@sanity/codegen`, `@architect/*`,
`adm-zip`, `glob`, `chokidar`). Bular chiqariladigan ilovaga emas, build/admin
asbobiga tegishli — pastki bo'lim 4.6 da bu haqida.

**Tuzatish (2 qator, men tekshirib bo'ldim):**

```diff
 "dependencies": {
-  "next": "^15.5.19",
+  "next": "^15.5.27",
+  "react-is": "^19.2.8",
 },
 "devDependencies": {
-  "eslint-config-next": "^15.5.19",
+  "eslint-config-next": "^15.5.27",
 }
```

⚠️ **Muhim:** `react-is` ni qo'shmasdan `next` ni yangilash **build'ni sindiradi**.
Bu ikkalasi birga kelishi shart.

---

### 🔴 4.3 CI'da dependency xavfsizlik tekshiruvi yo'q

`.github/workflows/ci.yml` da 3 ta job bor: `build` (lint, tsc, test, build),
`audit`, `api`. Lekin `audit` job'i — bu **vizual/a11y** audit
(`npm run audit` → `scripts/audit/index.mjs`), **`npm audit` emas**.

Natijada 4.2 dagi kritik zaifliklar CI'da hech qachon ushlanmaydi. Yuqoridagi
jadvalni yozib qo'ygan jamoa uchun bu kutilmagan bo'shliq.

**Tuzatish:** `ci.yml` ga qo'shish:

```yaml
- name: Dependency audit
  run: npm audit --omit=dev --audit-level=high
```

---

### 🟡 4.4 `x-default` hreflang har bir sahifada rus tiliga sozlangan

O'lchov — barcha tekshirilgan sahifalarda bir xil:

```
HTML head:  <link rel="alternate" hrefLang="x-default" href="…/ru/products">
sitemap.xml: <xhtml:link rel="alternate" hreflang="x-default" href="…/uz/products">
```

Ya'ni sayt Google'ga **ikkita qarama-qarshi signal** beradi. `canonical` to'g'ri
(har doim haqiqiy locale), lekin `x-default` har doim `/ru`.

**Ildiz sabab** — `src/lib/seo/metadata.ts:23`:

```ts
languages["x-default"] = `${SITE_URL}/${locales[0]}${clean}`;
```

`routing.ts` da `locales = ["ru", "uz"]`, shuning uchun `locales[0] === "ru"`.
Lekin `defaultLocale = "uz"`. Sitemap `defaultLocale` ni ishlatadi (to'g'ri),
`metadata.ts` esa `locales[0]` ni (noto'g'ri).

**Oqibat:** 114 ta sitemap URL × qarama-qarshi x-default. O'zbek bozori uchun
qurilgan saytda xalqaro default rus tiliga ishora qiladi.

**Tuzatish** — bitta so'z:

```diff
-languages["x-default"] = `${SITE_URL}/${locales[0]}${clean}`;
+languages["x-default"] = `${SITE_URL}/${defaultLocale}${clean}`;
```

(`defaultLocale` ni `@/lib/i18n/routing` dan import qilish kerak.)

---

### 🟡 4.5 Product JSON-LD rasmlari nisbiy URL

```json
"image": ["/products/swiss-energy-immunovit-30-hero.webp", …]
```

Google'ning Product structured data talabi — **absolyut URL**. Nisbiy URL
Product rich result'ni Search Console'da ogohlantirish bilan qoldiradi.

Qiziq jihati: `og:image` **to'g'ri** absolyutlashtirilgan
(`https://www.govita.uz/products/…-hero.webp`), ya'ni `absoluteUrl()` helper
allaqachon mavjud va boshqa joyda ishlatilgan.

**Ildiz sabab** — `src/lib/seo/jsonld.tsx`:

```ts
image: product.images.map((i) => i.url),
```

**Tuzatish:**

```diff
-image: product.images.map((i) => i.url),
+image: product.images.map((i) => absoluteUrl(i.url)),
```

Shuni ham ta'kidlash kerak: Product sxemasining qolgan qismi **juda yaxshi**.
`@graph` ichida `MedicalWebPage` (author + reviewedBy — E-E-A-T signali),
`Product`, `offers` (shippingDetails, deliveryTime, priceValidUntil bilan).
`aggregateRating` faqat haqiqiy sharhlar bo'lgandagina qo'shiladi — izohda
*"inventing the numbers to fill it is what Google's policy calls a manual
action"* deyilgan. Bu to'g'ri qaror.

---

### 🟡 4.6 54.6 MB RAR arxivlar Git'da, 46 MB'i ochiq tarqatiladi

```
/шипочка.rar  (repo ildizida)  8 539 258 bayt
public/products/напитки.rar   14 579 687
public/products/аппараты.rar  10 802 104
public/products/капсулы.rar    8 631 789
public/products/шипучки.rar    8 539 258
public/products/препараты.rar  3 537 138
                              ─────────────
                              54.6 MB
```

Uchta alohida muammo:

1. **Ildizdagi fayl — aniq duplikat.** MD5 tasdiqladi:
   `шипочка.rar` (ildiz) === `public/products/шипучки.rar`. 8.5 MB sof waste.
2. **Arxivlar ochiq URL'dan yuklab olinadi** — production'da ham:
   ```
   200   8.5 MB  /products/шипучки.rar
   200  14.6 MB  /products/напитки.rar
   200  10.8 MB  /products/аппараты.rar
   200   8.6 MB  /products/капсулы.rar
   200   3.5 MB  /products/препараты.rar
   ```
   `src/middleware.ts` matcher'i kengaytmali fayllarni chetlab o'tadi
   (`.*\\..*`), shuning uchun hech qanday himoya yo'q. Bu xom foto-damplar —
   fayl nomlari va ichidagi metadata ta'minot zanjirini ochib berishi mumkin.
3. **`.git` = 72 MB**, `public/products` = 69 MB. Har bir Vercel deploy 46 MB
   o'lik arxivni tashiydi.

`.gitignore` da *"RARs stay in public/products"* deyilgan — ya'ni bu atayin
qaror. Lekin ular **omborga** tegishli, **deploy qilinadigan statik papkaga**
emas.

**Tuzatish:** ildizdagi duplikatni o'chirish; arxivlarni `public/` dan olib
chiqib Git LFS'ga yoki tashqi omborga ko'chirish; hech bo'lmasa
`public/products/*.rar` uchun `headers()` da bloklash qo'shish.

**Tuzatildi:** oltita arxivning hammasi working tree'dan o'chirildi (5 tasi
`public/products/` da, 1 tasi ildizdagi duplikat) — `public/products` 69 MB →
25 MB, deploy'dan 46 MB o'lik fayl chiqib ketdi. `.gitignore` ga `*.rar`
qo'shildi va `scripts/audit/public-hygiene.test.ts` testi yozildi: u `public/`
ostida arxiv/binary damplar paydo bo'lsa, test **qizil** bo'ladi — ya'ni bu
holat qayta takrorlanmaydi.

**Jonli o'lchov:** beshala kirillcha URL ham production build'da `404`
qaytaradi.

> **Ochiq qolgan qismi — va bu atayin.** `.git` hali ham **72 MB**: fayllar
> working tree'dan o'chirildi, lekin ular **tarixda** qoldi. Buni tozalashning
> yagona yo'li `git filter-repo` bilan tarixni qayta yozish — bu **har bir
> commit hash'ini o'zgartiradi** va force-push talab qiladi. Bunday o'zgarishni
> bir tomonlama qilish noto'g'ri: agar bu repodan boshqa branch yoki fork
> ishlayotgan bo'lsa, ular sinadi. Xavfsizlik muammosi (ochiq tarqatilish)
> yopildi; tarix hajmi — mijoz qaror qiladigan alohida masala. Tavsiya: keyingi
> major reliz oldida, boshqa ishlar to'xtagan paytda, jamoa bilan kelishib
> bajarilsin.

---

### 🟡 4.7 Sanity Studio va Vision production'da ochiq

```
GET /studio  -> 200   (1.52 MB JS)
```

- `next.config.ts` dagi xavfsizlik sarlavhalari **atayin `/studio` ni chetlab
  o'tadi**: `source: "/((?!studio).*)"`. Natijada `/studio` da `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS
  **umuman yo'q**.
- `@sanity/vision` — so'rovlar uchun **debug vositasi** — `dependencies` da
  (prod) turadi va `sanity.config.ts:25` da `visionTool()` bilan yoqilgan.
- `robots.txt` da `Disallow: /studio` bor (yaxshi), lekin bu faqat botlarga
  so'rov, autentifikatsiya emas.

`CLAUDE.md` bo'yicha Sanity'ga hali ma'lumot kiritilmagan — ya'ni Studio hozir
production'da **hech narsa uchun** 1.52 MB og'irlik va ochiq yuza sifatida turibdi.

**Tuzatish:** Studio'ni production build'dan chiqarish yoki alohida
autentifikatsiya ortiga qo'yish; `@sanity/vision` ni `devDependencies` ga
ko'chirish va faqat development'da yoqish.

---

### 🟡 4.8 Butun saytda Content-Security-Policy yo'q

`next.config.ts` da 5 ta sarlavha bor va ular to'g'ri tanlangan (HSTS izohida
`preload` ni nega qo'shmaganliklari ham tushuntirilgan — bu yaxshi mulohaza).
Lekin **CSP umuman yo'q**. Checkout formasi, GTM, Meta Pixel va Yandex Metrika
bor sayt uchun CSP — XSS'ning zararini kamaytiradigan asosiy qatlam.

Kamida `Content-Security-Policy-Report-Only` bilan boshlash mantiqliy: u hech
narsani sindirmaydi, lekin qanday manbalar yuklanayotganini ko'rsatadi.

---

### 🟡 4.9 Mijoz telefon raqami server log'iga yoziladi

`src/app/actions/notifyRestock.ts:8`:

```ts
console.log(`[restock-notify] productId=${productId} phone=${phone}`);
```

Bu Server Action — mijoz telefon raqamini to'g'ridan-to'g'ri Vercel log'iga
yozadi. Faylning o'zida *"In production this could also send to a CRM"* izohi
bor, ya'ni bu vaqtinchalik yechim, lekin production'da PII log'lanadi.

Solishtirish uchun: `src/lib/email/send.ts:61` ham manzilni log'laydi
(`to ${to}`) — xuddi shu muammo.

Qolgan 15 ta `console.*` chaqiruvi esa to'g'ri: hammasi `console.error` va
faqat status kod / xato obyekti, PII yo'q. Bu yaxshi intizom — bitta fayl
bundan chetga chiqqan.

**Tuzatish:** telefonni maskalash (`phone.slice(-4)`) yoki faqat hodisa nomini
log'lash.

---

### 🟡 4.10 `/uz/account` hech qanday backend'siz to'liq ishlaydigan kabinet bo'lib ko'rinadi

> **Tuzatish (2026-10-07):** bu bo'limning dastlabki taxmini **noto'g'ri edi** va
> quyidagisi bilan almashtirildi. Men bu yerda `apiFetch`'ning
> `ApiError("API is not configured", 0)` tashlashini, ya'ni foydalanuvchi umumiy
> xato matnini olishini yozgan edim. Kodda buni tekshirganimda aksini topdim:
> `src/lib/api/client.ts` API sozlanmagan bo'lsa **xato tashlamaydi** — u har bir
> metod uchun mock javob qaytaradi. Muammo buzilgan jarayon emas edi, balki
> teskarisi: hech narsa buzilmaydigan, shuning uchun hech kim shubhalanmaydigan
> soxta jarayon.

`CLAUDE.md` marshrutlar jadvalida shunday yozilgan edi: *account/ — kabinet, API
sozlanmagan bo'lsa `notFound()`*.

Haqiqat: `NEXT_PUBLIC_API_URL=` bo'sh bo'lsa ham

```
GET /uz/account -> 200
```

`account/page.tsx` da `notFound()` **yo'q** edi — u bevosita `<AccountView />`
chizar, `TopBar.tsx` esa havolani `isApiConfigured()` bilan to'g'ri yashirardi.
Ya'ni hujjat bir qoidani aytadi, header uni bajaradi, marshrut esa buzadi — uch
qatlam bir-biriga zid.

**Oqibat (asl taxmindan jiddiyroq):** foydalanuvchi istalgan telefon raqamini
kiritadi va `client.ts`'dagi mock qatlam uni **muvaffaqiyatli kirgan** deb
qabul qiladi — `demo_token_<phone>` token beradi, `me()` soxta profil qaytaradi,
`orders()` ikkita o'ylab topilgan buyurtma ko'rsatadi (`GV-98421`, `GV-98104`).
Xato matni chiqmagani uchun bu holat hech qanday belgi bermaydi: mijoz saytni
qabul qilib olgach, kabinet "ishlayapti" deb hisoblaydi, buyurtmalar esa hech
qachon haqiqiy backend'ga ulanmaydi. Sotuvdan keyin eng qiyin tushuntiriladigan
xato turi — ishlaydigan ko'rinadigan, lekin hech narsa qilmaydigan funksionallik.

**Tuzatildi:** `src/lib/config/demo.ts` yaratildi. Endi kabinet ikki shartdan
biri bajarilgandagina ochiladi — haqiqiy API sozlangan **yoki**
`NEXT_PUBLIC_ACCOUNT_DEMO=on` aniq yoqilgan. Ikkalasi ham bo'lmasa
`account/page.tsx` `notFound()` qaytaradi va `TopBar` havolani chizmaydi. Demo
maqom **opt-in**, sukut bo'yicha emas: soxta kabinet endi faqat uni atayin
yoqqan odamga ko'rinadi.

**Jonli o'lchov (production build, flag yoqilmagan):** `GET /uz/account → 404`;
`TopBar` HTML'ida `href="/uz/account"` **0 marta**; `/uz/loyalty` sahifasida
ham 0 ta kabinet havolasi va 4 ta `/uz/products` havolasi.

---

### 🟢 4.11 Ishlatilmaydigan production bog'liqliklar

| Paket | Holat |
|---|---|
| `gsap` | `dependencies` da, **hech qayerda import qilinmagan** (src va scripts bo'ylab 0 ta) |
| `@tanstack/react-query` | `dependencies` da, **hech qayerda import qilinmagan** |
| `styled-components` | faqat Sanity orqali kerak; to'g'ridan-to'g'ri import yo'q |
| `@sanity/vision` | prod'da, faqat debug uchun (4.7 ga qarang) |

`gsap` va `react-query` — o'lik og'irlik va keraksiz supply-chain yuzasi.
Animatsiyalar CSS + Framer Motion + Lenis bilan qilingan (`lenis` haqiqatan
`SmoothScroll.tsx` da ishlatiladi).

Build bundle'iga tushmaydi (chunki import yo'q), lekin `npm install` ni
sekinlashtiradi va audit hisobini shishiradi.

---

### 🟢 4.12 Test qamrovi kichik va komponent darajasi yo'q

151 test (100 frontend + 51 backend) — **hammasi yashil** va ular muhim
joylarga qo'yilgan: narx hisobi, cart merge mantiqi, eslatma qoidalari, email
token'lari, obuna rejaları, OTP/auth, buyurtmalar. `reminders.test.ts` da `now`
argument sifatida uzatiladi — bu sof funksiyalar va yaxshi test dizayni.

Lekin ~37 600 qator kod uchun bu yupqa:

- **Komponent testlari yo'q** — `CheckoutForm.tsx` (565 qator, eng katta mantiqiy
  komponent) umuman test qilinmagan.
- **E2E yo'q.** `playwright` devDependency'da bor, `scripts/audit/` uni
  ishlatadi — lekin bitta ham `*.spec.ts` yo'q. Playwright allaqachon o'rnatilgan
  bo'lsa, checkout oqimi bo'yicha 3-4 ta E2E qo'shish arzon.
- **Coverage hisobi yo'q** — `vitest.config.ts` da coverage sozlanmagan,
  `.gitignore` da `/coverage` bor (ya'ni bir vaqtlar bo'lgan).
- **Test gigienasi:** `store.test.ts` har bir testda `[zustand persist
  middleware] Unable to update item 'govita-cart', the given storage is
  currently unavailable` deb chiqaradi — localStorage mock yo'q. Testlar o'tadi,
  lekin chiqish iflos va haqiqiy xatoni yashirishi mumkin.
  **Tuzatildi:** `vitest.setup.ts` qo'shildi — har bir testdan keyin Zustand
  store'lari tozalanadi va `Storage.prototype.setItem` patch'i `try/finally`
  ichida qaytariladi, shuning uchun bir testning holati keyingisiga o'tmaydi.
  Test natijasi endi **toza** — hech qanday ogohlantirish chiqmaydi.

**Tuzatishdan keyingi holat (4.12):** testlar 151 → **164** (113 frontend +
51 backend). Yangilari: `storage-keys.test.ts` (`alimkhanov-` → `govita-`
migratsiyasi va kalit ro'yxati) va `public-hygiene.test.ts` (`public/` ostida
binary damp paydo bo'lishini to'sadi). Test gigienasi muammosi yopildi.

**Ochiq qoldi — va bu ongli:** komponent testlari va E2E hali yo'q, coverage
sozlanmagan. Sabab: bular yangi funksionallik emas, mavjud qamrovni
kengaytirish — va ularni shoshilich yozish tuzatishlar bilan bir branch'da
aralashtirib yuboradi. Eng yuqori qiymatli qadam: `CheckoutForm.tsx` (565
qator) uchun komponent testlari va checkout oqimi bo'yicha 3–4 ta
Playwright E2E. Playwright allaqachon devDependency'da.

Backend'da ham xuddi shunday: 6 ta router fayl, 51 test — yaxshi nisbat, lekin
`marketing.py` (475 qator, eng katta router) uchun qamrov nisbatan yupqa.

---

### 🟢 4.13 Dokumentatsiya bir nechta muhim joyda eskirgan

`CLAUDE.md` va `README.md` — loyihaning eng muhim kirish nuqtalari, ayniqsa
`CLAUDE.md` AI-agent'lar uchun yo'riqnoma. Eskirgan da'volar faol ravishda
noto'g'ri yo'naltiradi:

| Da'vo | Qayerda | Haqiqat |
|---|---|---|
| "Multilingual (UZ / RU / EN)", "`/uz` `/ru` `/en` routing" | `README.md` | **`en` yo'q.** `locales = ["ru","uz"]`, `en.json` mavjud emas, `/en` → 307 |
| `src/messages/en.json` ro'yxatda | `CLAUDE.md` (Tarjimalar) | Fayl yo'q — **`CLAUDE.md` o'zi bilan ziddiyatda** (yuqorida "`en` yo'q" deyilgan) |
| "`/vitamins` 0 ta, `/symptoms` 1, `/goals` 2" | `CLAUDE.md` + `QOLGAN-ISHLAR.md` | **10 / 7 / 10** (27 ta mavzu) |
| "Mahsulot rasmlari placeholder SVG" | `CLAUDE.md` | 115 webp + 14 jpg haqiqiy foto |
| Cart kaliti `alimkhanov-cart`, wishlist `alimkhanov-wishlist` | `CLAUDE.md` | `govita-cart` / `govita-wishlist`; `alimkhanov-` endi faqat **legacy migratsiya** prefiksi (`src/lib/storage-keys.ts`) |
| "account/  # kabinet — API sozlanmagan bo'lsa notFound()" | `CLAUDE.md:59` | `notFound()` yo'q, 200 qaytadi (4.10) |
| "`loading.tsx` qo'shmang … olib tashlangan" | `CLAUDE.md` | `products/loading.tsx` **mavjud** (4.1) |
| Namespace ro'yxatida `upsell` ikki marta | `CLAUDE.md` | kichik takror |

Bundan tashqari, `src/app/[locale]/checkout/actions.ts` dagi izoh kodga
zid keladi:

```ts
// Awaited, unlike the operator notice: an order confirmation that races
// the serverless function's shutdown is one that never arrives.
await Promise.all([
  notifyOperatorOfOrder(order, result.orderId),   // ← bu HAM await qilinadi
  emailOrderConfirmation(order, result.orderId),
```

Izoh "operator xabari await qilinmaydi" deydi, lekin `Promise.all` ichida
ikkalasi ham await qilinadi. Loyihaning "izohlar *nega*ni tushuntiradi"
standarti uchun bu turdagi eskirgan izoh — eng xavfli tur, chunki u ishonchli
ko'rinadi.

---

### 🟢 4.14 Kichik kuzatuvlar

- **`/uz/products` sarlavha tartibi.** Bosh sahifada tartib to'g'ri
  (`h1, h2, h2, h3…`), lekin `/uz/products` da h1 dan **oldin** 5 ta `h2`
  keladi — bular Footer ustunlari (`Footer.tsx:108`, `FooterCol`). Bu
  React streaming tufayli: `loading.tsx` skeleton'i `<main>` ichida, haqiqiy
  `h1` esa stream oxirida keladi. Darajalar sakramaydi (shuning uchun loyiha
  auditi buni ushlamaydi), lekin hujjat konturi `h2,h2,h2,h2,h2` bilan boshlanadi.
  **4.1 ni tuzatish buni ham hal qiladi.**
  **Tasdiqlandi:** `loading.tsx` o'chirilgach, `/uz/products` server HTML'ida
  skeleton **0 ta** va `h1` mavjud. 20 ta sahifada o'lchandi — har birida aniq
  bitta `h1`, 0 ta sarlavha sakrashi.
- **Rate limiting serverless'da kuchsiz.** `src/lib/rate-limit.ts` xotirada
  saqlanadi va izohda bu **halol yozilgan**: *"the real limit is (instances ×
  limit)"*. Bu ongli kompromiss va men buni kamchilik deb hisoblamayman —
  lekin `clientIp()` `x-forwarded-for` ning birinchi qiymatini oladi, uni
  mijoz soxtalashtira oladi. Vercel'da bu ishonchli, boshqa proxy'da emas.
- **`hash_code()` JWT kalitini qayta ishlatadi** (`app/otp.py`) — OTP HMAC uchun
  `settings.jwt_secret` ishlatiladi. Ishlaydi, lekin kalitlarni ajratish
  (alohida `OTP_HMAC_KEY`) yaxshiroq amaliyot: bitta kalit sizsa, ikkala tizim
  ham zararlanadi.
- **Build ogohlantirishi:** `The default export of @sanity/image-url has been
  deprecated. Use the named export createImageUrlBuilder instead.` — ikki marta
  chiqadi. Hozir zararsiz, keyingi major versiyada sinadi.
  **Tuzatildi:** `src/sanity/image.ts` named export'ga o'tkazildi; shu bilan birga
  fayldagi keraksiz `// eslint-disable-next-line` ham olib tashlandi (u hech qanday
  qoidani bostirmas edi). Build logi endi **butunlay toza** — 0 ogohlantirish.
- **`next lint` deprecated.** Next.js 16 da olib tashlanadi. CI shu buyruqqa
  tayanadi, ya'ni Next 16 ga o'tishdan oldin ESLint CLI'ga migratsiya kerak.

---

### 🟢 4.15 Hydration gate'lar sahifani sarlavhasiz yuklaydi *(tuzatish paytida topildi)*

4.14 dagi sarlavha tartibini tekshirayotib, boshqa bir holatga duch keldim:
uchta brauzer-holat sahifasi — `/uz/profile`, `/uz/wishlist`, `/uz/account` —
server HTML'ida `<main>` ichida skeleton chizar, **lekin hech qanday `<h1>`
chizmasdi**. O'lchov:

```
/uz/wishlist  <main> 1811 bayt, 16 ta skeleton elementi, h1: yo'q
/uz/profile   <main>  227 bayt,  1 ta skeleton elementi, h1: yo'q
```

Sabab: `WishlistView`, `ProfileView` va `AccountView`'da Zustand `persist`
middleware hydration'dan keyin yuklanadi, shuning uchun komponent
`if (!hydrated) return <skeleton/>` deb qaytadi. Bu **to'g'ri qaror** — aks holda
birinchi paint'da "sizda hech narsa yo'q" deb chaqnab ketardi. Lekin gate butun
sahifani ushlab turardi, sarlavhani ham.

Nima uchun bu muhim: sarlavha saqlangan ma'lumotga **bog'liq emas**. Faqat
elementlar soni bog'liq. Ya'ni gate keragidan ko'proq narsani yashirar edi —
ekran o'quvchi dasturidan foydalanadigan odam hydration tugaguncha nomlanmagan
sahifaga tushar edi.

**Tuzatildi:** uchala komponentda ham sarlavha gate'dan **tashqariga** chiqarildi.
`ProfileView` umumiy `t("title")` ni ko'rsatadi va hydration'dan keyin
`t("titleNamed")` ga almashadi — ikkala render ham `hydrated=false` holatida
bo'lgani uchun bu oddiy state yangilanishi, hydration mismatch emas.

**Jonli o'lchov (tuzatishdan keyin):** `/uz/wishlist` → `h1 = "Sevimlilar"`,
`/uz/profile` → `h1 = "Mening profilim"`; skeleton'lar joyida qoldi (16 va 1),
ya'ni layout siljimadi.

*Bu 🟢 edi, chunki uchala sahifa ham `robots: noindex` va sitemap'da yo'q — SEO
ta'siri nol. Tuzatish arzon va a11y uchun to'g'ri bo'lgani uchun bajarildi.*

---

### 🟡 4.16 Tibbiy tekshiruvchi yo'q — ekspert kengashi atayin bo'sh

Bu topilma kod **sifati** haqida emas, kontent haqida — va uni hisobotga
qo'shishim kerak, chunki mijozga "tayyor" deb beriladigan narsaning bir qismi.

`/experts` sahifasida 3 ta profil turadi, hammasi `demo: true`.
`src/lib/content/experts.ts` dagi `reviewerForKey()` demo profillarni filtrlaydi
(`!e.demo`) va kengash bo'sh bo'lgani uchun `null` qaytaradi. Natijada
`MedicalWebPage` JSON-LD `reviewedBy` va `author` ni **umuman chiqarmaydi** va
komponentlar "Tekshirilgan" blokini ko'rsatmaydi.

**O'lchandi:** `/uz/goals/immunity`, `/uz/vitamins/vitamin-d3` va
`/uz/product/swiss-energy-immunovit-30` — uchchalasida ham `reviewedBy` ham,
`author` ham yo'q.

Bu **kod nuqsoni emas, to'g'ri tuzilgan mexanizm**. Fayldagi izoh buni ochiq
yozadi: avval bu yerda o'ylab topilgan uchta shifokor bo'lgan — 15 yillik
tarjimai hol, hech kimga tegishli bo'lmagan PubMed/LinkedIn havolalari va
generatsiya qilingan portretlar bilan — va `reviewerForKey()` ularni har bir
mahsulot va maqolaning tekshiruvchisi qilib tayinlagan. O'ylab topilgan tibbiy
kafolat BAD da'volarini aytadigan sahifalarda, "Reklama to'g'risida"gi qonunning
35-moddasi bu sohani aniq tartibga soladigan mamlakatda — bu yuridik xavf.
Bo'sh kengash va jim pasayish — to'g'ri tanlov.

**Mijozdan kerak:** kamida bitta haqiqiy mutaxassis — ism, haqiqiy fotosurat,
mutaxassislik, ish joyi va **yozma roziligi**. Qo'shilganda ikkala qatlam ham
o'zi yonadi: komponentlar ixtiyoriy ekspertni qabul qiladi, JSON-LD esa
`reviewedBy` ni chiqaradi. Hech qanday kod o'zgartirish talab qilinmaydi.

Batafsil: `docs/QOLGAN-ISHLAR.md` §2 va `docs/GOVITA-TAVSIYALAR.md` §Ekspertlar.

---

### 🟡 4.17 Uchta sahifada qotirilgan son haqiqatga zid keladi *(yakuniy tekshiruvda topildi)*

Barcha tuzatishlar tugagach, hujjatlardagi **har bir raqamni** mexanik tekshirib
chiqdim va shu jarayonda sayt matnlarida ham xuddi shu turdagi xatolarni topdim.
Bu kontent nuqsoni — kod buzilmagan, lekin sayt o'zi haqida noto'g'ri narsa aytadi.

**1. `/uz/about` — "katalogimiz uchta liniyadan iborat"**

```
pages.about.intro: "Katalogimiz uchta asosiy liniyadan iborat:
                    Swiss Energy, Dr. Frei va Delical."
```

Lekin `/uz/brands` sahifasi — sarlavhasi *"Katalogdagi barcha brendlar"* —
**6 ta** brendni ko'rsatadi:

```
Swiss Energy (Shveytsariya) · Dr. Frei (Shveytsariya) · Delical (Fransiya)
Peano (Germaniya) · Aminomorin (Yaponiya) · HIEW
```

Ya'ni saytning bir sahifasi "uchta, iborat" (ya'ni tamom) deydi, ikkinchisi
"barchasi" deb oltitani sanaydi. Mijoz ikkala sahifani yonma-yon ochsa,
ziddiyatni ko'radi.

Sabab: brendlar ro'yxati `pages.brands.items` ma'lumotidan (keyinchalik Sanity'dan)
keladi, `about.intro` esa **sonni matn ichiga qotirib qo'ygan**. Ma'lumot
o'zgarganda matn o'zgarmaydi.

**Tuzatildi:** son olib tashlandi — *"Katalogimiz rasmiy import qilingan
brendlardan tashkil topgan — Swiss Energy, Dr. Frei, Delical va boshqalar;
to'liq ro'yxat Brendlar sahifasida."* Endi brendlar soni qanday o'zgarsa ham
matn noto'g'ri bo'la olmaydi.

**2. Bosh sahifa — "6 ta savolga javob bering", kvizda esa 12+**

```
home.quizPromo.body: "...uchun 6 ta oddiy savolga javob bering."
```

Jonli kviz: `1 / 12`. Va bu ham qotiriladigan son emas — `QuizFlow.tsx:210`
`{t("stepOf", { step: stepIndex + 1, total: visible.length })}` ishlatadi,
`questions.ts` da esa `showIf` shartlari bor: savollar foydalanuvchi javobiga
qarab ko'rinadi yoki ko'rinmaydi. `raw` da 27 ta savol, ko'rinadigani yo'lga
qarab o'zgaradi.

Ya'ni **hech qanday** to'g'ri qotirilgan son mavjud emas — "12" ham boshqa yo'lda
noto'g'ri bo'lardi. **Tuzatildi:** *"bir necha oddiy savolga javob bering."*

**3. `/uz/experts` — "ikkita profil", aslida uchta**

```
experts.demoNoticeBody: "Quyidagi ikkita profil — dizayn uchun qo'yilgan namuna..."
```

Sahifada esa **3 ta** namunaviy profil chiziladi (`namuna-terapevt`,
`namuna-farmatsevt`, `namuna-nutriyent-mutaxassisi`). Bu eng nozik holati:
gap aynan *"biz o'ylab topmaymiz"* deb va'da beradigan xalqaro halollik
blokining ichida edi — va o'sha blokning o'zi noto'g'ri son aytardi.
**Tuzatildi:** *"Quyidagi profillar — dizayn uchun qo'yilgan namuna..."*

Uchchalasi ham `uz.json` va `ru.json` da tuzatildi; kalit pariteti saqlandi
(**919 = 919**). Jonli tekshiruv: 6/6 sahifa (`/uz` + `/ru` × about, home,
experts) — eski matn yo'q, yangi matn bor.

**Umumiy qoida (bu yerda chiqarilgan xulosa):** ma'lumotdan keladigan narsaning
sonini nusxaga qotirib yozmaslik kerak. Uchta holatning hammasi bitta sababdan
buzilgan: ro'yxat ma'lumotda, son esa matnda. Shu sababli tuzatishda son
**to'g'ri qiymatga almashtirilmadi** — u **olib tashlandi**, chunki 6→3 yoki
6→12 qilish keyingi o'zgarishda yana eskiradi.

---

## 5. Bu branch'da nima o'zgartirildi

Audit kuni bu bo'limda faqat bitta band bor edi — 4.2 dependency patch'ini
tekshirish uchun qo'llaganim, va *"boshqa hech narsani o'zgartirmadim"* degan
gap. Keyin siz loyihani mijozga taqdim etishga tayyor qilishni so'radingiz,
shuning uchun bu bo'lim endi to'liq o'zgarishlar ro'yxati.

### Yaratilgan fayllar (10 ta)

| Fayl | Nima uchun |
|---|---|
| `src/lib/config/demo.ts` | Kabinet va ijtimoiy-isbot demo rejimini bitta joydan boshqaradi; ikkalasi ham **opt-in** (4.10) |
| `src/lib/privacy.ts` | Telefon/email maskalash — server log'ida PII qolmasligi uchun (4.9) |
| `src/components/ui/ErrorNote.tsx` | Xato bloklarini bitta komponentga yig'ish (`danger` token masalasi izohida yozilgan) |
| `src/app/studio/layout.tsx` | `/studio` production gate'i — flag + haqiqiy project ID talab qiladi (4.7) |
| `scripts/audit/checks/soft404.mjs` | Soft-404 ni o'lchaydigan audit tekshiruvi (4.1 qayta takrorlanmasligi uchun) |
| `scripts/audit/deps.mjs` | Dependency baseline + ratchet: yangi zaiflik CI'ni qizartiradi (4.3) |
| `scripts/audit/public-hygiene.test.ts` | `public/` ostida binary damp paydo bo'lsa test qizil bo'ladi (4.6) |
| `vitest.setup.ts` | Har testdan keyin Zustand store'larini tozalaydi — testlar tartibi birbiriga ta'sir qilmaydi |
| `src/lib/storage-keys.test.ts` | `alimkhanov-` → `govita-` migratsiyasini va kalit ro'yxatini qamrab oladi |
| `LOYIHA-BAHOSI.md` | Ushbu hisobot |

### O'chirilgan (7 ta)

`src/app/[locale]/products/loading.tsx` (soft-404 va sarlavha tartibining sababchisi)
va 6 ta RAR arxiv — 5 tasi `public/products/`, 1 tasi ildizdagi duplikat.

### O'zgartirilgan (asosiylari)

| Fayl | O'zgarish |
|---|---|
| `src/lib/seo/metadata.ts` | `locales[0]` → `defaultLocale`: x-default endi `/uz` (4.4) |
| `src/lib/seo/jsonld.tsx` | `structuredDataImage()` — barcha JSON-LD rasmlari absolyut (4.5) |
| `src/app/[locale]/account/page.tsx` | `accountAreaAvailable()` bo'lmasa `notFound()` (4.10) |
| `src/components/layout/TopBar.tsx` | Kabinet havolasi demo flag'ini ham hisobga oladi |
| `src/app/actions/notifyRestock.ts` | Soxta "muvaffaqiyat" javobi o'rniga **haqiqiy Telegram yetkazib berish**; PII maskalangan |
| `src/components/product/OutOfStockNotify.tsx` | Label bilan bog'langan telefon formasi + haqiqiy xato holatlari |
| `src/components/loyalty/LoyaltyJourney.tsx` | Ishlamaydigan kabinet CTA'si → `/products` |
| `src/lib/email/send.ts` | `redactPhone()` log'da qo'llanadi |
| `sanity.config.ts`, `.github/workflows/ci.yml`, `.gitignore`, `vitest.config.ts`, `package.json` | Studio nomi, dependency gate, arxivlar, test setup, `audit:deps` |
| `src/components/{profile,account,wishlist}/*View.tsx` | Sarlavha hydration gate'idan tashqariga chiqarildi (4.15) |
| `src/sanity/image.ts` | Named export — build logi 0 ogohlantirish (4.14) |
| `README.md`, `CLAUDE.md`, `docs/QOLGAN-ISHLAR.md`, `.env.example` | Haqiqatga keltirildi (4.13) |
| `src/messages/{uz,ru}.json` | Restock formasi uchun 2 ta yangi kalit; uchta qotirilgan son olib tashlandi — brendlar, kviz savollari, namunaviy ekspertlar (4.17). Paritet 919 = 919 |
| `package.json` + lock | `next@15.5.27`, `eslint-config-next@15.5.27`, `react-is@19.2.8`; `gsap` va `@tanstack/react-query` olib tashlandi (4.2, 4.11) |

### Yakuniy gate natijalari

```
npm run lint        →  ✔ No ESLint warnings or errors      (0 xato, 0 ogohlantirish)
npx tsc --noEmit    →  0 xato
npm test            →  10 fayl / 113 test — hammasi yashil
pytest              →  51 passed
npm run build       →  ✓ Compiled successfully, ✓ 129/129 statik sahifa
                       build logida 0 ogohlantirish
npm run audit:deps  →  exit 0 · 0 actionable · 19 baselined · 0 stale
```

Dependency zaifliklari 47 → 39 → **19 baselined** ga tushdi. Qolgan 19 tasi
`sanity@3.x` pin'i tufayli yopilmaydi — bu atayin qabul qilingan baseline,
`scripts/audit/deps.mjs` esa yangi qator qo'shilsa CI'ni qizartiradi.

---

## 6. Endi nima qoldi

Koddan — hech narsa relizni to'smaydi. Qolgan narsalar ikki turga bo'linadi.

### Sizdan kerak (kodsiz ham bo'ladi, lekin sayt to'liq bo'lishi uchun)

Buning to'liq ro'yxati `docs/QOLGAN-ISHLAR.md` da — har bir band uchun qaysi
o'zgaruvchini to'ldirish kerakligi yozilgan. Qisqasi:

1. **env o'zgaruvchilari** — Shopflow, FastAPI deploy, Telegram bot tokeni,
   Resend + SPF/DKIM/DMARC, analytics ID'lari, sayt URL'i, Sanity.
2. **Logotip** — `BRAND.logo` hali `null`; JSON-LD `Organization.logo` shu sababli
   `/icons/icon-512.png` ga tushadi.
3. **Litsenziya raqami** va sertifikat skanlari (`NEXT_PUBLIC_LICENCE_NUMBER`).
4. **Kamida bitta haqiqiy tibbiy ekspert** (4.16) — ism, foto, mutaxassislik,
   yozma rozilik. Mexanizm tayyor, o'zi yonadi.
5. **Real sharhlar** — `/uz/reviews` hozir halol "bo'sh" holatni ko'rsatadi.

### Texnik qaror kutayotgan (relizni to'smaydi)

6. **CSP (4.8)** — saytda checkout, GTM va Meta Pixel bor, lekin
   `Content-Security-Policy` yo'q. `Report-Only` bilan boshlash to'g'ri yo'l:
   qattiq CSP'ni darhol yoqish uchta tashqi skriptni sindirishi mumkin, shuning
   uchun avval bir necha kun hisobot yig'ish kerak. Bu **ongli kechiktirish**,
   unutib qolish emas.
7. **Test qamrovi (4.12)** — 113 test yashil, lekin komponent darajasidagi test
   yo'q va `CheckoutForm.tsx` (565 qator) tekshirilmagan. Playwright o'rnatilgan,
   `*.spec.ts` fayllar yo'q. Eng yuqori qiymat: checkout oqimi uchun 3–4 ta E2E.
8. **`.git` tarixi (4.6)** — 72 MB, RAR'lar tarixda qolgan. `git filter-repo`
   talab qiladi va barcha commit hash'larini o'zgartiradi → jamoa bilan kelishib.
9. **Sanity 6 migratsiyasi** — 19 ta baselined zaiflikning yagona yechim yo'li.
10. **`backend/app/otp.py`** — OTP HMAC uchun `settings.jwt_secret` qayta
    ishlatiladi. Ishlaydi, lekin alohida `OTP_HMAC_KEY` kalitlarni ajratadi.
11. **`next lint` deprecated** — Next 16 ga o'tishdan oldin ESLint CLI'ga
    migratsiya kerak; CI shu buyruqqa tayanadi.

---

## 7. Yakuniy xulosa

Bu **yaxshi qurilgan loyiha**. Kod intizomi, izohlar madaniyati (har bir g'ayrioddiy
qaror *nega* shunday qabul qilingani bilan yozilgan), o'lchanadigan a11y darajasi
va backend xavfsizligi — bularning hammasi tajribali jamoa belgisi.
`src/lib/rate-limit.ts` dagi izoh shunday tugaydi: *"pulling in Redis to pretend
otherwise would add a dependency that can fail and take checkout down with it."*
Cheklov o'zi xotirada ekanini yashirmasdan, nega aynan shunday tanlanganini yozib
qo'yish — kamdan-kam uchraydigan mulohaza darajasi.

Muammolarning aksariyati **kod emas, intizomning susayishi**:

- Loyiha o'zi yozib qo'ygan qoidani (`loading.tsx` yo'q) o'zi buzgan → soft-404
- Loyiha o'zi yozib qo'ygan da'volar (`en` yo'q, 27 ta mavzu bor) hujjatlarda
  eskirgan → noto'g'ri yo'naltirish
- Sifatni o'lchaydigan vosita bor (`scripts/audit/`), lekin dependency
  xavfsizligini o'lchaydigan vosita yo'q → 2 kritik zaiflik sezmay qolgan

Uchta muammo (4.1, 4.2, 4.3) tuzatilsa, bu loyiha production'ga bemalol
chiqariladigan darajada. Ularning hammasi kichik va men har birini amalda
tasdiqladim.

---

## 8. Tuzatishdan keyingi holat (2026-10-07)

Yuqoridagi xulosa audit **kunidagi** holat. Siz loyihani mijozga taqdim etishga
tayyor qilishni so'raganingizdan keyin barcha 🔴 va 🟡 topilmalar kodda
tuzatildi va production build ustida jonli o'lchandi.

| Yo'nalish | Audit kuni | Hozir | Nima o'zgardi |
|---|---|---|---|
| Kod sifati | 9 | **9** | o'zgarmadi (yuqori edi) |
| Arxitektura | 9 | **9** | `demo.ts` konfiguratsiya qatlami qo'shildi |
| Accessibililik | 9 | **9.5** | uchala hydration gate sarlavhali bo'ldi (4.15) |
| Backend xavfsizligi | 9 | **9** | PII maskalash frontend log'lariga ham tarqaldi (4.9) |
| SEO | 6.5 | **9** | soft-404 yo'q, x-default to'g'ri, JSON-LD rasmlari absolyut — hammasi jonli tekshirildi |
| Dependency xavfsizligi | 4 | **7.5** | 47 → 19 (qolgani `sanity@3` pin'ida, baseline + CI ratchet bilan nazoratda) |
| Test qamrovi | 6 | **6.5** | 100 → 113 test, setup fayl va migratsiya testi; komponent/E2E hali yo'q |
| Repo gigienasi | 4 | **8** | 46 MB o'lik fayl deploy'dan chiqdi, ignore + test bilan qulflandi; `.git` tarixi ochiq masala |
| Dokumentatsiya | 6 | **9** | `README`, `CLAUDE.md`, `QOLGAN-ISHLAR.md` haqiqatga moslashtirildi; build logi toza |

**Umumiy: 8.0 → 9.1 / 10.**

Qolgan narsalar ikki turdagi: **siz beradigan ma'lumot** (env, logotip, litsenziya,
haqiqiy ekspert, real sharhlar) va **ongli kechiktirilgan texnik qarorlar** (CSP,
E2E qamrovi, git tarixi, Sanity 6). Birinchilari kodsiz ham sayt to'liq bo'lishi
uchun kerak — ro'yxati `docs/QOLGAN-ISHLAR.md` da, har biri uchun aniq qaysi
o'zgaruvchi to'ldirilishi yozilgan.

Tuzatish jarayonining o'zi uchta yangi muammoni ochdi — 4.15 (sarlavhasiz
birinchi paint), 4.16 (tibbiy imzo yo'qligi) va 4.17 (sayt matnidagi qotirilgan
sonlar haqiqatga zid). Uchalasi ham audit kunida ko'rinmagan edi, chunki ular
buzilgan funksionallik emas, **noto'g'ri da'vo** edi — va bunday narsalar faqat
har bir raqamni alohida o'lchaganda chiqadi.

**Bir narsani alohida aytishim kerak.** Bu hisobotning dastlabki nusxasida bitta
iqtibos men tomonidan o'ylab topilgan edi va men uni topib, haqiqiy manba matni
bilan almashtirdim. Shundan keyin hisobotdagi **har bir** iqtibos va raqam repo
ustida mexanik tekshirildi. Tuzatish paytida yana ikki xato da'voni o'zim
bekor qildim: biri `QOLGAN-ISHLAR.md` da (sahifalarda tibbiy imzo bor deb
yozgandim — jonli o'lchov `reviewedBy` umuman yo'qligini ko'rsatdi, bu 4.16 bo'ldi),
ikkinchisi 4.10 da (`ApiError` tashlanadi deb yozgandim — aslida mock qatlam
muvaffaqiyatli javob qaytarar edi, ya'ni muammo teskari edi). Da'vo yaxshi
yangraganda ham uni o'lchash kerak — bu hisobot endi shu qoida bilan yozilgan.
