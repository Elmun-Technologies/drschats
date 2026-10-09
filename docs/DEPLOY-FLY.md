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

## Birinchi o'rnatish (bir marta)

Buyruqlar `flyctl` ning joriy versiyasiga tayanadi; nom yoki flag o'zgargan bo'lsa
`fly <buyruq> --help` ni tekshiring.

```bash
# 1. Ilova (fly.toml dagi nom: govita — band bo'lsa o'zgartiring)
fly apps create govita

# 2. Baza — Managed Postgres, ilova bilan bir regionda
fly mpg create            # region: fra
fly mpg attach <cluster-id> -a govita   # DATABASE_URL secret'ini o'zi qo'yadi

# 3. Rasmlar (ixtiyoriy) — AWS_* va BUCKET_NAME secret'larini o'zi qo'yadi
fly storage create -a govita

# 4. Qolgan maxfiy qiymatlar (chatga yozmang, faqat terminalda)
fly secrets set -a govita \
  ADMIN_SESSION_SECRET="$(openssl rand -base64 48)" \
  ADMIN_SETUP_TOKEN="$(openssl rand -hex 16)" \
  TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... \
  EMAIL_TOKEN_SECRET="$(openssl rand -base64 32)"

# 5. Deploy
fly deploy
```

`ADMIN_SETUP_TOKEN` ni `fly secrets list` emas, o'zingiz saqlab qo'ying — u faqat
`/admin/setup` da bir marta kerak. Birinchi admin yaratilgach:
`fly secrets unset ADMIN_SETUP_TOKEN -a govita`.

## Domen

```bash
fly certs add www.govita.uz -a govita
fly certs add govita.uz -a govita
fly ips list -a govita        # A (IPv4) va AAAA (IPv6) qiymatlari
```

DNS'da (domen registratori): `govita.uz` → A/AAAA (yuqoridagi IP), `www` → CNAME
`govita.fly.dev`. Sertifikat tayyor bo'lgach (`fly certs show www.govita.uz`)
Vercel loyihasidan domenni olib tashlang. Kechasi qiling — DNS yangilanishi
bir necha daqiqa davom etishi mumkin.

## Avtomatik deploy (GitHub)

```bash
fly tokens create deploy -a govita -x 999999h
```

Chiqqan token'ni GitHub → Settings → Secrets → Actions → `FLY_API_TOKEN` ga qo'ying.
Shundan keyin `main` ga har merge avtomatik deploy bo'ladi. Token bo'lmasa
workflow jim o'tkazib yuboradi.

## Build vaqtidagi qiymatlar

`NEXT_PUBLIC_*` brauzer bundle'iga build paytida yoziladi, shuning uchun ular
**secret emas** — `fly.toml` dagi `[build.args]` da turadi (GTM, GA4, Pixel,
Metrika, Telegram bot nomi, Payme/Click/Uzum merchant ID, `CSP_MODE`,
`STORAGE_PUBLIC_URL`). O'zgartirgandan keyin qayta deploy kerak.

`GOVITA_PRODUCTION=1` build va runtime'da yoqilgan: demo bayroqlari bilan build
yiqiladi, buyurtma Telegram'ga yetmasa rad etiladi (`lib/config/live.ts`).

## Nima o'zgarmadi

- `npm run build` CI'da avvalgidek (standalone faqat `BUILD_STANDALONE=1` da).
- Build paytida baza yo'q — sahifalar o'rnatilgan katalogdan prerender bo'ladi va
  runtime'da bazadan yangilanadi (ISR); admin saqlasa darhol yangilanadi.
- Marketing cron'i (`vercel.json`) backend deploy qilinmaguncha baribir hech narsa
  qilmaydi; backend chiqqanda Fly scheduled machine bilan ulanadi.
