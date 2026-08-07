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
  --exclude docker/nginx/conf.d/site.conf \
  --exclude docker/nginx/conf.d/site.http.conf.disabled \
  "${ROOT}/" "${TARGET}:/opt/danilmakes/"

# Keep production SSL vhost in sync with example (DOMAIN substituted; gzip lives in nginx.conf)
ssh "${TARGET}" 'set -euo pipefail
cd /opt/danilmakes
DOMAIN="${DOMAIN:-danilmakes.ru}"
if [[ -f docker/nginx/conf.d/site.ssl.conf.example ]]; then
  sed "s/DOMAIN/${DOMAIN}/g" docker/nginx/conf.d/site.ssl.conf.example > docker/nginx/conf.d/site.conf
fi
if [[ -f docker/nginx/conf.d/site.http.conf ]]; then
  mv -f docker/nginx/conf.d/site.http.conf docker/nginx/conf.d/site.http.conf.disabled
fi
'

echo "==> Running deploy on server..."
ssh "${TARGET}" 'cd /opt/danilmakes && ./scripts/deploy.sh'

echo "==> Done."
