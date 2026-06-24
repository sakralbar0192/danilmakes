#!/usr/bin/env bash
set -euo pipefail

# Sync local project to VPS and run deploy.sh
# Usage: ./scripts/rsync-deploy.sh [user@host]

TARGET="${1:-root@109.71.242.7}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Syncing to ${TARGET}:/opt/danilmakes ..."
rsync -avz --delete \
  --exclude node_modules \
  --exclude server/node_modules \
  --exclude .git \
  --exclude dist \
  --exclude .env \
  "${ROOT}/" "${TARGET}:/opt/danilmakes/"

echo "==> Running deploy on server..."
ssh "${TARGET}" 'cd /opt/danilmakes && ./scripts/deploy.sh'

echo "==> Done."
