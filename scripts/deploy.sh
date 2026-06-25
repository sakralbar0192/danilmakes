#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Pulling latest changes (if git repo)..."
if [ -d .git ]; then
    git pull origin master
else
    echo "    Skipped: not a git repository"
fi

echo "==> Building portfolio demos..."
npm run build:all-demos

echo "==> Building frontend..."
npm ci
npm run build

echo "==> Deploying containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Done. Site updated."
