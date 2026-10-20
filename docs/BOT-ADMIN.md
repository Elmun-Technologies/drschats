# GoVita Telegram klub: bot, Mini App, admin

Klub boti — oddiy bot emas, Telegram ichidagi doʻkon. Ikki yoʻl bor:

1. **Mini App** — `«Doʻkon»` tugmasi (yoki xabar maydoni yonidagi menyu
   tugmasi) govita.uz ni Telegram ichida ochadi.
2. **Native doʻkon** — botning oʻzida: kategoriya → sahifalangan mahsulotlar
   → mahsulot kartasi (haqiqiy rasm, narx, eski narx, «Faqat N ta qoldi») →
   savat → qadam-baqadam buyurtma. Bu yoʻl Telegram uzilishiga chidamli:
   savat serverda, bot qayta ishga tushsa ham yoʻqolmaydi.

Ikkala yoʻlda ham buyurtma `placeOrder()` orqali oʻsha `orders` jadvaliga
tushadi, Telegram akkauntiga bogʻlanadi va holati botga keladi. Boshqaruv —
saytning oʻz admin panelida: **`/admin/bot`**.

## Arxitektura (2026-10 qaror)

```
Telegram ──polling──▶ govita-vip-bot (Python, aiogram, Fly: govita-bot)
                            │  Bearer BOT_API_KEY
                            ▼
                     govita.uz/api/bot/*  (Next.js, src/lib/bot/api.ts)
                            │
                            ▼
              Postgres: bot_* jadvallari, telegram_links, orders
                            ▲
   /admin/bot (sozlama, murojaat, aʼzolar, navbat) · checkout · /admin/orders
```

- **Bot hech narsa saqlamaydi.** Aʼzolar, telefon bogʻlanishlari, murojaatlar
  va yuboriladigan xabarlar navbati (outbox) — saytning bazasida
  (`db/migrations/0003_telegram_club.sql`). Shuning uchun bot buyurtmalarni
  ham, admin javoblarini ham bitta manbadan koʻradi.
- **Nega Python bot qoldi:** u tayyor va testli (aiogram); koʻchgani faqat u
  ulanadigan backend. Avvalgi FastAPI backend (`backend/app/bot_*`) deploy
  qilinmagan va oʻz alohida `orders` jadvalini oʻqirdi — saytdagi buyurtmalarni
  koʻrmasdi. U endi ishlatilmaydi; olib tashlash — alohida qaror.
- **Mijozga xabar yoʻli:** sayt `bot_jobs` ga yozadi (dedupe kaliti bilan —
  bir voqea bir xabar), bot `POST /outbox/claim` bilan 3 daqiqalik lease oladi,
  yuboradi va `receipt` qaytaradi. Bot oʻlsa, lease tugaydi va xabar qayta
  olinadi. 8 urinishdan keyin — «Yuborilmadi», admin'da qayta yuborish tugmasi.
- **Bloklagan mijoz:** Telegram 403 qaytarsa aʼzo `blocked_at` oladi va unga
  navbat toʻxtaydi; u /start bossa — qayta ochiladi.

## Mijoz tajribasi

| Qayerda | Nima boʻladi |
|---|---|
| `/start` | Aʼzo yoziladi (`s_<manba>` deep-link — manba sifatida). Salomlashuv `/admin/bot` dagi matndan (uz/ru) olinadi; API javob bermasa — ichki matn. Raqam bogʻlanmagan boʻlsa, kontakt soʻraladi |
| Kontakt | Faqat **oʻz** kontakti (`contact.user_id == from.id`). Raqam boshqa chatga bogʻlangan boʻlsa — bogʻlanmaydi, operatorga «Raqam ziddiyati» murojaati |
| «Doʻkon», menyu tugmasi | Sayt Mini App boʻlib ochiladi (`/uz`) |
| Mini App'da buyurtma | `initData` serverda Telegram imzosi bilan tekshiriladi (`lib/bot/webapp.ts`), chat id buyurtmaga yoziladi. Brauzerdagi hech narsaga ishonilmaydi |
| «Buyurtmalarim» | Shu chatdan (Mini App) yoki bogʻlangan raqamdan berilgan buyurtmalar (oxirgi 9 raqam boʻyicha — saytdagi buyurtmalar ham chiqadi) |
| Holat oʻzgarishi | `/admin/orders` da holat oʻzgarsa — mijozga botda xabar (uz/ru), «Batafsil» tugmasi bilan |
| «Katalog» / `/katalog` | Kategoriyalar → sahifalangan mahsulotlar (6 tadan). Har bir tugmada nom va **haqiqiy** narx |
| Mahsulot kartasi | Rasm, narx, real eski narx, «Faqat N ta qoldi», qisqa tavsif va **BAD ogohlantirishi**. Sotuvda yoʻq boʻlsa «➕» tugmasi chiqmaydi. Rasm faqat `https://` boʻlsa yuboriladi — Telegram boshqa sxemani qabul qilmaydi, shuning uchun karta matn boʻlib ochiladi |
| Savat | Serverdagi savat: `➕` / `➖` / `🗑`, promokod, tozalash, «Buyurtma berish». Narxlar har safar katalogdan qayta hisoblanadi |
| Qadam-baqadam buyurtma | Ism → **telefon (faqat Telegram kontaktidan)** → yetkazish usuli → viloyat + manzil yoki lokatsiya → izoh → promokod (ixtiyoriy) → server hisoblagan yakuniy summa → «Tasdiqlash» |
| Tasdiqlash | `idempotencyKey` bilan bitta buyurtma: ikki marta bosish yoki taym-autdan keyingi qayta urinish dublikat yaratmaydi. Savat faqat buyurtma yaratilgandan keyin boʻshaydi |
| `Qayta buyurtma` | Eski buyurtma savatga qaytariladi; endi sotilmayotgan qatorlar tushib qoladi |
| Til | `uz` / `ru` — `bot_carts.locale` va `bot_members.locale` da saqlanadi, keyingi xabarlar shu tilda |
| Matn yozsa | Avval katalogdan qidiradi; topilmasa murojaat (`/admin/bot/tickets`) + operator guruhiga xabar. 30 soniyada bittadan ortiq emas |

## Doʻkon API (`/api/bot/shop/*`)

Barchasi `Authorization: Bearer BOT_API_KEY`, Zod validatsiyasi va chat
boʻyicha rate limit bilan. Narxlar hech qachon klientdan olinmaydi.

| Metod | Yoʻl | Nima |
|---|---|---|
| GET | `/shop/categories?locale=` | Kategoriyalar va mahsulot soni |
| GET | `/shop/catalog?locale=&page=&category=&q=` | 6 talik sahifa; qidiruv `fold()` orqali |
| GET | `/shop/product/:slug?locale=` | Karta + `disclaimer` (BAD matni) |
| GET | `/shop/cart?chatId=&locale=` | Serverdagi savat, `issues`, `totals`, `promo`, `firstOrder` |
| POST | `/shop/cart/add` · `/shop/cart/set` · `/shop/cart/clear` | Savat (slug + qty; narx yoʻq) |
| POST | `/shop/promo` | Kodni savatga yozish/oʻchirish (`code: ""`) |
| POST | `/shop/quote` | Usul (courier/pickup) va promokod bilan yakuniy hisob |
| POST | `/shop/order` | `placeOrder()`; `idempotencyKey` (8–128 belgi) |
| POST | `/shop/reorder` | Eski buyurtma qatorlarini savatga |
| GET · POST | `/shop/locale` | Tilni oʻqish/yozish (telefon bogʻlanmagan boʻlsa ham) |

Xatolar `{ error, slug?, name?, reason?, available? }`:

| Status | `error` | Botdagi xabar |
|---|---|---|
| 409 | `out_of_stock` | «… hozir sotuvda yoʻq» + savat tugmasi; savat saqlanadi |
| 409 | `not_linked` | Kontakt soʻraladi; tasdiqlangach checkout davom etadi |
| 409 | `qty_cap` | «Bu mahsulotdan koʻproq qoʻshib boʻlmaydi» |
| 422 | `promo_invalid` | Sabab (`expired`, `min_subtotal`, …) va kod savatdan olib tashlanadi |
| 425 | `pending` | «Buyurtma allaqachon qabul qilinmoqda» |
| 429 | `rate_limited` | «Juda koʻp urinish» (savat 40/daq, promo 10/10 daq, buyurtma 6/10 daq) |

**Muhim:** `promoCode: null` — «promokodsiz», maydon umuman yoʻq boʻlsa —
savatdagi kod ishlatiladi.

## Avtomatizatsiya

Ishchi (`src/lib/messaging/worker.ts`, har 5 daqiqada) uchta narsani bajaradi:

| Nima | Qayerda | Qoida |
|---|---|---|
| **Omborga keldi** | `lib/notify/waitlist.ts` → `enqueueRestockMessage()` | Restock soʻrovi avval **restock flow** orqali yuboriladi (sokin soatlar, opt-out, outbox). Flow oʻchirilgan boʻlsa — avvalgi toʻgʻridan-toʻgʻri kanallar (Telegram → SMS → operator). `notified_via='flow'` |
| **Bugungi taklif boshlandi** | `lib/merch/deal-notify.ts` | `starts_at` oʻtgan har bir aksiya `deal_notifications` da **bir marta** belgilanadi va oʻsha mahsulotga «narxi tushsa xabar bering» deganlarga xabar boradi. Ikki mashina bir vaqtda ishlasa ham dublikat yoʻq |
| **Bot savati tashlab ketildi** | `lib/bot/abandoned.ts` | `bot_carts` 2 soatdan 26 soatgacha tegilmagan, ichida mahsulot bor va chatga telefon bogʻlangan boʻlsa — saytdagi «Tashlab ketilgan savat» flow'iga yoziladi (bir savat bir marta; yangi buyurtma flow'ni toʻxtatadi). Flow oʻchirilgan boʻlsa hech narsa yuborilmaydi |

Hamma flow'lar **oʻchiq holda** seed qilinadi — matnlarni `/admin/flows` da koʻrib, oʻzingiz yoqasiz. Sokin soatlar 21:00–09:00 (Toshkent), opt-out va dedupe engine darajasida.

## Bot auditoriyalari (segmental kampaniya)

`/admin/segments` da «Bot aʼzolari» guruhi — sayt segmentlaridan farqi: bu odamlar
Telegramda, hatto telefon bogʻlanmagan boʻlsa ham. Xabar **faqat Telegram** orqali
ketadi (SMS uchun raqam yoʻq) va oʻsha outbox, sokin soat, opt-out, shaxsiy
promokod va bosish hisobini ishlatadi.

| Segment | Kim | Dedupe kaliti |
|---|---|---|
| `bot-all` | Botni ishga tushirgan, bloklamaganlar | `telefon9`, yoʻq boʻlsa `tg<chat>` |
| `bot-linked` | Telefonini ulaganlar | `telefon9` |
| `bot-buyers` | Kamida bitta bekor qilinmagan buyurtmasi borlar | `telefon9` |
| `bot-new` | Telefon ulagan, hali xarid qilmaganlar | `telefon9` |
| `bot-cart` | Savatida mahsulot qoldirib, 1 soat–30 kun buyurtma bermaganlar | `telefon9` / `tg<chat>` |

Telefon bogʻlanmagan aʼzo uchun opt-out — botni bloklash (`blocked_at`), shuning
uchun bunday chatga faqat bloklanmagan boʻlsa yoziladi. Telefonli aʼzolar uchun
odatdagi `marketing_optouts` qoidasi amal qiladi.

Aʼzolar roʻyxati eksport qilinmaydi: telefon faqat bogʻlanganda maʼlum boʻladi,
reklama kabineti auditoriyasi esa saytdagi «Mijozlar» segmentlaridan olinadi.

## Admin (`/admin/bot`)

- **Klub** — 30 kunlik kanal statistikasi (bot / Mini App / sayt va bot savdo summasi), aʼzolar; sozlamalar (holat xabarlari yoqilgan, klub nomi,
  Mini App manzili, operator telefoni, ish vaqti, **salomlashuv uz/ru** — bot
  ularni ishga tushishda va keyin har 5 daqiqada (`bot/settings.py`, outbox
  sikli) qayta oʻqiydi, shuning uchun qayta ishga tushirish shart emas;
  salomlashuv esa har `/start` da olinadi);
  **«Klubga xabar»** — botni bloklamagan barcha aʼzolarga (tasdiq belgisi bilan,
  1000 belgi, HTML escape qilinadi);
  **«Segmental kampaniyalar»** — 5 bot auditoriyasi hajmi bilan, bosilsa
  `/admin/segments/<id>` dagi tayyor shablon va kanal tanloviga olib boradi.
- **Murojaatlar** — javob shu botdan boradi (bir murojaatga bitta javob), yopish.
- **Aʼzolar** — /start bosganlar, raqam, manba, bloklagan.
- **Xabarlar navbati** — har bir xabar holati, «Qayta yuborish».
- Buyurtma sahifasida «Telegram: Mini App orqali» qatori.

## Sozlash (bir marta)

1. **@BotFather** — yangi bot (operator xabarlari keladigan botdan **alohida**):
   `/newbot` → token. Menyu tugmasi («Doʻkon») va buyruqlarni bot ishga
   tushganda oʻzi oʻrnatadi.
2. **Kalit:** `openssl rand -hex 32` → bu `BOT_API_KEY` (sayt) = `GOVITA_API_KEY` (bot).
3. **Sayt** (`fly secrets set -a govita`):
   ```
   BOT_API_KEY=<kalit>                  # ≥ 32 belgi, aks holda /api/bot yopiq
   TELEGRAM_CLUB_BOT_TOKEN=<bot tokeni> # Mini App initData imzosini tekshirish uchun
   ```
   `fly.toml [build.args]` da `NEXT_PUBLIC_TELEGRAM_CLUB_BOT = "<bot_username>"` —
   bu Telegram Web (`web.telegram.org`) ga saytni iframe'da ochishga ruxsat
   beradi (`lib/security/csp.ts` → `framingHeaders`). Qolgan hamma joy uchun
   framing yopiq qoladi. Keyin `fly deploy` (migratsiya 0003 oʻzi yuradi).
4. **Bot** (`govita-vip-bot/` papkasidan):
   ```bash
   fly apps create govita-bot
   fly secrets set -a govita-bot BOT_TOKEN=<bot tokeni> GOVITA_API_KEY=<kalit>
   fly deploy
   fly scale count 1 -a govita-bot            # har doim bitta mashina
   ```
   `GOVITA_API_URL` `fly.toml` da (`https://govita.fly.dev/api/bot` — domen
   Vercel'dan ko'chishidan oldin ham ishlaydi). Avtomatik deploy uchun:
   `fly tokens create deploy -a govita-bot -x 999999h` → GitHub secret `FLY_BOT_API_TOKEN`.
5. Tekshirish: botda /start → kontakt → **«Katalog»** → mahsulot → savat →
   buyurtma → `/admin/orders` da yangi buyurtma (`Manba: Telegram bot`), botga
   «qabul qilindi» xabari. Soʻng «Doʻkon» (Mini App) orqali ham bitta buyurtma
   — manba `Telegram Mini App`.

**Maxfiy qiymatlar faqat `fly secrets` da.** Chatga, Git'ga, `fly.toml` ga yozilmaydi.

## Chegaralar (hali yoʻq)

- **Obunalar** — sayt takroriy yetkazishni hali yuritmaydi; bot «Obuna topilmadi» deydi.
- **Saytga bot orqali kirish (OTP)** — `/account` deploy qilinmagan, shuning uchun yoʻq.
- **Eslatmalar, kurslar, aksiya lentasi** — demo rejimda bor (`python -m bot --demo`),
  production'da yoʻq. Qoʻshilganda sayt `bot_jobs` ga yozadi — bot oʻzgarmaydi.
- **Native doʻkon va Mini App — hozircha naqd pul (COD).** Toʻlov provayderi
  merchant ID olgach qoʻshiladi.
- **Bot interfeysi uz/ru.** Saytdan keladigan xabarlar aʼzo tiliga qarab uz/ru.

## Fayllar

| Joy | Nima |
|---|---|
| `db/migrations/0003_telegram_club.sql` | `bot_config`, `bot_members`, `telegram_links`, `bot_tickets`, `bot_jobs`, `bot_order_events`, `orders.telegram_chat_id` |
| `db/migrations/0012_bot_shop.sql` | `orders.source`, `bot_carts`, `bot_order_keys`, `restock_requests.notified_via='flow'`, `deal_notifications` |
| `src/lib/bot/` | `api.ts` (bot kontrakti), `shop.ts` (katalog/savat/xarid), `store.ts` (baza), `webapp.ts` (initData), `auth.ts`, `messages.ts`, `config.ts`, `phone.ts`; testlar — `bot.test.ts` |
| `src/lib/orders/notify.ts` | Operatorga buyurtma xabari (sayt va bot uchun bitta matn) |
| `src/app/api/bot/[...path]/route.ts` | API kirish nuqtasi |
| `src/app/admin/(panel)/bot/` · `_actions/bot.ts` | Admin |
| `src/lib/telegram/mini-app.ts` · `components/telegram/TelegramMiniApp.tsx` | Mini App: initData, `web_app_ready`/`expand` (Telegram skriptisiz) |
| `govita-vip-bot/bot/remote.py` | Production bot; test — `tests/test_remote.py` |
| `govita-vip-bot/bot/shop.py` | Native doʻkon: katalog, savat, qadam-baqadam checkout; test — `tests/test_shop.py` |
| `govita-vip-bot/scripts/live_smoke.py` | 20 ta API tekshiruvi: savat, promokod, buyurtma, idempotentlik, holat xabari |
| `govita-vip-bot/scripts/live_shop_ui.py` | Doʻkon handlerlarini tirik saytga qarshi yuritadi (16 ekran): katalog → savat → checkout → buyurtma → «Qayta buyurtma» |
| `scripts/e2e/flow-bot-order.mjs` | Bot API → `orders` → `/admin/orders` (kanal «Telegram bot») tekshiruvi |
| `govita-vip-bot/fly.toml` | Bot deploy |

## Lokal tekshirish

Botni saytga qarshi lokal yurgizish mumkin: `GoVitaBackend` faqat **loopback**
uchun `http://` ga ruxsat beradi (boshqa hostlar uchun faqat `https://`,
credentials/query/fragment baribir taqiqlangan). Shu bilan:

```bash
# sayt 3000-portda
cd govita-vip-bot
GOVITA_LIVE_API=http://localhost:3000/api/bot GOVITA_LIVE_KEY=$BOT_API_KEY \
  .venv/bin/python scripts/live_smoke.py      # 20/20
GOVITA_LIVE_API=http://localhost:3000/api/bot GOVITA_LIVE_KEY=$BOT_API_KEY \
  .venv/bin/python scripts/live_shop_ui.py    # 16 ekran, buyurtma raqami
```

`live_shop_ui.py` Telegramni almashtiradi (xabarlar chop etiladi), lekin API,
baza va `placeOrder()` — haqiqiy. Shu bilan matnda qolib ketgan `{ism}`,
eski narx yoki 4096 belgidan uzun xabar darhol koʻrinadi.
