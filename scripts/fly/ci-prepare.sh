#!/usr/bin/env bash
# Runs in GitHub Actions before every Fly deploy (.github/workflows/fly-deploy.yml).
#
# Makes the Fly side match what GitHub knows, so nobody has to open a terminal:
#   1. creates the app if it does not exist yet (needs an org token);
#   2. attaches Managed Postgres when FLY_MPG_CLUSTER_ID is given and the app
#      has no DATABASE_URL yet;
#   3. generates the internal keys the site needs, once — an existing key is
#      never replaced, so admins stay logged in and stored integration
#      secrets stay readable;
#   4. copies the optional secrets that are set in GitHub (Telegram, Eskiz,
#      Tigris, Resend…) to Fly, so a value is changed in one place: GitHub.
# Everything is staged; the deploy that follows applies it in one release.
set -euo pipefail

cd "$(dirname "$0")/../.."
APP="${APP:-$(sed -n 's/^app = "\(.*\)"/\1/p' fly.toml)}"
REGION="${REGION:-$(sed -n 's/^primary_region = "\(.*\)"/\1/p' fly.toml)}"

note() { echo "::notice title=Fly::$*"; }
warn() { echo "::warning title=Fly::$*"; }
fail() { echo "::error title=Fly::$*"; exit 1; }

# 1. App
if ! flyctl status -a "$APP" >/dev/null 2>&1; then
  if flyctl apps list --json 2>/dev/null | jq -e --arg a "$APP" '.[] | select((.Name // .name) == $a)' >/dev/null; then
    note "$APP mavjud (hali mashinasi yoʻq)"
  else
    note "$APP ilovasi yoʻq — yaratilmoqda"
    flyctl apps create "$APP" --org "${FLY_ORG:-personal}" ||
      fail "Ilovani yaratib boʻlmadi. FLY_API_TOKEN «org» token boʻlsin (Fly → Account → Access Tokens → Org token) yoki ilovani Fly panelida bir marta yarating. docs/DEPLOY-FLY.md"
  fi
fi

# A failed listing must stop here: treating it as "no secrets" would generate
# new keys over the existing ones — admins logged out, encrypted settings lost.
listing="$(flyctl secrets list -a "$APP" --json)" || fail "Fly kalitlar roʻyxatini oʻqib boʻlmadi — hech narsa oʻzgartirilmadi."
existing="$(jq -r '.[]? | (.Name // .name)' <<<"$listing")" || fail "Kalitlar roʻyxati kutilgan shaklda emas — hech narsa oʻzgartirilmadi."
has() { grep -qx "$1" <<<"$existing"; }

# 2. Database
if ! has DATABASE_URL; then
  if [ -n "${FLY_MPG_CLUSTER_ID:-}" ]; then
    note "Managed Postgres ulanmoqda ($REGION)"
    flyctl mpg attach "$FLY_MPG_CLUSTER_ID" -a "$APP" ||
      fail "Bazani ulab boʻlmadi: FLY_MPG_CLUSTER_ID toʻgʻrimi va token shu tashkilotnikimi?"
  else
    warn "DATABASE_URL yoʻq: sayt oʻrnatilgan katalogda ishlaydi, /admin yopiq. Fly panelida Managed Postgres yarating va uning ID sini GitHub'da FLY_MPG_CLUSTER_ID ga yozing."
  fi
fi

generated=()
synced=()

# 3. Internal keys: generated once, never rotated by CI.
gen() {
  local name="$1" value="$2"
  has "$name" && return 0
  echo "::add-mask::$value"
  generated+=("$name=$value")
  note "$name yaratildi"
}
gen ADMIN_SESSION_SECRET       "$(openssl rand -base64 48 | tr -d '\n')"
gen EMAIL_TOKEN_SECRET         "$(openssl rand -base64 32 | tr -d '\n')"
gen INTEGRATION_ENCRYPTION_KEY "$(openssl rand -hex 32)"
gen CRON_SECRET                "$(openssl rand -hex 24)"
gen MESSAGE_LINK_SECRET        "$(openssl rand -base64 32 | tr -d '\n')"
gen LOYALTY_SECRET             "$(openssl rand -base64 32 | tr -d '\n')"

# 4. Optional secrets kept in GitHub → Fly, passed in as SYNC_<NAME> by the
#    workflow (never read from the ambient environment). An empty one is left
#    alone, so removing it from GitHub never wipes a value set on Fly by hand.
for name in \
  ADMIN_SETUP_TOKEN \
  TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID \
  BOT_API_KEY TELEGRAM_CLUB_BOT_TOKEN \
  ESKIZ_EMAIL ESKIZ_PASSWORD ESKIZ_SENDER \
  RESEND_API_KEY EMAIL_FROM EMAIL_REPLY_TO \
  AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_ENDPOINT_URL_S3 AWS_REGION BUCKET_NAME \
  GOOGLE_SITE_VERIFICATION YANDEX_VERIFICATION; do
  var="SYNC_$name"
  value="${!var:-}"
  if [ -n "$value" ]; then synced+=("$name=$value"); fi
done

if [ "${#generated[@]}" -gt 0 ]; then
  flyctl secrets set -a "$APP" --stage "${generated[@]}" >/dev/null
fi
if [ "${#synced[@]}" -gt 0 ]; then
  flyctl secrets set -a "$APP" --stage "${synced[@]}" >/dev/null ||
    warn "GitHub kalitlarini Fly'ga yozib boʻlmadi — deploy eski qiymatlar bilan davom etadi"
  note "${#synced[@]} ta kalit GitHub'dan Fly'ga koʻchirildi"
fi
