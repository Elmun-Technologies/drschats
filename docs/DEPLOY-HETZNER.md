# Hetzner'ga deploy

Bitta server, Docker Compose: **Caddy** (HTTPS avtomatik) → **app** (Next.js, `Dockerfile`)
→ **Postgres 17** (server ichida, internetga ochilmaydi). Yonida: **migrate** (har deploy'da
app'dan oldin), **backup** (kunlik `pg_dump`), **bot** (Telegram klub, ixtiyoriy).
Rasmlar — Hetzner Object Storage (S3).

Fayllar: `deploy/hetzner/` (`compose.yaml`, `Caddyfile`, `.env.example`, `setup.sh`),
workflow: `.github/workflows/hetzner-deploy.yml`.

`main` ga merge → CI yashil → image `ghcr.io/elmun-technologies/drschats:<sha>` → serverda
`migrate` + `up -d` → `https://www.govita.uz/api/health` tekshiriladi.

> **Qonun.** ZRU-547 (shaxsiy maʼlumotlar) Oʻzbekiston fuqarolarining maʼlumotini
> Oʻzbekistondagi serverda saqlashni talab qiladi; Hetzner — Germaniya/Finlyandiya.
> Ishga tushirishdan oldin yurist bilan tekshiring (pd.gov.uz reyestri ham). Kerak boʻlsa xuddi
> shu `deploy/hetzner/` mahalliy VPS'da (UZ data-markaz) ham oʻzgarishsiz ishlaydi.

## 1. Server (bir marta, ~20 daqiqa)

1. **Hetzner Cloud → Add server**: Ubuntu 24.04, joy **Falkenstein / Nuremberg**
   (Toshkentgacha eng yaqin), turi **CPX21** (3 vCPU, 4 GB) yoki **CX32** (4 vCPU, 8 GB).
   2 GB yetmaydi (Next + Postgres). **Backups** belgisini yoqing (+20%, kunlik disk nusxasi).
   SSH kalitingizni qoʻshing.
2. Serverga kiring va sozlang:
   ```bash
   ssh root@<server-ip>
   curl -fsSL https://raw.githubusercontent.com/elmun-technologies/drschats/main/deploy/hetzner/setup.sh | bash
   ```
   Skript: Docker, firewall (22/80/443), avtomatik yangilanishlar, `deploy` foydalanuvchisi,
   `/opt/govita/` va **ichki kalitlar bilan `.env`** (bir marta; qayta ishga tushsa tegmaydi).
3. `/opt/govita/.env` ni toʻldiring (`nano /opt/govita/.env`): `TELEGRAM_BOT_TOKEN`,
   `TELEGRAM_CHAT_ID` (**majburiy** — busiz buyurtma rad etiladi), `AWS_*`/`BUCKET_NAME`/
   `STORAGE_PUBLIC_URL` (3-band), `ESKIZ_*`.
   `POSTGRES_PASSWORD` va `INTEGRATION_ENCRYPTION_KEY` ni **parol menejeriga** saqlang —
   yoʻqolsa panelga kiritilgan kalitlar (Payme, Click, Eskiz) qayta kiritiladi.

## 2. DNS

`govita.uz` va `www.govita.uz` → server IP (A, IPv6 boʻlsa AAAA). Caddy sertifikatni
birinchi soʻrovda oʻzi oladi (80 va 443 ochiq boʻlishi shart). Asosiy manzil — `www`,
`govita.uz` unga 301.

## 3. Rasmlar: Object Storage

Hetzner Console → **Object Storage → Create bucket** (masalan `govita-media`, `fsn1`),
koʻrinishi **Public**. **S3 credentials** yarating.

```env
AWS_ENDPOINT_URL_S3=https://fsn1.your-objectstorage.com
AWS_REGION=fsn1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
BUCKET_NAME=govita-media
STORAGE_PUBLIC_URL=https://govita-media.fsn1.your-objectstorage.com
```

`STORAGE_PUBLIC_URL` va `BUCKET_NAME` **build vaqtida ham** kerak (rasm optimizatori va CSP
shu hostga ruxsat beradi) — GitHub **Variables** ga ham yozing (4-band).

## 4. GitHub (avtomatik deploy)

Kompyuteringizda deploy kaliti:
```bash
ssh-keygen -t ed25519 -N "" -f govita-deploy -C github-deploy
```
`govita-deploy.pub` → serverda `/home/deploy/.ssh/authorized_keys` ga qoʻshing.

GitHub → repo → **Settings → Secrets and variables → Actions**:

| Turi | Nomi | Qiymat |
|---|---|---|
| Secret | `HETZNER_HOST` | server IP |
| Secret | `HETZNER_SSH_KEY` | `govita-deploy` (yopiq kalit) toʻliq matni |
| Secret | `HETZNER_KNOWN_HOSTS` | ixtiyoriy: `ssh-keyscan <ip>` natijasi (MITM'dan himoya) |
| Variable | `STORAGE_PUBLIC_URL`, `BUCKET_NAME` | 3-banddagi qiymatlar |
| Variable | `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_YANDEX_METRIKA_ID` | ixtiyoriy |
| Variable | `NEXT_PUBLIC_TELEGRAM_CLUB_BOT`, `NEXT_PUBLIC_DELIVERY_CUTOFF` | ixtiyoriy |

Keyin **Actions → Deploy to Hetzner → Run workflow** (main). Birinchi build ~10 daqiqa,
keyingilari kesh bilan tezroq.

**Fly'ni oʻchirish**: Fly'dan koʻchib boʻlgach `FLY_API_TOKEN` secret'ini oʻchiring — «Deploy to
Fly» oʻzi oʻtkazib yuboriladi.

## 5. Birinchi ishga tushirish

1. `https://www.govita.uz/admin/setup?token=<ADMIN_SETUP_TOKEN>` (`.env` dan) → ega akkaunti.
   Keyin `.env` dagi `ADMIN_SETUP_TOKEN` qatorini boʻshating va `docker compose up -d app`.
2. `/admin/security` → 2FA. `/admin/integrations` → Payme/Click, Eskiz, «Tizim holati».
3. Katalog birinchi ishga tushishda bazaga oʻzi koʻchadi.

**Fly'dagi bazani koʻchirish** (agar u yerda haqiqiy buyurtmalar boʻlsa):
```bash
fly mpg proxy <cluster-id> &   # localhost:16380
pg_dump "postgres://…@localhost:16380/…" --no-owner -Fc -f govita.dump
scp govita.dump deploy@<ip>:/opt/govita/backups/
ssh deploy@<ip> 'cd /opt/govita && docker compose stop app && docker compose exec -T db pg_restore -U govita -d govita --clean --if-exists --no-owner < backups/govita.dump && docker compose up -d app'
```

## 6. Telegram klub boti (ixtiyoriy)

`/opt/govita/bot.env` (namuna: `govita-vip-bot/.env.example`): `BOT_TOKEN`,
`GOVITA_API_KEY` (= `.env` dagi `BOT_API_KEY`), `OPERATOR_CHAT_ID`, `CLUB_CODE_PEPPER`.
`GOVITA_API_URL` compose'da ichki manzilga qoʻyilgan. Fayl boʻsh boʻlmasa deploy botni ham
koʻtaradi; qoʻlda: `docker compose --profile bot up -d bot`.

## Kundalik ishlar

```bash
ssh deploy@<ip>
cd /opt/govita
docker compose ps                      # holat
docker compose logs -f --tail=200 app  # log
docker compose restart app             # .env oʻzgargach: docker compose up -d app
```

**Zaxira**: `backup` har 24 soatda `/opt/govita/backups/govita-<sana>.sql.gz` (14 kun).
Bu **oʻsha diskda** — serverdan tashqariga ham nusxa oling: Hetzner Backups (1-band) va/yoki
haftada bir Object Storage'ga:
```bash
docker run --rm -v /opt/govita/backups:/b --env-file /opt/govita/.env amazon/aws-cli \
  s3 sync /b s3://govita-backup/ --endpoint-url https://fsn1.your-objectstorage.com
```
(alohida, **ochiq boʻlmagan** bucket). Tiklash:
```bash
gunzip -c backups/govita-YYYY-MM-DD-HHMM.sql.gz | docker compose exec -T db psql -U govita -d govita
```

**Orqaga qaytarish** (yangi reliz buzilsa): migratsiyalar faqat kengaytiradi, shuning uchun
eski image yangi sxemada ishlaydi:
```bash
cd /opt/govita
APP_IMAGE=ghcr.io/elmun-technologies/drschats:<eski-sha> docker compose up -d app
```
(`<eski-sha>` — GitHub → Actions dagi oxirgi yashil deploy commit'i.) Image private boʻlsa
avval `docker login ghcr.io` (read:packages tokeni).

**Yangilash ishlari serverda**: OS — avtomatik (unattended-upgrades), reboot kerak boʻlsa
`sudo reboot` (konteynerlar oʻzi koʻtariladi). Postgres major versiyasini oʻzgartirmang —
`pg-data` hajmi bilan mos kelmaydi (dump/restore orqali).

## Muammolar

| Belgi | Sabab |
|---|---|
| Sertifikat yoʻq, `ERR_SSL` | DNS hali serverga qaramaydi yoki 80-port yopiq: `docker compose logs caddy` |
| `migrate` yiqildi | `docker compose run --rm migrate` — xato matni; app eski holatda qoladi |
| `/api/health` 503 | baza: `docker compose logs db` |
| Rasm yuklanmaydi | `AWS_*`, bucket Public emas, yoki `STORAGE_PUBLIC_URL` build'da yoʻq (Variables) |
| Buyurtma «qabul qilinmadi» | `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` yoʻq yoki bot chatga qoʻshilmagan |
