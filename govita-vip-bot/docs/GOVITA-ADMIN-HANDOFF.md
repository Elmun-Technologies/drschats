> Yangilanish: GoVita bot-admin/service API qo‘shildi. Joriy holat va sozlash: ../../docs/BOT-ADMIN.md. Quyidagi dastlabki reja to‘liq bajarilgan emas.

# Claude uchun: GoVita admin ↔ Telegram bot integratsiyasi

## Qaror — 2026-10-08

ShopFlow ishlatilmaydi. GoVita admin/backend mahsulotlar, mijozlar,
buyurtmalar va klub ma’lumotlarining asosiy manbasi bo‘ladi.
Bot alohida `govita-vip-bot/` loyihasida qoladi. Bot tarafidan sayt/admin
fayllari o‘zgartirilmaydi. ZIP’dagi ShopFlow/Prisma hujjatlari tarixiy
mahsulot talablari; amaldagi API sifatida ishlatilmasin.

**Bu hujjat endpointlar tayyor degani emas.** Quyidagilar backend va bot
mualliflari kelishadigan talablar. Aniq URL, JSON shakllari va autentifikatsiya
Claude tomonidan OpenAPI yoki misol request/response bilan berilishi kerak.

## Arxitektura va mas’uliyat

- Admin frontend emas, **adminning server API’si** bot bilan gaplashadi.
- `BOT_TOKEN` faqat bot xizmatida. `GOVITA_API_URL` — backend API bazasi;
  `GOVITA_API_KEY` — cheklangan bot-service kaliti, admin browser tokeni emas.
- Botga odamning admin paroli kerak emas. Kalitlar JS bundle yoki chatga yozilmaydi.
- Bitta Telegram tokenni faqat bitta engine boshqaradi. Polling va webhook
  bir vaqtda ayni token uchun ishlatilmaydi. Ko‘chirish tartibi alohida kelishiladi.
- Backend subscription order yaratishni va login verification/sessionni
  boshqarishi tavsiya qilinadi. Bot Telegram UI va xabar yetkazish transporti.
- Eslatma/kurs/obuna workerining bittadan egasi bo‘lsin: backend yoki bot.
  Backend workeriga ko‘chirilganda botning lokal workerlari prod’da o‘chiriladi.
- Hozirgi SQLite demo ma’lumotlari prod backendga avtomatik ko‘chirilmaydi.

## Backenddan kerak bo‘ladigan imkoniyatlar

| Imkoniyat | Talab |
|---|---|
| Capabilities/settings | API versiyasi, yoqilgan imkoniyatlar, klub nomi uz/ru, IANA timezone, sokin soatlar, operator, do‘kon/Mini App URL, chegirma va oraliq qoidalari |
| Telegram kontaktini bog‘lash | telegramUserId, name, phone, lang; bot avval `contact.user_id == from.id` tekshiradi. Backend konfliktni rad etadi, dublikat mijoz/orderlarni atomik birlashtiradi. Birinchi source saqlanadi; referral faqat yangi mijozga |
| Profil | Bot identity bo‘yicha profil, notification preferences va klub statistikasi; kalitni boshqa tenant/mijozga ishlatib bo‘lmasin |
| Katalog | String product/variant ID, nom uz/ru, narx butun UZS, stock, rasm, servingsPerPack, servingsPerDay, intakeNote uz/ru. Doza faqat tasdiqlangan yo‘riqnomadan |
| Buyurtmalar | Bot identity bo‘yicha cursor ro‘yxat va detail: code, sana, items/qty/narx, jami, delivery/payment, stage, timeline. Begona kod bir xil 404 |
| Takrorlash | Egaga tekshirilgan orderdan haqiqiy checkout/cart URL yoki cart token. Taxminiy `/cart?repeat=` yo‘lga tayanmaslik |
| Obunalar | Yaratish (mahsulot/variant/qty, tasdiqlangan manzil/to‘lov, oraliq), list/detail, skip/move/interval/pause/resume/cancel+sabab. Joriy narx, kelishilgan nextPct va chegirmalarning max qoidasi serverda |
| Obuna order run | Idempotency key va unique subscription+scheduledFor; bir run → bitta order. Timeoutdan keyin run/order holatini tekshirish endpointi. Order ID’siz sana siljimaydi. Ikki ketma-ket failed/cancelled delivery → pause |
| Eslatmalar/kurslar | CRUD, product yoki custom label, times/daysOfWeek/endDate; ack/snooze/off. Kurs supersede/zaxira hisoblash, subscription exclusion. Egalik barcha mutatsiyada tekshiriladi |
| Support | Botdan lead yaratish; operator admin paneldan javob beradi, botga yetkazish job’i yaratiladi. Reply mijoz Telegram ID’siga vakolatli yuboriladi |
| Login | Sayt serveri request/verify/logout; raqam mavjudligi javobdan bilinmaydi. 6 xona, 5 daqiqa, 5 urinish, telefon/IP rate limits. Kod/token hash, bir martalik verify, 30 kun sessiya. Bot kontakt bog‘lagach pending login yetkaziladi |
| Takliflar | Admin kampaniya va Telegram audience; opt-out, haftasiga 2 limit, sokin soatlar, blocked guard. Har reklamada o‘chirish tugmasi |
| Bot xabar navbati | Lease/claim bilan job olish, idempotent ack/nack, attempts/retryAfter; chat ID, shablon/uz-ru matn, tugmalar, event ID. Kod/token loglanmaydi. 429 retry, 403 blocked, `/start` unblock |

## Event/navbat talablari

Webhook o‘rniga botdan authenticated polling navbati tanlansa, qo‘shimcha
public bot porti va webhook secret talab qilinmaydi. Endpointlar hali kelishilmagan.

- Stable `eventId`, `type`, `customer/telegram identity`, `occurredAt`, payload.
- Turlar: order.stage_changed, reminder.due, course.ending,
  subscription.notice/order_created/paused, login.code, support.reply, promotion.
- Claim lease tugasa job qayta olinadi; ack eventId bo‘yicha idempotent.
- Har stage change mijoz ko‘radigan bosqich bilan dedupe qilinadi.
- Telegram va DB orasida atomik transaction yo‘q: yuborildi, lekin ack’dan
  oldin crash bo‘lsa kamdan-kam dublikat ehtimoli bor. «Exactly once» deb
  va’da qilmaslik; retry/reconciliation siyosati test bilan kelishiladi.
- Login job payloadidagi kod qisqa TTL va xizmatga cheklangan ruxsat bilan
  saqlanadi, muvaffaqiyat/expiry’dan so‘ng tozalanadi; loglarda yo‘q.

## Claude’dan yuboriladigan ma’lumotlar (sirlar emas)

1. OpenAPI fayli yoki endpoint/method + request/response namunalar.
2. API base URL va bot-service key yaratish/rotation tartibi (kalitning o‘zi emas).
3. Product/customer/order ID va status enumlari, pagination/error shakli.
4. Worker egasi va event delivery usuli, idempotency/reconciliation kontrakti.
5. Mini App/checkout haqiqiy URL’lari va support javob oqimi.
6. Lokal/staging test fixturelar; begona customer, konflikt va stock xatolari.

## Birgalikdagi qabul testi

- Kontakt → backend mijoz → sayt buyurtmasi shu mijoz botida ko‘rinadi.
- Begona order/sub/rem callback va deep link hech narsa oshkor qilmaydi.
- Status o‘zgardi → bitta bosqich xabari; retry/restartda yo‘qolmaydi.
- Obuna run parallel/retry’da ikki order yaratmaydi; narx va stock serverdan.
- Eslatma ack/snooze/off va kurs tugashi uz/ru timezone bo‘yicha ishlaydi.
- Saytdan login request → Telegram → verify → session → logout to‘liq ishlaydi.
- Admin operator javobi aynan kerakli chatga yuboriladi; promo opt-out hurmat qilinadi.
- Telegram 429/403, backend timeout va token rotation tekshiriladi.

## Hozirgi bot holati

ShopFlow runtime/import/env majburiyati olib tashlandi. `bot/backend.py`da
endpointlardan mustaqil HTTPS transport bor, ammo GoVita API adapteri hali
yo‘q. Prod rejimi ataylab to‘xtaydi: demo DB’ni haqiqiy xizmat sifatida
ishlatishning oldi olinadi. `--demo` lokal oqimlarni sinash uchun qolgan.
Bu bosqichda «100% tayyor» yoki «faqat kalitlar yetadi» deyilmaydi.
