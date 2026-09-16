#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export VITE_DEMO_API="${VITE_DEMO_API:-live}"

echo "==> Building tariff-prices demo (API=$VITE_DEMO_API)..."
npm run build:tariff-prices

echo "==> Building report-revenue demo (API=$VITE_DEMO_API)..."
npm run build:report-revenue

echo "==> Building xlsx-pipeline demo..."
npm run build:xlsx-pipeline

echo "==> Building fleet-data-fix demo..."
npm run build:fleet-data-fix

echo "==> Building divisions demo..."
npm run build:divisions

FAMILY_MEALS_ROOT="../family_meal-planning/frontend"
if [ -d "$FAMILY_MEALS_ROOT" ]; then
    echo "==> Building family-meals demo..."
    npm run build:family-meals
else
    echo "==> Skipping family-meals (repo not found at $FAMILY_MEALS_ROOT)"
fi

echo "==> All available demos built."
