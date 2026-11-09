# Reja: jalb qilish — animatsiya va tavsiya algoritmi (2026-11)

Maqsad: saytga kirgan odam ko'proq mahsulot ko'rsin, ko'proq savatga qo'shsin va qaytib kelsin.
Bu reja **konversiya va qaytish** haqida. Trafikning o'zini (oyiga 100–200 ming tashrif)
SEO, kontent, reklama va Telegram olib keladi (§6). Ikkalasi birga ishlaydi: jalb qilmaydigan
saytga trafik olib kelish — pulni tashlab yuborish.

Har bosqich alohida PR. **Bosqichlar faqat foydalanuvchi aytganda, bittadan.**

---

## 0. Hozirgi holat (kod bo'yicha, 2026-11-09)

**Tavsiyalar** (`lib/personalization/`):
- Faqat brauzerda (`govita-user`, localStorage): oxirgi 50 ta ko'rilgan mahsulot va xaridlar.
- Ball = reyting × 1.5 + kategoriyaga qiziqish × 4 (7 kunlik yarim yemirilish) + o'xshash narx
  + ko'rilgan bo'lsa −3, sotib olingan bo'lsa −5.
- **Zaif joylar:**
  1. Reyting hamma joyda 0 (haqiqiy sharh hali yo'q), ya'ni sifat signali ishlamaydi.
  2. Faqat **kategoriya** hisobga olinadi. Ingredient va sog'liq maqsadi hisobga olinmaydi
     (`catalogue.ts` da bor, lekin tavsiyaga ulanmagan).
  3. Barcha signallar teng: oddiy ko'rish va savatga qo'shish bir xil og'irlikda.
  4. «Mashhur» saralash = `inStock`, keyin `reviewCount` (0), ya'ni amalda qo'lda tuzilgan tartib.
     Serverda haqiqiy ma'lumot bor (`visitor_events`, `orders`), lekin u ishlatilmaydi.
  5. «Birga olinadi» yo'q. PDP faqat o'sha kategoriya va auditoriyadagi mahsulotlarni ko'rsatadi.
  6. Yangi tashrif buyuruvchi (tarixi yo'q) hammaga bir xil ro'yxatni ko'radi. Qaysi reklama
     yoki kalit so'zdan kelgani hisobga olinmaydi.
  7. Tavsiya ishlayaptimi — o'lchanmaydi: rail ko'rsatilgani va bosilgani hodisa sifatida yozilmaydi.

**Animatsiya:**
- `Reveal` (bitta IntersectionObserver, CSS).
- framer-motion 9 ta komponentda: drawer, toast, modal, quiz, popup, upsell.
- CSS'da 4 ta `@keyframes`: `marquee`, `pagein`, `hero-slide-in`, `reveal-in`.
- Bitta easing tokeni (`--ease-out-expo`). Davomiylik tokeni yo'q: har komponent o'zinikini tanlagan.
- Mikro-interaksiyalar yo'q: savatga qo'shilganda ikonka, yurak, son o'zgarishi.

---

## 1. Tamoyillar (o'zgarmas)

1. **Faqat real ma'lumot.** «N kishi ko'ryapti», soxta «Xit», o'ylab topilgan son yo'q.
   «Ko'p sotilmoqda» belgisi faqat haqiqiy buyurtma soni chegaradan oshganda chiqadi (§4.4).
2. **Tezlik — SEO.** Animatsiya faqat `transform`/`opacity` bilan. Birinchi ekran hech qachon
   yashirilmaydi (LCP). Shaxsiy blok joyini oldindan egallaydi (CLS = 0). INP < 200 ms.
3. **`prefers-reduced-motion`** — barcha harakat o'chadi, holat o'zgarishi esa ko'rinib qoladi.
4. **Audit nolda qoladi** (kontrast, tap-target, fokus, overflow, hydration).
5. **Shaxsiy ma'lumotsiz.** Tavsiya anonim `gv_vid` va brauzer profili bilan ishlaydi. Telefon,
   ism va manzil algoritmga kirmaydi. Cookie roziligi bo'lmasa server hech narsa yozmaydi
   (hozirgi qoida). Brauzer profili baribir ishlaydi: u qurilmadan chiqmaydi.
6. **Sahifalar keshda qoladi (ISR).** Shaxsiylashtirish faqat klient «orolchalari»da bo'ladi,
   sahifa butunligicha dinamik qilinmaydi.
7. **Tibbiy va'da yo'q** — tavsiya matnlari ham shunga kiradi («Nega bu?» = ingredient yoki maqsad nomi).

---

## 2. Bosqich A — animatsiya auditi va tuzatish

**A1. Audit** (Playwright, 1440 va 390):
- har sahifa yuklanishi, menyu, drawer, filtr, quiz, savat va checkout;
- o'lchanadi: CLS, uzun vazifalar (> 50 ms), «sakrash» va «miltillash» (skrinshot ketma-ketligi),
  `prefers-reduced-motion` holati;
- natija: muammolar ro'yxati, har birida «qayerda — nima — qanday tuzatiladi».

**A2. Motion tokenlari** (`globals.css`):
- davomiylik: `--dur-1: 120ms` (bosish), `--dur-2: 200ms` (hover, toggle),
  `--dur-3: 320ms` (drawer, sheet), `--dur-4: 480ms` (sahifa ichidagi katta o'tish);
- easing: `--ease-out-expo` (bor), `--ease-standard`, `--ease-spring`
  (savatga qo'shish uchun yengil «tepish»);
- framer-motion uchun bitta `lib/ui/motion.ts` (shu qiymatlarning JS nusxasi): har komponentdagi
  qo'lda yozilgan `duration: 0.3` o'rniga shu ishlatiladi.

**A3. Tuzatish:** audit ro'yxatidagi har band va mavjud animatsiyalarni tokenlarga o'tkazish.

---

## 3. Bosqich B — mikro-interaksiyalar (sayt «tirik» bo'lishi)

Muhimligi bo'yicha. Har biri kichik, CSS-first; JS faqat kerak bo'lsa.

| # | Joy | Nima | Nega |
|---|---|---|---|
| B1 | «Savatga» tugmasi | bosilganda tugma ✓ ga aylanadi (300 ms), header/tab bar'dagi savat ikonkasi «tepadi», son yangilanadi | qo'shildi degan ishonch, eng ko'p bosiladigan harakat |
| B2 | Savat stepper | son o'zgarganda raqam vertikal suriladi, jami narx silliq yangilanadi | narx «sakramaydi» |
| B3 | Yurak (sevimli) | bosilganda kichik «pop» va rang bilan to'lish | — |
| B4 | Bepul yetkazish chizig'i | chegaraga yaqinlashganda chiziq silliq to'ladi, yetganda bir marta sariq nuqta chiqadi | ko'proq qo'shishga undaydi (real chegara `/admin/commerce` dan) |
| B5 | Mahsulot kartasi | hover'da rasm 1.03 ga kattalashadi, karta soyasiz ko'tariladi (desktop); telefonda bosilganda 0.98 | «bosiladigan» ekani seziladi |
| B6 | Mobil tab bar | faol tab ostida indikator suriladi, savat soni o'zgarganda tepadi | — |
| B7 | Galereya (PDP) | rasm almashganda crossfade, telefonda barmoq bilan surish | — |
| B8 | Quiz | savollar orasida yo'nalishli o'tish, progress silliq to'ladi, natija kartalari ketma-ket chiqadi | testni oxirigacha o'tish ko'payadi |
| B9 | Skeleton | shaxsiy rail yuklanayotganda shu o'lchamdagi tinch skeleton (shimmer emas) | CLS 0 |
| B10 | Sahifa o'tishi | View Transitions API (qo'llab-quvvatlanadigan brauzerda): kartadagi rasm PDP rasmiga «uchadi»; qolganida oddiy o'tish | premium tuyg'u. **Tajriba**: oldin bitta yo'lda, audit va INP bilan tekshiriladi |

**Qilinmaydi:** parallax, avtomatik ijro etiladigan video fon, konfetti, «tirik sotuvlar» toast'i
(soxta bo'lsa), har bir blokda scroll-animatsiya (bezovta qiladi va sekinlashtiradi).

---

## 4. Bosqich C — tavsiya algoritmi v2

### 4.1 Javob: «har kirganda o'sha mahsulotni ko'radimi yoki boshqasini?»

Ikkalasi ham, lekin aralashma **qiziqish darajasiga qarab** o'zgaradi:

| Kim | Bosh sahifada nima ko'radi |
|---|---|
| **Yangi** (tarix yo'q) | kelgan manbaiga mos javon (UTM/reklama kampaniyasi, `/lp/…`, qidiruv so'zi: «imunitet» bilan kelgan — immunitet mahsulotlari birinchi), keyin **haqiqiy mashhurlar** (§4.4) |
| **Qaytgan** (ko'rgan, lekin olmagan) | «Davom eting» — ko'rgan mahsulotlari (eng kuchli qiziqish birinchi), keyin «Siz uchun» — o'xshash ingredient va maqsadlar, **ko'rmaganlari** |
| **Savatini tashlab ketgan** | savat bloki birinchi («Savatingizda 2 ta mahsulot qoldi») |
| **Xaridor** | **qayta buyurtma vaqti kelganlar** (30 kunlik qadoq ~25-kunda — `reminders.ts` qoidasi bor), keyin olganlariga qo'shimcha (birga olinadiganlar). Olgan mahsuloti qayta buyurtma vaqtigacha tavsiyada chiqmaydi |

Bitta tashrif ichida ham moslashadi: 3 ta mahsulot ko'rilgach, qolgan rail'lar shu qiziqishga buriladi.

### 4.2 Qiziqish darajasi — signallar va og'irliklar

Har hodisa mahsulotga, uning kategoriyasiga, ingredientlariga va sog'liq maqsadlariga ball qo'shadi:

| Signal | Og'irlik |
|---|---|
| kartani ko'rdi (impression) | 0 (faqat o'lchash uchun) |
| PDP ochdi | 1 |
| PDP'da ≥ 20 s qoldi yoki galereya/tarkibni ochdi | +1 |
| sevimlilarga qo'shdi / taqqosladi | 3 |
| savatga qo'shdi | 5 |
| savatdan olib tashladi | −2 |
| sotib oldi | 8 → keyin shu mahsulot «qayta buyurtma» rejimiga o'tadi |
| quiz javobi / profil maqsadi | maqsad bo'yicha 4 (o'zi aytgan — kuchli) |

Vaqt bilan yemiriladi: 7 kunlik yarim yemirilish (hozirgi), xarid uchun — qadoq muddati.

### 4.3 Ball formulasi (gibrid)

```
ball(p) = 0.40 · shaxsiy_moslik(p)        // ingredient + maqsad + kategoriya, §4.2 signallaridan
        + 0.25 · birga_olinadi(p | savat, ko'rilganlar)   // §4.4 juftliklar
        + 0.20 · mashhurlik(p)            // §4.4, trend bilan
        + 0.10 · yangilik/kashfiyot(p)    // kam ko'rsatilgan yangi SKU
        + 0.05 · biznes(p)                // haqiqiy chegirma, bugungi taklif
  filtrlar: sotuvda, core, auditoriyaga mos (bola/homilador/erkak — audience-fit),
            savatdagi va qayta buyurtmagacha olinganlar chiqmaydi
  xilma-xillik: bir rail'da bitta kategoriyadan ≤ 2 ta (MMR)
```

Og'irliklar boshlang'ich qiymat. A/B (§5) natijasiga qarab sozlanadi va `/admin/commerce` da
o'zgartiriladigan qilinadi. Ma'lumot kam bo'lsa (sovuq start: < 200 buyurtma) mashhurlik
va juftliklar o'z-o'zidan kontentga asoslangan moslikka tushadi. Bo'sh rail hech qachon chiqmaydi.

**Kashfiyot (exploration):** har 8 ta joydan 1 tasi kam ko'rsatilgan mahsulotga beriladi.
Aks holda yangi SKU hech qachon ko'rinmaydi va ma'lumot yig'ilmaydi.

### 4.4 Server signallari (yangi)

- **Migratsiya `00NN_product_signals.sql`**:
  - `product_signals` — mahsulot bo'yicha 7 va 30 kunlik: ko'rish, savat, buyurtma,
    konversiya, trend (7 kun ÷ 30 kun);
  - `product_pairs` — juftliklar: bitta buyurtmada (og'irlik 3) yoki bitta sessiyada
    savatga qo'shilgan (2), ketma-ket ko'rilgan (1). Lift bilan normallashtiriladi, toki
    mashhur mahsulot hamma joyda chiqmasin.
- **Hisoblash:** jarayon ichidagi ishchi (`instrumentation.ts`, xabar ishchisi kabi), soatda bir
  marta, bitta SQL agregatsiya bilan. Natija keshlanadi (`revalidateFromWorker`, tag `signals`).
- **Saytga:** `GET /api/reco/signals` — kichik statik JSON (~100 SKU × bir necha son), CDN keshida.
  Klient uni o'z profili bilan birlashtiradi. Server har kim uchun alohida hisoblamaydi, shuning
  uchun 200 ming tashrif ham arzon.
- **«Mashhur» saralash** endi `product_signals` dan. Haqiqiy ma'lumot bo'lmasa — hozirgi tartib.
- **Belgi:** «Ko'p sotilmoqda» faqat 30 kunda ≥ N buyurtma bo'lsa. N `site_settings` da,
  standart 10.

### 4.5 Rail'lar va joylashuvi

| Sahifa | Rail | Manba |
|---|---|---|
| Bosh | Davom eting · Siz uchun · Qayta buyurtma vaqti · Mashhur (trend) | shaxsiy + server |
| PDP | Birga olinadi (juftliklar; bo'lmasa — mos ingredient) · O'xshash (hozirgi) · Yaqinda ko'rilgan | server + kontent |
| Savat | Savatga qo'shimcha (juftliklar) · bepul yetkazishgacha yetadiganlar (`gap.ts`, bor) | server |
| Katalog | «Siz uchun» saralash varianti (faqat tarix bor bo'lsa) | shaxsiy |
| Qidiruv (0 natija) | so'zga eng yaqin mavzu + mashhurlar | kontent + server |
| 404 | mashhurlar | server |

Har rail'da kichik «Nega?» izohi: «Siz ko'rgan Magniy B6 bilan ko'p olinadi»,
«Tarkibida D3 bor». Faqat haqiqiy sabab yoziladi.

---

## 5. Bosqich D — o'lchash (busiz algoritm — taxmin)

- **Yangi hodisalar** (`lib/analytics/events.ts` orqali — qoida):
  - `rec_impression {rail, slugs[], variant}` — rail ko'rinishga kirganda, bir marta;
  - `rec_click {rail, slug, position, variant}`.

  `VISITOR_EVENT_TYPES` ga qo'shiladi, GA4 da esa `view_item_list` / `select_item` bilan
  `item_list_id` sifatida ketadi.
- **A/B:** mavjud `gv_ab` cookie (`lib/merch/ab.ts`). Variant A — hozirgi algoritm, B — v2.
  50/50, kamida 2 hafta yoki har variantda 1 000 sessiya.
- **Metrikalar:** rail CTR, «rail'dan savatga» ulushi, sessiyadagi PDP soni, savatga qo'shish
  darajasi, tashrif boshiga daromad, 30 kun ichida qaytish. Asosiy metrika — tashrif boshiga daromad.
- **Admin `/admin/reco`** (`requireAdmin("analytics")`):
  - rail bo'yicha jadval (ko'rsatildi → bosildi → savat → buyurtma);
  - A/B natijasi;
  - eng kuchli juftliklar;
  - og'irliklarni sozlash.

---

## 6. Trafik (100–200 ming/oy) — sayt kodi nima qila oladi

Animatsiya va algoritm trafik olib kelmaydi, lekin keyingi bandlar keladigan trafikni oshiradi:

- **Tezlik:** Core Web Vitals «yaxshi» (Google reytingiga kiradi). Har bosqichda `npm run audit`
  va Lighthouse.
- **Programmatik SEO:** «ingredient × maqsad» va «mahsulot narxi Toshkentda» sahifalari.
  Ro'yxat `/admin/keywords` (talab tahlili) dagi «talab bor — bizda sahifa yo'q» qatorlaridan
  olinadi. Har sahifa haqiqiy kontent bilan — yupqa sahifa indeksga kirmaydi.
- **Qaytish kanallari:** Telegram klub va SMS (rozilik bilan) — «qayta buyurtma vaqti»
  signali (§4.1) shu kanallarga ham boradi (`subscription_due` / `reorder` oqimlari).
- **Kampaniya landinglari** (`/lp/[campaign]`) — §4.1 dagi «manbaga mos javon» shu yerda ham.

Kanallar bo'yicha marketing rejasi alohida (repoda emas — biznes-maxfiy).

---

## 7. Ketma-ketlik va hajm

| Bosqich | Mazmun | Taxminiy hajm | Bog'liqlik |
|---|---|---|---|
| **A** | Animatsiya auditi, motion tokenlari, tuzatishlar | 1 PR | — |
| **B** | Mikro-interaksiyalar B1–B9 (B10 alohida tajriba) | 1–2 PR | A |
| **D1** | O'lchash hodisalari (`rec_impression`/`rec_click`) — **oldin**, toki v1 ning boshlang'ich ko'rsatkichi yig'ilsin | kichik PR | — |
| **C1** | Server signallari: migratsiya, ishchi, `/api/reco/signals`, haqiqiy «Mashhur» | 1 PR | D1 |
| **C2** | Algoritm v2: signal og'irliklari, ingredient/maqsad, juftliklar, qayta buyurtma, xilma-xillik, «Nega?» | 1 PR | C1 |
| **C3** | Yangi rail'lar va joylashuvi (§4.5) | 1 PR | C2 |
| **D2** | A/B, `/admin/reco` | 1 PR | C2 |

Tavsiya etilgan tartib: **D1 → A → B → C1 → C2 → C3 → D2**. D1 birinchi, chunki o'lchov
qancha erta yoqilsa, v2 ni shuncha tez solishtirish mumkin.

Har bosqich oxirida: `npm run lint`, `npm test`, `npm run build`, `npm run audit` (nol),
1440/390 skrinshot va `docs/HOLAT.md` yangilanadi.
