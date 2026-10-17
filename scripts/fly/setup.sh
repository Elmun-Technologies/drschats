#!/usr/bin/env bash
# Go Vita on Fly.io — one-time setup and first deploy (docs/DEPLOY-FLY.md).
#
#   bash scripts/fly/setup.sh            # app "govita" from fly.toml
#   APP=govita-test bash scripts/fly/setup.sh
#
# Safe to run again: every step checks what already exists and skips it. A
# secret that is already set is never overwritten, so rerunning cannot log
# admins out or make stored integration keys unreadable.
set -euo pipefail

cd "$(dirname "$0")/../.."
APP="${APP:-$(sed -n 's/^app = "\(.*\)"/\1/p' fly.toml)}"
REGION="${REGION:-fra}"

say()  { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
ok()   { printf '  ✓ %s\n' "$*"; }
ask()  { local reply; read -r -p "  $1 " reply; printf '%s' "$reply"; }
rand_b64() { openssl rand -base64 "$1" | tr -d '\n'; }
rand_hex() { openssl rand -hex "$1"; }

command -v fly >/dev/null 2>&1 || { echo "flyctl topilmadi: https://fly.io/docs/flyctl/install/"; exit 1; }
command -v openssl >/dev/null 2>&1 || { echo "openssl topilmadi (Windows'da Git Bash ichida ishga tushiring)"; exit 1; }

say "Fly hisobi"
fly auth whoami >/dev/null 2>&1 || fly auth login
ok "kirilgan: $(fly auth whoami)"

say "Ilova: $APP"
if fly apps list 2>/dev/null | awk '{print $1}' | grep -qx "$APP"; then
  ok "mavjud"
else
  fly apps create "$APP"
  ok "yaratildi"
fi

existing_secrets="$(fly secrets list -a "$APP" 2>/dev/null | awk 'NR>1 {print $1}')"
has_secret() { grep -qx "$1" <<<"$existing_secrets"; }

say "Baza (Fly Managed Postgres)"
if has_secret DATABASE_URL; then
  ok "DATABASE_URL allaqachon ulangan"
else
  echo "  Mavjud klasterlar:"
  fly mpg list 2>/dev/null || true
  cluster="$(ask "Klaster ID (bo'sh qoldirsangiz yangisi yaratiladi):")"
  if [ -z "$cluster" ]; then
    echo "  Region: $REGION tanlang."
    fly mpg create
    fly mpg list
    cluster="$(ask "Hozir yaratilgan klaster ID:")"
  fi
  fly mpg attach "$cluster" -a "$APP"
  ok "DATABASE_URL qo'yildi"
fi

say "Rasm yuklash (Tigris)"
if has_secret BUCKET_NAME; then
  ok "Tigris allaqachon ulangan"
else
  if [ "$(ask "Admin'dan rasm yuklash uchun Tigris yaratilsinmi? [Y/n]")" != "n" ]; then
    fly storage create -a "$APP"
    ok "AWS_* va BUCKET_NAME qo'yildi"
  fi
fi

say "Maxfiy kalitlar"
to_set=()
setup_token=""
has_secret ADMIN_SESSION_SECRET       || to_set+=("ADMIN_SESSION_SECRET=$(rand_b64 48)")
has_secret EMAIL_TOKEN_SECRET         || to_set+=("EMAIL_TOKEN_SECRET=$(rand_b64 32)")
has_secret INTEGRATION_ENCRYPTION_KEY || to_set+=("INTEGRATION_ENCRYPTION_KEY=$(rand_hex 32)")
has_secret CRON_SECRET                || to_set+=("CRON_SECRET=$(rand_hex 24)")
has_secret MESSAGE_LINK_SECRET        || to_set+=("MESSAGE_LINK_SECRET=$(rand_b64 32)")
has_secret LOYALTY_SECRET             || to_set+=("LOYALTY_SECRET=$(rand_b64 32)")
if ! has_secret ADMIN_SETUP_TOKEN; then
  setup_token="$(rand_hex 16)"
  to_set+=("ADMIN_SETUP_TOKEN=$setup_token")
fi
if ! has_secret TELEGRAM_BOT_TOKEN; then
  echo "  Buyurtmalar keladigan operator guruhi (docs/DEPLOY-FLY.md §3). Hozircha bo'lmasa — Enter."
  tg_token="$(ask "TELEGRAM_BOT_TOKEN:")"
  if [ -n "$tg_token" ]; then
    tg_chat="$(ask "TELEGRAM_CHAT_ID (-100…):")"
    to_set+=("TELEGRAM_BOT_TOKEN=$tg_token")
    [ -n "$tg_chat" ] && to_set+=("TELEGRAM_CHAT_ID=$tg_chat")
  fi
fi
if [ "${#to_set[@]}" -gt 0 ]; then
  fly secrets set -a "$APP" --stage "${to_set[@]}"
  ok "${#to_set[@]} ta kalit qo'yildi (deploy bilan kuchga kiradi)"
else
  ok "hammasi allaqachon bor"
fi

say "Deploy (Fly serverida build — 5–10 daqiqa)"
fly deploy -a "$APP" --remote-only
ok "https://$APP.fly.dev/uz"

say "Avtomatik deploy (GitHub → Fly)"
token="$(fly tokens create deploy -a "$APP" -x 999999h)"
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  gh secret set FLY_API_TOKEN --body "$token"
  ok "FLY_API_TOKEN GitHub'ga yozildi — main'ga har merge o'zi deploy bo'ladi"
else
  echo "  Quyidagi tokenni GitHub → Settings → Secrets and variables → Actions → FLY_API_TOKEN ga qo'ying:"
  echo "  $token"
fi

say "Tayyor"
if [ -n "$setup_token" ]; then
  echo "  1. https://$APP.fly.dev/admin/setup — kod: $setup_token"
  echo "     (bu kodni saqlang; birinchi admin yaratilgach: fly secrets unset ADMIN_SETUP_TOKEN -a $APP)"
else
  echo "  1. https://$APP.fly.dev/admin"
fi
echo "  2. Saytdagi mahsulotlar birinchi ishga tushishda bazaga o'zi ko'chadi (Katalog → Mahsulotlar)."
echo "  3. Domen: docs/DEPLOY-FLY.md §7 (fly certs add www.govita.uz -a $APP)."
