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

## Noldan ishga tushirish — ketma-ketlik

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
email + parol (≥ 12). Kirgach: Bosh sahifa → **«Import»** (o'rnatilgan katalog
bazaga ko'chadi; narx va zaxirani shu yerda tahrirlaysiz). Keyin:
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
**Payme/Click/Uzum merchant ID'larini qo'ymang** — onlayn to'lov integratsiyasi
hali yozilmagan: ID qo'yilsa mijoz «to'ladim» deb o'ylaydi, pul olinmaydi.

## Build vaqtidagi qiymatlar

`NEXT_PUBLIC_*` brauzer bundle'iga build paytida yoziladi, shuning uchun ular
**secret emas** — `fly.toml` dagi `[build.args]` da turadi (GTM, GA4, Pixel,
Metrika, Telegram bot nomi, Payme/Click/Uzum merchant ID, `CSP_MODE`,
`STORAGE_PUBLIC_URL`). O'zgartirgandan keyin qayta deploy kerak.

`GOVITA_PRODUCTION=1` build va runtime'da yoqilgan: demo bayroqlari bilan build
yiqiladi, buyurtma Telegram'ga yetmasa rad etiladi (`lib/config/live.ts`).

## Telegram klub boti (ikkinchi app)

Bot — alohida Fly app (`govita-bot`, `govita-vip-bot/fly.toml`): bitta mashina,
HTTP xizmati yoʻq, Telegram'ni long-polling qiladi va saytning `/api/bot` iga
murojaat qiladi. Sayt tomoni: `BOT_API_KEY`, `TELEGRAM_CLUB_BOT_TOKEN` secret'lari va
`NEXT_PUBLIC_TELEGRAM_CLUB_BOT` build arg. Toʻliq qadamlar: **[`BOT-ADMIN.md`](BOT-ADMIN.md)**.

## Nima o'zgarmadi

- `npm run build` CI'da avvalgidek (standalone faqat `BUILD_STANDALONE=1` da).
- Build paytida baza yo'q — sahifalar o'rnatilgan katalogdan prerender bo'ladi va
  runtime'da bazadan yangilanadi (ISR); admin saqlasa darhol yangilanadi.
- Marketing cron'i (`vercel.json`) backend deploy qilinmaguncha baribir hech narsa
  qilmaydi; backend chiqqanda Fly scheduled machine bilan ulanadi.
