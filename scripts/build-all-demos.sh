#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building tariff-prices demo..."
npm run build:tariff-prices

echo "==> Building report-revenue demo..."
npm run build:report-revenue

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
