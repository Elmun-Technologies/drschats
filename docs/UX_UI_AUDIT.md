# Go Vita storefront — to'liq UX/UI audit

**Sana:** 2026-08-22
**Branch:** `arena/01a0293d-drschats` (base `f05ce20`)
**Tekshiruv qamrovi:** butun storefront — `uz` va `ru` lokalizatsiya, bosh sahifa / mahsulot / katalog / savatcha / checkout / quiz / profil va boshqa modullar.
**Usul:** production build (`next build`) + running server ustida tekshiruv; SSR HTML ni `uz`/`ru` da o'rganish; manba kod o'rganish (`src/components`, `src/lib`); WCAG kontrastni hisoblash (token qiymatlari bo'yicha).

> **Muhim cheklov:** sandbox tarmog'i Google Fonts va Playwright/Chromium CDN'ni bloklagani uchun `npm run audit` (headless-browser tekshiruvi) ishga tushirilmadi va rasmiy skrinshotlar olindi emas. Shunga qaramay kontrast qiymatlari aniq **hisoblab**, SSR HTML va kod tahlil qilindi. Quyidagi xulosalar ushbu usul bilan tasdiqlangan.

> **YANGILASH (2026-08-22, keying commit):** Ushbu audit natijasida topilgan P0 va P1 muammolarning aksariyati **tuzatildi** — pastdagi «10. Tuzatishlar» bo'limiga qarang. Scorecard endi tuzatishdan oldingi boshlang'ich holatni aks ettiradi.

---

## 1. Xulosa (scorecard)

| Yo'nalish | Boshlang'ich | Tuzatilgandan keyin | Izoh |
|---|---|---|---|
| I18n / lokalizatsiya | **2/10** | **9/10** | RU sahifadagi qattiq kodlangan o'zbekcha matnlar tarjimaga o'tkazildi |
| Trust & compliance | **4/10** | **9/10** | Soxta ijtimoiy isbot endi default'da o'chirilgan; xayoliy reyting/izoh yashirindi |
| Kontrast / a11y | **5/10** | **9/10** | `--color-faint`/`--color-muted` va gold-ink tokenlari WCAG AA'ga keltirildi |
| Brend konsistensiyasi | **5/10** | **8/10** | Amber aksenti asosiy oqimdan olib tashlandi; eski indigo `theme-color` tuzatildi |
| IA / navigatsiya | **7/10** | **8/10** | Maqsadga asoslangan navigatsiya saqlanib qoldi; kichik silliqlashlar |
| Conversion funnel | **7/10** | **8/10** | Soxta scarcity olib tashlandi; exit-intent yumshatildi; checkout tartibi to'g'rilandi |
| Semantika / ma'lumot tuzilmasi | **6/10** | **9/10** | heading sakrayishi yo'q qilindi; takroriy hisoblagich olib tashlandi |
| PWA / performans | **7/10** | **8/10** | Brand rangi (`theme_color`) endi palettega mos |
| **Umumiy** | **~5.5/10** | **~8.5/10** | P0/P1 yopildi; P2/P3 silliqlash va haqiqiy kontent kutilmoqda |

---

## 2. ENG MUHIM — avval nimalarni tuzatish kerak

### P0-1. Soxta ijtimoiy isbot DEFAULT'DA YOQIQ (kritik: trust + compliance)

`src/lib/content/sample-social-proof.ts:42`:

```ts
export const SHOW_SAMPLE_SOCIAL_PROOF =
  process.env.NEXT_PUBLIC_SAMPLE_SOCIAL_PROOF !== "off";
```

Fayl ichidagi komment va `.env.example`, `README.md`, `CLAUDE.md` **"default o'chiq; yoqish uchun `=on`"** deydi. Lekin kod aslida **default = yoqilgan** (env yo'q bo'lsa `undefined !== "off"` → `true`). Natijada production'da (env o'rnatilmagan):

- `mock.ts` bo'yicha barcha mahsulotlarga xayoliy `rating: 4.5–4.9` qo'yiladi;
- Bosh sahifada **"Tasdiqlangan xaridor"** yorliqli o'ylab topilgan sharhlar (Sanjar O., Manzura B., Odil S., Feruza N. — "Verified buyer");
- **"10,000+ Muvaffaqiyatli xaridlar"**, **"4.9 ★"**, **"98% Ijobiy fikrlar"** kabi xayoliy raqamlar;
- `LivePurchaseToast` ("malika S. hozirgina sotib oldi") har ~35s chiqadi.

**Nima uchun kritik:** dorixona auditoriyasi uchun soxta sharh/reyting — bu yolg'on da'vo. Google'ning `aggregateRating` structured-data siyosati xayoliy reytinglarni taqiqlaydi; O'zbekiston "Reklama to'g'risida"gi qonuni (art. 35, footer'da keltirilgan) xuddi shunday. Bu savdo, huquqiy va SEO riski.

**Yechim:** default'ni **o'chirishga** o'zgartirish:

```ts
export const SHOW_SAMPLE_SOCIAL_PROOF =
  process.env.NEXT_PUBLIC_SAMPLE_SOCIAL_PROOF === "on";
```

va hujjatlardagi kommentni kodga moslashtirish.

---

### P0-2. RU sahifada qattiq kodlangan o'zbekcha matnlar (i18n buzilishi)

`ru` sahifalar asosan tarjima qilingan, lekin bir nechta komponent **qattiq kodlangan o'zbekcha satrlarni** ishlatadi. Bu RU foydalanuvchi uchun sayt "xom" va ishonchsiz ko'rinadi. Tasdiqlangan (SSR HTML `/ru`):

| Manba | Matn | Joy |
|---|---|---|
| `src/components/layout/Header.tsx:27-33` | `navItems` dagi `label`'lar — **"Bosh sahifa", "Barcha mahsulotlar", "Vitaminlar & Minerallar", "30 Kunlik To'plamlar", "AI Diagnostika", "Ekspertlar", "Foydali maqolalar"** + badge `"Katalog"`, `"Kompleks"`, `"2 min"` | Bosh menyu (desktop), mobil menyu |
| `src/components/product/ProductCard.tsx:97` | `{product.servings} porsiya` | Mahsulot kartalari |
| `src/components/product/BuyBox.tsx:140` | `⚡ Faqat 4 ta qoldi (Zudlik bilan yetkaziladi)` | Mahsulot sahifasi |
| `src/components/shop/ShopView.tsx:140` | `{result.total} ta Mahsulotlar Mavjud` | Katalog header |
| `src/components/checkout/CheckoutForm.tsx:215,390` | `Qulay To'lov Usullari:`, `Siz jami … tejadingiz! 🥳` | Checkout (mijoz tomonida) |
| `src/components/exit-intent/ExitIntentPopup.tsx` | butun qattiq kodlangan — `50,000 so'm Vafdorlik Vaucheri…`, `Faqat bugun`, `Vaucherni olish ➔` | Exit-intent popup |
| `src/components/home/TrustRibbon.tsx:7-27` | `100% Sertifikatlangan`, `Laboratoriyada Sinalgan`, `Tibbiy Konsilium Nazorati`, `Tezkor Yetkazib Berish` + desc | Home trust ribbon |
| `src/components/home/QuizPromo.tsx` | `Qadam 1/2/3`, `Nutriolog & Tibbiyot eksperti` | Home |

**Izoh:** `Header` dagi `nav`/`badges` namespace-da to'g'ri tarjimalar **mavjud** (`useTranslations("nav")`), lekin `navItems` ularni ishlatmaydi — qattiq kodlangan `label` ishlatiladi. `CatalogMenu` esa to'g'ri lokalizatsiya qiladi, ya'ni muammo tizimli emas, balki bir nechta joyda.

**Yechim:** barcha yuqoridagi satrlarni `useTranslations` / `getTranslations` ga o'tkazish. `Header.navItems` da `label` o'rniga key ishlatish (masalan `{ key: "home", href: "/" }` va `t(item.key)`).

---

## 3. P1 — Yangi ishni buzmaslik (accessibility / a11y)

### P1-1. Kontrast — `--color-faint` kichik matnlar & placeholders (WCAG AA o'tmaydi)

`src/styles/globals.css:34` → `--color-faint: #94a3b8`.

Hisoblangan kontrast (WCAG AA, oddiy matn 4.5:1 talab):

| Kombinatsiya | Nisbat | Natija |
|---|---|---|
| `#94a3b8` (faint) on `#ffffff` (ink) | **2.56** | FAIL |
| `#94a3b8` (faint) on `#f9fafa` (surface) | **2.45** | FAIL |
| `#64748b` (muted) on `#f2f4f6` (surface-2) | **4.32** | FAIL (4.5 dan past) |

`--color-faint` **60 ta joyda** ishlatiladi (`grep -rn "text-faint" src/components | wc -l`), jumladan:
- **placeholder'lar:** `src/components/checkout/CheckoutForm.tsx:406` (`placeholder:text-faint`), `src/components/layout/SearchBox.tsx:215`;
- kichik meta-matn: mahsulot `sizes`/counts, sanalar, "kategoriyalar by" yorliqlari, footer'dagi kichik izohlar.

Placeholder va kichik kulrang matn 2.5:1 da o'qish qiyin (özellikle keksa yoki ko'rish qobiliyati past foydalanuvchilar uchun). Auto-audit buni ushlamaydi, chunki placeholder `textContent` emas va ko'p `faint` elementlar `descendant` hisoblanadi.

**Yechim:** `--color-faint` ni kamida `#6b7280` (≥4.5:1) dan darker qilish yoki placeholder uchun `--color-muted` dan foydalanish; `--color-muted` over `surface-2` ni ham eng kam 4.5:1 ga ko'tarish.

### P1-2. Kontrast — gold & amber matnlar ochiq fonda (AA o'tmaydi)

Token lar: `--color-gold: #c5a059` (globals.css:46), `--color-gold-ink: #b2893f` (47), `amber-500 #f59e0b`.

| Kombinatsiya | Nisbat | Natija |
|---|---|---|
| `#c5a059` (gold) on white | **2.46** | FAIL |
| gold text on `bg-gold/20` over white | **2.09** | FAIL |
| `#b2893f` (gold-ink) on `bg-gold/20` | **2.73** | FAIL |
| `#f59e0b` (amber-500) on white (aktiv nav, hover) | **2.15** | FAIL |

Misol:
- `src/components/home/NewsletterSignup.tsx:40,56,77` — `text-gold` kichik yorliqlar ochiq fonda;
- `src/components/health/TopicIndex.tsx:70,107,158` — `text-gold` badgelar ochiq fonda;
- `src/components/home/DealOfDay.tsx:87` — gold on gold/15;
- `Header.tsx` — aktiv nav `text-amber-500` (2.15:1).

Champagne gold ochiq fonda **dekorativ emas, o'qilishi kerak bo'lgan matn** sifatida ishlatilgan. Kichik (text-xs) da albatta AA 4.5:1 talab qilinadi.

**Yechim:** ochiq fondagi `text-gold` ni `--color-gold-ink` (`#8a6a2e` ga dark qilib) yoki `--color-brand-deep` ga almashtirish; dark fonlarda gold qoldirish mumkin (u yerda 7.27:1 — yaxshi). `amber-500` aktiv/hover matnini `--color-brand-deep` yoki `#b45309` (amber-700) ga o'tkazish.

---

## 4. P1 — Brend va vizual konsistensiya

### P1-3. 3 xil aksent rang — "navy", "gold", "amber" aralashgan

`globals.css` kommenti "Apteka Indigo" deb ataydi, lekin tokenlar "Deep Premium Navy & Champagne Gold" palette:
- **"action"** sifati uchun `--color-accent: #1e293b` (navy) — asosiy tugmalar;
- **"money/savings"** uchun `--color-gold: #c5a059` — chegirma/CTA;
- Ammo **uchinchi** aksent ham bor: `amber-500/600` — aktiv nav (`Header.tsx`), hover, mahsulot "porsiya" yorlig'i (`ProductCard.tsx:97`), "Faqat 4 ta qoldi" (`BuyBox.tsx`), CartDrawer sarlavha ikonkasi, TrustRibbon ikonkalari.

Natijada bir sahifada 3 xil "aksiya" rangi raqobatlashadi: asosiy CTA `bg-accent` (navy), hero CTA `bg-gold`, kartadagi "Add to cart" `from-amber-500 to-accent` gradient, nav aktiv `amber-500` yoki `text-amber-500`. Bu brend identifikatsiyasini, diqqatni va "qaysi tugma asosiy" degan savolni xiralashtiradi.

**Yechim:** bitta aksent (=action) va bitta aksan (=money/state) ni tanlash. `amber` ni butunlay olib tashlab, uni gold yoki navy ga birlashtirish; nav aktiv/hover uchun navy yoki gold dan birini belgilash.

### P1-4. `theme-color` eski indigo (palette'ga mos emas)

- `src/app/[locale]/layout.tsx:62` → `<meta name="theme-color" content="#3d4cdb" />`
- `public/manifest.json:8` → `"theme_color": "#3d4cdb"`

`#3d4cdb` — to'q indigo/ko'k, hozirgi palette ("Deep Premium Navy & Champagne Gold", navy `#0f172a`/`#1e293b`, gold `#c5a059`) bilan **mos emas**. PWA/brauzer chrome (tab, taskbar) hindigo ko'rinadi, sayt esa navy+gold. Bu PWA va mobil "feel" da nomuvofiqlik.

**Yechim:** ikkala joyda `#0f172a` (yoki `#1e293b`) ni qo'yish, va `manifest.json` ning `background_color`/`theme_color` bilan layout meta'ni sinxron qilish.

### P1-5. Default til `ru`, hujjatlarda `uz` deyilgan

- `src/lib/i18n/routing.ts:5` → `export const defaultLocale: Locale = "ru";` (va `localePrefix: "always"`)
- Ammo `README.md`, `CLAUDE.md`, `.env.example` → "`uz` default", "open `/uz`", "`uz` (default) va `ru`".

Tasdiqlangan: `curl localhost:3000/` → 301/redirect to `/ru`. Ya'ni saytga kirgan yangi foydalanuvchi (O'zbekiston bozori uchun mo'ljallangan) **avtomatik rus tilida** ko'radi, hujjatlar esa o'zbekni "default" deb tasdiqlaydi.

**Yechim:** `defaultLocale` ni `uz` ga o'zgartirish va `localePrefix: "as-needed"` (yoki qoladigan bo'lsa) — va hujjatlarni kodga moslashtirish. Bu ham UX, ham SEO (bosh sahifa uchun default lang) uchun muhim.

---

## 5. P2 — UX / ma'lumot tuzilmasi

### P2-1. Heading daraja sakrashi (h2 → h4)

`src/components/home/TrustRibbon.tsx:54` → `<h4>`. Home'da ketma-ketlik: `h2 "Premium wellness mahsulotlar"` → `h4 "100% Sertifikatlangan"` → ... `h3` yo'q. Bu **h2→h4 sakrash**. `CLAUDE.md` "Sarlavha darajasi sakrashi | 0" deb da'vo qiladi — lekin bu sahifada sakrash mavjud.

**Yechim:** `h4` ni `h3` ga almashtirish (yoki bu trust elementlarini rasmiy heading emas, `p` qilish). Va `CLAUDE.md` jadvalini yangilash.

### P2-2. Katalog sahifada mahsulot soni ikki marta ko'rsatiladi

`src/components/shop/ShopView.tsx`:
- `:140` → badge `{result.total} ta Mahsulotlar Mavjud` (qattiq kodlangan);
- `:318` → `{t("resultsCount", { count: result.total })}` (sort bar ustida).

Ikkalasi bir xil sonni, bir sahifada ikki xil shaklda ko'rsatadi — ortiqcha va tarjima ham mos emas.

**Yechim:** birini olib tashlash, qolganini `t("resultsCount")` ga o'tkazish.

### P2-3. Soxta scarcity (mijozni chalg'ituvchi)

`src/components/product/BuyBox.tsx:140` → `⚡ Faqat 4 ta qoldi (Zudlik bilan yetkaziladi)` — **har doim** `inStock` bo'lganda ko'rinadi, qattiq kodlangan va lokalizatsiya qilinmagan. Bu soxta "kam qoldi" urg'u (dark pattern) — haqiqiy stok qiymati bilan bog'liq emas.

**Yechim:** yoki haqiqiy `stock` ma'lumotidan kelib chiqish, yoki olib tashlash; albatta tarjima qilish.

### P2-4. Aggressive exit-intent popup

`src/components/exit-intent/ExitIntentPopup.tsx`: `mouseleave` (kursorni yuqoriga ko'tarish) **va** `visibilitychange` (tab almashtirish) — ikkalasi popup ochadi, session'dа bir marta. Bu ko'p foydalanuvchini bezovta qiladi va kontent butunlay qattiq kodlangan o'zbekcha. Business nuqtai nazaridan "taksi-format" dark-pattern sifatida qabul qilinishi mumkin.

**Yechim:** faqat mouseleave (tab switch emas), yoki butunlay olib tashlash; tarjima qilish; "bir marta / kechiktirish" tugmasini taqdim etish.

### P2-5. Checkout joylashtirish — mobil'da xulosa formadan oldin

`src/components/checkout/CheckoutForm.tsx`: `<form ... [order:2] lg:[order:1]>`, `<aside ... [order:1] lg:[order:2]>`. Mobil'da **savatcha xulosasi** formadan **oldin** turadi. Bu foydalanuvchiga ma'lumot yozishdan oldin pul summasini ko'rsatadi — ba'zan yaxshi, lekin ko'p hollarda formani birinchi qilish yaxshiroq (mijoz avval ma'lumot kiritadi, keyin xulosaga erishadi), ayniqsa uzun forma (7 maydon) da scroll'ga qo'shimcha yuk bo'ladi.

**Yechim:** mobil'da formani birinchi ko'rsatish, xulosani yig'ilgan holda qoldirish.

---

## 6. P3 — Pastroq ustuvorlik / qulaylik

| # | Tavsif | Joy |
|---|---|---|
| P3-1 | **Placeholder mahsulot/hero rasmlar** — Unsplash lifestyle rasmlari va SVG placeholder'lar. Brend rostini olguncha mahsulot sahifasi ishonchsiz ko'rinadi. | `HeroBento.tsx`, `mock.ts`, `brand.ts` |
| P3-2 | **`localePrefix: "always"`** — `/` root sahifa yo'q, har doim /uz yoki /ru. SEO/UX uchun ko'pincha ma'qul, lekin root redirect UX'iga e'tibor berish. | `routing.ts` |
| P3-3 | `manifest.json` `background_color` / `theme_color` va layout meta-tag sinxron emas (P1-4 bilan birga). | `manifest.json`, `layout.tsx` |
| P3-4 | `sitemap.ts` da priyoritetlar qo'lda; yangi sahifalar (lp, program, review) avtomatik qo'shilmaydi. | `sitemap.ts` |
| P3-5 | `quiz` sahifasi (276 kB) va `studio` (1.67 MB) asosiy sahifalardan og'irroq. | build natijasi |

---

## 7. Nima yaxshi ishlayapti (saqlab qolish kerak)

- **Accessibility poydevori kuchli:** `useDialog` hook (Escape, fokus-trap, fokusni qaytarish), `role=dialog`/`aria-modal`, skip-to-content link, `aria-live` qty, form xatolari `role=alert`+`aria-invalid`+`aria-describedby`, search `combobox`/`listbox`, `prefers-reduced-motion` fallback.
- **Maqsadga asoslangan navigatsiya** (`/goals`, `/symptoms`, `/vitamins`, `/quiz`, `/programs`) — dorixona uchun juda to'g'ri arxitektura; bo'sh bo'lim menyuda ko'rinmaydi (`isNavigable`).
- **Pastki chekka tokeni** `--bottom-nav` — mobil tab-bar, scroll-top, toast, consent'ning bir-biriga kirib qolishini oldini oladi.
- **`grid-template-rows: 0fr→1fr`** accordion va scroll-reveal CSS orqali — JS-animation runtime'siz, reduced-motion'da ishonchli.
- **Form validation & rate-limiting** (checkout server action, Zod, 10/IP/10min) va **email-konfirmatsiya** oqimi.
- **SEO** (JSON-LD WebSite/LocalBusiness/Product/FAQ/Breadcrumb, hreflang, sitemap, noindex-checkout) yaxshi qurilgan.

---

## 8. Tavsiya etilgan tuzatish tartibi (roadmap)

**1-bosqich (P0)** — ishga tushirishdan oldin:
1. `SHOW_SAMPLE_SOCIAL_PROOF` default'ni o'chirish + hujjatlarni moslash.
2. Barcha qattiq kodlangan o'zbekcha matnlarni tarjima qilish (Header nav, ProductCard `porsiya`, BuyBox urgency, ShopView count, Checkout, ExitIntent, TrustRibbon, QuizPromo).

**2-bosqich (P1)** — a11y va brend:
3. `--color-faint` va gold/amber kontrastini 4.5:1 ga ko'tarish; placeholder'ni `--color-muted` ga o'tkazish.
4. Aksent rang tizimini birlashtirish (amber'ni olib tashlash).
5. `theme-color`/manifest `#0f172a`; `defaultLocale: "uz"` + hujjatlarni sinxron.
6. Heading daraja (TrustRibbon h4→h3).

**3-bosqich (P2)** — UX silliqlash:
7. ShopView duplicate sonni olib tashlash.
8. Soxta scarcity'ni haqiqiy stokka bog'lash yoki olib tashlash.
9. Exit-intent popup'ini yumshatish (tab switch olib tashlash) + tarjima.
10. Checkout mobil tartib (formani oldin).

---

## 9. Ilova — tekshirish usuli va dalillar

- **Ishga tushirish:** `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` (sandbox Google Fonts bloklangan) bilan `next build`; `next start -p 3000`. `HOME` = `http://localhost:3000`.
- **SSR HTML:** `curl http://localhost:3000/uz` va `/ru` — sarlavhalar, heading'lar, tag-badge, qattiq kodlangan matnlar, imo-islohlar tekshirildi.
- **Kontrast:** WCAG 2.1 nisbat formulasi bilan token qiymatlaridan hisoblandi (yuqoridagi jadval).
- **Rasmiy `npm run audit`** ishga tushmadi (Chromium yuklab olinmadi) — CI'da qayta tekshirish tavsiya etiladi.
- **Kod:** barcha topilmalar `src/…` fayl:qator bilan keltirilgan.

---

## 10. Tuzatishlar (2026-08-22) — kiritilgan o'zgarishlar

Ushbu bo'limda yuqoridagi muammolarni hal qilish uchun qilingan kod o'zgarishlari keltirilgan. Barcha o'zgarishlar `next build` + `next start` bilan tekshirildi; `npm test` (46/46) va `npm run lint` toza.

### P0-1 — Soxta ijtimoiy isbot
- `src/lib/content/sample-social-proof.ts` → `SHOW_SAMPLE_SOCIAL_PROOF` endi `=== "on"` (strikt opt-in). Default: **o'chiq**.
- `src/components/home/StatsBand.tsx` → xayoliy `customers`/`rating` statlar ham shu bayroq ortiga yashirindi; haqiqiy `products`/`delivery` har doim chiqadi.
- (Natija: `/uz` va `/ru` da "Tasdiqlangan xaridor", "10,000+", "4.9 ★", reytinglar **endı chiqmaydi**.)

### P0-2 — Qattiq kodlangan o'zbekcha matnlar → tarjimalar
`src/messages/uz.json` va `src/messages/ru.json` ga yangi kalitlar qo'shildi va komponentlar `useTranslations`/`getTranslations` ga o'tkazildi:
- `src/components/layout/Header.tsx` — `nav.menu.*` + `nav.badge.*` (desktop + mobil menyu, badge'lar).
- `src/components/product/ProductCard.tsx` — `product.servingsLabel` ("porsiya"/"порций").
- `src/components/shop/ShopView.tsx` — `shop.productsAvailable`.
- `src/components/checkout/CheckoutForm.tsx` — `checkout.paymentMethodsTitle`, `checkout.paymentCash`, `checkout.savings`.
- `src/components/exit-intent/ExitIntentPopup.tsx` — butun `exit` namespace (title/body/badge/perks/cta/promise/success).
- `src/components/home/TrustRibbon.tsx` — `home.trustRibbon.t1..t4`.
- `src/components/home/QuizPromo.tsx` — `home.quizPromo.*` (badge/body/steps/cta/doctor).
- `src/components/home/Testimonials.tsx` — `home.voices.badge/verifiedBuyer/stat*`.
- `src/components/home/NewsletterSignup.tsx` — `home.newsletter.*`.
- `src/components/home/TopCategories.tsx` — `home.categories.hooks.*` + `home.categories.cta`.
- `src/components/home/ProgramsRail.tsx` — `programs.railEyebrow`, `programs.savePercent`.
- `src/components/home/AudienceDoors.tsx` — `home.audience.eyebrow/subtitleFallback/sub*`.
- `src/components/home/PromoBanners.tsx` — `home.promo.b1..b3`.
- `src/components/health/TopicIndex.tsx` — `health.topicIndex.*` + kindLabel.
- `src/components/product/SubscribeToSave.tsx` — `subscription.benefitFirst/benefitRecurring/benefitCancel/deliveryInterval`, `oneTime`, `oneTimeNote`.
- `src/components/experts/ConsultationModal.tsx` — `experts.successTitle/telegramCta/close`.
- `src/components/layout/Footer.tsx` — `footer.qualityBadge`.

### P1-1 — Kontrast (faint / muted)
- `src/styles/globals.css` → `--color-muted: #55616f`, `--color-faint: #626d80`. Endi white/surface/surface-2 da **≥4.5:1** (yuqoridagi jadval).

### P1-2/P1-3 — Gold/amber kontrast va aksent birlashuvi
- `--color-gold-ink: #8a6a2e` (ochiq fonda ≥4.5:1); `--color-gold` dark fonlar uchun saqlanib qoldi (7.27:1).
- `Header.tsx` aktiv/hover nav `amber-500` → `gold-ink`; `ProductCard` amber gradient tugma → solid `bg-accent`; `ProductCard`/qator hover → `gold-ink`; `CartDrawer` ikonka → `gold-ink`. Quiz/ekspertlar o'z amber aksentini saqlab qoldi (alohida bo'lim aksenti).

### P1-4 — theme-color / manifest
- `src/app/[locale]/layout.tsx` va `public/manifest.json` → `#0f172a` (navy), eski indigo olib tashlandi.

### P1-5 — Default til
- `src/lib/i18n/routing.ts` → `defaultLocale: "uz"`. Endi `/` → `/uz`; hujjatlarga mos.

### P2-1 — Heading sakrashi
- `TrustRibbon.tsx` → `h4` → `h3`. Endi home'da heading sakrashi yo'q (tekshirildi: `h1=1, h2=22, h3=49, h4=0`).

### P2-2 — Takroriy hisoblagich
- `ShopView.tsx` → sort bardagi takroriy `resultsCount` olib tashlandi; hero badge `productsAvailable` qoldi.

### P2-3 — Soxta scarcity
- `BuyBox.tsx` → "Faqat 4 ta qoldi" (qattiq kodlangan, soxta) **olib tashlandi**; faqat `inStock` holati qoldi.

### P2-4 — Exit-intent yumshatish
- `ExitIntentPopup.tsx` → `visibilitychange` (tab almashtirish) trigger olib tashlandi; faqat mouseleave qoldi; kontent tarjimaga o'tkazildi.

### P2-5 — Checkout mobil tartib
- `CheckoutForm.tsx` → form `[order:1]`, aside `[order:2]` (mobil'da forma birinchi).

### Qo'shimcha ikkinchi pass (2026-08-22)
Ikkinchi tekshiruvda ochiq fonda qolgan bir nechta `text-gold` (kontrast ~2.1:1) topilib tuzatildi:
- `src/components/contact/ContactChannels.tsx` — `gold` tone → `text-gold-ink`.
- `src/components/profile/ReminderPanel.tsx` — gold → `text-gold-ink`.
- `src/app/[locale]/blog/page.tsx` — "Tavsiya etilgan maqola" gold → `text-gold-ink` (+ `blog.featuredLabel` uz/ru).
- `src/components/home/TrustRibbon.tsx` — ikona ranglari gold → `text-gold-ink` (grafik objekti 3:1).
- `src/messages/*.json` — kategoriya hook keys to'g'ri slug'larga moslashtirildi (`devices`, `nutrition`, `skin`), `home.promo.viewMore` qo'shildi.

### Tekshiruvlar
- `npm run build` → **0 xato**; `127/127` static page generate qilindi.
- `npm test` → **46/46 o'tdi**.
- `npm run lint` → **0 ogohlantirish/xato**.
- SSR HTML `uz`/`ru` → qattiq kodlangan o'zbekcha matnlar va soxta ijtimoiy isbot **topilmadi**; barcha RU sahifalar toza.
