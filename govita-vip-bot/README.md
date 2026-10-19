# GoVita — VIP Salomatlik Klubi Telegram-boti

Sayt (`govita.uz`, repo ildizidagi Next.js) dan **alohida** loyiha. Spec va mockuplar: `docs/` (`govita-vip-bot.zip` dan).

## Holat

**ShopFlow ishlatilmaydi.** GoVita backendga admin va service API qo‘shildi.
Production adapter haqiqiy customers/orders/subscriptions/tickets/outbox
bilan ishlaydi. **Native do‘kon** (`bot/shop.py`) tayyor: katalog, savat,
qadam-baqadam checkout va idempotent buyurtma — barchasi sayt API’si orqali.
To‘liq VIP funksiyalar hali yakunlanmagan.
Sozlash va cheklovlar: [BOT-ADMIN.md](../docs/BOT-ADMIN.md).

## Lokal prototipdagi oqimlar (mockuplar 01–10)
- `/start` → salomlashuv, «Klubda nima bor», `📱 Raqamni ulashish`; begona kontakt rad etiladi, raqam konflikti → operator lidi
- Deep link: `login`, `club`, `o_<kod>`, `r_<ref>`, `s_<manba>`, `sub_<id>` (egalik tekshiruvi bilan)
- Bosh menyu: Doʻkon (Mini App), Katalog, Savat, Buyurtmalarim, VIP klub, Savol berish, Til
- `/katalog`, `/savat` — native doʻkonni toʻgʻridan-toʻgʻri ochadi
- Savat serverda (`bot_carts`): `➕` / `➖` / `🗑`, promokod; har bir narx serverda qayta hisoblanadi
- Buyurtma kartasi (bosqichlar, tarkib, jami), bosqich xabarlari (dedupe) — `workers.push_stage()`
- Qabul eslatmalari (✅ Ichdim / ⏱ 1 soat / ⏸ oʻchirish), bir slotga bitta xabar
- Kurs tugashi xabari (doza boʻyicha, sokin soatlar, obunadagiga yoʻq)
- Mavjud lokal obuna boshqaruvi: oʻtkazish, surish, pauza, bekor. Yangi obuna yaratish real pipeline tayyor bo‘lmaguncha yopiq.
- Klub kartasi, doʻstni taklif, takliflarni oʻchirish, operator/maslahat
- Saytga kirish kodi (`/start login`, 6 xona, sha256 + pepper, 5 daq)

## Ishga tushirish
```bash
cd govita-vip-bot
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env   # BOT_TOKEN ni BotFather'dan
 # .env avtomatik yuklanadi (python-dotenv)
.venv/bin/python -m bot --demo     # --demo: mockupdagi namunaviy buyurtmalar (+998901234567)
.venv/bin/pytest
```

## Docker
```bash
docker compose up --build -d
docker compose logs --tail=50 bot
```
`.env`: `BOT_TOKEN`, `GOVITA_API_URL`, `GOVITA_API_KEY` (bot-service kaliti).
Kalitlarni chatda yoki Git’da saqlamang. API manzili admin panelning frontend
URL’i emas, server endpointlari bazasi bo‘ladi.

Production: `GOVITA_API_URL=https://<sayt>/api/bot`, xizmat kaliti backend
`BOT_API_KEY` bilan bir xil. Lokal sinov uchun `python -m bot --demo`.
SQLite va lokal pepper Docker `/data` volume’da saqlanadi.

**Bitta token — bitta engine.** Polling va boshqa webhook botni bir vaqtda
ayni token bilan yoqmang. Bu loyiha webhook’ni avtomatik o‘chirmaydi.

## Keyingi qadam
Mini App adaptatsiyasi (soddalashtirilgan header/footer, safe-area, haptics),
bot marketing avtomatizatsiyasi va `/admin/bot` statistikasi. Real Telegram
end-to-end sinovi talab qilinadi; 100% tayyor emas.
