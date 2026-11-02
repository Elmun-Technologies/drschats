# Deploy — Fly.io

Sayt, baza va rasmlar bitta Fly tashkilotida. Baza **internetga ochilmaydi**:
sayt unga Fly'ning ichki tarmog'i orqali ulanadi (Fly Managed Postgres
tashqaridan, masalan Vercel'dan, rasmiy ulanmaydi — shu sabab sayt ham Fly'da).

```
govita (Next.js, Docker)  ──ichki tarmoq──►  Fly Managed Postgres
        │                                    (DATABASE_URL — `fly mpg attach`)
        └──► Tigris (rasmlar, `fly storage create`)
deploy:  release_command → db/migrations → yangi mashinalar trafik oladi
```

## Fayllar

| fayl | vazifa |
|---|---|
| `Dockerfile` | 3 bosqich: `npm ci` → `next build` (standalone) → `node server.js` (node:22-slim) |
| `fly.toml` | ilova, region `fra`, health-check `/uz`, 1 mashina doim yoniq, `release_command` |
| `.github/workflows/fly-deploy.yml` | `main` ga push → `flyctl deploy` (faqat `FLY_API_TOKEN` secret bo'lsa) |
| `scripts/db/migrate.mjs` | bitta tranzaksiya + `pg_advisory_xact_lock` — PgBouncer ortida ham xavfsiz |

## Avtomatik deploy — terminalsiz, faqat brauzerda (tavsiya)

Bir marta sozlanadi, keyin **GitHub'da PR merge qilish — saytni yangilashning
o'zi**. `main` ga har merge'dan keyin CI o'tsa, GitHub Actions («Deploy to Fly»)
o'zi: ilovani (yo'q bo'lsa) yaratadi, bazani ulaydi, ichki kalitlarni bir marta
yaratadi, GitHub'dagi kalitlarni Fly'ga ko'chiradi va deploy qiladi; baza
migratsiyalari `release_command` da. Skript: `scripts/fly/ci-prepare.sh`.

**Bir martalik sozlash (taxminan 10 daqiqa):**

1. **Fly hisobi** — https://fly.io → ro'yxatdan o'ting, to'lov kartasini qo'shing.
2. **Baza** — Fly paneli → *Managed Postgres* → *Create* (region **fra**).
   Yaratilgan klasterning **ID** sini nusxa oling.
3. **Token** — Fly paneli → *Account* → *Access Tokens* → **Org token** yarating
   (ilovani yaratish va bazani ulash uchun org token kerak; ilova va baza
   allaqachon ulangan bo'lsa, `deploy` token ham yetadi).
4. **GitHub** — repo → *Settings* → *Secrets and variables* → *Actions* →
   *New repository secret*:

   | secret | qiymat | majburiy |
   |---|---|---|
   | `FLY_API_TOKEN` | 3-qadamdagi token | ha |
   | `FLY_MPG_CLUSTER_ID` | 2-qadamdagi klaster ID | ha (bazasiz admin yopiq) |
   | `ADMIN_SETUP_TOKEN` | o'zingiz o'ylagan kod (16+ belgi) — birinchi admin uchun | birinchi marta |
   | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | buyurtmalar keladigan operator guruhi (§3) | tavsiya |
   | `ESKIZ_EMAIL`, `ESKIZ_PASSWORD`, `ESKIZ_SENDER` | SMS (yoki keyin `/admin/integrations` da) | ixtiyoriy |
   | `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` | email | ixtiyoriy |
   | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `BUCKET_NAME` | Tigris (admin'dan rasm yuklash; Fly paneli → Tigris) | ixtiyoriy |
   | `BOT_API_KEY`, `TELEGRAM_CLUB_BOT_TOKEN` | Telegram klub boti (`BOT-ADMIN.md`) | ixtiyoriy |

   Fly tashkilotingiz nomi `personal` bo'lmasa: *Variables* bo'limida
   `FLY_ORG` = tashkilot nomi.
5. **Ishga tushirish** — GitHub → *Actions* → «Deploy to Fly» → *Run workflow*.
   Tugagach, jurnal oxirida sayt va admin havolalari chiqadi:
   `https://govita.fly.dev/admin/setup` → 4-qadamdagi `ADMIN_SETUP_TOKEN`.

**Keyin:** kod o'zgarishi — PR → merge, bo'ldi. Kalitni o'zgartirish — GitHub
Secrets'da qiymatni yangilab, «Deploy to Fly» → *Run workflow* (yoki keyingi
merge). Ichki kalitlar (`ADMIN_SESSION_SECRET`, `INTEGRATION_ENCRYPTION_KEY`,
`MESSAGE_LINK_SECRET`, `LOYALTY_SECRET`, `EMAIL_TOKEN_SECRET`, `CRON_SECRET`)
faqat yo'q bo'lsa yaratiladi va **hech qachon almashtirilmaydi** — aks holda
adminlar chiqib ketardi, shifrlangan sozlamalar o'qilmay qolardi va yuborilgan
SMS havolalari buzilardi. Fly kalitlar ro'yxatini o'qib bo'lmasa, workflow
hech narsani o'zgartirmay to'xtaydi. GitHub'dan secret o'chirilsa, Fly'dagi
qiymat o'chmaydi.

**Domen** (bir marta, §7): `fly certs add` o'rniga Fly paneli → ilova →
*Certificates* → `govita.uz` va `www.govita.uz`; DNS yozuvlarini panel ko'rsatadi.
Domen Fly'ga o'tgach, Vercel loyihasini uzish mumkin.

## Eng qisqa yo'l — bitta buyruq

`flyctl` o'rnatilgan kompyuterda (macOS/Linux terminali yoki Windows'da Git Bash),
loyiha papkasida:

```bash
bash scripts/fly/setup.sh
```

Skript quyidagi 2–4-qadamlarni o'zi bajaradi va qayta ishga tushirilsa xavfsiz
(bor narsani o'tkazib yuboradi, qo'yilgan kalitni **hech qachon** almashtirmaydi —
aks holda adminlar chiqib ketardi va saqlangan integratsiya kalitlari o'qilmay qolardi):
ilova → Managed Postgres + `fly mpg attach` → Tigris → maxfiy kalitlar
(`ADMIN_SESSION_SECRET`, `EMAIL_TOKEN_SECRET`, `INTEGRATION_ENCRYPTION_KEY`,
`CRON_SECRET`, `ADMIN_SETUP_TOKEN`, ixtiyoriy Telegram) → `fly deploy` →
`FLY_API_TOKEN` (`gh` bo'lsa GitHub'ga o'zi yozadi, bo'lmasa ekranga chiqaradi).
Oxirida `/admin/setup` havolasi va kodi chiqadi.

GitHub'dagi «Deploy to Fly» `FLY_API_TOKEN` bo'lmasa sariq ogohlantirish bilan
o'tadi — «yashil» belgi deploy bo'ldi degani emas.

## Noldan ishga tushirish — qo'lda, ketma-ketlik

Kompyuterda loyiha kodi **shart emas**: sayt ham, bot ham GitHub'dan Fly'ning
o'z serverida build qilinadi. Kompyuterga faqat `flyctl` kerak.
Maxfiy qiymatlar faqat terminalda (`fly secrets set`) — chatga, Git'ga yozilmaydi.

### 0. Kod
PR'lar `main` ga merge qilingan, CI yashil.

### 1. Kompyuter (bir marta)
```bash
# macOS
brew install flyctl
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
# Linux
curl -L https://fly.io/install.sh | sh

fly auth login            # brauzer ochiladi; Fly hisobiga karta qo'shilgan bo'lsin
```

### 2. Sayt ilovasi, baza, rasmlar
```bash
fly apps create govita                   # nom band bo'lsa — boshqa nom va fly.toml dagi app
fly mpg create                           # Managed Postgres, region: fra
fly mpg attach <cluster-id> -a govita    # DATABASE_URL o'zi qo'yiladi
fly storage create -a govita             # rasmlar (Tigris), AWS_* o'zi qo'yiladi
```

### 3. Saytning maxfiy qiymatlari
```bash
openssl rand -hex 16          # chiqqan qiymat — ADMIN_SETUP_TOKEN, o'zingiz saqlang (6-qadam)
fly secrets set -a govita \
  ADMIN_SESSION_SECRET="$(openssl rand -base64 48)" \
  ADMIN_SETUP_TOKEN=<yuqoridagi qiymat> \
  EMAIL_TOKEN_SECRET="$(openssl rand -base64 32)" \
  INTEGRATION_ENCRYPTION_KEY="$(openssl rand -hex 32)" \
  CRON_SECRET="$(openssl rand -hex 24)" \
  TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=...
```
Windows'da `openssl` Git Bash ichida bor.
- **Operator Telegram'i** (buyurtmalar keladigan guruh): @BotFather → `/newbot` →
  token = `TELEGRAM_BOT_TOKEN`. Botni guruhga qo'shing, guruhga bitta xabar
  yozing, brauzerda `https://api.telegram.org/bot<TOKEN>/getUpdates` →
  `"chat":{"id":-100…}` = `TELEGRAM_CHAT_ID`. Bo'lmasa buyurtma bazaga yoziladi,
  lekin operatorga xabar bormaydi.

### 4. Birinchi deploy (GitHub orqali)
```bash
fly tokens create deploy -a govita -x 999999h
```
Token → GitHub → repo → Settings → Secrets and variables → Actions →
`FLY_API_TOKEN`. Keyin GitHub → Actions → «Deploy to Fly» → **Run workflow**.
Migratsiyalar (`release_command`) o'zi yuradi. Bundan keyin `main` ga har
merge avtomatik deploy bo'ladi.

### 5. Tekshirish
`https://govita.fly.dev/uz` ochiladi; `fly logs -a govita` da xato yo'q.

### 6. Birinchi admin
`https://govita.fly.dev/admin/setup` → 3-qadamdagi `ADMIN_SETUP_TOKEN` →
email + parol (≥ 12). Saytdagi mahsulotlar, kategoriyalar va brendlar birinchi
ishga tushishda bazaga **o'zi ko'chadi** (rasmlari bilan — fayllar repo'dagi
`public/products/` va `public/images/products/`). Keyinroq saytga yangi mahsulot
kodda qo'shilsa, Katalog → Mahsulotlar sahifasida «panelda yo'q» kartasi chiqadi —
«Panelga olish» faqat yetishmaganini qo'shadi, tahrirlanganini o'zgartirmaydi. Keyin:
```bash
fly secrets unset ADMIN_SETUP_TOKEN -a govita
```

### 7. Domen (Vercel'dan ko'chirish)
```bash
fly certs add www.govita.uz -a govita
fly certs add govita.uz -a govita
fly ips list -a govita        # A (IPv4) va AAAA (IPv6)
```
DNS'da: `govita.uz` → A/AAAA (yuqoridagi IP), `www` → CNAME `govita.fly.dev`.
`fly certs show www.govita.uz` tayyor bo'lgach — Vercel loyihasidan domenni
olib tashlang. Kechasi qiling: DNS bir necha daqiqa yangilanadi.

### 8. Telegram klub boti (Mini App) — domendan **keyin**
Mini App manzili `www.govita.uz` — domen Fly'ga o'tmaguncha u Vercel'ni ochadi.
Qadamlar: **[`BOT-ADMIN.md`](BOT-ADMIN.md) → «Sozlash»** (yangi bot,
`BOT_API_KEY` + `TELEGRAM_CLUB_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_CLUB_BOT`,
`govita-bot` ilovasi, `FLY_BOT_API_TOKEN`).

### 9. Keyinroq (ixtiyoriy)
Email (Resend + DNS yozuvlari), analytics ID'lari (`fly.toml [build.args]`),
`CSP_MODE=enforce` — [`QOLGAN-ISHLAR.md`](QOLGAN-ISHLAR.md).
Onlayn to'lov (Payme, Click) deploy sozlamasi emas — `/admin/integrations` →
«Onlayn toʻlov» da kalitlar kiritilib yoqiladi (`INTEGRATION_ENCRYPTION_KEY` kerak).
Batafsil: [`ADMIN.md`](ADMIN.md#onlayn-toʻlov-payme-click).

## Build vaqtidagi qiymatlar

`NEXT_PUBLIC_*` brauzer bundle'iga build paytida yoziladi, shuning uchun ular
**secret emas** — `fly.toml` dagi `[build.args]` da turadi (GTM, GA4, Pixel,
Metrika, Telegram bot nomi, `CSP_MODE`,
`STORAGE_PUBLIC_URL`). O'zgartirgandan keyin qayta deploy kerak.

`GOVITA_PRODUCTION=1` build va runtime'da yoqilgan: demo bayroqlari bilan build
yiqiladi, buyurtma Telegram'ga yetmasa rad etiladi (`lib/config/live.ts`).

## Telegram klub boti (ikkinchi app)

Bot — alohida Fly app (`govita-bot`, `govita-vip-bot/fly.toml`): bitta mashina,
HTTP xizmati yoʻq, Telegram'ni long-polling qiladi va saytning `/api/bot` iga
murojaat qiladi. Sayt tomoni: `BOT_API_KEY`, `TELEGRAM_CLUB_BOT_TOKEN` secret'lari va
`NEXT_PUBLIC_TELEGRAM_CLUB_BOT` build arg. Toʻliq qadamlar: **[`BOT-ADMIN.md`](BOT-ADMIN.md)**.

## Xabarlar ishchisi (SMS, avtomatlashtirish)

Ishchi **sayt jarayonining ichida** yuradi (`instrumentation.ts` →
`lib/messaging/worker.ts`): har 60 soniyada navbatdagi SMS/Telegram xabarlarini
yuboradi, har 5 daqiqada avtomatlashtirish oqimlarini tekshiradi. Shuning uchun
`fly.toml` dagi `auto_stop_machines = "off"` va `min_machines_running = 1`
**kerak** — mashina uxlasa, xabarlar ham to'xtaydi (yo'qolmaydi, uyg'ongach ketadi).
Ikkinchi mashina qo'shilsa ham xavfsiz: bazadagi advisory lock va `SKIP LOCKED`
bitta xabarni ikki marta yubormaydi.

Ixtiyoriy tashqi cron (masalan, Fly scheduled machine yoki uptime-servis):
`curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://www.govita.uz/api/cron/messages`.
O'chirish: `MESSAGE_WORKER=off` (cron endpoint ishlayveradi).

Ishchi yana: har daqiqada xabarlarni 50 tadan, bir vaqtda 4 tadan yuboradi va
navbat to'la bo'lsa daqiqaning 40 soniyasigacha davom etadi; aksiya/banner oynasi
ochilgan yoki yopilgan sahifalarni yangilaydi; heartbeat'ni `ops_state` ga yozadi.
Har 5 daqiqada: yetib bormagan operator xabarlarini qayta yuboradi, muddati
o'tgan to'lanmagan onlayn buyurtmalarni bekor qiladi (`orders.releaseUnpaidHours`,
`/admin/products` → «Ombor», standart 24 soat), operator ogohlantirishlari
(`lib/ops/alerts.ts`). Har soatda: ballar muddati, saqlash muddati (`lib/ops/retention.ts`).

Secret'lar: `MESSAGE_LINK_SECRET` va `LOYALTY_SECRET` — live deploy'da (`GOVITA_PRODUCTION=1`)
**majburiy** (bo'lmasa birinchi STOP havolasi yoki ball kodi xato beradi; `ci-prepare.sh`
ikkalasini bir marta yaratadi). `MESSAGE_LINK_SECRET` ni **o'zgartirmang**: SMS dagi STOP va
qisqa havolalar shu kalit bilan imzolangan. `LOYALTY_SECRET` almashtirilsa faqat 5 daqiqalik
kodlar va 30 daqiqalik tokenlar bekor bo'ladi.
Eskiz login/parol — `/admin/integrations` (shifrlangan) yoki `ESKIZ_EMAIL`,
`ESKIZ_PASSWORD`, `ESKIZ_SENDER` secret'lari. `SMS_FAKE=1` live deploy'da
(`GOVITA_PRODUCTION=1`) e'tiborga olinmaydi.

## Kuzatuv va ogohlantirish

- **`/api/health`** — tashqi uptime-monitor shu manzilni kuzatsin (Fly `/uz` ni
  tekshiradi). Baza o'lsa **503**. Tanada: `database`, `degraded` (bu mashina
  o'rnatilgan katalogga tushgan yoki ishchi 3 daqiqadan beri aylanmagan) va
  `worker` — oxirgi aylanish, navbat kechikishi, 10 daqiqadan ortiq kutayotganlar,
  soatlik xatolar, yetib bormagan buyurtma xabarlari. Faqat sonlar.
- **Operator guruhiga ogohlantirish** (har turdan 3 soatda bir martadan ko'p emas):
  soatiga 10 tadan ortiq xabar yuborilmasa, navbatda 50 tadan ortiq xabar 10
  daqiqadan beri tursa, buyurtma xabari guruhga yetmasa, sayt bazani o'qiy olmay
  o'rnatilgan katalogni ko'rsatsa.
- **`/admin/integrations` → «Tizim holati»** — nima yoqilgan (qiymatsiz), navbat
  holati va haftalik CSP buzilishlari.
- Har so'rovda `x-request-id` (javob sarlavhasida ham); server xatosi log'ida
  `rid=` bilan chiqadi.
- **CSP hisobotlari** `/api/csp-report` ga keladi (kunlik son, IP va sahifa
  manzilisiz). `CSP_MODE=enforce` ga o'tishdan oldin bir necha kun «Tizim holati»
  dagi ro'yxatni kuzating: haqiqiy analytics teglari bilan bo'sh bo'lsa — yoqing.
  `/admin` har doim o'zining qat'iy siyosati bilan (enforce) ishlaydi.

## Runbook — nosozlikda nima qilinadi

### Orqaga qaytarish (rollback)

```bash
fly releases -a govita                 # versiyalar va image'lar ro'yxati
fly deploy -a govita --image registry.fly.io/govita:deployment-<OLDINGI_ID>
```

`--image` qayta build qilmaydi — o'sha image darhol chiqadi. **Migratsiyalar
orqaga qaytmaydi**: shuning uchun quyidagi qoida.

### Migratsiya qoidasi: avval kengaytir, keyin qisqart (expand/contract)

Har migratsiya **faqat qo'shadi**: yangi jadval, yangi ustun (nullable yoki
default bilan), yangi indeks. Eski kod yangi sxemada ishlay olishi shart — aks
holda rollback buziladi va rolling deploy paytida eski mashina yiqiladi.

- Ustunni olib tashlash yoki nomini o'zgartirish **ikki relizda**: 1) kod uni
  o'qishni to'xtatadi (yangi ustunga ham yozadi), deploy; 2) keyingi relizda
  `drop column`.
- `not null` ni mavjud ustunga — avval default va to'ldirish, keyingi relizda constraint.
- Uzoq indeks — `create index concurrently` bitta tranzaksiyada ishlamaydi;
  katta jadvalda alohida qo'lda, so'ng `if not exists` bilan migratsiyaga.
- Eski migratsiya faylini o'zgartirmang (`migrate.mjs` checksum bilan rad etadi) —
  yangi `00NN_*.sql`.
- Ilova roli uchun so'rov chegarasi 30 s (0021); `migrate.mjs` o'z
  tranzaksiyasida uni olib tashlaydi.

### Zaxira nusxa va tiklash (backup/restore)

Fly Managed Postgres kunlik zaxira va PITR'ni o'zi qiladi — sozlamasini
`fly mpg` panelida tekshiring (QOLGAN-ISHLAR, X24). Qo'shimcha qo'lda nusxa:

```bash
fly mpg proxy -a <cluster> &           # localhost:16380 ga tunnel
pg_dump "postgres://…@localhost:16380/govita" -Fc -f govita-$(date +%F).dump
# tiklash — avval BO'SH bazaga, tekshirib, keyin DATABASE_URL ni almashtirish:
pg_restore -d "postgres://…/govita_restore" --no-owner govita-$(date +%F).dump
```

Yiliga bir marta tiklashni sinab ko'ring (bo'sh bazaga, sayt `DATABASE_URL` bilan
lokal ishga tushadi). Rasmlar Tigris'da — bucket o'chirilmasa yo'qolmaydi.

### Kalitlar: saqlash va almashtirish

Kalitlar faqat GitHub Secrets va Fly secrets'da. Parol menejerida (egasi)
alohida nusxa saqlansin — ayniqsa **`INTEGRATION_ENCRYPTION_KEY`**: u yo'qolsa
paneldagi barcha shifrlangan kalitlar (Eskiz, Payme, Click, bot tokenlari)
ochilmaydi va qayta kiritiladi.

| Kalit | Almashtirilsa | Qanday |
|---|---|---|
| `ADMIN_SESSION_SECRET` | hamma admin chiqib ketadi; 2FA sirlari ochilmaydi (qayta ulash kerak) | `fly secrets set` → deploy |
| `INTEGRATION_ENCRYPTION_KEY` | panelga kiritilgan maxfiy kalitlar qayta kiritiladi | yangi qiymat → `/admin/integrations` da kalitlarni qayta saqlash |
| `MESSAGE_LINK_SECRET` | yuborilgan SMS'dagi STOP va `/r/` havolalari ishlamay qoladi | **almashtirmang**; faqat sizib chiqsa |
| `LOYALTY_SECRET` | ochiq SMS kodlari va 30 daqiqalik tokenlar bekor | istalgan vaqt |
| `BOT_API_KEY` | bot va sayt bir vaqtda yangilanadi | ikkala app'ga bir xil qiymat, ketma-ket deploy |
| `CRON_SECRET`, `EMAIL_TOKEN_SECRET` | tashqi cron / ochiq email havolalari | yangi qiymat → deploy |

`ci-prepare.sh` ichki kalitlarni **faqat yo'q bo'lsa** yaratadi — mavjudini hech
qachon almashtirmaydi; almashtirish har doim qo'lda va ataylab.

### Tez-tez uchraydigan nosozliklar

- **Eskiz ishlamayapti** (ogohlantirish «yuborilmadi»): `/admin/integrations` →
  «Test SMS». Navbat yo'qolmaydi — qayta urinishlar `MAX_SEND_ATTEMPTS` gacha,
  keyin `failed`; Eskiz tiklangach yangi xabarlar ketadi. Timeout bo'lgan SMS
  **qayta yuborilmaydi** (yetib borgan bo'lishi mumkin) — `/admin/messages` da
  `eskiz_timeout`.
- **Telegram (operator) ishlamayapti**: buyurtmalar bazada turadi (`/admin/orders`),
  buyurtma sahifasida «Telegram xabari yetib bormagan»; ishchi 24 soat ichida 6
  marta qayta yuboradi.
- **Ishchi to'xtagan** (`worker.state = stale`): `fly logs -a govita | grep messages`;
  `MESSAGE_WORKER=off` emasligini tekshiring; vaqtincha
  `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://www.govita.uz/api/cron/messages`.
- **Baza yo'q** (`/api/health` 503): sayt o'rnatilgan katalog bilan sotishda davom
  etadi, buyurtma bazasiz qabul qilinmaydi (`ORDERS_IN_DB`). `fly mpg status`.

## Nima o'zgarmadi

- `npm run build` CI'da avvalgidek (standalone faqat `BUILD_STANDALONE=1` da).
- Build paytida baza yo'q — sahifalar o'rnatilgan katalogdan prerender bo'ladi;
  server ishga tushgach 15 soniyada butun kesh eskirgan deb belgilanadi
  (`refreshAfterBoot`), keyingi tashrif bazadan chiziladi; admin saqlasa darhol yangilanadi.
- Image ichida ilova fayllari `root` ga tegishli; `app` foydalanuvchisi faqat
  `.next/cache` va ISR natijasiga yoza oladi. `BUCKET_NAME` build arg sifatida
  beriladi (`fly-deploy.yml`) — rasm optimizatori faqat shu bucket'dan oladi.
- Marketing cron'i (`vercel.json`) backend deploy qilinmaguncha baribir hech narsa
  qilmaydi; backend chiqqanda Fly scheduled machine bilan ulanadi.
