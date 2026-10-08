# Tarixiy ShopFlow auditi — 2026-10-08

**Bu yo‘nalish bekor qilingan:** GoVita o‘z admin backendiga ulanadi.
Joriy talablar: [GOVITA-ADMIN-HANDOFF.md](GOVITA-ADMIN-HANDOFF.md).
Quyidagi audit eski qarorlar tarixi; runtime’da ShopFlow ishlatilmaydi.

## Tekshirilgan manba
Elmun-Technologies/shopflow, main: `PUBLIC_API.md`,
`backend/src/routes/public-api.ts` (GitHub orqali faqat o‘qildi).

Mavjud: GET categories/products/product/promotions, POST orders.
Yo‘q: `/club/*`, mijoz bo‘yicha buyurtmalar GET, tasdiqlangan Telegram
kontaktini mijozga bog‘lash, order idempotency, subscription discount.
ZIP API.md — taklif etilgan kontrakt, amaldagi endpointlar emas.

## Xavfsiz ish tartibi
- ShopFlow HTTPS client: timeout, redirect taqiqlangan, kalit loglanmaydi.
- Ishga tushganda haqiqiy API autentifikatsiyasi va katalog sinxronlash.
- Prod rejimida demo katalog/buyurtmalar yaratilmaydi.
- Obuna sanasi avtomatik buyurtma ID’siz surilmaydi.
- Obuna yaratish tugmasi hozir aniq «ulanmagan» javobini beradi; yolg‘on
  chegirma/yaratilmagan bugungi buyurtma va’dasi olib tashlandi.

## To‘liq yakunlash uchun ShopFlow’da kerak
1. Bot service scope bilan verified-contact link: konfliktni tekshirish,
   mijoz/order merge; telefonni browserdan tasdiqlangan deb qabul qilmaslik.
2. Bot identity orqali egaga tegishli orders/detail/delivery read.
3. Catalog servingsPerPack/servingsPerDay/intakeNote.
4. Idempotent subscription run: unique subscription+scheduledFor, server
   narx/discount hisoblash, order ID bilan atomik muvaffaqiyat.
5. Klub login request/verify/logout va hash sessiyalar, rate limits.
6. Takroriy bot polling’ni oldini olish: ShopFlow shu token webhook’ini
   boshqarmasligi kerak. Bir tokenni ikkita engine ishlatmaydi.

## Hali botda tugallanmagan
Rus tili; auth API verify/session; remote order cache sync; subscription
checkout manzil/to‘lov; notification outbox/retry; promo haftalik limit;
full callback fuzz/parallel tests; mahsulot foto kartalari; worker
reconciliation. 100% tayyor yoki faqat ikkita kalit bilan to‘liq ishlaydi
DEB QABUL QILINMASIN.

GoVita sayt fayllari va ShopFlow repo o‘zgartirilmagan.
