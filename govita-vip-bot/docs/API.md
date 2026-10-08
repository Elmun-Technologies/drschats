# Public API v1 — klub endpointlari

Baza: `$SHOPFLOW_API_URL/club` (`https://shop-flow.uz/api/v1/club`). `PUBLIC_API.md` uslubida; shu fayl oxirida unga «7. Klub» boʻlimi sifatida qoʻshiladi.

- **Autentifikatsiya:** `Authorization: Bearer sf_…` (tenant kaliti, faqat server-to-server). Mijoz endpointlarida qoʻshimcha `X-Customer-Token: <token>`.
- `sf_` kalit govita.uz **serverida** (Next.js route handler / server action), brauzerga chiqmaydi.
- Barcha endpointlar `ClubSettings.enabled = false` boʻlsa `404 club_disabled`.
- Xatolar: mavjud uslub `{ "error": "<code>" }` (+ ixtiyoriy maydonlar). Pul — butun soʻm. Hammasi `Cache-Control: no-store`.
- Rate limit mavjud IP limiti (300/daq) ustiga — auth endpointlariga alohida limit (pastda).

## Auth

### `POST /auth/request`
```json
{ "phone": "+998901234567", "lang": "uz" }
```
→ `200 { "ok": true, "resendIn": 60, "botUrl": "https://t.me/<bot>?start=login" }` — **har doim bir xil**, raqam bormi-yoʻqmi.
Ichida: telefon bogʻlangan + `telegramUserId` + bloklanmagan → kod yuboriladi. Aks holda `ClubLoginCode(codeHash=null)` yoziladi — mijoz botda raqamini ulashsa, kod darhol yuboriladi.
Limit: 3 / 10 daqiqa va 10 / kun telefon boʻyicha, 20 / soat IP boʻyicha (`X-Client-IP` sarlavhasi saytdan) → `429 rate_limited { retryAfter }`.

### `POST /auth/verify`
```json
{ "phone": "+998901234567", "code": "471209" }
```
→ `200 { "customerToken": "…", "expiresAt": "…", "customer": { "id", "name", "phone", "language" } }`
→ `400 invalid_code { attemptsLeft }` · `410 code_expired`.

### `POST /auth/logout` — joriy tokenni bekor qiladi.

## Mijoz (`X-Customer-Token` majburiy)

| Metod | Yoʻl | Tavsif |
|---|---|---|
| GET | `/me` | Profil + `club { joinedAt, telegramLinked }` + bildirishnoma sozlamalari |
| PATCH | `/me` | `name`, `language`, `email`, `birthDate`, `notify*` |
| GET | `/me/orders?cursor=&limit=20` | `{ items: [{ code, createdAt, total, stage, itemsCount }], nextCursor }` |
| GET | `/me/orders/:code` | Tarkib, manzil, toʻlov, `stage`, `timeline[]` |
| POST | `/me/orders/:code/repeat` | Savat havolasi (Mini App / sayt savati uchun item roʻyxati) |
| GET | `/me/subscriptions` | Roʻyxat: mahsulot, qty, oraliq, keyingi sana, narx (−%) , status |
| POST | `/me/subscriptions` | `{ productId, variantId?, qty, intervalDays, addressId, deliveryMethod, paymentMethod }` — odatda checkout'dan |
| PATCH | `/me/subscriptions/:id` | `{ intervalDays? , qty?, nextRunAt? }` |
| POST | `/me/subscriptions/:id/skip` | Keyingi run'ni oʻtkazish |
| POST | `/me/subscriptions/:id/pause` | `{ until? }` |
| POST | `/me/subscriptions/:id/resume` | — |
| POST | `/me/subscriptions/:id/cancel` | `{ reason }` |
| GET | `/me/reminders` | Eslatmalar |
| POST | `/me/reminders` | `{ productId?, label, times[], daysOfWeek?, endDate? }` |
| PATCH / DELETE | `/me/reminders/:id` | — |
| GET | `/me/courses` | Faol kurslar: mahsulot, tugash sanasi (ProfileV3 «… tugayapti») |

## Buyurtma yaratish bilan bogʻliq
Mavjud `POST /orders` (PUBLIC_API.md §6) ga qoʻshimcha, orqaga mos:
- `customerToken?` — boʻlsa buyurtma shu mijozga biriktiriladi (telefon boʻyicha qidirish oʻrniga).
- `subscription?: { intervalDays }` — boʻlsa birinchi buyurtmaga `subscriptionFirstPct` chegirma, `Subscription` yaratiladi.
- Javobga `orderCode` va `botUrl: "https://t.me/<bot>?start=o_<code>"` qoʻshiladi (OrderSuccess sahifasidagi «Telegram orqali kuzatish»).

## Webhook (ixtiyoriy)
Mavjud outbound webhook'larga hodisalar: `subscription.created|paused|cancelled`, `subscription.run.order_created`, `course.alerted`.
