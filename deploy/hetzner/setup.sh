#!/usr/bin/env bash
# Yangi Hetzner server (Ubuntu 24.04) uchun bir martalik sozlash. root sifatida:
#   curl -fsSL https://raw.githubusercontent.com/elmun-technologies/drschats/main/deploy/hetzner/setup.sh | bash
# Qayta ishga tushirish xavfsiz: bor narsani buzmaydi, kalitlarni almashtirmaydi.
set -euo pipefail

APP_DIR=/opt/govita
DEPLOY_USER=deploy
RAW=https://raw.githubusercontent.com/elmun-technologies/drschats/main/deploy/hetzner

echo "==> Paketlar va Docker"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -yq ca-certificates curl ufw fail2ban unattended-upgrades openssl
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo "==> Firewall: faqat 22, 80, 443"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

echo "==> Avtomatik xavfsizlik yangilanishlari"
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> SSH: parol bilan kirish o'chiq"
if [ -s /root/.ssh/authorized_keys ]; then
  sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
  systemctl reload ssh || systemctl reload sshd || true
fi

echo "==> Deploy foydalanuvchisi ($DEPLOY_USER)"
id "$DEPLOY_USER" >/dev/null 2>&1 || useradd -m -s /bin/bash "$DEPLOY_USER"
usermod -aG docker "$DEPLOY_USER"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
touch "/home/$DEPLOY_USER/.ssh/authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh/authorized_keys"
chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"

echo "==> $APP_DIR"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR" "$APP_DIR/backups"
for f in compose.yaml Caddyfile; do
  curl -fsSL "$RAW/$f" -o "$APP_DIR/$f"
done
[ -f "$APP_DIR/bot.env" ] || touch "$APP_DIR/bot.env"

if [ ! -f "$APP_DIR/.env" ]; then
  echo "==> .env yaratilmoqda (ichki kalitlar bilan)"
  curl -fsSL "$RAW/.env.example" -o "$APP_DIR/.env"
  set_key() { sed -i "s|^$1=.*|$1=$2|" "$APP_DIR/.env"; }
  set_key POSTGRES_PASSWORD          "$(openssl rand -hex 24)"
  set_key ADMIN_SESSION_SECRET       "$(openssl rand -base64 48 | tr -d '\n/+=')"
  set_key EMAIL_TOKEN_SECRET         "$(openssl rand -base64 32 | tr -d '\n/+=')"
  set_key INTEGRATION_ENCRYPTION_KEY "$(openssl rand -hex 32)"
  set_key CRON_SECRET                "$(openssl rand -hex 24)"
  set_key MESSAGE_LINK_SECRET        "$(openssl rand -base64 32 | tr -d '\n/+=')"
  set_key LOYALTY_SECRET             "$(openssl rand -base64 32 | tr -d '\n/+=')"
  set_key RATE_LIMIT_SALT            "$(openssl rand -hex 16)"
  set_key ADMIN_SETUP_TOKEN          "$(openssl rand -hex 16)"
else
  echo "==> .env bor — tegilmadi"
fi
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"/{.env,bot.env,compose.yaml,Caddyfile}
chmod 600 "$APP_DIR/.env" "$APP_DIR/bot.env"

cat <<MSG

Tayyor. Keyingi qadamlar (docs/DEPLOY-HETZNER.md):
  1. $APP_DIR/.env ni to'ldiring: TELEGRAM_*, AWS_*/BUCKET_NAME, ESKIZ_* ...
  2. INTEGRATION_ENCRYPTION_KEY va POSTGRES_PASSWORD nusxasini parol menejeriga saqlang.
  3. GitHub Actions uchun deploy kalitini qo'shing:
       echo "<ochiq kalit>" >> /home/$DEPLOY_USER/.ssh/authorized_keys
  4. GitHub → Settings → Secrets: HETZNER_HOST, HETZNER_SSH_KEY  → main ga push = deploy.
MSG
