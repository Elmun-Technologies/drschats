# SEO — holat, qoidalar va reja

Maqsad: asosiy tijoriy so'rovlarda (Toshkent / O'zbekiston, uz + ru) Google va
Yandex'da top-3. **Kod buni yolg'iz ta'minlay olmaydi.** Texnik va on-page
qism — kirish chiptasi; o'rinni kontent hajmi, havolalar (backlink), brend
qidiruvi, xaritalar va sharhlar hal qiladi. Pastdagi reja shu tartibda.

## 1. Texnik holat (kodda, crawl bilan o'lchangan)

Crawl: `sitemap.xml` dagi har bir URL (216 ta, uz + ru) production build'da.

| tekshiruv | holat |
|---|---|
| 200 bo'lmagan URL sitemap'da | 0 |
| canonical o'z URL'iga teng emas | 0 |
| sitemap'da `noindex` sahifa | 0 |
| `h1` soni ≠ 1 | 0 |
| hreflang (uz, ru, x-default) yo'q | 0 |
| `alt` siz rasm | 0 |
| takror `<title>` | 0 |

Qilingan ishlar va sababi:

- **Title/description kalit so'z bilan** — `src/lib/seo/page-meta.ts` +
  `meta.seo` / `meta.pages` (uz + ru). Avval title faqat nom edi
  ("Vitaminlar — Go Vita"), endi xaridor yozadigan so'rov:
  "… narxi, Toshkentda sotib olish", "… купить в Ташкенте, цена". Description'da
  haqiqiy narx, mahsulot soni va yetkazish muddati (`COMMERCE` dan) — CTR uchun.
  Uzunlik `page-meta.test.ts` da qo'riqlanadi (title ≤ 70, description 70–160).
- **Sitemap** — ru URL'lar ham `<loc>` (avval faqat uz yuborilardi, ru faqat
  hreflang orqali ma'lum edi), mahsulot rasmlari (image sitemap), `lastmod`
  faqat haqiqiy sana bo'lganda (blog). Bo'sh kategoriya sitemap'da yo'q va 404.
- **Filtr/saralash/sahifa URL'lari** (`?sort=`, `?brand=`, `?page=`) —
  `noindex, follow`: havolalar kuzatiladi, nusxa sahifalar indeksga tushmaydi.
- **JSON-LD**:
  - Product `brand` — ishlab chiqaruvchi (avval hamma mahsulotda "Go Vita");
  - o'ylab topilgan `datePublished`/`dateModified` va `priceValidUntil` olib tashlandi;
  - yetkazish narxi haqiqiy (chegaradan past — `shippingFee`);
  - `PharmacyOrDrugstore` → `Store` (litsenziya raqami hali yo'q);
  - WebSite + Store faqat bosh sahifada (Store kontaktda ham), har sahifada emas;
  - kategoriyada `CollectionPage` + `ItemList` + `BreadcrumbList`.
- **og:locale** — `uz_UZ` / `ru_RU` + `og:locale:alternate`.
- **Verifikatsiya** — `GOOGLE_SITE_VERIFICATION`, `YANDEX_VERIFICATION` env.
- **Kategoriya matnlari** — `src/lib/content/category-seo.ts`, 15 ta javon ×
  uz/ru, tibbiy va'dasiz (test tekshiradi).
- **Mock bug**: `productCount` `categoryId` bo'yicha sanalardi, javon esa
  `categorySlug` bo'yicha ko'rsatardi → "collagen", "herbal" bo'sh sahifa bo'lib
  menyu va sitemap'da turardi. Endi ikkalasi bir xil sanaydi.

### Qoidalar (yangi sahifa qo'shganda)

1. Metadata `buildPageMetadata` yoki `page-meta.ts` dagi helper orqali — qo'lda
   `title: \`${x} — Go Vita\`` yozilmaydi.
2. Title ≤ 70 belgi, so'rov so'zi oldinda, brend oxirida. Description 70–160.
3. Query-param varianti bo'lsa — `noindex: true`.
4. Bo'sh sahifa (0 mahsulot, 0 maqola) — 404 va sitemap'dan tashqarida.
5. JSON-LD'da faqat haqiqiy ma'lumot: o'ylab topilgan sana, reyting, sharh,
   litsenziya yo'q (Google manual action xavfi, YMYL).

## 2. Ishga tushirishda — sizdan (1-hafta)

| # | ish | ta'sir | murakkablik |
|---|---|---|---|
| 1 | Google Search Console: domen tasdiqlash, `sitemap.xml` yuborish | Yuqori | Past |
| 2 | Yandex.Webmaster: tasdiqlash, sitemap, region = Toshkent | Yuqori | Past |
| 3 | Google Business Profile + Yandex Business + 2GIS kartochkasi (manzil, soat, telefon — saytdagi bilan **bir xil**) | Yuqori | Past |
| 4 | `NEXT_PUBLIC_SITE_URL=https://www.govita.uz`, www/non-www bitta yo'nalishga 301 | Yuqori | Past |
| 5 | Litsenziya raqami → `BRAND.legal.licence` (YMYL ishonch signali) | O'rta | Past |
| 6 | Haqiqiy logo fayli → Organization `logo` | Past | Past |

## 3. Kontent (1–3 oy) — top-3 ning asosiy dvigateli

Kalit so'zlar **taxmin** — Google Keyword Planner va Yandex Wordstat bilan
tasdiqlash kerak:

- Tijoriy (kategoriya/mahsulot): "vitaminlar sotib olish", "vitamin d3 narxi",
  "omega 3 sotib olish toshkent", "купить витамины ташкент", "магний B6 цена".
- Brend: "swiss energy vitamin", "dr frei tonometr", "delical".
- Ma'lumot (blog/mavzu): "vitamin d yetishmasligi belgilari", "какие витамины
  пить осенью", "homiladorlikda qaysi vitaminlar".

Reja:
- Haftasiga 2 maqola (uz + ru) — `/blog`, har biri 1–3 mahsulotga havola;
  hozir atigi 3 ta. Raqobatchilar yuzlab maqola bilan turibdi.
- Har bir mahsulotga noyob tavsif (ishlab chiqaruvchi matnini ko'chirish emas),
  tarkib jadvali, savol-javob.
- **Haqiqiy sharhlar** — buyurtmadan keyin Telegram orqali so'rash. Sharh
  yulduzchalari qidiruvda CTR ni sezilarli oshiradi.
- Haqiqiy ekspert (shifokor, rozilik bilan) — `/experts` qaytadi va
  `reviewedBy` paydo bo'ladi (YMYL uchun eng kuchli ishonch signali).

## 4. Havolalar va brend (doimiy)

- Brend saytlari (Swiss Energy, Dr. Frei) "qayerdan sotib olish" sahifasida
  rasmiy distribyutor sifatida havola.
- O'zbek media (kun.uz, gazeta.uz, daryo.uz) — PR maqolalar, ekspert izohlari.
- Hamkor dorixonalar (`/where-to-buy`) — o'z saytlarida havola.
- Spam/havola sotib olish yo'q — Google va Yandex jazolaydi.

## 5. O'lchash

Har oy: GSC/Yandex.Webmaster'da top so'rovlar, o'rin, CTR; indeksdagi sahifalar
soni = sitemap'dagi soni bo'lishi kerak. Core Web Vitals — GSC hisobotidan
(maydon ma'lumoti), Lighthouse emas.
