# GoVita Telegram bot boshqaruvi

Mavjud FastAPI backendga mustaqil modul qo‘shildi. Public Next.js sayt
marshrutlari o‘zgarmadi. Admin UI: backend origin’da `/admin/bot`.

## Sozlash
Backend `.env`:
- `BOT_ADMIN_KEY`: admin login kaliti.
- `BOT_ADMIN_SESSION_SECRET`: cookie JWT imzolash uchun mustaqil secret.
- `BOT_API_KEY`: bot service uchun boshqa kalit.
- `TELEGRAM_MODE=polling`: eski webhook update handlerni o‘chiradi.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`: backenddan OTP yuborish uchun.
- Production’da mavjud JWT_SECRET/OTP_HMAC_KEY qoidalari ham amal qiladi.
Har secretni mustaqil `secrets.token_urlsafe(32)` bilan yarating. Kalitni
brauzer bundle yoki Git’da saqlamang. Production HTTPS talab qilinadi.

```bash
cd backend
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Bot `.env`: `BOT_TOKEN` (backend bilan ayni token),
`GOVITA_API_URL=https://<backend-host>/api/v1/bot`,
`GOVITA_API_KEY` (backend BOT_API_KEY bilan bir xil).
`python -m bot` production adapterdan foydalanadi; `--demo` eski lokal demo.
Oldingi Telegram webhookni operator rejalashtirilgan ko‘chirishda o‘chiradi.
Bot webhook faol bo‘lsa pollingni boshlamaydi. Ikki engine yoqmang.

## Qo‘shilganlar
- Admin login, 8 soat httpOnly/SameSite cookie, production Secure, CSRF,
  persistent IP login limit, kalit rotation’dan keyin sessiya yaroqsiz.
- Klub sozlamalari, mijozlar, buyurtma bosqichlari, murojaat/javob, outbox.
- Bot-service kontakt tekshiruvi + konflikt rad etish, guest order/sub claim.
- Buyurtma list/detail egaga tekshiriladi, obuna boshqaruvi existing modeldan.
- Operator javobi va bosqich xabarlari durable outbox; conditional lease claim,
  retry/backoff, max attempts, blocked guard, /start unblock.
- Prod bot shu API’dan o‘qiydi; local SQLite’dan mijoz/orders olmaydi.
- OTP existing HMAC + verify flow orqali; plaintext outbox/logga yozilmaydi.

## Chegaralar
Bu hali butun VIP botning 100% tayyorligi emas. Admin modulida mahsulot doza
katalogi, kurs/reminder CRUD/worker, promotion campaigns, ruscha to‘liq UI,
subscription run race/idempotency yakunlanmagan. Mavjud marketing subscription
runner bu patchda qayta yozilmadi. Bot yangi subscription checkout yaratmaydi;
existing obunalarni boshqaradi. Admin panelda haqiqiy katalog yo‘q bo‘lgani
uchun soxta mahsulot yaratilmadi.

Botning transport xatolari loglanmaydi (tokenli URL sizib chiqmasin), lekin
ishlab chiqarishda monitoring/counters qo‘shish kerak. Outbox send va ACK
orasida crash bo‘lsa Telegram dublikat ehtimoli bor — exactly-once emas.
Worker polling botga tegishli, marketing cron bilan bir eventni ikki marta
qayta yubormang. PostgreSQL parallel/lease integratsion test va real Telegram
testi deploymentdan oldin kerak. Admin ro‘yxatlari oxirgi 100 yozuv bilan
cheklangan. Login limit proxy IP bo‘yicha konservativ; distributed auth/RBAC
admin platforma tayyor bo‘lganda umumiy admin auth bilan almashtiriladi.

## Tekshirilgan
Backend 69 test; bot 15 test; Alembic SQLite fresh upgrade head.
