# Holat (har ishdan keyin yangilanadi)

Bu fayl — yangi chat/sessiya uchun **joriy holat**. CLAUDE.md konventsiyalarni biladi,
bu fayl esa "hozir nima qilindi, nima qolgan" ni biladi. Yangi sessiya boshida shuni o'qing,
eski chat tarixini o'qishga harakat qilmang.

**Qoida**: katta ish tugagach (PR, muhim o'zgarish, bloklangan narsa) — shu faylni yangilang.

## Branch

Ish branch'i: `claude/dreamy-ride-p434h5` (asosiy: `main`). Hozircha main'dan oldinda —
hali PR ochilmagan (foydalanuvchi so'rasa och).

## Yaqinda tugagan (main'ga merge qilingan)

- Real narxlar (Dr Schatz prays-listi) — PR #133
- SMS qonun muvofiqligi (reklama rozilik, tungi soat) + zod 4 — PR #134
- Friksiyani kamaytirish: 4–5 savolli test, upsell oynasi o'chiq, bitta manzil
  maydoni, rasmiy distribyutor belgisi, kunlik narx, welcome pop-up — #135

## Joriy (branch'da, hali PR emas)

- **Hetzner deploy tayyorlandi** (commit 28b9051): `deploy/hetzner/` (Compose: Caddy +
  app + Postgres + kunlik backup + bot), `.github/workflows/hetzner-deploy.yml`,
  `docs/DEPLOY-HETZNER.md`. Hali jonli serverga **ulanmagan** — foydalanuvchi
  "Hezner serveriga uladik" desa hujjat bo'yicha bosqichma-bosqich bajarish kerak.
  **Diqqat**: ZRU-547 (shaxsiy ma'lumotlar O'zbekistonda saqlanishi) — Hetzner
  Germaniya/Finlyandiyada, yurist tekshiruvi kerak (hujjatda yozilgan).

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
