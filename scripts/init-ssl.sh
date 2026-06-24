#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:?Set DOMAIN env variable}"
EMAIL="${CERTBOT_EMAIL:?Set CERTBOT_EMAIL env variable}"

docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

echo "Certificate obtained for $DOMAIN"
echo "Update nginx to use SSL config and restart: docker compose -f docker-compose.prod.yml up -d nginx"
