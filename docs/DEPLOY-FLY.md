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
**Payme/Click/Uzum merchant ID'larini qo'ymang** — gateway handoff va server
tomondan tasdiqlangan payment callback hali yozilmagan. ID mavjudligi checkout'ni
yoqmaydi; hozir mijozlar uchun faqat yetkazishda naqd to'lov faol.

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

Secret'lar: `MESSAGE_LINK_SECRET` (ixtiyoriy, lekin tavsiya — `openssl rand -base64 32`;
bo'lmasa `EMAIL_TOKEN_SECRET`, keyin `ADMIN_SESSION_SECRET` ishlatiladi. **Bir marta
qo'yib, o'zgartirmang**: SMS dagi STOP va qisqa havolalar shu kalit bilan imzolangan).
`LOYALTY_SECRET` (ixtiyoriy) — ballarni ishlatish SMS kodining HMAC'i va muvaffaqiyat
sahifasi kvitansiyasi; bo'lmasa `ADMIN_SESSION_SECRET` dan keltiriladi. Almashtirilsa
faqat 5 daqiqalik kodlar va 30 daqiqalik tokenlar bekor bo'ladi.
Eskiz login/parol — `/admin/integrations` (shifrlangan) yoki `ESKIZ_EMAIL`,
`ESKIZ_PASSWORD`, `ESKIZ_SENDER` secret'lari. `SMS_FAKE=1` live deploy'da
(`GOVITA_PRODUCTION=1`) e'tiborga olinmaydi.

## Nima o'zgarmadi

- `npm run build` CI'da avvalgidek (standalone faqat `BUILD_STANDALONE=1` da).
- Build paytida baza yo'q — sahifalar o'rnatilgan katalogdan prerender bo'ladi va
  runtime'da bazadan yangilanadi (ISR); admin saqlasa darhol yangilanadi.
- Marketing cron'i (`vercel.json`) backend deploy qilinmaguncha baribir hech narsa
  qilmaydi; backend chiqqanda Fly scheduled machine bilan ulanadi.
