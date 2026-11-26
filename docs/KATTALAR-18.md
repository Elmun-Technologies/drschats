# 18+ «Juftliklar uchun» — Dolphi (2026-11-26)

govita — Dolphi prezervativlarining Oʻzbekistondagi rasmiy hamkori va distributori.
Egasi qarorlari (2026-11-25): havola faqat katalog menyusi va footerda, sahifa qidiruvda
indekslanadi, yosh tasdigʻi 30 kun eslab qolinadi.

## Qanday ishlaydi

- **Kategoriya** `adult` (`lib/catalog/adult.ts`, migratsiya `0038_adult_category.sql`).
  Mahsulot admin'da shu kategoriyaga qoʻyilsa, 18+ boʻladi — boshqa belgi kerak emas.
- **Izolyatsiya — katalog dvigatelida** (`engine.ts`, `ProductListParams.adult`):
  `getProducts` 18+ ni sukut boʻyicha chiqarmaydi (katalog, qidiruv, bosh sahifa, tavsiyalar,
  upsell, quiz, feed, bot doʻkoni). `category: "adult"` → faqat 18+. `adult: "include"` —
  mijoz oʻzi tanlagan joylar: savat narxi, sevimlilar, taqqoslash, buyurtma, sitemap.
  `getCategories` 18+ ni umumiy roʻyxatga bermaydi.
- **Yosh darvozasi** `components/adult/AgeGate.tsx`: `/couples` va har 18+ mahsulot sahifasi
  blur + `inert`, dialog «18 yoshdan kattaman» / «Yoʻq» (bosh sahifaga). Cookie `gv_age18`
  30 kun; `<html class="age-ok">` boʻyashdan oldin qoʻyiladi — sahifa statik (ISR) qoladi,
  qaytgan mijozda blur miltillamaydi. Kontent HTML'da — qidiruv tizimlari oʻqiydi.
- **Sahifa** `/couples` (`app/[locale]/couples`, `components/adult/CouplesView.tsx`, matn
  `lib/content/adult.ts`): Viva Magenta, qora qadoq kompozitsiyasi, assortiment (boʻsh boʻlsa —
  qoʻngʻiroq/Telegram), «Qop-qora qadoq» 3 qadam, FAQ. Mahsulot boʻlmaguncha `noindex`,
  menyu va sitemap'da yoʻq (`nav-sections.ts` — `COUPLES_HREF`).
- **Maxfiylik**
  - analytics: `itemOf` 18+ ni `item_id: "adult"`, `item_name: "18+"` qiladi; Meta Pixel'ga
    umuman yuborilmaydi (`forPixel`);
  - «yaqinda koʻrilgan» va personalizatsiyaga yozilmaydi (`ViewTracker`);
  - savat qatori `adult: true` belgisi bilan (`CartLine.adult`).
- **Maxfiy qadoq**: server buyurtmada 18+ boʻlsa `delivery.discreet = true` qoʻyadi
  (brauzerga ishonilmaydi); operator xabarida «🖤 MAXFIY QADOQ (18+)» qatori; savatda belgi;
  email chekida va eslatma xatlarida 18+ qator «18+» deb yoziladi, mahsulot havolasisiz.
  Holat SMS/Telegram xabarlarida mahsulot nomi hech qachon boʻlmagan (faqat raqam va jami).
- **Hujjatlar**: maxfiylik siyosati §7 «18+ mahsulotlar», yetkazish FAQ.

## Ochiq

- **Mahsulotlar**: Dolphi SKU roʻyxati (nom, tur, soni, narx), packshot rasmlari, MXIK kodlari —
  egasidan. Admin'da `adult` kategoriyasiga qoʻshiladi.
- **Hujjatlar**: distributor sertifikati va roʻyxatdan oʻtganlik guvohnomasi — `/licenses` va
  `/couples` dagi «Rasmiy distributor» blokiga.
- **Yurist**: kontratseptiv reklamasi va 18+ onlayn savdo boʻyicha matnni koʻrib chiqsin.
  Oferta hali chop etilmagan (`OFFER_PUBLISHED = false`); chop etilganda band kerak:
  «18+ mahsulotlar faqat 18 yoshga toʻlgan shaxslarga sotiladi; buyurtma berish orqali xaridor
  18 yoshdan kattaligini tasdiqlaydi. Bunday buyurtma maxfiy qadoqda yetkaziladi. Qaytarish va
  almashtirish amaldagi qonunchilikka muvofiq (shaxsiy gigiyena vositalari)».
- **Fiskal chek**: mahsulot nomi chekda qonun boʻyicha yoziladi — yashirib boʻlmaydi.
- **Foto**: juftlik lifestyle fotolari (odobli) — Adobe limiti tiklangach.
- **Telegram Mini App**: 18+ bot doʻkonida koʻrinmaydi (kategoriya roʻyxatda yoʻq) — yosh
  darvozasi u yerda yoʻq, shuning uchun shunday qolsin.
