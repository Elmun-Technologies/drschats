# Claude Code uchun topshiriqlar — bosqichma-bosqich

Har bir bosqichdagi «Topshiriq» blokini toʻliq nusxalab, Claude Code'ga yuboring. Bosqich tugagach natijani brauzerda koʻring, keyin keyingisiga oʻting. Bitta bosqich = bitta yoki bir nechta mantiqiy commit.

Har bir topshiriqqa avtomatik amal qiladigan umumiy qoidalar 0-bosqichda `CLAUDE.md` ga yoziladi.

---

## 0-bosqich. Tayyorgarlik va reja

**Natija:** dizayn qoidalari `CLAUDE.md` da, tokenlar Tailwind'da, shrift va rasmlar joyida, ish rejasi tayyor. Koʻrinish hali oʻzgarmaydi.

```
Loyihaga yangi dizayn qoʻshildi: design/ papkasi. Avval quyidagilarni oʻqi:
design/README.md, design/CLAUDE-design.md, design/PAGES.md, design/tokens.json, design/pages/index.json.

Keyin:
1. Loyihaning hozirgi tuzilishini oʻrgan: Next.js versiyasi, app/ yoki pages/ router, Tailwind sozlamasi, mavjud komponentlar (header, footer, mahsulot kartasi, savat), maʼlumot qayerdan kelishi (mahsulotlar, narxlar, savat holati), i18n (uz/ru).
2. CLAUDE.md boʻlmasa — yarat. design/CLAUDE-design.md mazmunini CLAUDE.md ga «Dizayn tizimi» boʻlimi sifatida qoʻsh. Umumiy ish qoidasini ham yoz: har UI ishidan oldin design/pages/<Sahifa>.html va design/screenshots/<Sahifa>.jpg ni oʻqish; ish oxirida Playwright bilan 1440 va 390 kenglikda skrinshot olib, dizayn skrinshoti bilan solishtirish va farqlarni roʻyxat qilish.
3. design/tokens.json dagi ranglar, radiuslar va soyalarni Tailwind theme.extend ga ayni nomlar bilan qoʻsh (ink, ink-2, muted, tile, line, red, yellow, dark-panel va h.k.). Mavjud ranglarni hozircha oʻchirma.
4. Onest shriftini next/font/google orqali ula (400, 500, 600, 700; latin + cyrillic). Logo uchun Playfair Display 500.
5. design/assets/ dagi fayllarni public/images/ ga koʻchir: c-*.png → public/images/products/, st-* → public/images/stock/. Mahsulot maʼlumotida yangi kesma rasmlarni ishlat (design/data/products.json da slug → imageCutout mosligi bor).
6. Hech qanday sahifani hali oʻzgartirma. Oxirida menga qisqa hisobot ber: mavjud route'lar va design/PAGES.md taqqoslamasi, qaysi komponentlar qayta ishlatiladi, qaysilari yangi, xavflar. Keyingi bosqichlar uchun aniq reja tuz.
```

---

## 1-bosqich. Layout: Header, Footer, mobil header, tab bar

```
1-bosqich: umumiy layout komponentlari.
Manba: design/pages/HeaderV3.html, FooterV3.html, HeaderMobileV3.html, TabBarV3.html, FooterMobileV3.html, MegaMenuV3.html (va mos skrinshotlar).

- Header: utility qator (shahar, yetkazish, toʻlov, kafolat, chegirma tizimi, dorixonalar uchun, Telegram, telefon, UZ|RU), asosiy qator (logo, qora «Katalog» tugmasi, qidiruv, Taqqoslash/Sevimlilar/Kirish/Savat + savat soni), kategoriya qatori («Aksiyalar» qizil). «Katalog» bosilganda MegaMenuV3 dagi panel ochiladi.
- Mobil: HeaderMobileV3 (qidiruv maydoni bosilganda qidiruv ekrani), TabBarV3 — position: fixed; bottom: 0; safe-area; sahifa kontentiga pastdan tab bar balandligicha padding.
- Footer: desktop — FooterV3, mobil — FooterMobileV3 (ustunlar akkordeon).
- Mavjud havolalar va maʼlumotlarni (telefon, Telegram, kategoriyalar) saqla, faqat koʻrinishni dizaynga moslashtir.
Tugagach: bosh sahifani 1440 va 390 da skrinshot qil va dizayn bilan solishtir.
```

---

## 2-bosqich. Mahsulot kartasi va umumiy UI elementlar

```
2-bosqich: ProductCard va kichik UI elementlar.
Manba: design/pages/ProductCardV3.html, design/source/kit.css (klasslar: btn, btn-l, btn-o, chip, b-sale, b-hit, arrow, arr-s, tile, card, panel, inp, opt, cb).

- ProductCard: kvadrat rasm bloki (tile fon, radius 16, rasm object-fit: contain, 9% padding), yuqori oʻngda yurak, pastki chapda «−N%» qizil pill va «Xit» sariq pill, narx (20px bold) + eski narx, birlik narxi qatori (birlik boʻlmasa ham joy egallaydi), nom 2 qator, «24 soatda yetkazish», pastda «Savatga» (och) → savatda boʻlsa qora stepper.
- Narx formatlash yordamchisi: 79 000 soʻm, birlik narxi = narx / dona soni.
- Tugma, chip, badge, input, radio-karta, checkbox — kit.css asosida qayta ishlatiladigan komponentlar.
Barcha mavjud mahsulot kartalarini shu komponentga oʻtkaz.
```

---

## 3-bosqich. Bosh sahifa

```
3-bosqich: bosh sahifa. Manba: design/pages/HomeV3.html, HomeMobileV3.html, HomeMobileFirstV3.html.
Bloklar tartibi: hero slayder (yon doira strelkalar) + «Haftaning taklifi»; kategoriya plitkalari (sarlavha tepada, qadoq kesmasi pastda); ishonch qatori; Aksiyadagi mahsulotlar; qora Swiss Energy paneli ichida kartalar; Koʻp sotib olinadi; 2+1 banner; Kim uchun tanlaysiz (foto); xizmat kartochkalari; Mahsulot qayerdan keladi; Yangiliklar; FAQ + yordam bloki; SEO matn.
Matnlar dizayndagidek, mahsulotlar va narxlar — real maʼlumot manbasidan (hardcode emas). Slayder matnlari: ImmunoVit, Vitamin C, Prenatal Forte (saytdagi slides).
Mobil versiya HomeMobileV3 ga mos boʻlsin.
```

---

## 4-bosqich. Katalog, filtrlar, mega-menyu

```
4-bosqich: katalog. Manba: CatalogV3.html, CatalogMobileV3.html, FiltersMobileV3.html, MegaMenuV3.html.
- Desktop: breadcrumb, sarlavha + soni, subkategoriya plitkalari, chapda filtrlar (narx oraligʻi, sotuvda bor, chegirmadagilar, brend, shakli, kim uchun, mamlakat — har birida soni), saralash, plitka/roʻyxat, faol filtr chiplari, gridda Obuna banneri, «N tadan M tasi koʻrsatildi», koʻp qidiriladigan teglar, SEO matn.
- Mobil: sticky «Filtrlar / Ommabop» qatori, filtrlar pastdan chiqadigan sheet (FiltersMobileV3), «Yana N ta koʻrsatish».
- Filtr sonlari real maʼlumotdan hisoblansin.
```

---

## 5-bosqich. Mahsulot sahifasi

```
5-bosqich: mahsulot sahifasi. Manba: ProductV3.html, ProductMobileV3.html, ProductMobileFirstV3.html.
- Galereya (vertikal thumbnaillar + katta rasm, tile fon), sarlavha, meta qator (sharhlar soni — real, savol-javob, brend, taqqoslash, sevimlilar, ulashish).
- Oʻrta ustun: qadoq hajmi, asosiy xususiyatlar (nuqtali chiziq bilan), qisqa tarkib.
- Xarid bloki: narx, eski narx, −%, birlik narxi; «Bir martalik» / «Obuna bilan — arzonroq» (−10% hozir, keyin −15%, 30/45/60/90 kun); miqdor; Savatga qoʻshish; Hozir buyurtma berish; sotuvda bor; yetkazish va toʻlov bloki.
- Sticky tablar: Tavsif, Tarkibi (jadval), Qabul qilish, Xususiyatlar, Savol-javob, Sharhlar (boʻsh holat), Hujjatlar; oʻngda sticky mini xarid kartasi.
- Mobil: pastda fixed xarid paneli tab bar ustida.
- BAD ogohlantirishi majburiy. Tibbiy vaʼdalarni (masalan «stressni kamaytiradi») mahsulot matnlaridan olib tashla.
```

---

## 6-bosqich. Savat, rasmiylashtirish, natija

```
6-bosqich: savat va buyurtma. Manba: CartV3.html, CartMobileV3.html, CartEmptyV3.html, OrderSuccessV3.html, OrderSuccessMobileV3.html.
- Bepul yetkazishgacha progress (300 000 soʻm), mahsulotlar roʻyxati (tanlash, miqdor, sevimlilarga, oʻchirish), «Buyurtmangizga qoʻshing» upsell, 3 qadam: aloqa, yetkazish (kuryer / oʻzi olib ketish, viloyat, manzil, izoh), toʻlov (Payme, Click, Uzum, naqd/karta).
- Oʻngda sticky xulosa: mahsulotlar, aksiya chegirmasi, birinchi buyurtma −10% (faqat birinchi buyurtmada), yetkazish, jami, tejadingiz, «Buyurtmani yuborish», oferta roziligi.
- Mobil: pastda fixed «Jami + Buyurtmani yuborish».
- Mavjud buyurtma/toʻlov logikasini oʻzgartirma — faqat UI.
```

---

## 7-bosqich. Qidiruv

```
7-bosqich: qidiruv. Manba: SearchV3.html (Header ostidagi takliflar oynasi + natijalar), SearchEmptyV3.html, SearchMobileV3.html.
Takliflar: soʻrov variantlari, kategoriyalar, 3 ta mahsulot (rasm, nom, narx), «Barcha N ta natija». Natija yoʻq holati: mashhur soʻrovlar, «kelganda xabar bering» formasi, tavsiyalar.
```

---

## 8-bosqich. Aksiyalar, brendlar, sevimlilar, taqqoslash

```
8-bosqich. Manba: SaleV3, SaleMobileV3, BrandsV3, BrandV3, FavoritesV3, FavoritesMobileV3, CompareV3.
Taqqoslash jadvalida farq qiluvchi qatorlar fon bilan ajratiladi, «Faqat farqlar» filtri bor.
```

---

## 9-bosqich. Kabinet

```
9-bosqich: shaxsiy kabinet. Manba: LoginV3, LoginMobileV3, AccountV3, AccountMobileV3, OrderDetailV3, SubscriptionsV3, ProfileV3, AccountNavV3.
Kirish — mavjud Telegram OTP oqimi (telefon → kod, 6 xonali). Buyurtmalar holati: Qabul qilindi / Tasdiqlandi / Yoʻlda / Yetkazildi / Bekor qilindi — timeline bilan. Obunalar: oʻtkazib yuborish, oraliqni oʻzgartirish, toʻxtatish, davom ettirish, bekor qilish. Profil: asosiy maʼlumotlar, maqsadlar, oila aʼzolari, eslatmalar.
Backend'da yoʻq funksiyalar uchun UI'ni tayyorla, lekin menga roʻyxat ber — oʻzim qaror qilaman.
```

---

## 10-bosqich. Vitamin tanlash testi

```
10-bosqich. Manba: QuizV3, QuizMobileV3, QuizResultV3.
Mavjud test logikasini saqla. Savol ekrani: progress, foto variantlar; natija: tanlangan yoʻnalishlar, mahsulotlar «Nega» va «Izoh» bilan, toʻplam narxi, «Rejani savatga qoʻshish», shifokor ogohlantirishi.
```

---

## 11-bosqich. Maʼlumot sahifalari, blog, 404

```
11-bosqich. Manba: DeliveryV3, DeliveryMobileV3, PaymentV3, GuaranteeV3, LoyaltyV3, AboutV3, LicensesV3, PartnersV3, ContactV3, BlogV3, ArticleV3, NotFoundV3, InfoNavV3, MenuMobileV3.
Maʼlumot sahifalari chapda InfoNav bilan bitta layout'da. Matnlar dizayndagidek (ular saytdagi real matnlardan olingan). Rekvizitlarda yoʻq qiymatlar uchun «Maʼlumot tayyorlanmoqda — telefon orqali soʻrang».
```

---

## 12-bosqich. Yakuniy tekshiruv

```
12-bosqich: vizual va sifat tekshiruvi.
1. design/pages/index.json dagi har bir sahifa uchun mos route'ni 1440 va 390 kenglikda Playwright bilan skrinshot qil va design/screenshots bilan yonma-yon solishtir. Farqlar jadvalini tuz (sahifa, farq, jiddiylik) va jiddiylarini tuzat.
2. Butun loyihada yashil ranglar (#0B6B41 va eski brend yashillari) qolmaganini tekshir.
3. Kontrast, aria-label, teginish maydonlari ≥ 44px, klaviatura bilan navigatsiya.
4. Lighthouse: Performance, Accessibility, SEO. Rasmlar next/image orqali, oʻlchamlari belgilangan.
5. Mobil: tab bar va xarid paneli fixed, kontentni yopmaydi; iOS safe-area.
Hisobot va commit xabarlarini taklif qil.
```
