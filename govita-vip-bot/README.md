# GoVita — VIP Salomatlik Klubi Telegram-boti

Sayt (`govita.uz`, repo ildizidagi Next.js) dan **alohida** loyiha. Spec va mockuplar: `docs/` (`govita-vip-bot.zip` dan).

## Nima bor (mockuplar 01–10)
- `/start` → salomlashuv, «Klubda nima bor», `📱 Raqamni ulashish`; begona kontakt rad etiladi, raqam konflikti → operator lidi
- Deep link: `login`, `club`, `o_<kod>`, `r_<ref>`, `s_<manba>`, `sub_<id>` (egalik tekshiruvi bilan)
- Bosh menyu: Doʻkon (Mini App), Buyurtmalarim, Obunalarim, Eslatmalar, VIP klub, Aksiyalar, Vitamin testi, Savol berish, Maʼlumot, Til
- Buyurtma kartasi (bosqichlar, tarkib, jami), bosqich xabarlari (dedupe) — `workers.push_stage()`
- Qabul eslatmalari (✅ Ichdim / ⏱ 1 soat / ⏸ oʻchirish), bir slotga bitta xabar
- Kurs tugashi xabari (doza boʻyicha, sokin soatlar, obunadagiga yoʻq)
- Obuna: −10% / −15%, 30/45/60/90 kun, oʻtkazish, surish, oraliq, pauza, bekor + sabab
- Klub kartasi, doʻstni taklif, takliflarni oʻchirish, operator/maslahat
- Saytga kirish kodi (`/start login`, 6 xona, sha256 + pepper, 5 daq)

## Ishga tushirish
```bash
cd govita-vip-bot
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env   # BOT_TOKEN ni BotFather'dan
set -a; . ./.env; set +a
.venv/bin/python -m bot --demo     # --demo: mockupdagi namunaviy buyurtmalar (+998901234567)
.venv/bin/pytest
```

## Keyingi qadam
Buyurtma/mahsulot maʼlumotlari hozir lokal SQLite'da. ShopFlow API (`docs/API.md`) tayyor boʻlgach `bot/db.py` dagi `orders_for/order/product` shu API'ga ulanadi; `push_stage` ShopFlow webhook'idan chaqiriladi.
