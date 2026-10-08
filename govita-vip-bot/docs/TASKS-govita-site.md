# govita.uz — klub integratsiyasi (Claude Code uchun)

Oldingi paket (`govita-design.zip`, `TASKS.md`) bilan birga ishlaydi. ShopFlow tomonidagi Bosqich 3–4 tayyor boʻlgach boshlanadi.

## Qoidalar
- `SHOPFLOW_API_URL`, `SHOPFLOW_API_KEY` — **faqat server** env (`NEXT_PUBLIC_` emas). Brauzer ShopFlow'ga toʻgʻridan murojaat qilmaydi.
- `NEXT_PUBLIC_TG_BOT` — bot username (havolalar uchun, sir emas).
- Mijoz tokeni — `httpOnly; Secure; SameSite=Lax` cookie (`gv_session`), 30 kun. JS'dan oʻqilmaydi.
- Dizayn: `design/` (LoginV3, AccountV3, OrderDetailV3, SubscriptionsV3, ProfileV3, OrderSuccessV3, LoyaltyV3, footer).

## Bosqich A — ShopFlow klienti
> `lib/shopflow.ts` — server-only (`import "server-only"`) fetch klient: base URL, Bearer kalit, `X-Customer-Token` (cookie'dan), timeout 8 s, xatolarni tiplangan qaytarish. `API.md` dagi javob tiplari `types/club.ts` da.

## Bosqich B — Kirish (LoginV3)
> `/account/login`: telefon → server action `auth/request` → kod ekrani (60 s qayta yuborish taymeri, «Kod kelmadimi?» bloki va `https://t.me/${NEXT_PUBLIC_TG_BOT}?start=login` havolasi) → `auth/verify` → cookie → `/account`. Xatolar: notoʻgʻri kod (qolgan urinishlar), muddati oʻtgan, 429. Middleware: `/account/*` cookie'siz → `/account/login?next=`.

## Bosqich C — Kabinet
> `/account` (`/me/orders`), `/account/orders/[code]` (bosqichlar timeline'i `stage` dan, «Telegram orqali kuzatish» → `?start=o_<code>`, «Buyurtmani takrorlash» → `/repeat` → savat), `/account/subscriptions` (oʻtkazish / oraliq / toʻxtatish / davom / bekor + sabab), `/account/profile` (eslatmalar va kurslar `/me/reminders`, `/me/courses`; bildirishnoma switch'lari `PATCH /me`). Telegram bogʻlanmagan boʻlsa — «Telegram botni ulash» (`?start=club`).

## Bosqich D — Checkout va obuna
> PDP va savatda «Obuna bilan — arzonroq» (30/45/60/90 kun) → `POST /orders` ga `subscription` + login boʻlsa `customerToken`. `OrderSuccess` — javobdagi `botUrl` bilan «Telegram orqali kuzatish».

## Bosqich E — Bot havolalari
> Footer VIP klub kartasi → `?start=s_footer`; LoyaltyV3 → `?start=s_loyalty`; blog maqolalari → `?start=s_blog`. Barchasi bitta helper `tgLink(payload)`.

## Qabul mezonlari
- [ ] `SHOPFLOW_API_KEY` brauzer bundle'ida yoʻq (`next build` + grep).
- [ ] Cookie `httpOnly`, `Secure`.
- [ ] Boshqa mijozning `/account/orders/<code>` sahifasi 404.
- [ ] Mobil (390 px) dizayndagi kabi.
