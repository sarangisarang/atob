#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# setup-vps.sh — ATOB Transport VPS one-time setup
# Run as root on a fresh Ubuntu 22.04 server
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

[[ $EUID -ne 0 ]] && error "Run as root: sudo bash setup-vps.sh"

DOMAIN="${1:-}"
EMAIL="${2:-}"
[[ -z "$DOMAIN" ]] && error "Usage: bash setup-vps.sh api.your-domain.com admin@email.com"
[[ -z "$EMAIL"  ]] && error "Usage: bash setup-vps.sh api.your-domain.com admin@email.com"

info "Setting up ATOB Transport on $DOMAIN"

# ─── System update ────────────────────────────────────────────────────────────
info "Updating system..."
apt-get update -qq && apt-get upgrade -y -qq

# ─── Docker ───────────────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
    info "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    info "Docker already installed: $(docker --version)"
fi

if ! docker compose version &>/dev/null; then
    info "Installing Docker Compose plugin..."
    apt-get install -y docker-compose-plugin
fi

# ─── Firewall ─────────────────────────────────────────────────────────────────
info "Configuring firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ─── App directory ────────────────────────────────────────────────────────────
APP_DIR="/opt/atob-transport"
info "Creating app directory: $APP_DIR"
mkdir -p "$APP_DIR"/{deploy,backend}

# ─── Copy files (assumes scp was done already) ───────────────────────────────
if [[ ! -f "$APP_DIR/deploy/docker-compose.prod.yml" ]]; then
    warn "Files not yet uploaded. Upload with:"
    warn "  scp -r ./deploy root@SERVER_IP:/opt/atob-transport/"
    warn "  scp -r ./backend root@SERVER_IP:/opt/atob-transport/"
    warn "Then re-run this script OR continue manually."
fi

# ─── .env setup ───────────────────────────────────────────────────────────────
if [[ ! -f "$APP_DIR/deploy/.env" ]]; then
    info "Creating .env from template..."
    cp "$APP_DIR/deploy/.env.template" "$APP_DIR/deploy/.env"
    chmod 600 "$APP_DIR/deploy/.env"
    warn "EDIT $APP_DIR/deploy/.env with real values before continuing!"
    warn "  nano $APP_DIR/deploy/.env"
fi

# ─── Nginx domain substitution ────────────────────────────────────────────────
info "Configuring Nginx for domain: $DOMAIN"
sed -i "s/api.YOUR-DOMAIN.com/$DOMAIN/g" \
    "$APP_DIR/deploy/nginx/conf.d/atob-init.conf" \
    "$APP_DIR/deploy/nginx/conf.d/atob.conf" 2>/dev/null || true

# ─── Start with HTTP-only config first (for certbot) ─────────────────────────
info "Starting services with HTTP-only config..."
cd "$APP_DIR/deploy"

# Use init config first
[[ -f nginx/conf.d/atob.conf ]] && mv nginx/conf.d/atob.conf nginx/conf.d/atob.conf.bak
docker compose -f docker-compose.prod.yml up -d --build postgres nginx backend

info "Waiting for backend to start..."
sleep 15

# ─── Let's Encrypt certificate ────────────────────────────────────────────────
info "Obtaining SSL certificate for $DOMAIN..."
docker compose -f docker-compose.prod.yml run --rm certbot \
    certonly --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive

# ─── Switch to HTTPS config ───────────────────────────────────────────────────
info "Switching to HTTPS config..."
[[ -f nginx/conf.d/atob.conf.bak ]] && mv nginx/conf.d/atob.conf.bak nginx/conf.d/atob.conf
rm -f nginx/conf.d/atob-init.conf

docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# ─── Backup cron ──────────────────────────────────────────────────────────────
info "Installing daily backup cron..."
CRON_LINE="0 3 * * * /opt/atob-transport/deploy/backup.sh >> /var/log/atob-backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v atob-backup; echo "$CRON_LINE") | crontab -

# ─── Create backups directory ─────────────────────────────────────────────────
mkdir -p "$APP_DIR/deploy/backups"
chmod 700 "$APP_DIR/deploy/backups"

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ATOB Transport VPS Setup Complete!"
echo "  API: https://$DOMAIN"
echo ""
echo "  NEXT STEPS:"
echo "  1. Verify: curl -k https://$DOMAIN/auth/me"
echo "  2. Run smoke test:"
echo "     BASE_URL=https://$DOMAIN bash $APP_DIR/scripts/smoke-phase1.sh"
echo "  3. Update frontend/src/config.js:"
echo "     export const API_BASE_URL = 'https://$DOMAIN';"
echo "  4. Rebuild APK"
echo "═══════════════════════════════════════════════════════"
