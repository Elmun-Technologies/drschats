# Ona va bola parvarishi — reja, algoritm, ma'lumot modeli

Holat (2026-11-23): **2-bosqich ishga tushdi — mehmon rejimi.** `/care/mom` va `/care/baby` saytda; kuzatuv faqat brauzerda (`govita-care`), serverga hech narsa yozilmaydi. 3–6-bosqichlar (hisob, eslatmalar, 0–3 mahsulotlar, shifokor/huquqiy tasdiq) — kutilmoqda. Bu fayl — shu yo'nalishning yagona manbai;
qaror o'zgarsa shu yerda yangilanadi.

## Maqsad

Ayolni **homiladorlikdan** boshlab, bolani **3 yoshigacha** (birinchi 1000 kun + undan keyingi yil) kuzatuvga olish:
bosqichga mos reja, eslatma va **oylik podpiska qutisi**. Sayt navigatsiyasi sog'liq maqsadlariga qurilgani uchun
(CLAUDE.md) bu ikki sahifa menyuda va bosh sahifada ko'zga tashlanib turadi.

Egasi qarorlari (2026-11-23):

| Savol | Qaror |
|---|---|
| Model | **Bepul kuzatuv + pullik podpiska qutisi** (mavjud Subscribe & Save asosida) |
| 0–3 yosh mahsulotlari | **Dr. Frei / Swiss Energy 0–3 qatori qo'shiladi** (egasi narx-list va MXIK beradi) |
| Tibbiy nazorat | **Shifokor/pediatr matnni ko'radi**, ismi saytda ko'rsatiladi |
| Ma'lumot | **Hisob + baza, aniq rozilik bilan**, o'chirish tugmasi |

## Ikki sahifa

- **`/care/mom` — «Men uchun»**: ayolning o'z parvarishi. Homiladorlik haftasi (1–40+), trimester, tug'ruqdan keyingi
  davr va emizish. Ichida: shu haftada nima muhim, savol-javob, mahsulot qutisi.
- **`/care/baby` — «Bola uchun»**: bola 0–3 yosh. Yoshga mos bosqich, ovqatlanish bosqichlari, vitamin/qo'shimchalar,
  shifokor ko'riklari eslatmasi.
- Ikkalasi bitta **sayohat** (`journey`): homiladorlik tug'ilish sanasi bilan bola sayohatiga o'tadi, ona esa
  «tug'ruqdan keyingi» bosqichga. Foydalanuvchi qaytib kelganda aynan o'z bosqichiga tushadi.

## Algoritm (sof funksiyalar, `lib/care/`, testli — `lib/profile/reminders.ts` uslubida, `now` argument)

### 1. Bosqichni aniqlash

```
anchor:  EDD (taxminiy tug'ilish sanasi)  yoki  LMP (oxirgi hayz)  yoki  bolaning tug'ilgan sanasi
LMP     = EDD − 280 kun
hafta   = floor((bugun − LMP) / 7)

homiladorlik:  1–13 → T1 · 14–27 → T2 · 28–42 → T3
tug'ruqdan keyin (ona):  0–6 hafta · 2–6 oy · 6–12 oy (emizish bayrog'i bilan)
bola (kunlar/oylar):  yangi tug'ilgan 0–28 kun · 1–3 oy · 3–6 · 6–9 (qo'shimcha ovqat boshlanishi) · 9–12 · 12–24 · 24–36
```

- Bosqich saqlanmaydi, **har so'rovda hisoblanadi** (sana o'zgarsa hamma narsa o'zi to'g'rilanadi).
- Muddatidan oldin tug'ilgan bola uchun `gestationalWeeks` maydoni (ixtiyoriy) — bosqich «tuzatilgan yosh» bo'yicha.
- Tug'ilish sanasi kiritilgan zahoti homiladorlik sayohati yopiladi, bola sayohati ochiladi.

### 2. Kontent bosqichga bog'lanadi

Har bosqich: `checklist` (shifokor ko'rigi, tahlillar eslatmasi — raqamlar yo'q, «shifokor belgilagan muddatda»),
`nutrition` (JSST/Sog'liqni saqlash vazirligi manbalari asosida), `faq`, `warnSigns` («shifokorga zudlik bilan murojaat qiling»).
Hammasi `uz` + `ru`, **shifokor tasdig'idan o'tmaguncha sahifa yopiq** (`CARE_ENABLED` bayrog'i).

### 3. Mahsulot ↔ bosqich moslashuvi (qat'iy)

Mahsulot bosqichga **faqat jadvalda yozilgan bo'lsa** chiqadi (`careFit`: slug → `{ audience, fromWeek|fromMonth, toMonth, source }`),
hech qachon taxmin bilan emas. `source` — qadoqdagi yosh/qo'llash cheklovi. Misollar: Prenatal Forte → homiladorlik T1–T3 + emizish;
Dr. Frei Kids → faqat 7+ yosh (0–3 bosqichda **chiqmaydi**). Mos mahsulot bo'lmasa bosqichda halol yoziladi:
«Bu yoshga katalogimizda qo'shimcha yo'q — pediatr bilan maslahatlashing». Quiz'dagi `audience-fit` qoidasi bilan bir xil tamoyil.

### 4. Podpiska qutisi

```
box(journey, now) → { items[], nextShipAt, changesAt? }
```

- Tarkib `careFit` + bosqichdan; 1 quti ≤ 4 mahsulot; narx mavjud `subscriptionPricing` (−10% birinchi, −15% keyingi — `/admin/commerce`).
- Oraliq: 30 kun (standart), to'xtatish/o'tkazib yuborish/bekor — mavjud `/account/subscriptions` (`subscriptions` jadvali, 0017).
- **Bosqich o'zgarsa tarkib o'zi o'zgarmaydi**: yetkazishdan 7 kun oldin xabar («T2 → T3: qutida o'zgarish taklif qilinadi») va mijoz
  tasdiqlamaguncha eski tarkib qoladi. Yangi mahsulotni mijoz bilmasdan qo'shish yo'q.
- **To'xtatish shartlari** (quti yuborilmaydi, operatorga ro'yxat): mijoz «dori qabul qilaman / allergiya / asorat» belgilagan;
  tug'ilish sanasi yaroqsiz; mahsulot ombor yo'q (almashtirish taklifi, jimgina emas).

### 5. Eslatmalar

Mavjud kanallar: Telegram klub boti (`bot_jobs`), buyurtma/xabar navbati `queueMessage`, SMS qoidalari (`sms_marketing_consents`,
18:00–09:00 yuborilmaydi, STOP). Eslatma turlari: haftalik «bu hafta», shifokor ko'rigi, quti yaqinlashmoqda, bosqich o'zgardi.
Reklama SMS faqat alohida rozilik bilan; tibbiy eslatma Telegram yoki tranzaksion.

## Ma'lumot modeli (migratsiya `0038_care.sql`, faqat kengaytiradi)

- `care_journeys` — `id`, `customer_phone9` (yoki Telegram chat id), `kind` (`pregnancy` | `child`), `anchor_date`, `anchor_kind`
  (`edd`|`lmp`|`birth`), `gestational_weeks?`, `child_name?`, `parent_journey_id?`, `consented_at`, `created_at`, `deleted_at?`
- `care_flags` — `journey_id`, `medication`, `allergy`, `complication` (faqat bayroq, matn yo'q: minimal ma'lumot)
- Kirish: mavjud «Telegram orqali kirish» (`gv_customer`, 0033) yoki telefon OTP. Mehmon rejimi — bosqichni ko'rish (sana brauzerda).
- **Minimal yig'ish**: ism ixtiyoriy, bola uchun faqat tug'ilgan sana; sog'liq tashxislari yig'ilmaydi.
- `/account` → «Ma'lumotlarimni o'chirish» (mavjud `customer_birthdays` kabi), audit'ga yoziladi.

## Xavflar (muhimlik tartibida)

1. **Shaxsiy ma'lumot qonuni.** Homiladorlik va bola sanasi — sog'liq ma'lumoti. «Shaxsiy ma'lumotlar to'g'risida»gi qonun aniq rozilik,
   ro'yxatdan o'tish (pd.gov.uz — SMS yuboruvchi uchun allaqachon kerak) va ma'lumotni O'zbekiston hududida saqlashni talab qilishi mumkin;
   hozirgi hosting Hetzner (chet el). **Ishga tushirishdan oldin huquqshunos tasdig'i shart** — shu sababli `CARE_ENABLED` bayrog'i.
2. **Tibbiy javobgarlik.** Bosqich matnlari faqat shifokor tasdig'idan keyin; da'volar `claims.ts` (davolaydi/oldini oladi yo'q);
   har sahifada «BAD — dori vositasi emas» va ogohlantiruvchi belgilar bloki.
3. **Mahsulot bo'shlig'i.** 0–3 yosh uchun mahsulot yo'q; egasi narx-list va MXIK berguncha podpiska qutisi faqat Prenatal Forte bilan ishlaydi,
   bola sahifasi kuzatuv + eslatma sifatida chiqadi (qutisiz).
4. **Ishonch.** Yashirin avtomatik to'lov va «jimgina» tarkib o'zgarishi — shikoyat va chargeback. Yuqoridagi tasdiqlash qoidasi shu uchun.
5. **Taxminiy muddat xatosi.** EDD/LMP noto'g'ri kiritilsa hafta noto'g'ri; ekranda doim «taxminiy, shifokor muddatiga qarang».

## Kodda qayerda

- Sof mantiq: `src/lib/care/stages.ts` (hafta = tugallangan haftalar, tugʻish sanasi = 40-hafta; yosh oyda; 7 bosqich), `storage.ts` (localStorage, tozalash), `content.ts` (uz/ru matn, mahsulot slug'lari, `{first}`/`{recurring}` — foizlar `/admin/commerce` dan). Testlar: `stages.test.ts`, `content.test.ts` (daʼvolar, apostrof, katalogda bor slug, mavzu havolalari, uz/ru shakli).
- UI: `components/care/` — `CareTemplate` (server), `CareTracker`, `BoxPanel` (Prenatal Forte podpiska, oraliq tanlash), `KitBuilder` (aptechka: oddiy yigʻindi, oʻylab topilgan chegirma yoʻq).
- Koʻrinish: desktop kategoriya qatorida 2 ta sariq pill (`CARE_LINKS`), `HEALTH_LINKS` orqali katalog menyusi, mobil menyu va footer, bosh sahifada `HomeCare` (kategoriyalar ostida), sitemap (priority 0.8), audit roʻyxati.
- Shifokor kartasi **chizilmaydi**, toki haqiqiy ism berilmaguncha.

## Bosqichlar

| # | Ish | Chiqish |
|---|---|---|
| 0 | Reja + **dizayn** (Claude Design), egasi tasdiqlaydi | shu fayl, dizayn artifakt |
| 1 | `lib/care/` sof mantiq + testlar, `careFit` jadvali, migratsiya | testli engine, UI yo'q |
| 2 | `/care/mom`, `/care/baby` sahifalari (mehmon rejimi, bayroq ostida) | V3 dizayn bo'yicha, audit nolda |
| 3 | Rozilik, kirish, saqlash, o'chirish | akkaunt ichida kuzatuv |
| 4 | Eslatmalar (Telegram/SMS) | bosqich xabarlari |
| 5 | Podpiska qutisi + 0–3 mahsulotlar | quti, tasdiqlash oqimi |
| 6 | Shifokor tasdig'i, huquqiy tasdiq → `CARE_ENABLED` yoqiladi | ishga tushirish |

## Ochiq savollar (egasi)

- Shifokor/pediatr kim (ism, mutaxassislik, rozilik)? Matn qoralamasini unga yuboramiz.
- Dr. Frei / Swiss Energy 0–3 qatorining narx-listi va MXIK kodlari.
- Huquqshunos: ma'lumotni O'zbekistonda saqlash talabi va pd.gov.uz ro'yxati holati.
- Nomlar: «Men uchun» / «Bola uchun» (taklif) — yoki boshqa.
