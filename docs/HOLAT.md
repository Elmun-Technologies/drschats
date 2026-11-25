# Holat (har ishdan keyin yangilanadi)

Bu fayl — yangi chat/sessiya uchun **joriy holat**. CLAUDE.md konventsiyalarni biladi,
bu fayl esa "hozir nima qilindi, nima qolgan" ni biladi. Yangi sessiya boshida shuni o'qing,
eski chat tarixini o'qishga harakat qilmang.

**Qoida**: katta ish tugagach (PR, muhim o'zgarish, bloklangan narsa) — shu faylni yangilang.

## Branch

Ish branch'i: `claude/dreamy-ride-p434h5` (asosiy: `main`). Rebrend va Hetzner to'plami
#140 bilan `main` ga tushgan; branch merge'dan keyin `main` dan qayta boshlanadi.

**Deploy (2026-11-14): sayt Hetzner/Coolify'da jonli.** `www.govita.uz` → Coolify `govita-web`
(server `2.29.137.243`); baza `govita-postgres` (oʻsha asosiy baza), 6 soatlik backup, bot `@go_vitabot`
(`govita-bot`) yangi saytga ulangan. `main` ga merge → GitHub webhook → Coolify avtomatik deploy;
ishlamasa Coolify → `govita-web` → Redeploy. Vercel `drschats` loyihasida domen, cron va Git ulanishi olib tashlangan.
DNS hozircha Vercel nameserverlarida (Pro tarif 2026-12-14 gacha toʻlangan) — `@` va `www` A yozuvi serverga;
keyingi qadam: DNS'ni Cloudflare'ga koʻchirish (Ahost'da NS almashtirish). Payme/Click kalitlari
`/admin/integrations` da **qayta kiritilishi** kerak (shifrlash kaliti yangilandi). Tafsilot:
[`DEPLOY-HETZNER.md`](DEPLOY-HETZNER.md) → «Hozirgi holat: Coolify».

## Integratsiyalar holati (2026-11-23, `/admin/integrations`, kodsiz sozlandi)

- **Analitika ulandi**: GA4 `G-WBYMBW0ZEZ` va Yandex Metrika `114537981` (Webvisor **o'chiq** — forma
  maydonlarida telefon/manzil bor). Teglar saytda yuklanadi; cookie-rozilik berilgandagina
  (`Analytics.tsx`), do'kon CSP'si `report-only` va ikkala host ro'yxatda. GTM va Meta Pixel — ulanmagan
  (Pixel: Business Manager qarori kutilmoqda). GA4 hisobi va Metrika schyotchigi `n4zvi` Yandex akkauntida —
  kompaniya akkauntiga o'tkazish kerak.
- **Click** kalitlari kiritilgan (INN `307895851`), lekin **fiskal chek ketmaydi**: har SKU uchun package code
  va yetkazish MXIK/package code buxgalterdan kutilmoqda (`0035_mxik_codes.sql` faqat MXIK'ni to'ldirgan;
  Neuroforce, Aminomorin, Peano, Hamdard Safi, qahvalar qoplanmagan). Shu paytgacha Click'ni yoqmaslik xavfsizroq.
- **Payme**: kalitlar hali kiritilmagan. **Eskiz SMS**: keyinga qoldirilgan. Operator Telegram tokeni va
  Resend panelda sozlanmagan.
- `integration_settings` dagi 2 ta eski (yangi `INTEGRATION_ENCRYPTION_KEY` bilan ochilmaydigan) qator
  o'chirildi — `decrypt-error` yo'qoldi. Kalitni qayta o'zgartirmang.
- **Rejalashtirilgan SEO vazifalari**: «govita SEO 12 soatlik tsikl» (09:07/21:07, GSC va Merchant Center —
  Chrome kerak), «govita SEO haftalik kontent va raqobatchi» (dushanba) va «govita kunlik 3 blog maqola»
  (04:32, PR + o'zi merge). 2026-11-21 da tsikl usage limit tufayli yiqilgan edi.

## Talab tahlili → yangi sahifalar (2026-11-23)

`/admin/keywords` (Planner 2026-11-02): bozor ≈ 250 470 qidiruv/oy, ruscha 62% / o'zbekcha 35%.
«Mahsulot bor, sahifa yo'q» bo'yicha 12 ta `/vitamins/<slug>` sahifa qo'shildi
(`lib/content/health-topics-demand.ts`, uz + ru): `folic-acid`, `vitamin-a`, `vitamin-e`,
`vitamin-a-e`, `biotin`, `selenium`, `vitamin-k2`, `multivitamins`, `vitamin-b-complex`,
`vitamin-b6`, `vitamin-b1`, `lutein` (≈ 44 000 qidiruv/oy). Mahsulotlar faqat tarkibida shu modda
borlari; miqdor — faqat katalogda yozilgani. `keywords/subjects.ts` da `site.topic` ulandi —
admin'da «Нужна страница» belgisi o'zi yo'qoladi.

**Auditoriya sahifalari (2026-11-23)**: `/goals/kids`, `/goals/pregnancy`, `/goals/men`, `/goals/women`, `/goals/eyes`
(`lib/content/health-topics-audience.ts`; talab: bolalar 520, homilador 220, erkaklar 180, koʻz 170, ayollar 110). Mahsulotlar
faqat shu auditoriyaga mos katalogdagilar; `keywords/subjects.ts` da `topic` ulangan.

**Ona va bola parvarishi (2026-11-23):** `/care/mom` va `/care/baby` qurildi (Claude Design canvas «govita — Ona va Bola parvarishi» asosida, egasi «go» dedi). Mehmon rejimi: kuzatuv faqat brauzerda. Header'da 2 sariq pill, bosh sahifada `HomeCare` bloki. Kutilmoqda (egasidan): shifokor/pediatr ismi, Dr. Frei/Swiss Energy 0–3 narx-listi + MXIK, huquqshunos (maʼlumotni saqlash) — keyin hisob, eslatmalar va bola qutisi. Reja: `docs/ONA-BOLA.md`. Hero'dagi onalar rasmi hozir Prenatal Forte qadoq fotosi — litsenziyali homilador ayol fotosi kerak.

**2026-11-24 — 5 ta yangi sahifa:** `/goals/teens`, `/goals/seniors`, `/goals/sport`, `/symptoms/brittle-nails`, `/symptoms/muscle-cramps` (`health-topics-more.ts`, talab hisobotidagi `aud-teens`, `aud-elderly`, `aud-sport`, `sym-nails`, `sym-cramps` shu sahifalarga bogʻlandi).

**Kunlik reja: ≥5 yangi sahifa** (egasi talabi). Navbat: shakl sahifalari (shipuchi, marmelad, tomchi), auditoriya
(sportchilar, keksalar, oʻsmirlar), simptom sahifalari (kamqonlik, mushak tortishishi, soch toʻkilishi — hozir vitamin
sahifasiga bogʻlangan), brend sahifalari; har biri — katalogdagi haqiqiy mahsulotlar va testdan oʻtgan matn.

Qolgan (qaror kerak, kod emas): katalogda yo'q mahsulotlar — Omega-3 (20 440), Melatonin (8 270),
Ashvaganda (5 780), Spirulina (5 350), Ginkgo (4 960), L-karnitin (4 340), Inulin, Yod, Q10.
Mavjud 6 sahifa kengaytirildi (2026-11-23): Magniy B6 (nom ham «Магний B6»), D3, Rux, C, Kollagen, Kalsiy —
bo'limlar + 3–4 FAQ (uz/ru), faqat katalogdagi tarkib; isbotsiz raqamlar (D3 «70%», IU dozalar, kollagen «1.5 baravar»,
«gialuron kislotasi») olib tashlandi. **Ochiq savol:** kollagen sahifasi nomi «Dengiz kollageni» dan «Kollagen» ga
o'zgardi — katalog kartasida manba (dengiz/qoramol) yozilmagan, `ingredients.ts` va `health-topics.ts` (beauty/joints)
da hamon «dengiz» deyiladi; egasidan tasdiq kerak.

## 2026-11-24 / 25 — rasm banki, hero foto, yangi mavzular va blog

- **Rasm banki** (#186, #193): Adobe Stock'dan litsenziyalangan **210 ta foto va 14 ta video** —
  `public/images/bank/*.webp`, `public/videos/bank/*.mp4`, roʻyxat va Adobe ID'lar `docs/IMAGE-BANK.md`,
  `docs/image-bank.tsv`. Yangi sahifa yoki maqola rasmi avval shu bankdan olinadi.
- **Mavzu sahifalariga hero foto** (#187): `lib/content/topic-images.ts` — har mavzuga bankdan bitta noyob
  foto (test buni tekshiradi), OG rasm va `primaryImageOfPage`.
- **Kesma rasmlar** (#188): 11 ta mahsulot (qahvalar, termometr, ingalyator, Safi, Hiew, Potenton) Adobe
  bilan fondan ajratildi, 640×640 PNG.
- **Yangi mavzular** (#191, #193): `/symptoms/dry-skin`, `eye-strain`, `fever`, `numbness`, `bleeding-gums`,
  `period-pain`, `cracked-lips`; `/goals/blood-pressure`, `menopause`, `vegetarian`
  (`health-topics-1125.ts`, `health-topics-1126.ts`; `subjects.ts` ga `topic` ulangan). Isitma va 180/120
  bosim boʻyicha Codex tuzatishlari (AAP/AHA) kiritilgan.
- **Eski rasmlar almashtirildi** (2026-11-25): Adobe Stock'dan yana 32 ta yorqin, eʼtibor tortadigan foto
  (sariq/rangli fon, makro). `public/images/stock/st-*` endi saytda ishlatilmaydi (faqat bazadagi eski kategoriya
  rasmlari uchun qoldi): blog muqovalari (11 ta eski + standart), bosh sahifa plitkalari, «Biz haqimizda»,
  «Yetkazish», «Hamkorlar», test «Kim uchun» kartalari, `/care`. Yangi: 7 ta dastur sahifasi va kartasiga hamda
  12 ta ingredient kartasiga foto (`lib/content/page-images.ts`, test bilan, OG rasm). Admin rasm tanlash oynasida
  «Rasm banki (Adobe)» boʻlimi.
- **Blog** (#189, #190, #192, #193): +9 maqola (probiotiklar, doimiy charchoq, 60+ vitaminlar, ichish
  vaqti, soch toʻkilishi, stress va magniy, imtihon davri, telefon va uyqu, qoʻl-oyoq sovushi) — jami 41.
- **GSC indekslash** (kvota ~10/kun): 24-noyabr kvota tugagan; yangi URL'lar navbatda.
- **Ishga tushirish auditi** (2026-11-25, repodan tashqarida): P0 — oferta yoʻq, operator Telegram/Resend
  sozlanmagan, fiskal chek (package code, 9 SKU'da MXIK yoʻq), `/licenses` dagi raqamsiz daʼvolar,
  shaxsiy maʼlumotlar (pd.gov.uz, server UZ tashqarisida), DNS Vercel'da (2026-12-14 gacha).
  **Repo public** — hujjatlardagi infratuzilma maʼlumotlari ochiq; egasining qarori kutilmoqda.

## Yaqinda tugagan (main'ga merge qilingan)

- **Rasm banki** (2026-11-24): Adobe Stock bepul davrida 160 ta haqiqiy foto (AI emas) va 5 ta qisqa video litsenziyalandi — `public/images/bank/`, `public/videos/bank/`, reyestr `docs/IMAGE-BANK.md` (+ `docs/image-bank.tsv`). Yangi sahifa/blog/banner uchun rasm avval shu yerdan olinadi. Mavzu sahifalariga hero foto #187 bilan qoʻshildi (yuqoridagi boʻlim).
- **Yandex Vebmaster**: govita.uz huquqi tasdiqlandi (HTML-fayl, 2026-11-24). «Фиды» boʻlimida faqat koʻchmas mulk/vakansiya/transport/xizmat toifalari bor — tovar YML feedi bu yerga ulanmaydi (Yandex Business / Tovarlar kabineti kerak, egasi).

- **Talab tahlili — bozor maʼlumoti oldindan** (2026-11-12): `0037_keyword_market_baseline.sql` 2026-11-02 Planner eksportini (1 913 soʻz, oyiga 250 800 qidiruv) boʻsh jadvalga yozadi — `/admin/keywords` fayl yuklamasdan toʻladi. Sahifaga qoʻshildi: talab darajasi (1000+/100–999/10–99/10 dan kam), tillar ulushi, mavsum, «Sahifa kerak», oʻsayotgan/pasayayotgan soʻzlar (`lib/keywords/report.ts`, testli). **Keyingi qadam (foydalanuvchi tanlagan «a» variant)**: «Sahifa kerak» roʻyxatidagi mavzuga tugma bilan uz/ru sahifa qoralamasi — Anthropic API kaliti va bazadagi qoralama sahifalar kerak.

- Real narxlar (Dr Schatz prays-listi) — PR #133
- SMS qonun muvofiqligi (reklama rozilik, tungi soat) + zod 4 — PR #134
- Friksiyani kamaytirish: 4–5 savolli test, upsell oynasi o'chiq, bitta manzil
  maydoni, rasmiy distribyutor belgisi, kunlik narx, welcome pop-up — #135

## Yaqinda tugagan (2026-11, #140)

- **Hetzner deploy tayyorlandi** (commit 28b9051): `deploy/hetzner/` (Compose: Caddy +
  app + Postgres + kunlik backup + bot), `.github/workflows/hetzner-deploy.yml`,
  `docs/DEPLOY-HETZNER.md`. Hali jonli serverga **ulanmagan** — foydalanuvchi
  "Hezner serveriga uladik" desa hujjat bo'yicha bosqichma-bosqich bajarish kerak.
  **Diqqat**: ZRU-547 (shaxsiy ma'lumotlar O'zbekistonda saqlanishi) — Hetzner
  Germaniya/Finlyandiyada, yurist tekshiruvi kerak (hujjatda yozilgan).

- **Rebrend «govita» (brendbook v1, 2026-11)**: nom `govita` (kichik harf) — sayt, uz/ru
  matnlar, SEO, email, SMS, bot matnlari; logo fayldan (`public/brand/`), favicon/ilova ikonkasi
  «g•», Playfair va forest/gold olib tashlandi, sarlavha/narx Onest 800, hero'da «katta sariq
  nuqta». Brendbook PDF — foydalanuvchida (repoda yoʻq). **Diqqat**: SMS matnlari «govita:» bilan
  boshlanadi — Eskiz shablonlarini qayta tasdiqlatish kerak.

## Admin panel ruscha (2026-11, qilindi)

- **Qilindi (2026-11-11)**: butun admin panel — menyu, bosh sahifa, buyurtmalar, katalog, mijozlar, segmentlar,
  kampaniyalar, oqimlar, vitrina, aksiya/promokod, sodiqlik, savdo qoidalari, integratsiyalar, bot, kontent, audit,
  login/2FA, server action xabarlari. Lug'at `dict-ru.ts` (~2100 yozuv), `i18n.test.ts` har `t("…")` ni tekshiradi.
- **Atayin o'zbekcha**: mijozga boradigan matnlar (SMS/Telegram shablonlari, vitrina kontenti), mahsulot/kategoriya
  nomlari (maʼlumot), Keyword Planner eksporti, kutayotganlar CSV sarlavhalari.

## Navbatdagi ish (reja tayyor, qurilish foydalanuvchi aytganda)

- **Jalb qilish: animatsiya + tavsiya algoritmi v2** — [`docs/REJA-JALB-QILISH.md`](REJA-JALB-QILISH.md).
  **D1 qilindi** (o'lchash: `rec_impression`/`rec_click`, 8 ta rail, migratsiya 0034).
  Tartib: D1 (o'lchash hodisalari) → A (animatsiya auditi) → B (mikro-interaksiyalar) →
  C1 (server signallari) → C2 (algoritm v2) → C3 (rail'lar) → D2 (A/B + `/admin/reco`).

## Trafik: mahsulot SEO (2026-11)

- **T1 qilindi**: 30 ta mahsulotga uz/ru kalit so'z (`content/product-keywords.ts`) — title, H1, alt, qidiruv.
- **T2 qilindi — 12 ta maqola** (`content/blog-articles-2026-11.ts` va `-11b.ts`, uz+ru, FAQ bilan, mos mahsulot
  havolalari, rasm — litsenziyali stok foto): kalsiy+D3, bolalar vitaminlari, homiladorlik, kollagen, tonometr,
  nebulayzer, shipuchi vitaminlar, C vitamini, koʻz/lyutein, soch-tirnoq/biotin, erkaklar, immunitet.
  Qoidalar: sarlavha ≤ 55 belgi, tibbiy va'da yo'q (`claims.ts`, `blog.test.ts`). AI-rasm ishlatilmaydi.
  Keyingi: Search Console'da yangi sahifalarni kuzatish, talab ma'lumoti bo'yicha yangi mavzular.
- **T3 bloklangan**: prays-listdagi ~30 yangi SKU (Picot, Gummy Monsters, Omega 3 Premium, Fertilex, choylar…) —
  haqiqiy rasm kerak. Dorilar (Nimdol, Rovatineks, Rovaxol, Chervujid) saytga qo'yilmaydi.
  Narxlar (21.10.2026 prays) saytdagi 30 SKU bilan to'liq mos — #133 da qo'yilgan.

## Bloklangan (davom ettirish uchun nima kerak)

- **BTS yetkazish integratsiyasi**: `docs.bts.uz` / `apitest.bts.uz` sessiya tarmog'iga
  ruxsat berilishi va BTS test login kerak. Qisman API ma'lumoti bor (qidiruv orqali):
  `POST /auth/login` → access/refresh token; `v1/order/add` — senderCityId,
  receiverCityId, weight, packageId, postTypeId, senderDelivery.
- **Yangi mahsulotlar (prays-listdagi ~35 SKU)**: ma'lumot yig'ilgan
  (`deck/mahsulotlar-tadqiqoti.md` — scratchpad'da, repoga commit qilinmagan, chunki
  biznes-maxfiy), lekin rasmlar kerak. Ishlab chiqaruvchi domenlarini (dr-frei.com,
  swissenergy-vitamins.com, delical.fr, picot.fr va h.k.) tarmoqqa qo'shish yoki
  distribyutor sifatida rasmiy rasm so'rash kerak.

## Ochiq PR'lar (dependabot)

- **#130** next-intl 3→4 — migratsiya tekshirilmagan, `/ru/contact` prerender xatosi
  chiqishi mumkin.
- **#132** ESLint 9→10 — `eslint-config-next` hali qo'llamaydi (Next 16'gacha kutish
  kerak); hozircha yopish mumkin.

## Scratchpad'da (repoga COMMIT QILINMAGAN — biznes-maxfiy, repo ochiq)

- `deck/govita-seo-qiymat-rejasi.pdf`, `deck/govita-marketing-strategiya-6-oy.pdf`
  (v2, 12 kanal), `deck/mahsulotlar-tadqiqoti.md`, `research/*.json`.
  Bular foydalanuvchiga `SendUserFile` bilan yuborilgan; sessiya tugagach scratchpad
  o'chadi — qayta kerak bo'lsa qaytadan generatsiya qilinadi.

## Limitni tejash (har sessiyada yodda tutish)

- Og'ir subagent/workflow kerak bo'lmasa chaqirmang.
- Javoblar qisqa, to'g'ridan-to'g'ri; ortiqcha tushuntirish yozmang.
- claude-mem kabi "cloud memory" vositalari bu muhitda (har sessiya = yangi konteyner)
  ishlamaydi — faqat git'ga commit qilingan narsa saqlanadi. Shu HOLAT.md — aynan shu
  uchun.
