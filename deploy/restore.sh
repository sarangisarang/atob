#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# restore.sh — Restore PostgreSQL from backup
# Usage: bash restore.sh backups/atobapp_2026-05-30.sql.gz
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
BACKUP_FILE="${1:-}"

[[ -z "$BACKUP_FILE" ]] && {
    echo "Usage: bash restore.sh backups/atobapp_YYYY-MM-DD.sql.gz"
    echo ""
    echo "Available backups:"
    ls -1 "$SCRIPT_DIR/backups/"*.sql.gz 2>/dev/null || echo "  (none found)"
    exit 1
}

[[ ! -f "$BACKUP_FILE" ]] && { echo "[ERROR] File not found: $BACKUP_FILE"; exit 1; }

# Load .env
set -a; source "$ENV_FILE"; set +a

echo "[WARN] This will REPLACE the current database with: $BACKUP_FILE"
echo "       All current data will be lost."
read -rp "Type 'yes' to confirm: " CONFIRM
[[ "$CONFIRM" != "yes" ]] && { echo "Aborted."; exit 0; }

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Stopping backend..."
docker compose -f "$SCRIPT_DIR/docker-compose.prod.yml" stop backend

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Dropping and recreating database..."
docker compose -f "$SCRIPT_DIR/docker-compose.prod.yml" exec -T postgres \
    psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS ${DB_NAME};"
docker compose -f "$SCRIPT_DIR/docker-compose.prod.yml" exec -T postgres \
    psql -U "$DB_USER" -c "CREATE DATABASE ${DB_NAME};"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restoring from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | \
    docker compose -f "$SCRIPT_DIR/docker-compose.prod.yml" exec -T postgres \
    psql -U "$DB_USER" "$DB_NAME"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restarting backend..."
docker compose -f "$SCRIPT_DIR/docker-compose.prod.yml" start backend

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restore complete."
