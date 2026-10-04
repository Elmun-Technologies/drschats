# Govita — tavsiyalar va ularning holati

Bu fayl mijozning ro'yxati bo'yicha yuritiladi. Har bir band uchun: **kod
tomonidan bajarilganmi**, yoki **sizdan nimadir kutilyaptimi**.

Ro'yxatning bir qismi kodda hal qilinadi (matn, tartib, rang, narx formulasi) —
o'sha qismi bajarildi. Qolgani — foto, huquqiy matn, tibbiy matn, haqiqiy
ma'lumot — faqat sizdan kelishi mumkin; ular quyida aniq ro'yxat ko'rinishida
turadi. Umumiy "sizdan nima kerak" hujjati ham bor: `docs/QOLGAN-ISHLAR.md`.

Belgi: ✅ bajarildi · 🟡 qismi bajarildi, davomi sizda · 🔴 faqat sizdan

---

## 1. Foto-seans — Toshkent, 1–2 kun

Bu ro'yxatdagi eng katta birlik. Mijoz "hozircha AI bilan generatsiya qilib
turamiz" dedi — shuning uchun quyidagi kadrlar hozir **AI bilan yasalgan
vaqtinchalik rasmlar** bilan to'ldirildi (bitta uslub: iliq kunduzgi yorug'lik,
sutli-bej fon, yorliqsiz shisha, oq xalat yo'q, kasalxona yo'q). Ular
`/public/images/...` da turadi va haqiqiy foto-seans bo'lganda **aynan shu fayl
nomlari almashtiriladi** — kodga tegish shart emas.

| Fayl | Qayerga tushdi | Holat |
|---|---|---|
| `images/audience/woman.jpg` | "Ayolga" eshigi | ✅ AI (almashtiriladi) |
| `images/audience/man.jpg` | "Erkakka" | ✅ AI |
| `images/audience/pregnancy.jpg` | "Bo'lajak onaga" | ✅ AI |
| `images/audience/child.jpg` | "Bolaga" (maktab yoshi) | ✅ AI |
| `images/audience/senior.jpg` | "60+ ota-onaga" | ✅ AI |
| `images/audience/recovery.jpg` | "Kasallikdan keyin" — uyda, kasalxonasiz | ✅ AI |
| `images/hero/hand.jpg` | Asosiy banner — qo'lda ushlangan shisha | ✅ AI |
| `images/quality/documents.jpg` | "Sifat" bo'limi — hujjat va karton | ✅ AI |

Rasm **generatsiya qilingan** ekani ochiq yozilgan: yorliq, logotip va o'qiladigan
matn yo'q — ya'ni AI "bizning sertifikatimiz" yoki "bizning mahsulotimiz" bo'lib
ko'rinmaydi. Mahsulotning o'zi har doim **haqiqiy foto** (bannerda AI fon ustiga
haqiqiy paket qo'yilgan).

### Nima kerak

| # | Kadr | Kim uchun | Qayerga tushadi |
|---|---|---|---|
| 1 | **Asosiy banner**: mahsulot haqiqiy qo'lda (qo'l, yuzning bir qismi), tibbiy va'da yo'q | 35–55 yosh, ayol yoki erkak | `src/components/home/HeroBento.tsx` — hozir haqiqiy paket rasmi |
| 2 | Ayolga — 30–45 yosh | o'zbek yuzi | `AudienceDoors` 1-eshik |
| 3 | Erkakka — 30–50 yosh | o'zbek yuzi | 2-eshik |
| 4 | Bo'lajak onaga | homilador, tabiiy holatda | 3-eshik |
| 5 | Bolaga — **maktab yoshidagi** bola (chaqaloq emas) | 6–12 yosh | 4-eshik |
| 6 | 60+ ota-onaga | katta yoshdagi juftlik yoki ota/ona, uyda | 5-eshik |
| 7 | Kasallik/operatsiyadan keyin | **uyda tiklanish** (soniya, palata, kasalxona yo'q) | 6-eshik |
| 8 | Mahsulot "hayotda": stol ustida, oshxonada, sayohat sumkasida | — | mahsulot sahifasi + Instagram |
| 9 | Instagram uchun 10–15 kadr + 3–5 qisqa video | — | @govita_uz |
| 10 | Hujjat: shartnoma, hujjatlar, ombor | — | `ScienceSection` (hozir ikonkalar) |

### Qoidalar (bular shartnoma shartiga yozilsin)

- **Bir uslub**: bir fon rangi, bir yorug'lik, bir obyektiv. Kadrlar yonma-yon
  turganda bir kunda olingan ko'rinishi kerak.
- **Lokal yuzlar.** Yevropa stok modellari emas — mijoz o'zini ko'rishi kerak.
- **Tibbiy va'da yo'q.** Tabletka "davolayotgan" kadr, shifokor xalati,
  kasalxona koridori — yo'q. "Kasallikdan keyin" = uy, choy, adyol.
- **Mahsulot ko'rinadigan bo'lsa — nomi o'qiladigan** bo'lsin va u katalogda
  **mavjud** bo'lishi shart. Mavjud bo'lmagan mahsulot bilan reklama qilish —
  iste'molchi huquqlari bo'yicha shikoyat uchun eng oson asos.
- **Model roziligi yozma**, foto-mualliflik huquqi **kompaniyaga** o'tadi
  (fotografga emas, modelga ham emas). Standart "release" hujjati yetarli, lekin
  unda "web, ijtimoiy tarmoq, reklama, muddatsiz" so'zlari bo'lishi kerak.
- Bolalar suratga olinadigan bo'lsa — ota-ona/vasiy imzosi alohida.
- Xom fayllar (RAW) ham bizga topshirilsin.

### Fayllarni qayerga qo'yish

```
public/doors/ayol.jpg        # 2-eshik
public/doors/erkak.jpg       # 3-eshik
public/doors/homilador.jpg   # 4-eshik
public/doors/bola.jpg        # 5-eshik
public/doors/ota-ona.jpg     # 6-eshik
public/doors/tiklanish.jpg   # 7-eshik
public/hero/banner.jpg       # 1-kadr
public/life/<slug>-1.jpg     # 8-kadr (mahsulot slug'i bilan)
```

`AudienceDoors` / `HeroBento` fayllaridagi izohda aynan qaysi qator
o'zgartirilishini yozib qo'ydim.

---

## 2. Shifokor videolari 🟡 (quvur tayyor — yuklash sizning mashinangizda)

Kod tomoni **to'liq tayyor va sinovdan o'tgan**. Instagram'ni bu qurilma
(build muhiti) ocholmaydi: DNS ishlaydi, lekin tarmoq allowlist'i ulanishni
uzadi (`TLS connection closed`) — `yt-dlp` o'rnatilgan, sinab ko'rildi. Video
faylni **bir marta o'z kompyuteringizda** yuklash kerak, keyin sayt uni o'zi
xizmat qiladi.

### Bitta buyruq

```bash
npm run videos:doctor
```

Skript `https://www.instagram.com/alimkhanov_pharm/` profilidan videolarni
yuklab oladi va:

| Natija | Qayerga |
|---|---|
| Video fayllar | `public/videos/doctor/<id>.mp4` |
| Poster kadr | `public/videos/doctor/<id>.jpg` |
| Ro'yxat (mashina yozadi) | `src/lib/content/doctor-videos.generated.json` |

Foydali variantlar:

```bash
npm run videos:doctor -- --limit 20            # eng yangi 20 tasi
npm run videos:doctor -- --url <reel-havolasi> # aniq bittasi
npm run videos:doctor -- --cookies-from-browser chrome   # IG login so'rasa
npm run videos:doctor -- --manifest-only       # yuklamasdan ro'yxatni yangilash
```

`yt-dlp` kerak: `brew install yt-dlp` yoki `pipx install yt-dlp`.

### Ikkinchi qadam — qaysi video qaysi mahsulot haqida

Skript yuklab bo'lgach, **qaysi klip qaysi mahsulotga tegishli ekanini o'zi
bilmaydi** — bu inson qarori. Shuning uchun har bir video
`src/lib/content/doctor-videos.map.json` da yozuv kutadi; yozuvsiz video
**hech qayerda ko'rinmaydi**:

```json
{
  "DQxYz12345": {
    "productSlug": "delical-vanil-200ml",
    "doctorName": "Dr. <ism>",
    "consentOnFile": true,
    "otc": true,
    "caption": { "uz": "<bir qator>", "ru": "<одна строка>" }
  }
}
```

Ikki qulf, mijozning o'z talabidan: **`consentOnFile`** — shifokor nomi
mahsulot yonida turishi uning yozma roziligi bilan, va **`otc`** — retsept
mahsulotiga video umuman qo'yilmaydi. Ikkisi ham `false` bo'lsa, video
yuklangan bo'lsa ham chiqmaydi (test bilan qulflangan:
`src/lib/content/doctor-videos.test.ts`, 6 holat).

### Sinovdan o'tdi

Quvur boshdan-oxir sinovdan o'tkazildi: soxta klip →
`--manifest-only` → manifest yozildi → map yozuvi → build → mahsulot
sahifasida `<video preload="none" poster="...">` va shifokor nomi chiqdi.
Sinov fayllari o'chirildi, repozitoriya toza.

### Instagram'dan olish huquqi

Videoni platformadan olib **o'z saytda qayta e'lon qilish** — akkaunt
egasining (kompaniyaning) qarori. Skript buni texnik jihatdan bajaradi, lekin
e'lon qilish huquqi yozma bo'lishi kerak: shifokorning video uchun roziligi va
mahsulot bo'yicha alohida roziligi — advokat ro'yxatida (§4).

## 3. Ekspertlar kengashi 🟡 (demo profillar qo'yildi)

**Muhim:** ilgari saytda uchta "shifokor" bor edi — ism, 15 yillik tajriba,
LinkedIn/PubMed havolasi va surati bilan. Ularning **hech biri yo'q edi**;
suratlar generatsiya qilingan, havolalar birovga tegishli emas edi. Ular har bir
mahsulot va maqola ostida "Tekshirilgan" bo'lib chiqardi. Bu — o'ylab topilgan
tibbiy kafolat, va uni matnni tahrirlash bilan tuzatib bo'lmaydi.

Shuning uchun ro'yxat **bo'shatildi** (`src/lib/content/experts.ts`): ekspert
bloki hozir hech qayerda ko'rinmaydi va JSON-LD'da "author/reviewedBy"
yozilmaydi — kimdir nomidan gapiradigan odam bo'lmasa, umuman yozilmasin.

### Bitta ekspert yozuvi uchun nima kerak

| maydon | misol | izoh |
|---|---|---|
| `id`, `slug` | `exp-karimova` | kod uchun |
| `name` | Nodira Karimova | **to'liq**, otasining ismi bilan |
| `title` | Gastroenterolog, PhD | mutaxassislik + daraja |
| `worksFor` | Toshkent tibbiyot akademiyasi, 1-klinika | ish joyi — aniq |
| `bio` | 2–4 jumla | qayerda o'qigan, nima bilan shug'ullanadi |
| `photo` | `/experts/nodira.jpg` | **bir odam — bir foto, butun saytda**. Stok surat, robot surat yo'q |
| `consent` | sanasi + imzosi | ism-familiya va foto ishlatishga yozma rozilik |
| `sameAs` | haqiqiy profil havolalari | bo'lmasa — bo'sh qoldiriladi, o'ylab topilmaydi |

Yozuv `src/lib/content/experts.ts` → `rawExperts` massiviga qo'shiladi (yoki
Sanity CMS'ga — u ham shu maydonlarni kutadi), shundan keyin ekspert bloki
o'z-o'zidan qaytadi: mahsulot sahifasi, maqola, quiz natijasi.

**Qo'shimcha shart:** ekspert sahifasida "Maslahat olish" tugmasi bor
(`ConsultationModal.tsx`). U hozir **hech qayerga yubormaydi** — forma bosilganda
"qabul qilindi" deb ko'rsatadi, xolos. Birinchi haqiqiy ekspert chiqishidan
oldin: (a) so'rov keladigan kanal (Telegram guruh yoki raqam), (b) javob berish
muddati, (c) "tibbiy maslahat" emas, "mahsulot bo'yicha savol" ekani yozilishi
kerak. Aks holda onlayn shifokor va'dasi bo'sh qoladi.

---

## 4. Advokat ko'rigi 🔴

Bular matnda o'zgartirildi, lekin **huquqiy tasdiq kutilyapti**:

1. **Qaytarish muddati.** Sayt hozir "ochilmagan qadoq, 14 kun" deb yozadi
   (`src/lib/config/commerce.ts` → `returns`). BAD (qo'shimcha oziq) — dori
   emas, shuning uchun "30 kun, savolsiz" va'dasi qonun talab qilmaydigan va
   dorixona bajarolmaydigan va'da. Advokat yakuniy so'zni aytadi: muddat,
   shartlar, "ochilgan mahsulot qaytarilmaydi" bandi.
2. **Obuna shartlari.** Avtomatik qayta yetkazish — bu takroriy to'lov. Kerak:
   qachon bekor qilish mumkin, pul qachon yechiladi, ogohlantirish bormi.
   Kodda chegirma va muddat bor (`commerce.ts` → `discounts`), shartlar matni
   advokatdan keyin yakunlanadi.
3. **Shifokor promo-kodlari.** Shaxsiy kodlar berilishidan oldin: bu chegirma
   yoki haq to'lanadigan tavsiya emasmi, shifokor buni mijozga qanday aytadi,
   qaysi mahsulotlarga tegishli. Tibbiy xodimga tovar tavsiya qildirish
   reklama qonunchiligida alohida band.
4. **Narx kafolati.** "Sayt narxi dorixona narxidan past emas" — bu raqobat
   qonunchiligi bo'yicha ham tekshirilsin (past narx e'lon qilish cheklovlari).
5. **"Tibbiy maslahat" iborasi.** Ekspert blokidagi matn va `Disclaimer`
   komponenti bir-biriga mos bo'lishi kerak.
6. **Sertifikatlar.** "Sertifikat so'rash" havolasi bor. Haqiqiy hujjat
   raqamlari va ularni ko'rsata olishimiz qonuniy ekani tasdiqlansin.

---

## 5. Tibbiy matnlar 🔴

Sog'liq mavzulari (`/vitamins`, `/symptoms`, `/goals`, `/programs`, blog) —
**shifokor yoki kontent-menejer yozadi**, men yozmayman. Sabab
`docs/QOLGAN-ISHLAR.md` §1 da batafsil. Struktura va maydonlar tayyor; matn
kelishi bilan sahifalar o'z-o'zidan ko'rinadi.

Shifokor ko'rigidan o'tishi kerak bo'lgan, allaqachon saytda turgan matnlar:

- `src/lib/quiz/questions.ts` — har bir savolning `guidance` izohi (test
  nima uchun so'ralayotganini tushuntiradi). Bitta joyda ("gormonal
  muvozanat") neytrallashtirildi; qolganlari shifokor tahririni kutmoqda.
- `src/lib/content/health-topics.ts` — mavzu matnlari (masalan, "suyak,
  immunitet va gormonal balans" iborasi).
- `src/lib/content/ingredients.ts` — har bir ingredientning `role` tavsifi.
- `src/lib/shopflow/mock.ts` — mahsulot `highlights`/`benefits` bandlari
  (ishlab chiqaruvchi yo'riqnomasidan so'zma-so'z olinishi kerak).

---

## 6. Mahsulot ma'lumotlari 🟡

Katalogdagi 30 nom bo'yicha uchta narsa **faqat sizdan**: nomi, rasmi, kelib
chiqqan davlati. Kod tomonda muvofiqlik tekshiruvi bor
(`src/lib/shop/curation.ts`), lekin manba ma'lumot sizda.

Har bir SKU uchun jadval to'ldirilsin:

| slug | nomi (qadoqdagi) | foto (paket) | ishlab chiqarilgan davlat | ro'yxat hujjati raqami |
|---|---|---|---|---|
| `dr-frei-biotin-30` | … | … | … | … |

Qoidalar:

- **Nom = qadoqdagi nom.** "Swiss Energy Vitamin C" kartasida Dr. Frei rasmi
  turган holat aynan shu jadval to'ldirilmagani uchun yuz bergan.
- **Davlati ro'yxat hujjati bilan bir xil.** Dr. Frei bir joyda Shveytsariya,
  boshqa joyda Bolgariya bo'lgan — bittasi tanlanadi va hujjat bilan
  tasdiqlanadi.
- **Eski/chizilgan narx faqat real bo'lsa.** Hozir saytda faqat 6 ta mahsulotda
  chizilgan narx bor va ular haqiqiy (Delical — muddati yaqin partiya,
  Dr. Frei — mavsumiy aksiya). Sababsiz chegirma qo'shilmaydi.
- **Porsiya narxi** (`so'm/porsiya`) faqat paketdagi porsiyalar soni qadoqda
  yozilgan bo'lsa hisoblanadi; aks holda ko'rsatilmaydi.
- Hamdard kabi "chetga chiqadigan" pozitsiyalar katalogdan chiqarildi yoki
  asosiy ro'yxatga kiritilmadi — assortiment siyosati shu.

---

## 7. Kodda bajarilgan bandlar (nazorat uchun)

| Mijoz aytdi | Holat | Qayerda |
|---|---|---|
| canonical / og:url / og:image → govita.uz | ✅ | `src/lib/config/site.ts`, `src/lib/seo/metadata.ts`, `public/og/govita-og.jpg` (1200×630, yaratildi — dizayner almashtirsa bo'ladi) |
| "Nega Go Vita'ga ishonishadi" 0+/0h | ✅ | statik raqamlar, animatsiyaga bog'liq emas |
| RU sahifada o'zbek/ingliz qoldiqlari | ✅ | `src/messages/ru.json` to'liq yuritildi |
| BackToTop narxni to'sishi | ✅ | `BackToTop.tsx` — 1400px dan keyin, ixcham |
| Header qidiruv paneli | ✅ | ikonkaga yig'iladi (`Header.tsx`) |
| Narx ikki qatorga tushishi | ✅ | `src/components/ui/Price.tsx` |
| So'm/porsiya hisobi | ✅ | `src/lib/content/product-photos.ts` + paket hajmi; noto'g'ri porsiya ko'rsatilmaydi |
| Nom ↔ rasm mosligi | 🟡 | 30 SKU qayta yozildi; yangi ma'lumot §6 jadvali bilan |
| Kelib chiqqan davlat | 🟡 | ziddiyatlar olib tashlandi, tasdiqlash §6 |
| Soxta chizilgan narxlar | ✅ | faqat real aksiyalar qoldi |
| Tibbiy va'dalar ("AI-diagnostika", "klinik isbotlangan", "qonni tozalash" va h.k.) | ✅ | barchasi matnlardan olib tashlandi |
| Isbotsiz da'volar ("AQSh standartlari", "faqat xelatlar") | ✅ | olib tashlandi |
| Quiz nomi "Vitamin tanlash" | ✅ | `quiz.*` kalitlari |
| Ekspert: bir foto, to'liq ism, ish joyi | ✅/🔴 | soxta ekspertlar o'chirildi; haqiqiylari §3 |
| Footer yuridik ma'lumotlari | ✅ | `src/lib/brand.ts` — davlat reyestridan (orginfo.uz, INN 307895851): "DR SCHATZ" MChJ, STIR 307895851, Yakkasaroy, Bobur 77, rahbar, ro'yxat sanasi, OKED. `/requisites` shu manbani ko'rsatadi. **Litsenziya raqami hali yo'q** |
| Bepul yetkazish chegarasi bitta | ✅ | `commerce.ts` → 300 000 |
| Yetkazish muddati bitta | ✅ | Toshkent 24 soat, viloyatlar 1–3 kun |
| Chegirma tizimi bitta | ✅ | `commerce.ts` + `/loyalty` sahifasi (10% / 10%→15%) |
| Onlayn to'lov (Payme/Click/Uzum) | ✅ | `src/lib/config/payments.ts` — merchant ID kiritilishi bilan yonadi; operator qo'ng'irog'i majburiy emas |
| Bosh sahifa 14 → 8 blok | ✅ | `src/app/[locale]/page.tsx` — takrorlanmaydigan bitta mahsulot to'ri |
| Delical uch marta ko'rinishi | ✅ | bitta aksiya bloki + bitta grid, takrorlanish yo'q |
| "Kun mahsuloti" sarlavha/karta mosligi | ✅ | bitta mahsulot, countdown olib tashlandi |
| VIP: e-mail o'rniga Telegram, toj emoji yo'q | ✅ | `NewsletterSignup`, `loyalty` matnlari |
| "Kimga tanlaymiz?" ikki marta chiqishi | ✅ | bitta sarlavha |
| 6 eshik (Ayolga…Tiklanish) | ✅ | `AudienceDoors` + `quiz/questions.ts` |
| Stereotip/tibbiy va'da tilsizlari | ✅ | "gormonal muvozanat" va sh.k. olib tashlandi |
| Palitra: sutli fon, grafit, gold | ✅ | `src/styles/globals.css` |
| Gold faqat sotib olish tugmalarida | ✅ | `ui/Button.tsx` → `gold`/`primary` = pul, qolgani neytral |
| Ishonch rangi (signal yashil) | ✅ | `--color-signal #2b7159` |
| Bir xil kartochka foni, gradientsiz | ✅ | `ProductCard.tsx` |
| Mahsulot rasmlari bir standartda | 🟡 | fon va kadrlash bir xillashtirildi; yangi foto §1 |
| Muammoli rasmlar (mikroskop, retsept, sabzavot, chaqaloq) | ✅ | olib tashlandi |
| Kontrast ≥4.5:1 | ✅ | tokenlar qayta ko'rildi |
| Sayt dorixona narxidan past emas | ✅ | narx siyosati kodda emas, ma'lumotda — qoida yozildi |
| Obuna = asosiy mahsulot | ✅ | `subscription/plans.ts` + `SubscribeToSave` |
| Uzum Market bilan bir xil narx | 🔴 | savdo kanali — qaror sizda |
| "Qayerdan sotib olish" — dorixonalar | ✅/🟡 | `/where-to-buy` sahifasi qurildi: 11 tarmoq, tekshirilgan manzillar va har bir tarmoqning **jonli filiallar xaritasi** (2GIS). Karta-pin bizniki bo'lishi uchun har bir tarmoqning to'liq filial ro'yxati (manzil + qaysi mahsulot) kerak |
| Birinchi buyurtmaga 10% | ✅/🟡 | `commerce.ts` + `/loyalty`; chegirmani operator tasdiqlashda qo'llaydi — bu jarayon amalda ishlashi kerak |

---

## 8. UI/design-system yurishi (kod tomonidan)

Mijoz "UI hozir ideal emas" degandan keyin butun sayt **bitta tizimga**
yig'ildi. Bu ish brauzerda emas, kod va CSS darajasida qilindi (sandboxda
brauzer yo'q), shuning uchun quyida nima o'zgargani aniq yozilgan — ko'z bilan
tekshirish sizning tomonda.

### Ritm (bo'shliqlar)

| Nima | Qanday |
|---|---|
| Bo'lim orasi | bitta o'lchov: `.section-y` (clamp 52–88px) va `.section-y-tight` (40–64px). 14 xil `py-16…py-32` qiymat olib tashlandi |
| Bo'lim qobig'i | `ui/Section.tsx` — `tone` (ink / surface / deep / none) + `size`. Fon o'zgarmasa chiziq, o'zgarsa chiziqsiz |
| Sarlavha | `ui/SectionHeading.tsx` — bitta o'lchov narvoni: `text-2xl → sm:3xl → lg:4xl`, bitta vazn (`extrabold`), eyebrow neytral |
| Burchak radiusi | 4 dan 40px gacha bo'lgan "bir martalik" qiymatlar yo'q; kartochka `rounded-2xl`, yirik panel `rounded-3xl`, "gumbaz" shakllari (5.5rem) olib tashlandi |
| Soyalar | bitta issiq o'q: `--shadow-xs/sm/card/pop/cta`. Ilgari uch xil rangda (navy, slate, jigarrang) soya bor edi — ikki karta yonma-yon turganda boshqa rangda soya tashlardi |

### Kontrast va o'qilish (60+ auditoriya uchun)

- `--color-muted` #696259 → **#5f594f**, `--color-faint` #766f64 → **#6a6359**.
  Eski `faint` `surface-2` fonda 4.29:1 edi — aynan kartochka metama'lumoti
  (kelib chiqish, porsiya) o'sha rangda yozilgan. Endi eng pasti 4.56:1.
- Gold (`--color-accent`) — **faqat fon**. Ustidagi matn doim `brand-deep`
  (4.56:1); oq matn 3.13:1 bo'lgani uchun gold ustida oq matn yo'q.
- Ishonch rangi — `--color-signal #2b7159` (oq matn bilan 5.82:1): "shifokor
  tekshirgan", sertifikat, ekspert, mavjudlik holati, progress ko'rsatkichlari.
- Fokus halqasi sayt bo'ylab bitta: `:focus-visible` → signal, 2px.
- Tailwind v4 tugmalarda `cursor:pointer` bermaydi — baza qoidasi qo'shildi
  (butun sayt bo'ylab 1 ta ishlatilgan edi, endi hammasida).

### Palitra qoidasi: gold = pul

Gold (va `gold-soft`) endi faqat **savatga / sotib olish / rasmiylashtirish**
tugmalarida: `ProductCard`, `StickyBuyBar`, `BuyBox`, `UpsellRail`,
`UpsellLadderModal`, savat va checkout tugmalari, "rejani savatga" tugmasi.
Qolgan hamma joyda neytral:

- chegirma yorliqlari, "Katalogga o'tish", hero CTA, bo'lim sarlavhalari;
- kategoriya chiplar, blog "Maqolani o'qish", breadcrumb havolalari;
- qidiruv tugmasi, "Katalog" tugmasi, cookie "Qabul", filtr/navigatsiya,
  kirish/ro'yxatdan o'tish, bo'sh savat, 404, xohishlar ro'yxati;
- to'lov usuli plashkalari, progress barlar, sahifalash, tablar;
- ishonch belgilari (`BuyBox` trust qatori) → signal yashil;
- izoh/ogohlantirish panellari (disclaimer) → neytral fon.

### Mahsulot kartochkasi

`ProductCard.tsx` qayta yozildi: bitta fon (pattern/gradient yo'q), rasm alohida
ichi bo'sh "tile"da, sarlavha uchun `min-h` (kartochkalar bir chizig'da
tekislanadi), bitta metama'lumot qatori, gold faqat "Savatga" tugmasida.
Narx `ui/Price.tsx` orqali: eski narx doim alohida qatorda — 2 ustunli mobil
to'rda "142 890" va "800 000" yonma-yon tushib, ikki narx bo'lib o'qilardi.

### Quiz: uydirma raqamlar va uydirma jadval olib tashlandi

- **"Salomatlik ko'rsatkichi" (N/100)** butunlay o'chirildi. U
  `98 − yo'nalish×5 − ingredient×2` formulasidan hisoblanib, 68–92 orasiga
  qisilardi va "Yaxshi ko'rsatkich" / "Nutriyentlar yetishmovchiligi xavfi"
  deb baho berardi. Buni hech bir shifokor aytmagan — o'sha sahifadagi
  "-15% Maxsus Chegirma Rejasi" banneri bilan birga olib tashlandi.
- **Ertalabki/kechki jadval** olib tashlandi: taqsimot `idx % 2` bilan, ya'ni
  massiv tartibi bo'yicha qilinardi va yoniga "ovqatdan so'ng 1 tabletka"
  yozilardi. Bu — qabul qilish bo'yicha uydirma ko'rsatma.
- "Dr. Chats Sun'iy Intellekt va Tibbiy Konsilium Diagnostikasi" yorlig'i
  (AI-diagnostika va'dasi, ustiga o'zbekcha, RU sahifada ham) → testning o'z
  nomi. "Tibbiy konsilium izohi" → neytral "Izoh".
- Qizil bayroq bloki (`seeDoctor`) qoldi — u yagona haqiqiy ogohlantirish.

### Boshqa tizim ishlari

| Nima | Qanchasi | Izoh |
|---|---|---|
| Palitradan tashqari ranglar | **0** | `QuizFlow` 23, `QuizPlanView` 23, `experts/[slug]` 12, savat/header 7 ta amber/indigo/emerald/rose/green kodda qolmadi |
| Bir martalik dekorativ "sahnalar" | 6 sahifa | Olti "bespoke" mahsulot sahifasida har xil rangli fon: pushti glow, apelsin radial, ko'k radial, kamalak konus, oltin quyosh, yashil radial + oy va 14 ta yulduz + aylanuvchi halqalar. Bittasi `.product-hero` umumiy foniga almashtirildi |
| Ishlatilmagan CSS | 8 util | `.glass`, `.glass-panel`, `.hover-lift*`, `.text-gradient`, `.gradient-accent`, `.animate-glow`, `.soft-glow` — bittasi `MultivitaminDaily`da buzilgan holda qolgan edi, tuzatildi |
| CSS bundle | 88 KB | `@source not "docs"` — audit hujjatlari matni CSS'ga util tushurib yuborardi (`.text-amber-500`, `.from-amber-500`) |
| To'lov plashkalari | 5 → 2 | "Payme / Click / Uzum / Visa / Mastercard" har mahsulotda chizilardi; endi faqat `payments.ts`da sozlangan provayder + "yetkazib berishda to'lov" |
| Ishlatilmagan komponent | — | `Badge tone="gold"/"accent"` endi neytral (kategoriya, "Yangi", "Xit" — gold tugma bilan raqobat qilmaydi) |
| Ru/uz matn | 0 raw kalit | `/uz`, `/ru`, `/uz/quiz`, `/ru/quiz`, `/uz/products`, `/uz/cart`, `/uz/checkout`, `/uz/about` va h.k. — 19 sahifa 200, kalit qolmagan |

### Tekshiruv

- `npx tsc --noEmit` — toza; `npm test` — 7 fayl / 94 test o'tdi;
  `npm run build` — xatosiz (BUILD_ID `.next/BUILD_ID`).
- 19 sahifa curl bilan tekshirildi: 200, palitradan tashqari klass 0, raw
  i18n kalit 0.
- ⚠️ **Brauzer tekshiruvi bu yerda ishlamaydi** (sandboxda Chromium yo'q,
  `npm run audit` ishga tushmaydi). Ko'z bilan ko'rish — sizning tomonda:
  asosan 60+ uchun kontrast, mobil 360px'da kartochka va narx, header
  skrollda yig'ilishi.

---

## 9. Bu bosqichda qo'shildi (AI rasmlar · demo ekspertlar · aptekalar · huquqiy ma'lumot)

### 9.1 AI rasmlar
Yuqorida §1 jadvali. Ishlatilgan usul: bitta sessiyada, bitta uslubda
generatsiya; har bir rasmda yorliq/logotip/o'qiladigan matn yo'q — AI rasm
"hujjat" yoki "bizning mahsulot" bo'lib ko'rinmasligi kerak. Kodda ular oddiy
`<Image>` — haqiqiy foto kelganda faqat fayl almashtiriladi.

### 9.2 Demo ekspertlar
`src/lib/content/experts.ts` ichida 3 ta namuna profil (`demo: true`) va ularning
portretlari (`public/images/experts/demo-1.jpg`, `demo-2.jpg`). Muhim qoida:

- har bir demoda nom yonida **(namuna profili)** yozuvi turadi;
- ekspert sahifasida "bu namuna profil" banneri chiqadi;
- **`reviewerForKey()` demolar qaytarmaydi** — ya'ni hech bir mahsulot yoki
  maqola sahifasida namuna odam "tekshirgan mutaxassis" sifatida ko'rinmaydi;
- demoda uydirilgan ilmiy daraja, staj va tashqi havolalar yo'q — ularning
  o'rnida "hujjat kutilmoqda" ro'yxati turadi.

Uchala portret ham tayyor (`demo-1.jpg`, `demo-2.jpg`, `demo-3.jpg`).
Haqiqiy mutaxassis kelganda: `demo: true` ni olib tashlash va maydonlarni
to'ldirish — tamom.

### 9.3 Dorixonalar — `/where-to-buy`
11 tarmoq: City Pharm, Grandpharm, Effekt pharm, Vaksina, Eko pharm, Koinot,
Shox pharm, Pharma Cosmos, Anvar pharm, Mega pharm, Shavkat o'g'li. Har bir
kartochkada: tarmoq nomi, filial soni (ochiq manbada ko'rsatilgan bo'lsa), 2–4
tekshirilgan manzil (o'zbek lotin + rus kirill), va **"Barcha filiallar
xaritada"** havolasi — 2GIS'ning o'sha tarmoq bo'yicha jonli ro'yxatiga.

Nega o'zimizning xarita emas: karta uchun koordinatalar kerak, koordinata esa
o'lchov talab qiladi. Qo'lda qo'yilgan pin — sayt boshqa joyda olib tashlagan
"uydirma detal"ning aynan o'zi. To'liq filial ro'yxati (manzil + qaysi
mahsulot) kelganda shu sahifa ostiga xarita bloki qo'shiladi.

Manzillar sanasi sahifada ko'rsatiladi (hozir 04.10.2026), shunda ro'yxat qancha
eski ekani ko'rinib turadi.

### 9.4 Shifokor videolari — quvur qurildi va sinovdan o'tdi

- `scripts/assets/fetch-doctor-videos.mjs` (npm: `videos:doctor`) — yt-dlp bilan
  profildan yuklaydi, poster kadr oladi, manifest yozadi, `--manifest-only`
  bilan tarmoqsiz qayta hisoblaydi.
- `src/lib/content/doctor-videos.generated.json` — mashina yozadigan ro'yxat
  (commit qilingan bo'sh holatda).
- `src/lib/content/doctor-videos.map.json` — inson yozadigan xarita (bo'sh).
- `src/lib/content/doctor-videos.ts` — `selectDoctorVideos()` sof funksiyasi:
  faqat **map + rozilik + OTC** bo'lgan klip chiqadi.
- `src/components/product/DoctorVideo.tsx` — mahsulot sahifasida
  `<video preload="none">` (mobil internetni bekorga yemasin), ostida shifokor
  nomi va bir qatorlik izoh, ishonch rangida.
- `src/lib/content/doctor-videos.test.ts` — 6 test: rozilik yo'q → chiqmaydi,
  retsept → chiqmaydi, xarita yo'q → chiqmaydi, begona yo'l → chiqmaydi,
  poster yo'q → chiqadi.

Sinov: soxta klip bilan to'liq zanjir tekshirildi (manifest → map → build →
sahifada video), keyin sinov fayllari o'chirildi.

### 9.5 Huquqiy ma'lumot (reyestrdan)
`src/lib/brand.ts`:

| Maydon | Qiymat |
|---|---|
| Tashkilot | "DR SCHATZ" mas'uliyati cheklangan jamiyati |
| STIR (INN) | 307895851 |
| Manzil | Toshkent sh., Yakkasaroy tumani, Bobur ko'chasi, 77-uy |
| Rahbar / ta'sischi | Alimxanov Dilshod Shuxratovich (100%) |
| Ro'yxat sanasi | 11.11.2020 |
| Faoliyat | OKED 46490 — boshqa uy-ro'zg'or tovarlari ulgurji savdosi |
| Manba | orginfo.uz, ma'lumot sanasi 25.06.2024 |

**Litsenziya / ro'yxat raqami hali kiritilmagan** — reyestrda yo'q, o'ylab
topilgan raqam esa yo'qligidan yomonroq. `/requisites` shu qatorni "ma'lumot
tayyorlanmoqda" deb ko'rsatadi.


---

## Aloqa

Savol yoki fayl bo'lsa: `BRAND.contact.b2bEmail` (saytning footerida va
`/requisites` sahifasida).
