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
| `account-verify` | profilga pochta qo'shilganda | email | ❌ tranzaksion |
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

Cron har safar avval **muddati kelgan obunalarni buyurtmaga aylantiradi**
(`POST /api/v1/marketing/subscriptions/run`), keyin xabarlarni yuboradi. Shu
tartibda: mijozga keladigan "keyingi yetkazish" xabari allaqachon yangilangan
jadvalni aks ettiradi.

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

### 5c. Telegram — kanal allaqachon tayyor

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...                      # operator guruhi
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=govita_bot
```

Bu yerda qo'shimcha ish yo'q: saytga kirish allaqachon Telegram kodi orqali
ishlaydi, ya'ni tizimga kirgan har bir mijozning `chat_id` si `telegram_links`
jadvalida turadi. Eslatmalar navbati aynan o'sha jadvalni o'qiydi — ikkinchi
nusxa saqlanmaydi.

Ya'ni mijoz `/profile` da Telegram kanalini yoqsa, eslatmalar darrov ishlaydi.
`NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` qo'yilmasa kanal `/profile` da umuman
ko'rsatilmaydi — hech qachon kelmaydigan xabarni va'da qiladigan belgi yo'qdan
yomonroq.

### 5d. Web push — ataylab qilinmadi

PWA bor, lekin push **qo'shilmadi**. Sababi ochiq: uni to'g'ri yuborish uchun
VAPID kalitlari va shifrlash kutubxonasi kerak, ya'ni yangi bog'liqlik va yangi
sir. Bu bozorda esa Telegram xuddi shu ishni yaxshiroq bajaradi. Kerak bo'lsa —
ayting, alohida qo'shamiz.

---

## 5e. SMS, avtomatlashtirish va atributsiya (`/admin/flows`, `/admin/messages`)

Migratsiya `0010_sms_flows.sql`: `marketing_optouts`, `flows`, `flow_enrollments`,
`outbound_messages`, `campaigns.promo/link`, `integration_settings` kalit tekshiruvi
shaklga o'tdi (`sms.*` kalitlari uchun).

### Kanal: SMS (Eskiz.uz)

- `lib/sms/`: `SmsProvider.send(phoneE164, text)`; `EskizProvider` (`eskiz.ts`) —
  `POST /api/auth/login` (email+parol → bearer token, jarayonda keshlanadi, 401 da
  bir marta qayta login), `POST /api/message/sms/send` (`mobile_phone` 998XXXXXXXXX,
  `message`, `from` — default `4546`). 4xx qayta urinilmaydi, 5xx/429/tarmoq — urinadi.
  HTTP qismi soxta `fetch` bilan testlangan (`eskiz.test.ts`). Sozlanmagan bo'lsa
  provayder yo'q — SMS xabar «oʻtkazildi» (`sms_not_configured`), navbatda qolib ketmaydi.
- Sozlash: `/admin/integrations` → «SMS — Eskiz» (email, parol, yuboruvchi nomi —
  shifrlangan) + «Test SMS yuborish». Muqobil env: `ESKIZ_EMAIL/PASSWORD/SENDER`.
- Uzunlik: `lib/sms/segments.ts` — GSM-7 (160/153) yoki UCS-2 (70/67; kirill, ʻ).
  Muharrirlar qismlar sonini STOP qatori bilan birga ko'rsatadi. «ʻ → '» sozlamasi
  (`site_settings` `sms.transliterate`) lotin matnni GSM-7 da saqlaydi; tipografik
  belgilar (— « » …) har doim oddiysiga almashtiriladi.
- Lokal sinov: `SMS_FAKE=1` — hech narsa yuborilmaydi, jurnalga yoziladi. Live
  deploy'da (`GOVITA_PRODUCTION=1`) bayroq e'tiborga olinmaydi.

### Xabarlar navbati (outbox)

Har bir marketing xabari — `outbound_messages` qatori (kanal, telefon, matn, havola,
promo sozlamasi, flow/kampaniya, `dedupe_key` unikal, holat
`pending → sending → sent | failed | skipped`).

- **Telegram** — o'z navbati bor (`bot_jobs`, bot yetkazadi). Yuborish paytida qator
  `bot_jobs` ga beriladi va `bot_job_id` saqlanadi; «yetkazildi» o'sha yerdan o'qiladi.
  Telegram xabarida «Ochish» va «🔕 Bunday xabarlarni oʻchirish» tugmalari.
- **Ishchi** (`lib/messaging/worker.ts`) sayt jarayonida: har 60 s navbat, har 5 daqiqa
  oqimlar. `pg_try_advisory_xact_lock` + `FOR UPDATE SKIP LOCKED` bilan qatorni oladi
  (`sending`, `claimed_at`), tranzaksiyadan **tashqarida** yuboradi, holatni yozadi.
  Xato: 5 daq, 30 daq, uchinchisi yakuniy. Qulab tushganda `sending` da qolgan qator
  10 daqiqadan keyin `failed` («interrupted») — **qayta yuborilmaydi** (Eskiz allaqachon
  olgan bo'lishi mumkin). `POST /api/cron/messages` (CRON_SECRET) — xuddi shu tik.
- **Tungi vaqt**: 21:00–09:00 (Toshkent) hech qanday marketing SMS/Telegram ketmaydi —
  navbat 09:00 ga suriladi (yuborish paytida tekshiriladi, `quiet-hours.ts`).
- **Promokod** yuborish paytida beriladi (`issuePromoCode`, shaxsiy, bir martalik,
  `source` = `flow`/`campaign`, `campaign_id` = `flow-<id>`/`campaign-<id>`), qatorga
  oldin yoziladi — qayta urinish ikkinchi kod bermaydi. `{muddat}` — kod tugash vaqti.

### Rad etish (opt-out)

- Har SMS oxirida `STOP: govita.uz/s/<token>`; token 15 belgi, imzolangan, telefon
  ochiq ko'rinmaydi (`lib/messaging/tokens.ts`). `/s/<token>` → `/[locale]/stop/<token>`:
  ochishning o'zi hech narsani o'zgartirmaydi (havola preview'lari bor), bitta tugma
  bosilganda `marketing_optouts` ga yoziladi (kanal yoki «hammasi»).
- Navbatdagi xabarlar darhol `skipped`; oqimlar va kampaniyalar har yuborishdan oldin
  tekshiradi; «hammasi» yoki ikkala kanal rad etilsa oqimdan chiqariladi.
- SMS ga «STOP» deb javob berish (Eskiz inbound) hali ulanmagan.

### Avtomatlashtirish (flows)

Muddat **ishga tushgan paytdan** (savat vaqti, yetkazilish, oxirgi buyurtma) sanaladi.
Mijoz birinchi qadam vaqti kelganda va u yaqinda bo'lsa kiradi (savat — 2 kun, yetkazish
va kurs — 3 kun, qaytarish — 7 kun oyna): oqimni yoqish ikki yillik tarixga xabar
yubormaydi. Kirish `(flow_id, subject, cycle)` bo'yicha unikal. Telefon shart
(`visitors.phone9` — oldingi buyurtmadan; Telegram bog'lanishi ham telefon orqali);
anonim savat — faqat retarget eksporti.

| oqim (sukut: o'chiq) | ishga tushiruvchi | qadamlar |
|---|---|---|
| Tashlab ketilgan savat | `cart_abandoned` | 1 soat · 24 soat · 72 soat −7% kod (48 soat) |
| Birinchi xariddan keyin | `first_order_delivered` | yetkazilgan kuni maslahat · +7 kun test · +21 kun −10% (7 kun) |
| Kurs tugayapti | `course_ending` (`COURSE_DAYS`/`REORDER_LEAD_DAYS`) | −5 kun · tugash kuni |
| Qaytarish | `lapsed` | 60 kun · 75 kun −15% (72 soat) |
| Omborga keldi | `restock` | **ulanmagan, yoqib bo'lmaydi** — «omborga keldi» xabarini kutish ro'yxati yuboradi (`lib/notify/waitlist.ts`: Telegram → SMS outbox → operator). `enqueueRestockMessage()` (`lib/flows/restock.ts`) hech qayerdan chaqirilmaydi |

`checkout_dropped` triggeri bor (oqim ekilmagan), `birthday` — 3-bosqich.
Kanal: `telegram_then_sms` (ulangan bo'lsa Telegram, aks holda SMS), `telegram`, `sms`.
O'zgaruvchilar: `{ism} {savat} {summa} {mahsulot} {kod} {muddat} {havola}`.
Chiqish: mijoz anchor'dan keyin buyurtma bersa → `converted` (+ buyurtma id), har
tikda tekshiriladi; savat bo'shasa → `exited`. O'tib ketgan qadam keyingisi ham
kelgan bo'lsa yuborilmaydi (bir vaqtda bir nechta xabar yo'q).

### Atributsiya

Har xabardagi `{havola}` — qisqa `/r/<id>-<imzo>`: bosish qatorga yoziladi (preview
botlar sanalmaydi) va `utm_source=sms|telegram`, `utm_medium=flow|campaign`,
`utm_campaign=flow-<id>|campaign-<id>`, `utm_content=step-N` bilan sahifaga yo'naltiradi.
Buyurtma shu flow/kampaniyaga hisoblanadi, agar uning promokodi shu `campaign_id`
dan bo'lsa **yoki** `attribution.utmCampaign` shu kalit bo'lsa (`lib/messaging/stats.ts`).
`/admin/flows`, `/admin/campaigns`: yuborildi, yetkazildi, bosildi, buyurtma, tushum,
konversiya; oqimda alohida «qaytdi» (converted enrollments).

### Kampaniyalar

Segment sahifasidagi forma: kanal (Telegram / Telegram, boʻlmasa SMS / SMS),
`{havola}` sahifasi, har bir mijozga shaxsiy promokod. Hammasi o'sha navbatdan —
tungi vaqt, rad etish, STOP havolasi bir xil.

## 5f. Sodiqlik: keshbek, tavsiya, tugʻilgan kun, bannerlar A/B (`/admin/loyalty`)

Migratsiya `0011_loyalty_referral_ab.sql`. Sozlamalar — `site_settings`
`loyalty.rules` (bitta JSON, `lib/loyalty/model.ts` → `coerceLoyaltyRules`,
har maydon alohida standartga qaytadi). **Hammasi sukut boʻyicha oʻchiq.**
Baza boʻlmasa (`ORDERS_IN_DB` yoʻq) — dastur oʻchiq, nima boʻlishidan qatʼi nazar.

### Keshbek ballari

- **1 ball = 1 soʻm.** Balans saqlanmaydi: `loyalty_ledger` qatorlari yigʻindisi,
  muddat **dangasa** baholanadi (`lib/loyalty/ledger.ts` → `evaluateLedger`, sof,
  testli). Musbat qator — «lot» (oʻz tugash sanasi bilan), manfiy qator birinchi
  tugaydigan lotdan oladi; tugash sanasida lotda qolgani yoʻqoladi; ortiqcha
  sarf — qarz, keyingi lot avval uni yopadi. `expire` qatorlari faqat buxgalteriya:
  ishchi soatiga bir marta (`messaging/worker.ts` → `expirePoints`) yozadi, shunda
  oddiy SQL yigʻindisi ham, «majburiyat» ham toʻgʻri.
- **Berish**: admin holatni «Yetkazildi» qilganda (forma ham, tez tugmalar ham —
  `app/admin/_actions/orders.ts` → `afterOrderStatus`) toʻlangan mahsulot summasidan
  (chegirma va balldan keyin, yetkazishsiz) `earnPercent`%; `minOrder` dan past —
  yoʻq. Bitta buyurtma bir marta (`unique (order_id) where kind='earn'`).
- **Bekor qilish**: buyurtmaga bogʻlangan har musbat qator (keshbek, tavsiya
  mukofoti) qaytarib olinadi (muddati oʻtgan qismi ikki marta olinmaydi —
  `reversibleAmount`), ishlatilgan ball yangi lot boʻlib qaytariladi. Har qator
  bir marta (`unique (ref_id) where kind in ('reverse','expire')`). Qayta ochilgan
  buyurtma ballarni qayta hisoblamaydi (atayin — qoʻlda tuzatish bor).
- **Ishlatish faqat SMS kod bilan** (har kim boshqa raqam yozishi mumkin):
  savatda toʻliq telefon kiritilgach balans soʻraladi; >0 boʻlsa «Sizda N ball
  bor — Ishlatish» → 6 xonali kod (`lib/loyalty/otp-server.ts`). Tranzaksion: tungi
  vaqt va rad etish taʼsir qilmaydi, outbox emas — toʻgʻridan-toʻgʻri shlyuzga.
  Limit: 3 kod / telefon / soat (jadvalda, bir nechta mashinada ham), 10 / IP / soat,
  tekshirish 30 / IP / 10 daq. Jadvalda faqat HMAC (`LOYALTY_SECRET`, boʻlmasa
  `ADMIN_SESSION_SECRET` dan alohida yorliq bilan), telefonga bogʻlangan, 5 daqiqa,
  5 urinish (5-urinish ham tekshiriladi, keyin «tugadi»). Toʻgʻri kod →
  30 daqiqalik imzolangan token (telefon + balans chegarasi), savat holatida
  (xotirada). SMS sozlanmagan boʻlsa — ishlatish yashirin, berish davom etadi.
- **Buyurtmada** (`promo/server.ts` → `placeOrder`, oʻsha telefon qulfi ostida):
  token qayta tekshiriladi, balans qayta oʻqiladi, summa = min(balans, chegirmalardan
  keyingi mahsulot × `maxSharePercent`%, token chegarasi) — `maxRedeemable`;
  `redeem` qatori va `adjustments` oxiriga `{kind:"points",amount}`. **Ball —
  toʻlov, chegirma emas**: promokod/birinchi buyurtma bilan qoʻshiladi (ulardan
  keyin), `totals.total` ni kamaytiradi, `totals.discount` ni emas. Token eskirgan
  yoki balans 0 — `points_invalid`, savat ballarni olib tashlab aytadi.
- **Mijoz koʻradi**: savatda «Yetkazilgach +N ball»; muvaffaqiyat sahifasida
  (buyurtma action'i imzolagan `?k=` kvitansiya — `lib/loyalty/receipt.ts`;
  raqamlar ketma-ket, shuning uchun sahifa mijozni raqam boʻyicha qidirmaydi);
  klub botida «qabul qilindi» xabarida «Hisobingizga N ball tushadi (yetkazilgach)»,
  «yetkazildi» da «N ball tushdi. Balans: M». `/loyalty` — faqat yoqilgan qoidalar,
  sozlamadagi raqamlar bilan.

### Tavsiya (doʻstni taklif qilish)

- Kod: `GV` + 6 belgi (chiziqsiz — promokod `GV-XXXXXX`), `referral_codes`, mijozda
  **yetkazilgan buyurtma boʻlgandan keyin** birinchi soʻralganda yaratiladi.
  Mijoz kodini muvaffaqiyat sahifasida (nusxalash / ulashish, havola `?ref=KOD` —
  `ReferralCapture` savatdagi promokod maydoniga yozadi) va «yetkazildi» Telegram
  xabarida oladi.
- Doʻst kodni promokod maydoniga yozadi: `isReferralCode` + mavjud boʻlsa tavsiya
  yoʻli (`lib/referral/`), aks holda oddiy promokod. Shartlar (`evaluateReferral`):
  dastur yoqilgan, oʻz kodi emas (bir xil telefon), telefonning bekor qilinmagan
  oldingi buyurtmasi yoʻq, shu telefonga tirik tavsiya yoʻq. Chegirma `friendPercent`%
  — promokod kabi birinchi buyurtma chegirmasi bilan raqobatlashadi (kattasi;
  teng — birinchi buyurtma), `adjustments` da `{kind:"referral",code,percent,amount}`.
  Tavsiya qatori (`referrals`) chegirma yutmasa ham yoziladi — doʻst kod bilan keldi.
- Doʻst buyurtmasi **yetkazilganda** taklif qilganga mukofot (`rewardReferral`):
  keshbek yoqilgan va «Ball» tanlangan boʻlsa — ball (`adjust`, buyurtmaga bogʻlangan,
  bekor qilinsa qaytariladi), aks holda shaxsiy promokod (`issuePromoCode`, source
  `referral`, 60 kun). Xabar outbox orqali (Telegram, boʻlmasa SMS). Oylik limitdan
  oshsa — `capped`, mukofot yoʻq. Doʻst buyurtmasi yetkazilmay bekor qilinsa —
  `cancelled`, telefon yana tavsiya qilinishi mumkin.

### Tugʻilgan kun

- `/profile` da (yoqilgan boʻlsa) aniq rozilik: ism, kun/oy (yil ixtiyoriy),
  telefon → `customer_birthdays`. «Rozilikni bekor qilish» qatorni oʻchiradi.
  Maxfiylik siyosatida (1- va 6-boʻlim) yozilgan.
- Trigger `birthday` (`lib/flows/triggers.ts`): langar — tugʻilgan kundan
  `daysBefore` kun oldingi Toshkent yarim tuni, `cycle` = yil (yiliga bir marta),
  29-fevral boshqa yillarda 28-fevral. **Faqat avval buyurtma bergan raqamlar** —
  rozilik raqam egaligini isbotlamaydi, tabrik begonaga SMS yoʻli boʻlmasin.
  Oqim «Tugʻilgan kun» (−15%, 10 kun) **oʻchiq** holda yaratiladi.

### Bannerlar A/B testi

- Bir joydagi ikki banner bitta `experiment` kaliti bilan `A` va `B`
  (`banners.experiment/variant`, unikal). Ikkalasi faol boʻlsa sayt ularni bitta
  slot qiladi; bittasi qolsa — oddiy banner.
- **ISR va nol CLS**: `middleware.ts` har brauzerga tasodifiy `gv_ab` cookie
  beradi; sahifa HTML'ida **ikkala** variant bor (hamma uchun bir xil, kesh
  buzilmaydi), CSS sukut boʻyicha B ni yashiradi; `<head>` dagi kichik inline
  skript (`abHeadScript`, layout faol kalitlar bilan chizadi) cookie'dan
  variantni hisoblab `<html data-ab="kalit:B">` qoʻyadi — **birinchi chizishdan
  oldin**, shuning uchun hech narsa siljimaydi va React aynan server yuborgan
  HTML'ni gidratlaydi (`<html suppressHydrationWarning>`). Taqsimot —
  FNV-1a + aralashtirish, `ab.test.ts` skript va server funksiyasi bir xilligini tekshiradi.
- Koʻrish: slot mount boʻlgach `trackExperimentView` — GA4 `view_promotion` va
  `POST /api/b/:id?kind=view`, sessiyada bir marta; serverda kishi (`gv_ab`) ×
  banner × kun boʻyicha bitta qator (`banner_exposures`), `gv_vid` boʻlsa yoziladi.
  Bosish — odatdagi beacon, oʻsha qatorga `clicked_at`.
- Admin (`/admin/storefront` → «A/B testlar»): koʻrish, kishilar, bosish, CTR,
  koʻrgan brauzerlarning keyingi buyurtmalari va tushumi (`orders.visitor_id`),
  ikki ulushli z-test (95%); har variant ≥ 200 koʻrish va ≥ 10 bosishgacha
  «Hali yetarli maʼlumot yoʻq». «Gʻolibni qoldirish» ikkinchisini oʻchiradi.
  Ro'yxatda «A/B test» tugmasi bannerdan B variantni boshlaydi.

## 6. Tekshirish ro'yxati

Deploy qilgandan keyin:

- [ ] `/uz/profile` ochiladi, maqsad tanlanadi, oila a'zosi qo'shiladi
- [ ] Oila a'zosiga bugungi sanani qo'ying → eslatmalar panelida "Bugun" chiqadi
- [ ] Bosh sahifadagi obuna formasiga pochta yozing → **tasdiqlash xati** keladi
- [ ] Havolani bosing → `/email/preferences?status=confirmed` va **welcome** xati
- [ ] Xat pastidagi "Obunani bekor qilish" → darhol bekor bo'ladi, savol so'ramaydi
- [ ] Checkout'da pochta yozib buyurtma bering → buyurtma tasdig'i keladi
- [ ] `/profile` da pochtani yozib "Pochtani tasdiqlash" → havola keladi, bosilgach
      `status=verified`
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
| promokodlar va `issuePromoCode()` (avtomatik xabar, referal, tugʻilgan kun kodi shu yerdan olinadi) | `src/lib/promo/server.ts`; qoidalar — [`ADMIN.md`](ADMIN.md#promokodlar) |
| cron | `src/app/api/cron/marketing/route.ts` |
| SMS provayder (Eskiz), qismlar hisobi | `src/lib/sms/` |
| navbat, ishchi, tungi vaqt, rad etish, havolalar, natijalar | `src/lib/messaging/` |
| avtomatlashtirish (oqimlar, triggerlar, `enqueueRestockMessage`) | `src/lib/flows/` |
| xabarlar ishchisi tiki | `src/app/api/cron/messages/route.ts` |
| qisqa havola / STOP | `src/app/r/[token]`, `src/app/s/[token]`, `src/app/[locale]/stop/[token]` |
| navbat (kim, qachon) | `backend/app/routers/marketing.py` |
| profil API | `backend/app/routers/profile.py` |
| obunalar API | `backend/app/routers/subscriptions.py` |
