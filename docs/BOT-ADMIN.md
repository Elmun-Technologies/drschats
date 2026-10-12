# GoVita Telegram klub: bot, Mini App, admin

Klub boti — oddiy bot emas, Telegram ichidagi doʻkon. Mijoz botdagi
**«Doʻkon»** tugmasini (yoki xabar maydoni yonidagi menyu tugmasini) bossa,
govita.uz Telegram ichida **Mini App** boʻlib ochiladi va u yerdan buyurtma
beradi. Buyurtma uning Telegram akkauntiga bogʻlanadi, holati botga keladi.
Boshqaruv — saytning oʻz admin panelida: **`/admin/bot`**.

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
| `/start` | Aʼzo yoziladi (`s_<manba>` deep-link — manba sifatida). Raqam bogʻlanmagan boʻlsa, kontakt soʻraladi |
| Kontakt | Faqat **oʻz** kontakti (`contact.user_id == from.id`). Raqam boshqa chatga bogʻlangan boʻlsa — bogʻlanmaydi, operatorga «Raqam ziddiyati» murojaati |
| «Doʻkon», menyu tugmasi | Sayt Mini App boʻlib ochiladi (`/uz`) |
| Mini App'da buyurtma | `initData` serverda Telegram imzosi bilan tekshiriladi (`lib/bot/webapp.ts`), chat id buyurtmaga yoziladi. Brauzerdagi hech narsaga ishonilmaydi |
| «Buyurtmalarim» | Shu chatdan (Mini App) yoki bogʻlangan raqamdan berilgan buyurtmalar (oxirgi 9 raqam boʻyicha — saytdagi buyurtmalar ham chiqadi) |
| Holat oʻzgarishi | `/admin/orders` da holat oʻzgarsa — mijozga botda xabar (uz/ru), «Batafsil» tugmasi bilan |
| Matn yozsa | Murojaat (`/admin/bot/tickets`) + operator guruhiga xabar. 30 soniyada bittadan ortiq emas |

## Admin (`/admin/bot`)

- **Klub** — koʻrsatkichlar; sozlamalar (holat xabarlari yoqilgan, klub nomi,
  Mini App manzili, operator telefoni, ish vaqti — bot keyingi soʻrovda oladi);
  **«Klubga xabar»** — botni bloklamagan barcha aʼzolarga (tasdiq belgisi bilan,
  1000 belgi, HTML escape qilinadi).
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
   `GOVITA_API_URL` `fly.toml` da (`https://www.govita.uz/api/bot`).
5. Tekshirish: botda /start → kontakt → «Doʻkon» → buyurtma → `/admin/bot`
   da «Mini App buyurtmalari» 1, botga «qabul qilindi» xabari.

**Maxfiy qiymatlar faqat `fly secrets` da.** Chatga, Git'ga, `fly.toml` ga yozilmaydi.

## Chegaralar (hali yoʻq)

- **Obunalar** — sayt takroriy yetkazishni hali yuritmaydi; bot «Obuna topilmadi» deydi.
- **Saytga bot orqali kirish (OTP)** — `/account` deploy qilinmagan, shuning uchun yoʻq.
- **Eslatmalar, kurslar, aksiya lentasi** — demo rejimda bor (`python -m bot --demo`),
  production'da yoʻq. Qoʻshilganda sayt `bot_jobs` ga yozadi — bot oʻzgarmaydi.
- **Bot interfeysi faqat oʻzbekcha.** Saytdan keladigan xabarlar aʼzo tiliga qarab uz/ru.

## Fayllar

| Joy | Nima |
|---|---|
| `db/migrations/0003_telegram_club.sql` | `bot_config`, `bot_members`, `telegram_links`, `bot_tickets`, `bot_jobs`, `bot_order_events`, `orders.telegram_chat_id` |
| `src/lib/bot/` | `api.ts` (bot kontrakti), `store.ts` (baza), `webapp.ts` (initData), `auth.ts`, `messages.ts`, `config.ts`, `phone.ts`; test — `bot.test.ts` |
| `src/app/api/bot/[...path]/route.ts` | API kirish nuqtasi |
| `src/app/admin/(panel)/bot/` · `_actions/bot.ts` | Admin |
| `src/lib/telegram/mini-app.ts` · `components/telegram/TelegramMiniApp.tsx` | Mini App: initData, `web_app_ready`/`expand` (Telegram skriptisiz) |
| `govita-vip-bot/bot/remote.py` | Production bot; test — `tests/test_remote.py` |
| `govita-vip-bot/fly.toml` | Bot deploy |
