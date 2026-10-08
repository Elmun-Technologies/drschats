# VIP Salomatlik Klubi — Telegram-bot spetsifikatsiyasi

Versiya 1.0 · 2026-10 · Mijoz: GoVita (govita.uz) · Platforma: ShopFlow

## 0. Qisqacha

- **Bitta bot.** GoVita'ning mavjud doʻkon boti (ShopFlow tenant boti) VIP klub botiga kengaytiriladi. Ikkinchi bot ochilmaydi: auditoriya boʻlinadi, bot faqat oʻziga `/start` bosganlarga yoza oladi.
- **ShopFlow'da generic.** Hamma yangi imkoniyat (login kodi, obuna, eslatma, kurs tugashi, klub) ShopFlow'da **tenant sozlamasi** sifatida quriladi. GoVita — birinchi foydalanuvchi, keyin har qanday tenant yoqib oladi.
- **Konfiguratsiya, kod emas.** GoVita'ning menyusi, matnlari va formalari — BotFlow JSON (`botflow/`). Yangi tugma turlari `bot-flow-schema.ts` ga qoʻshiladi (ShopFlow CLAUDE.md, 9-qoida).

### ShopFlow'da allaqachon bor (qayta ishlatiladi)
| Bor | Qayerda |
|---|---|
| BotFlow konstruktori: ekran, tugma, forma, buyruq, fallback | `lib/bot-flow-schema.ts`, `lib/bot-engine.ts`, `BOT_BUILDER.md` |
| Mini App doʻkon, checkout, profil, manzillar, sevimlilar, referral | `routes/storefront.ts`, `/store/:slug` |
| Telegram `initData` tekshiruvi | `lib/telegram-auth.ts` |
| Telefon/Telegram ID boʻyicha mijozlarni birlashtirish | `lib/storefront-customer.ts` (`findRelatedCustomers`, `mergeRelatedCustomerOrders`) |
| Buyurtma statusi oʻzgarganda mijozga xabar | `lib/telegram-notify.ts` `notifyOrderStatusChange` |
| Bildirishnoma log va opt-out (`notifyOrderUpdates`, `notifyPromotions`) | `NotificationLog`, `Customer` |
| Avtomatik xabar zanjirlari (NEW_CUSTOMER, FIRST_PURCHASE, INACTIVE_DAYS, BIRTHDAY, WEEKLY) | `BotSequence*`, `lib/bot-sequence-worker.ts` |
| Segmentlar, promo kodlar, sale kampaniyalar | `CustomerSegment`, `PromoCode`, `sale-campaigns` |
| Public API v1 (`sf_` kalit, server-to-server) | `routes/public-api.ts`, `PUBLIC_API.md` |

### Yetishmaydi (shu spec quradi)
1. Bot kontakt qabul qilganda **`contact.user_id` tekshirilmaydi** — boshqa odamning kontaktini yuborib, uning raqamini oʻziga bogʻlash mumkin. Telefon boʻyicha birlashtirish ham botda yoʻq (faqat storefront'da).
2. `/start` **payload (deep link)** eʼtiborsiz qoldiriladi.
3. Sayt (govita.uz) uchun **Telegram orqali kirish kodi** va mijoz darajasidagi API yoʻq (Public API faqat katalog va buyurtma yaratish).
4. **Obuna** (Subscribe & Save), **qabul eslatmalari**, **kurs tugashi** — modellar va workerlar yoʻq.
5. Mahsulotda **doza maʼlumoti** yoʻq (qadoqda nechta, kuniga nechta) — kurs muddatini hisoblab boʻlmaydi.
6. Botda mijozning **oʻz buyurtmalari roʻyxati** yoʻq (`track_order` faqat kod soʻraydi).

---

## 1. Maqsad va metrikalar

| Maqsad | Metrika | Boshlangʻich nishon (90 kun) |
|---|---|---|
| Takroriy xarid | Kurs tugashi xabaridan 7 kun ichida buyurtma | ≥ 12% |
| Obuna | Faol obunalar / takroriy xaridorlar | ≥ 15% |
| Obuna ushlab qolish | 3-yetkazishgacha yetgan obunalar | ≥ 60% |
| Klub qamrovi | Telegram'i bogʻlangan mijozlar / barcha mijozlar | ≥ 50% |
| Support yuki | «Buyurtmam qayerda?» murojaatlari | −40% |
| Eslatmalar | Eslatmaga «✅ Ichdim» bosilganlar | ≥ 35% |
| Bot sogʻligʻi | Botni bloklaganlar / oyiga faol | ≤ 3% |

Nishonlar — taxmin, birinchi 30 kunlik maʼlumotdan keyin qayta belgilanadi. Hammasi `NotificationLog` va yangi jadvallardan SQL bilan olinadi — alohida analitika kerak emas.

---

## 2. Foydalanuvchi oqimlari

### 2.1 Klubga qoʻshilish (`/start`)
1. Mijoz `t.me/<bot>` yoki saytdagi «Telegram'da botni ochish»ni bosadi.
2. Salomlashuv + «📱 Raqamni ulashish» (`request_contact`) + bosh menyu.
3. Kontakt kelganda:
   - `contact.user_id !== from.id` → rad: «Faqat oʻz raqamingizni ulashishingiz mumkin». Hech narsa saqlanmaydi.
   - Mos kelsa → `findRelatedCustomers(telegramUserId, phone)` → asosiy yozuv tanlanadi → buyurtmalar birlashtiriladi → `clubJoinedAt` qoʻyiladi.
   - Telefon boshqa Telegram ID'ga allaqachon bogʻlangan → **avtomatik qayta bogʻlanmaydi**; operatorga «ID konflikti» lidi, mijozga «Operator tekshiradi».
4. Javob: «Siz VIP klubdasiz» + oxirgi faol buyurtma (boʻlsa) + bosh menyu.

### 2.2 Deep link payloadlari (`/start <payload>`)
Telegram cheklovi: ≤ 64 belgi, `A-Za-z0-9_-`.

| Payload | Qayerdan | Natija |
|---|---|---|
| `login` | Saytdagi kirish sahifasi | Kontakt soʻraydi; kutilayotgan kirish soʻrovi boʻlsa — kodni darhol yuboradi |
| `club` | Sayt footer, LoyaltyV3, qadoq QR | Klub haqida ekrani + kontakt |
| `o_<orderCode>` | «Buyurtma qabul qilindi» sahifasi | Buyurtma kartasi — **faqat** buyurtma shu mijozniki boʻlsa (telefon yoki Telegram ID mos). Aks holda kontakt soʻraydi |
| `r_<refCode>` | «Doʻstni taklif qilish» | Yangi mijozga `referredByCustomerId`. Mavjud mijozga taʼsir qilmaydi |
| `s_<source>` | Reklama, QR, SMS | `clubSource` ga yoziladi (birinchi qiymat saqlanadi) |
| `sub_<id>` | Obuna xabaridagi havola | Obuna kartasi (egasi tekshiriladi) |

### 2.3 Saytga kirish kodi
Dizayn: `LoginV3` — «+998 … raqamiga bogʻlangan Telegram'ga kod yuborildi».
1. Sayt serveri → `POST /api/v1/club/auth/request {phone}`.
2. ShopFlow: telefon bogʻlangan mijoz + `telegramUserId` + bot bloklanmagan → 6 xonali kod botga yuboriladi.
3. **Javob har doim bir xil** (`{ ok: true, resendIn: 60, botUrl }`) — raqam bazada bormi-yoʻqligi oshkor boʻlmaydi.
4. Kod kelmasa → sayt «Telegram'da botni ochish» (`?start=login`) koʻrsatadi. Mijoz botda raqamini ulashadi → bot shu raqam uchun 10 daqiqa ichidagi kutilayotgan soʻrovni topib, kodni darhol yuboradi.
5. Sayt → `POST /api/v1/club/auth/verify {phone, code}` → `{ customerToken, expiresAt, customer }`.
6. Botdagi xabar: kod + «Siz soʻramagan boʻlsangiz, eʼtibor bermang. Kodni hech kimga aytmang». Kod tugmasiz — nusxa olish uchun `<code>`.

### 2.4 Buyurtma holati
- Push: status bosqichi oʻzgarganda bitta xabar (mavjud `notifyOrderStatusChange` qayta yoziladi — §5).
- Pull: «📦 Buyurtmalarim» → oxirgi 5 ta buyurtma (kod, sana, summa, bosqich) → har biriga «Batafsil» → tarkib, manzil, bosqichlar, «🔁 Takrorlash» (Mini App savatiga), «💬 Operator».

### 2.5 Qabul eslatmalari
- Yaratish: (a) yetkazilgan buyurtmadan keyin bot taklif qiladi: «Qabul vaqtini eslatib turaylikmi?» → vaqt tanlash (08:00 / 09:00 / 13:00 / 20:00 / boshqa); (b) «⏰ Eslatmalar» → «+ Qoʻshish» → mahsulot (oxirgi xaridlardan) → vaqt; (c) saytdagi Profil → Eslatmalar (API orqali).
- Xabar: «⏰ Prenatal Forte qabul vaqti · 1 kapsula, ovqat bilan» + [✅ Ichdim] [⏱ 1 soatdan keyin] [⏸ Eslatmani oʻchirish].
- Doza matni mahsulot `intakeNote` maydonidan; boʻlmasa faqat mahsulot nomi. **Bot doza tavsiya qilmaydi.**
- Kurs tugaganda eslatma avtomatik toʻxtaydi (yoki mijoz tanlasa — davom etadi).

### 2.6 Kurs tugashi
- Hisob: `kunlar = floor(servingsPerPack × qty / servingsPerDay)`; boshlanish — yetkazilgan sana (`DeliveryOrder.deliveredAt`, boʻlmasa `Order.updatedAt` COMPLETED paytida).
- Xabar `endsAt − courseEndLeadDays` (default 5) da, 10:00–20:00 oraligʻida: «Prenatal Forte taxminan 5 kunda tugaydi» + [🔁 Takrorlash] [🔁 Obuna qilish −15%] [Kerak emas].
- Obunadagi mahsulotga kurs tugashi xabari yuborilmaydi (obuna oʻzi yetkazadi).
- Doza maʼlumoti boʻlmagan mahsulotga xabar yuborilmaydi.

### 2.7 Obuna (Subscribe & Save)
Qoidalar (govita.uz LoyaltyV3 bilan bir xil): bugun −10%, keyingi har yetkazishda −15%; oraliq 30 / 45 / 60 / 90 kun; chegirmalar qoʻshilmaydi — eng kattasi qoʻllanadi.
- Yaratish: saytda yoki Mini App'da checkout'da «Obuna bilan — arzonroq». Botda — kurs tugashi xabaridan.
- Har yetkazishdan **3 kun oldin** xabar: «Keyingi yetkazish 12-oktabr · Prenatal Forte × 1 · 322 150 soʻm (−15%)» + [⏭ Bu safar oʻtkazish] [📅 Sanani surish] [✏️ Oʻzgartirish].
- Belgilangan kuni buyurtma avtomatik yaratiladi (`Order.subscriptionId` bilan), oddiy buyurtma pipeline'idan oʻtadi (MoySklad/Sales Doctor push, kuryer).
- Toʻlov MVP'da: yetkazishda naqd/karta yoki toʻlov havolasi (Payme/Click). Kartadan avtomatik yechish — 2-bosqich (kartani tokenlash kerak, §9).
- «🔁 Obunalarim» → roʻyxat → har biri: oʻtkazish, oraliqni oʻzgartirish, toʻxtatish (sana bilan), davom ettirish, bekor qilish (sabab soʻraladi: qimmat / natija yoʻq / zaxira bor / boshqa).

### 2.8 Klub takliflari
- Manba: mavjud `BotSequence` (BIRTHDAY, INACTIVE_DAYS, WEEKLY) + segmentlarga qoʻlda yuborish (`MANUAL`/`PROMOTION`).
- Faqat `notifyPromotions = true` mijozlarga, 10:00–20:00, haftasiga ko‘pi bilan 2 ta reklama xabari (tenant sozlamasi).
- Har reklama xabari oxirida: «Bunday xabarlarni oʻchirish» tugmasi → `notifyPromotions = false`.
- Faqat real aksiyalar: −10% birinchi buyurtma, obuna, 2+1, 300 000 soʻmdan bepul yetkazish. Taymer, «N kishi sotib oldi» — yoʻq.

### 2.9 Operator
- Mavjud `operator` action + `Conversation` (Chat sahifasi). Fallback = `operator`.
- Ish vaqtidan tashqari avtomatik javob: «Ish vaqti Du–Sha 09:00–18:00. Xabaringiz saqlandi».
- Tibbiy savol → `consult` formasi (teg `maslahat`), javob — «bu tibbiy maslahat emas» ogohlantirishi bilan.

### 2.10 Profil va sozlamalar (`/sozlamalar`)
Til · buyurtma xabarlari · eslatmalar · kurs tugashi · klub takliflari (har biri alohida yoqish/oʻchirish) · «Maʼlumotlarimni oʻchirish» (operatorga soʻrov).

---

## 3. Arxitektura

```
govita.uz (Next.js)
  ├─ server-side ─► ShopFlow Public API v1  (Bearer sf_… + X-Customer-Token)
  └─ brauzer: sf_ kalit HECH QACHON brauzerga chiqmaydi
ShopFlow backend (Fastify)
  ├─ routes/webhooks.ts      Telegram update → bot-engine
  ├─ lib/bot-engine.ts       + deep link, + yangi actionlar, + callback'lar (rem:, sub:, ce:)
  ├─ lib/club/*              auth, subscriptions, reminders, course, stage (yangi)
  ├─ routes/public-api.ts    + /club/* endpointlar
  ├─ routes/club.ts          admin: sozlamalar, obunalar, eslatmalar statistikasi
  └─ workers                 reminder (1 daq), course-end (1 soat), subscription (15 daq)
Admin panel (React)          Sozlamalar → «Klub»; Mijoz kartasi → Obunalar/Eslatmalar; Mahsulot → Doza
```

### Tenant sozlamasi — `ClubSettings` (bitta tenant uchun bitta yozuv)
Hammasi oʻchirilgan holda yaratiladi; boshqa tenantlarga taʼsir qilmaydi.
`enabled`, `clubName` (uz/ru), `loginCodesEnabled`, `subscriptionsEnabled`, `subscriptionFirstPct` (10), `subscriptionNextPct` (15), `subscriptionIntervals` ([30,45,60,90]), `subscriptionNoticeDays` (3), `remindersEnabled`, `courseEndEnabled`, `courseEndLeadDays` (5), `promoMaxPerWeek` (2), `quietFrom` ("20:00"), `quietTo` ("10:00"), `timezone` ("Asia/Tashkent"), `supportHours` (uz/ru matn).

### Workerlar
Mavjud pattern: `startXWorker(prisma, log)` + `setInterval`, `server.ts` da ishga tushadi. Har bir yozuv **atomar «claim»** bilan olinadi (`updateMany where status=… and lockedAt is null`) — bir nechta instans boʻlsa ham ikki marta yuborilmaydi.
- **reminder-worker** (har 1 daqiqa): tenant vaqt zonasidagi `HH:MM` ga mos, bugun yuborilmagan, `snoozeUntil <= now` eslatmalar.
- **course-end-worker** (har soat): `alertAt <= now`, `status = ACTIVE`, sokin soatlardan tashqari.
- **subscription-worker** (har 15 daqiqa): (a) `scheduledFor − noticeDays` → ogohlantirish; (b) `scheduledFor <= now` → buyurtma yaratish → keyingi `SubscriptionRun`.
- Yuborish tezligi: ≤ 25 xabar/s global, 1 xabar/s bitta chatga. Telegram 429 → `retry_after` kutiladi. 403 → `Customer.telegramBlockedAt` qoʻyiladi, keyingi yuborishlar toʻxtaydi; mijoz `/start` bossa tozalanadi.

---

## 4. Maʼlumotlar modeli
Toʻliq Prisma snippetlari — `DATA-MODEL.md`. Qisqacha:
- `Order` + `subscriptionId`.
- `Customer` + `clubJoinedAt`, `clubSource`, `telegramBlockedAt`, `notifyReminders`, `notifyCourseEnd`.
- `Product` + `servingsPerPack`, `servingsPerDay`, `intakeNote` (Json uz/ru).
- Yangi: `ClubSettings`, `Subscription`, `SubscriptionRun`, `IntakeReminder`, `CourseTracker`, `ClubLoginCode`, `CustomerSession`, `BotIdentityConflict` (yoki Lead teg bilan).
- `NotificationType` + `ORDER_STAGE`, `REMINDER`, `COURSE_END`, `SUBSCRIPTION`, `LOGIN_CODE`.

## 5. Buyurtma bosqichlari (mijoz koʻradigan)
Bitta funksiya `customerOrderStage(order, delivery)` — bot, sayt va Mini App bir xil koʻrsatadi.

| Bosqich | Shart |
|---|---|
| Qabul qilindi | `Order.status = PENDING` |
| Tasdiqlandi | `PROCESSING` va yetkazish yoʻq yoki `PENDING/ASSIGNED` |
| Yoʻlda | `DeliveryStatus = PICKED_UP / IN_TRANSIT` |
| Yetkazildi | `DeliveryStatus = DELIVERED` yoki `Order.status = COMPLETED` |
| Yetkazib boʻlmadi | `DeliveryStatus = FAILED` → operator tugmasi |
| Bekor qilindi | `CANCELLED` |
| Qaytarildi | `REFUNDED` yoki `DeliveryStatus = RETURNED` |

Xabar faqat **bosqich** oʻzgarganda yuboriladi (status `PICKED_UP → IN_TRANSIT` — bitta «Yoʻlda»). Dedupe: `NotificationLog(relatedObjectId=orderId, type=ORDER_STAGE, body hash)`.

## 6. API
Toʻliq — `API.md`. Hammasi `/api/v1/club/*`, `sf_` kalit + (mijoz endpointlarida) `X-Customer-Token`.

## 7. Xavfsizlik
- **Kontakt egasi:** `message.contact.user_id === message.from.id`, aks holda rad.
- **Kod:** 6 raqam, `crypto.randomInt`; bazada faqat `sha256(code + tenantId + phone + pepper)`; 5 daqiqa; 5 urinish; telefon boʻyicha 3 soʻrov / 10 daqiqa va 10 / kun; IP boʻyicha 20 / soat. Muvaffaqiyatli tekshiruvdan keyin kod yaroqsiz.
- **Javoblar bir xil** — raqam bazada borligi oshkor qilinmaydi.
- **CustomerToken:** 32 bayt tasodifiy, bazada hash; 30 kun; `revokedAt`; tenantga bogʻlangan. Sayt uni `httpOnly; Secure; SameSite=Lax` cookie'da saqlaydi.
- **Egalik tekshiruvi:** har bir `sub:`, `rem:`, `o_` callback/deep link — yozuv `customerId` shu Telegram foydalanuvchisiga tegishli ekanini tekshiradi (aks holda «Topilmadi»).
- **callback_data:** ≤ 64 bayt; ID'lar emas, qisqa kalitlar (`rem:ack:<id>` — cuid 25 belgi, sigʻadi). Ichida maxfiy maʼlumot yoʻq.
- **Telefon raqami** loglarda maskalangan (`log-sanitize.ts`).
- **Tibbiy cheklov:** xabarlarda «davolaydi», doza tavsiyasi, natija vaʼdasi yoʻq. Doza faqat qadoqdagi yoʻriqnomadan (`intakeNote`, admin kiritadi).
- **Sirlar:** bot tokeni mavjud `tenant-secrets` shifrlash bilan; yangi sir — faqat `CLUB_CODE_PEPPER` (env).

## 8. Migratsiya (mavjud bot → VIP klub)
1. Mavjud GoVita tenant botining tokeni saqlanadi — mijozlar `/start` ni qayta bosishi shart emas.
2. BotFather: nom «GoVita — VIP Salomatlik Klubi», tavsif, about, rasm. `@drschatsstorebot` hali ishlatilsa — qaysi bot qolishini hal qilish (OPEN-QUESTIONS #1).
3. `govita-botflow-now.json` — darhol (hozirgi sxema bilan valid). Feature'lar tayyor boʻlgach `govita-botflow.json`.
4. Bir martalik backfill: bot obunachilari (`telegramUserId` bor) uchun `clubJoinedAt = createdAt`; telefon boʻyicha dublikatlar birlashtiriladi (dry-run hisobot → keyin apply).
5. Eʼlon: bitta xabar barcha faol obunachilarga (`notifyPromotions = true`), tezlik ≤ 25/s.
6. Sayt: footer, LoyaltyV3, OrderSuccess, Login sahifalaridagi bot havolalari yangi payloadlar bilan.

## 9. Bosqichlar
| Bosqich | Nima | Natija |
|---|---|---|
| 0 | BotFlow JSON (hozirgi sxema) yuklash, BotFather | Bot klub koʻrinishida — 1 kun |
| 1 | Kontakt xavfsizligi + birlashtirish + deep link + `my_orders` + bosqichlar | Buyurtma holati toʻliq |
| 2 | Kirish kodi + mijoz API + sayt integratsiyasi | govita.uz kabineti ishlaydi |
| 3 | Doza maydonlari + kurs tugashi + eslatmalar | Takroriy xarid dvigateli |
| 4 | Obuna (COD/havola) + bot/sayt boshqaruvi | Subscribe & Save |
| 5 | Klub takliflari limitlari, opt-out, admin statistikasi | Marketing kanali |
| 6 (keyin) | Kartadan avtomatik yechish (Payme/Click tokenlash), AI maslahat | — |

## 10. Xavflar
| Xavf | Taʼsir | Choralar |
|---|---|---|
| Obuna buyurtmasi toʻlanmaydi (COD) | Yuqori | 3 kun oldin ogohlantirish + oʻtkazish tugmasi; 2 marta ketma-ket yetkazib boʻlmasa — avtomatik pauza |
| Doza maʼlumoti notoʻgʻri → kurs xabari erta/kech | Oʻrta | Faqat admin tasdiqlagan mahsulotlar; ±2 kun yumshoq matn («taxminan») |
| Spam hissi → bot bloklanadi | Yuqori | Haftalik limit, sokin soatlar, har xabarda oʻchirish, blok darajasi monitoringi |
| Telefon konflikti (oila bitta raqam) | Oʻrta | Avtomatik qayta bogʻlash yoʻq; operator hal qiladi |
| Tibbiy daʼvo | Yuqori | Matn shablonlari qulflangan; BAD ogohlantirishi; `consult` — «tibbiy maslahat emas» |
| Multi-tenant regressiya | Yuqori | Hammasi `ClubSettings.enabled=false` default; tenant-isolation testlari |
| Telegram limit (ommaviy yuborish) | Oʻrta | Navbat + 25/s + 429 `retry_after` |
