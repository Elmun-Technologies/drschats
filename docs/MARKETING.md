# Shaxsiy yondashuv, email va eslatmalar

Bu hujjat uch narsani tushuntiradi: sayt foydalanuvchi haqida **nimani biladi**,
o'sha bilim asosida **nima yuboriladi**, va buni ishga tushirish uchun **sizdan
nima kerak**.

Qisqa javob: kod tayyor, **hech narsa yubormaydi** — chunki pochta provayderi
ulanmagan. Bitta `RESEND_API_KEY` uni yoqadi.

---

## 1. Ikki xil profil

Ular atayin ajratilgan va aralashtirilmasligi kerak.

| | **Xulq profili** | **Sog'liq profili** |
|---|---|---|
| qayerda | `src/lib/personalization/` | `src/lib/profile/` |
| nima yig'adi | ko'rilgan mahsulotlar, xaridlar | ism, tug'ilgan kun, oila, maqsadlar |
| qanday | avtomatik, klik asosida | foydalanuvchi o'zi yozadi |
| ko'rinadimi | yo'q | ha — `/profile` sahifasida to'liq |
| o'chirish | brauzer xotirasini tozalash | `/profile` → "Profilni tozalash" |

Ikkinchisi rozilik talab qiladi va shuning uchun **ko'rinadigan** bo'lishi shart:
odam nima yozganini o'qiy olishi va o'chira olishi kerak. Birinchisiga rozilik
kerak emas, chunki u hech qachon foydalanuvchiga qaytarib ko'rsatilmaydi va
undan xabar yuborilmaydi.

### `/profile` sahifasi

Bu sahifa **API'siz ham to'liq ishlaydi** — ma'lumot brauzerda saqlanadi.
`NEXT_PUBLIC_API_URL` qo'yilgan va foydalanuvchi tizimga kirgan bo'lsa, profil
qo'shimcha ravishda serverga ko'chiriladi (boshqa qurilmada ham qolishi va
eslatmalar navbati o'qiy olishi uchun).

Sahifada: asosiy ma'lumotlar → maqsadlar → oila a'zolari → **eslatmalar
ro'yxati** → kanal ruxsatlari → shu maqsadlarga mos mahsulotlar → o'chirish.

Eslatmalar ro'yxati ataylab **yuborishdan oldin** ko'rsatiladi: faqat kelgan
xatdan bilinadigan dastur — bu baholab bo'lmaydigan dastur.

---

## 2. Nima yuboriladi

Barcha matnlar: `src/lib/email/campaigns.ts` (uz + ru, bitta faylda).

| kampaniya | qachon | kanal | rozilik kerakmi |
|---|---|---|---|
| `opt-in` | obuna so'ralganda | email | — (tasdiqlash xati) |
| `welcome` | havola bosilgach | email | ✅ |
| `order` | buyurtma qabul qilinganda | email | ❌ tranzaksion |
| `account-verify` | ro'yxatdan o'tganda | email | ❌ tranzaksion |
| `birthday` | tug'ilgan kunga 7 kun qolganda | email, telegram | ✅ |
| `child-season` | 10-avgust — 10-sentyabr | email, telegram | ✅ |
| `reorder` | kurs tugashiga ~5 kun qolganda | email, telegram | ✅ |
| `subscription-upcoming` | yetkazishga 3 kun qolganda | email, telegram | ✅ |
| `abandoned-cart` | tashlab ketilgan savatcha | email | ✅ |

**Tranzaksion** xatlarda obunani bekor qilish havolasi **yo'q** — buyurtma
holatidan "obunani bekor qilish" ma'nosiz. Qolgan hammasida bor, ustiga
`List-Unsubscribe` sarlavhalari (Gmail va Mail.ru aynan shularni o'qiydi).

### Qonun tomoni

Matnlarda **hech qanday davolash va'dasi yo'q** — faqat kurs, sana va
yetkazish haqida. O'zbekiston "Reklama to'g'risida"gi qonuni 35-moddasi BAD
reklamasiga alohida talab qo'yadi, xat esa reklama hisoblanadi. Yangi kampaniya
qo'shsangiz shu chiziqni saqlang.

---

## 3. Qanday ishlaydi

```
 brauzer                storefront (Vercel)            backend (FastAPI)
┌────────────┐         ┌────────────────────┐        ┌───────────────────┐
│ /profile   │ ──────▶ │ server action      │ ─────▶ │ profil, rozilik   │
│ savatcha   │         │ email shabloni     │        │ obunalar          │
└────────────┘         │ imzolangan havola  │        │ yuborilganlar log │
                       └─────────┬──────────┘        └─────────┬─────────┘
                                 │  kuniga bir marta cron      │
                                 │ ◀───── "bugun kim kutmoqda" │
                                 ▼
                          Resend / Telegram
```

**Kim** va **qachon** — backend hal qiladi (tug'ilgan kunlar, oila, obunalar va
allaqachon yuborilganlar logi o'sha yerda). **Nima** va **qanday** — storefront
(shablonlar, provayder kaliti, Telegram tokeni o'sha yerda, va u deploy
qilingan). Cron navbatni oladi, yuboradi, natijani qaytaradi.

Har bir navbat yozuvida `reminder_id` bor va u **noyob**. Shuning uchun cron
ikki marta ishlasa ham bir odam bir kunda ikkita tabrik olmaydi.

### Imzolangan havolalar

Tasdiqlash va obunani bekor qilish havolalari bazadagi yozuvga emas,
**imzoga** tayanadi (`src/lib/email/token.ts`). Sababi: storefront'ning o'z
bazasi yo'q, va "odamlar obunani bekor qila olishi uchun" baza qo'shish —
noto'g'ri tartib. Obunani bekor qilish havolasi hech qachon eskirmaydi,
tasdiqlash havolasi 7 kun yashaydi.

---

## 4. Obuna tizimi (Subscribe & Save)

Swanson modelidan olingan, bozorga moslashtirilgan. Shartlar bitta joyda:
`src/lib/subscription/plans.ts`.

- birinchi buyurtmada **−10%**, keyingi har bir yetkazishda **−15%**
- obuna buyurtmalari **300 000 so'm**dan bepul yetkaziladi (oddiy buyurtmadan
  past chegara)
- oraliq: 30 / 45 / 60 / 90 kun
- **istalgan vaqtda**: to'xtatish, bittasini o'tkazib yuborish, oraliqni
  o'zgartirish, bekor qilish — `/account` sahifasida, telefonsiz

Takrorlanadigan narx mahsulot sahifasidayoq ko'rsatiladi. Haqiqiy narxi faqat
ikkinchi yetkazishda ma'lum bo'ladigan obuna — bu tuzoq, va bu tizim unday
qilib qurilmagan.

Obuna checkout'da tug'iladi: `subscription` belgisi bor qatorlar backend'da
`subscriptions` jadvaliga tushadi va oraliq bo'yicha guruhlanadi.

---

## 5. Ishga tushirish

### 5a. Pochta — bu bittasi hamma narsani yoqadi

```env
RESEND_API_KEY=re_...
EMAIL_FROM=Go Vita <no-reply@govita.uz>
EMAIL_REPLY_TO=info@govita.uz
EMAIL_TOKEN_SECRET=<tasodifiy uzun satr>
NEXT_PUBLIC_SITE_URL=https://govita.uz
```

1. [resend.com](https://resend.com) da hisob oching, domenni qo'shing.
2. DNS'ga **SPF**, **DKIM** va **DMARC** yozuvlarini qo'ying — Resend aniq
   qiymatlarni ko'rsatadi. Bularsiz xatlar spamga tushadi.
3. `EMAIL_TOKEN_SECRET` — `openssl rand -base64 32`. **Production'da majburiy**:
   qo'yilmasa kod ishga tushmaydi (aks holda istalgan manzilni obunadan
   chiqarish mumkin bo'lardi).

Kalit qo'yilmaguncha kod xato bermaydi — log'ga `[email] skipped …` yozadi va
davom etadi. Ya'ni checkout hech qachon pochta tufayli sinmaydi.

### 5b. Eslatmalar (cron)

```env
CRON_SECRET=<tasodifiy uzun satr>
MARKETING_API_KEY=<tasodifiy uzun satr>   # backend'da ham xuddi shu
NEXT_PUBLIC_API_URL=https://api.govita.uz
```

`vercel.json` da cron allaqachon yozilgan: har kuni **06:00 UTC** (Toshkentda
11:00). Vercel `CRON_SECRET` bilan avtomatik sarlavha yuboradi.

`CRON_SECRET` qo'yilmasa endpoint **yopiq turadi** — haqiqiy odamlarga xat
yuboradigan ochiq endpoint standart holat bo'lishi mumkin emas.

`NEXT_PUBLIC_API_URL` yoki `MARKETING_API_KEY` bo'lmasa cron ishlaydi, lekin
darrov "skipped" qaytaradi. Bu xato emas — backend deploy qilinmaguncha normal
holat.

### 5c. Telegram (ixtiyoriy, lekin bu bozorda kuchli kanal)

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...                      # operator guruhi
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=govita_bot
```

Oxirgi o'zgaruvchi qo'yilmasa `/profile` sahifasida Telegram kanali **umuman
ko'rsatilmaydi** — hech qachon kelmaydigan xabarni va'da qiladigan belgi
yo'qdan yomonroq.

**Sizdan kerak bo'ladigan ish:** bot foydalanuvchi bilan suhbat boshlaganda
uning `chat_id` sini `users.telegram_chat_id` ga yozishi kerak. Profil
sahifasidagi havola `?start=<payload>` bilan ochiladi — bot shu payload'ni
qaytarib oladi. Botning o'zi hali yozilmagan.

### 5d. Web push — ataylab qilinmadi

PWA bor, lekin push **qo'shilmadi**. Sababi ochiq: uni to'g'ri yuborish uchun
VAPID kalitlari va shifrlash kutubxonasi kerak, ya'ni yangi bog'liqlik va yangi
sir. Bu bozorda esa Telegram xuddi shu ishni yaxshiroq bajaradi. Kerak bo'lsa —
ayting, alohida qo'shamiz.

---

## 6. Tekshirish ro'yxati

Deploy qilgandan keyin:

- [ ] `/uz/profile` ochiladi, maqsad tanlanadi, oila a'zosi qo'shiladi
- [ ] Oila a'zosiga bugungi sanani qo'ying → eslatmalar panelida "Bugun" chiqadi
- [ ] Bosh sahifadagi obuna formasiga pochta yozing → **tasdiqlash xati** keladi
- [ ] Havolani bosing → `/email/preferences?status=confirmed` va **welcome** xati
- [ ] Xat pastidagi "Obunani bekor qilish" → darhol bekor bo'ladi, savol so'ramaydi
- [ ] Checkout'da pochta yozib buyurtma bering → buyurtma tasdig'i keladi
- [ ] Mahsulot sahifasida "Obuna bilan" → savatchada "Har 30 kunda" va
      "Keyingi yetkazib berish: …" chiqadi
- [ ] `curl -H "Authorization: Bearer $CRON_SECRET" https://.../api/cron/marketing`
      → `{"ok":true,...}`

---

## 7. Fayllar

| nima | qayerda |
|---|---|
| profil (tur, do'kon, eslatma qoidalari) | `src/lib/profile/` |
| katalogni maqsadga solishtirish | `src/lib/personalization/catalogue.ts` |
| xat matnlari (uz + ru) | `src/lib/email/campaigns.ts` |
| xat qolipi (HTML + matn) | `src/lib/email/render.ts` |
| imzolangan havolalar | `src/lib/email/token.ts` |
| yuborish | `src/lib/email/send.ts` |
| obuna shartlari | `src/lib/subscription/plans.ts` |
| cron | `src/app/api/cron/marketing/route.ts` |
| navbat (kim, qachon) | `backend/app/routers/marketing.py` |
| profil API | `backend/app/routers/profile.py` |
| obunalar API | `backend/app/routers/subscriptions.py` |
