#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:?Set DOMAIN env variable}"
EMAIL="${CERTBOT_EMAIL:?Set CERTBOT_EMAIL env variable}"

COMPOSE="docker compose -f docker-compose.prod.yml"
CONF_DIR="docker/nginx/conf.d"

echo "==> Requesting certificate for $DOMAIN and www.$DOMAIN ..."
$COMPOSE run --rm --entrypoint certbot certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "==> Enabling HTTPS nginx config ..."
sed "s/DOMAIN/$DOMAIN/g" "$CONF_DIR/site.ssl.conf.example" > "$CONF_DIR/site.conf"

if [[ -f "$CONF_DIR/site.http.conf" ]]; then
  mv "$CONF_DIR/site.http.conf" "$CONF_DIR/site.http.conf.disabled"
fi

echo "==> Restarting nginx ..."
$COMPOSE restart nginx

echo "==> Done. Check: https://$DOMAIN"
