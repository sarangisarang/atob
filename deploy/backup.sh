#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# backup.sh — Daily PostgreSQL backup for ATOB Transport
# Cron: 0 3 * * * /opt/atob-transport/deploy/backup.sh
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
BACKUP_DIR="$SCRIPT_DIR/backups"
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="$BACKUP_DIR/atobapp_${DATE}.sql.gz"
KEEP_DAYS=14

# Load .env
if [[ -f "$ENV_FILE" ]]; then
    set -a; source "$ENV_FILE"; set +a
else
    echo "[ERROR] .env not found at $ENV_FILE" >&2
    exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup..."

# Dump and compress
docker compose -f "$SCRIPT_DIR/docker-compose.prod.yml" exec -T postgres \
    pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete: $BACKUP_FILE ($SIZE)"

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "atobapp_*.sql.gz" -mtime "+${KEEP_DAYS}" -delete
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Old backups cleaned (kept last ${KEEP_DAYS} days)"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Done."
