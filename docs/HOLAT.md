# Holat (har ishdan keyin yangilanadi)

Bu fayl — yangi chat/sessiya uchun **joriy holat**. CLAUDE.md konventsiyalarni biladi,
bu fayl esa "hozir nima qilindi, nima qolgan" ni biladi. Yangi sessiya boshida shuni o'qing,
eski chat tarixini o'qishga harakat qilmang.

**Qoida**: katta ish tugagach (PR, muhim o'zgarish, bloklangan narsa) — shu faylni yangilang.

## Branch

Ish branch'i: `claude/dreamy-ride-p434h5` (asosiy: `main`). Rebrend va Hetzner to'plami
#140 bilan `main` ga tushgan; branch merge'dan keyin `main` dan qayta boshlanadi.

**Deploy (2026-11-09 tekshirildi): sayt Vercel'da** — `main` ga merge bo'lishi bilan Vercel
production'ni o'zi yangilaydi. «Deploy to Fly» va «Deploy to Hetzner» secret'siz (`FLY_API_TOKEN`,
`HETZNER_HOST`) qadamlarni o'tkazib yuborib «success» ko'rsatadi — bu deploy emas.

## Yaqinda tugagan (main'ga merge qilingan)

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
