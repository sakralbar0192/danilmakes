#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

source .env 2>/dev/null || true

docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-danilmakes}" "${POSTGRES_DB:-danilmakes}" \
  > "$BACKUP_DIR/danilmakes_${TIMESTAMP}.sql"

echo "Backup saved to $BACKUP_DIR/danilmakes_${TIMESTAMP}.sql"
