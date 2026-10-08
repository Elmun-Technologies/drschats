# ShopFlow — Claude Code uchun bosqichma-bosqich vazifalar

Repo: `Elmun-Technologies/shopflow`. Bu paket `docs/club/` ga qoʻyiladi (`SPEC.md`, `DATA-MODEL.md`, `API.md`, `MESSAGES.md`, `botflow/`, `mockups/`).

## Umumiy qoidalar (har bosqichda)
- Avval `CLAUDE.md`, `BOT_BUILDER.md`, `MIGRATIONS.md`, `PUBLIC_API.md` ni oʻqing. CLAUDE.md qoidalari ustun (branch, draft PR, i18n uz+ru, admin light theme, storefront'ga tegmaslik).
- **Generic:** GoVita nomi, matni yoki raqami kodga yozilmaydi. Hammasi `ClubSettings` / BotFlow / i18n default orqali.
- **Default oʻchiq:** yangi imkoniyat `ClubSettings.enabled=false` boʻlgan tenantlarda hech narsani oʻzgartirmaydi.
- Har bosqich: bitta migratsiya (`npx prisma migrate dev --name club_<qism>`), vitest testlar, `npm run typecheck` + `npm test` (backend va frontend), CLAUDE.md «Bajarilgan ishlar»ga qator, Conventional Commit, **draft PR**. Bir bosqich — bir PR.
- Sirlar kodga yozilmaydi. Yangi env: `CLUB_CODE_PEPPER` (`.env.example` ga, qiymatsiz).

---

## Bosqich 0 — Tekshiruv (kod yozilmaydi)
**Prompt:**
> `docs/club/SPEC.md` ni oʻqi. «Yetishmaydi» roʻyxatidagi 6 bandni kodda tekshir (fayl va qator bilan). Spec bilan farq boʻlsa yoki allaqachon qilingan narsa boʻlsa — roʻyxat qilib ber. `DATA-MODEL.md` ni hozirgi `schema.prisma` bilan solishtir: nom toʻqnashuvi, yetishmayotgan relation. Faqat hisobot, kod oʻzgarmasin.

**Natija:** tasdiqlangan farqlar roʻyxati. Spec shunga qarab yangilanadi.

## Bosqich 1 — Kontakt xavfsizligi va mijozni birlashtirish
**Prompt:**
> SPEC §2.1 va §7 boʻyicha: Telegram kontakt qabul qilinadigan barcha joylarda (`bot-engine.ts` `saveContactPhone` va form `contact` maydoni, `webhooks.ts` legacy yoʻli) `message.contact.user_id === message.from.id` tekshiruvini qoʻsh; mos kelmasa — hech narsa saqlama, `club.contactNotOwn` xabarini yubor. Webhook update parserida `contact.user_id` ni ham uzat. Mijozni topish/yaratishni `storefront-customer.ts` dagi `findRelatedCustomers` + `pickCanonicalCustomer` + `mergeRelatedCustomerOrders` orqali qil (telefonni `canonicalPhone` bilan saqla). Telefon boshqa `telegramUserId` ga bogʻlangan boʻlsa — qayta bogʻlama, `club-conflict` tegli Lead yarat va `club.conflict` xabarini yubor.

**Qabul mezonlari:** begona kontakt rad etiladi (test); bir xil telefonli ikki yozuv birlashadi, buyurtmalar asosiyga oʻtadi (test); konflikt lid yaratadi (test); `ClubSettings` yoʻq tenantda xatti-harakat oʻzgarmaydi, faqat xavfsizlik tekshiruvi qoʻshiladi.

## Bosqich 2 — ClubSettings + admin «Klub» sozlamalari
**Prompt:**
> `DATA-MODEL.md` dagi `ClubSettings` va `Customer` qoʻshimcha maydonlarini migratsiya bilan qoʻsh. `routes/club.ts` (admin, JWT) — `GET/PUT /api/club/settings` (zod validatsiya: foizlar 0–50, oraliqlar 7–180, HH:MM format, IANA timezone). Admin panel: Sozlamalar → yangi «Klub» tab — har bir imkoniyat uchun switch va maydonlar, i18n `club.*` kalitlari uz+ru, light theme.

**Qabul mezonlari:** sozlama saqlanadi va qayta yuklanadi; boshqa tenant sozlamasini oʻqib/yozib boʻlmaydi (tenant-isolation test).

## Bosqich 3 — Deep link, bosqichlar, «Buyurtmalarim»
**Prompt:**
> 1) `/start <payload>` ni parse qil (`login`, `club`, `o_<code>`, `r_<ref>`, `s_<source>`, `sub_<id>`; regex `^[A-Za-z0-9_-]{1,64}$`). Mavjud /start oqimi (session reset, buyruqlar, welcome) saqlansin; payload — undan keyin qoʻshimcha harakat. `o_` va `sub_` — egalik tekshiruvi bilan. `r_` — faqat yangi mijozga `referredByCustomerId`. `s_` — `clubSource` (birinchi qiymat).
> 2) `lib/club/stage.ts` — `customerOrderStage(order, delivery)` SPEC §5 jadvali boʻyicha + unit testlar. `notifyOrderStatusChange` va delivery status oʻzgarishi shu funksiya orqali faqat **bosqich** oʻzgarganda xabar yuborsin (`NotificationType.ORDER_STAGE`, dedupe). Matnlar `MESSAGES.md` `stage.*`.
> 3) `bot-flow-schema.ts` ga 7 ta yangi action (`my_orders`, `subscriptions`, `reminders`, `club`, `share_contact`, `referral`, `profile`) — `docs/club/botflow/bot-flow-schema.patch` boʻyicha. BOT_BUILDER.md tartibi: sxema → `bot-engine.ts runAction` → admin `ACTION_TYPES` → i18n `botflow.action.*`. Bu bosqichda `my_orders`, `club`, `share_contact`, `referral`, `profile` toʻliq ishlaydi; `subscriptions` va `reminders` — `ClubSettings` da oʻchiq boʻlsa «Tez orada» matni.
> 4) `docs/club/botflow/govita-botflow.json` sxemadan oʻtishini test qil (`bot-flow.test.ts` ga fixture).

**Qabul mezonlari:** `o_<boshqa mijoz kodi>` buyurtmani oshkor qilmaydi (test); `PICKED_UP→IN_TRANSIT` ikkinchi xabar yubormaydi (test); ikkala BotFlow JSON valid.

## Bosqich 4 — Saytga kirish kodi va mijoz API
**Prompt:**
> `ClubLoginCode`, `CustomerSession` modellarini qoʻsh. `API.md` dagi `/api/v1/club/auth/*`, `/me`, `/me/orders`, `/me/orders/:code`, `/me/orders/:code/repeat` endpointlarini `public-api.ts` uslubida yoz (sf_ kalit + `X-Customer-Token`). Kod: `crypto.randomInt`, hash `sha256(code|tenantId|phone|CLUB_CODE_PEPPER)`, 5 daq, 5 urinish, rate limit (telefon 3/10daq, 10/kun; IP 20/soat). `/auth/request` javobi har doim bir xil. Botda `/start login` + kontakt → shu telefon uchun 10 daqiqa ichidagi `codeHash=null` soʻrov boʻlsa, kod yaratib yubor. `POST /orders` ga `customerToken?`, javobga `orderCode`, `botUrl`. `PUBLIC_API.md` ga «7. Klub» boʻlimi.

**Qabul mezonlari:** notoʻgʻri kod 5 martadan keyin bloklanadi; muddati oʻtgan kod `410`; token bekor qilingach `401`; bazada ochiq kod/token yoʻq (test); raqam bor/yoʻqligi javobdan bilinmaydi (test).

## Bosqich 5 — Doza, kurs tugashi, eslatmalar
**Prompt:**
> `Product` ga `servingsPerPack`, `servingsPerDay`, `intakeNote`; admin mahsulot formasida «Qabul maʼlumoti» bloki (izoh: «faqat qadoqdagi yoʻriqnomadan»). `CourseTracker` + `course-end-worker` (soatlik, claim pattern, sokin soatlar, `notifyCourseEnd`), tracker yaratish — bosqich «Yetkazildi»ga oʻtganda (`DATA-MODEL.md` §3). `IntakeReminder` + `reminder-worker` (har daqiqa, tenant timezone, `lastSlot` bilan bir slotga bir xabar). Bot callback'lari `rem:*`, `ce:*` (`MESSAGES.md` formati, egalik tekshiruvi). Yetkazilgandan keyin `rem.offer` taklifi. API: `/me/reminders`, `/me/courses`. Telegram 429 — `retry_after`; 403 — `telegramBlockedAt`. Workerlarni `server.ts` da mavjud workerlar kabi ishga tushir.

**Qabul mezonlari:** 60 kapsula / kuniga 1 → 60 kun (test); obunadagi mahsulotga kurs xabari yoʻq (test); bir slotga ikki eslatma yoʻq (parallel worker testi); doza maydoni boʻsh mahsulotga xabar yoʻq.

## Bosqich 6 — Obuna
**Prompt:**
> `Subscription`, `SubscriptionRun`, `Order.subscriptionId`. `subscription-worker` (15 daq): `scheduledFor − noticeDays` → `sub.notice`; `scheduledFor <= now` → mavjud buyurtma yaratish servisi orqali `Order` (narx = joriy narx × (1 − nextPct/100), boshqa chegirma bilan qoʻshilmaydi — eng kattasi), keyingi run. 2 ta ketma-ket FAILED (yetkazish FAILED/CANCELLED) → PAUSED + `sub.autoPaused`. Bot: «Obunalarim», `sub:*` callback'lar (oʻtkazish, surish 7/14 kun, oraliq, pauza, davom, bekor + sabab). API: `/me/subscriptions*`; `POST /orders` ga `subscription: { intervalDays }`. Admin: mijoz kartasida «Obunalar» tab, umumiy roʻyxat sahifasi (filtr: status, keyingi sana).

**Qabul mezonlari:** bitta run ikki buyurtma yaratmaydi (`@@unique` + claim testi); oʻtkazilgan run keyingisini toʻgʻri hisoblaydi; foiz sozlamasi oʻzgarsa mavjud obunaning `nextPct` i oʻzgarmaydi.

## Bosqich 7 — Klub takliflari intizomi
**Prompt:**
> PROMOTION/MANUAL va BotSequence yuborishlariga umumiy guard: `notifyPromotions`, `promoMaxPerWeek`, sokin soatlar, `telegramBlockedAt`. Har reklama xabariga `promo:off` tugmasi. Admin «Klub» sahifasida statistika: aʼzolar, Telegram bogʻlangan %, faol obunalar, kurs xabaridan 7 kun ichida buyurtma %, blok %, eslatma «Ichdim» %. (SPEC §1 metrikalari, SQL bilan.)

## Bosqich 8 — GoVita'ni ishga tushirish (konfiguratsiya + bir martalik skript)
**Prompt:**
> `scripts/club-backfill.ts <tenantSlug> [--apply]`: `telegramUserId` bor mijozlarga `clubJoinedAt`, telefon boʻyicha dublikatlarni birlashtirish. Default dry-run — hisobot (nechta, qaysilar). `--apply` faqat qoʻlda. Kod yozilmaydigan qism `README.md` «Ishga tushirish» roʻyxatida.

---

## Hamma bosqich tugagach — tekshiruv roʻyxati
- [ ] `ClubSettings` oʻchiq tenant: hech qanday yangi xabar ketmaydi (e2e).
- [ ] Barcha callback'lar ≤ 64 bayt va egalik tekshiruvidan oʻtadi.
- [ ] Loglarda telefon maskalangan, kod/token yoʻq.
- [ ] `mockups/*.png` bilan bot xabarlari matni mos.
