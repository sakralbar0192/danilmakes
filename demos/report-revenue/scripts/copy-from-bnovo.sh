#!/usr/bin/env bash
set -euo pipefail

BNovo="/home/dukhov/projects/bnovo_pms/bnovopms.ui/src"
DEST="/home/dukhov/projects/danilmakes/demos/report-revenue/src"

mkdir -p "$DEST"

# Screen
rsync -a --exclude '__tests__' --exclude 'docs' \
  "$BNovo/screens/bnovo-report-revenue/" \
  "$DEST/screens/report-revenue/"

# Store
mkdir -p "$DEST/store/modules/reports"
cp "$BNovo/store/modules/reports/revenue.js" "$DEST/store/modules/reports/"

# Models
mkdir -p "$DEST/models/reports/revenue"
cp "$BNovo/models/reports/revenue/"*.js "$DEST/models/reports/revenue/"
mkdir -p "$DEST/models/service"
cp "$BNovo/models/service/index.js" "$DEST/models/service.js" 2>/dev/null || cp "$BNovo/models/service/index.js" "$DEST/models/service/"
cp "$BNovo/models/core.js" "$DEST/models/" 2>/dev/null || true
cp "$BNovo/models/hotel.js" "$DEST/models/" 2>/dev/null || true
cp "$BNovo/models/roomtype.js" "$DEST/models/" 2>/dev/null || true

# Services
mkdir -p "$DEST/services/reports"
cp "$BNovo/services/reports/revenue-report.js" "$DEST/services/reports/"
cp "$BNovo/services/reports/revenue-plan.js" "$DEST/services/reports/"
cp "$BNovo/services/core.js" "$DEST/services/" 2>/dev/null || true
cp "$BNovo/services/hotel.js" "$DEST/services/" 2>/dev/null || true
cp "$BNovo/services/automation/index.js" "$DEST/services/automation.js" 2>/dev/null || true

# Utils
mkdir -p "$DEST/utils"
for f in object.js uid.js array-helpers.js array-set-content.js object-structure-formatter.js \
  string-helpers.js form-data.js uri-helpers.js http.js ym-helpers.js date.js colors.js \
  language.js string.js compat-model.js; do
  cp "$BNovo/utils/$f" "$DEST/utils/" 2>/dev/null || true
done

# Mixins
mkdir -p "$DEST/mixins"
for f in appstate-mixin.js once-show.js vue2-listeners-compat.js; do
  cp "$BNovo/mixins/$f" "$DEST/mixins/" 2>/dev/null || true
done

# Router helpers
mkdir -p "$DEST/router/helpers"
cp "$BNovo/router/helpers/account.js" "$DEST/router/helpers/" 2>/dev/null || true

# Config
mkdir -p "$DEST/config"
cp "$BNovo/config/environment.js" "$DEST/config/" 2>/dev/null || true

# Charts + extra UIKit
mkdir -p "$DEST/uikit/charts" "$DEST/uikit/b-data-table" "$DEST/uikit/b-widget-wrapper/components" \
  "$DEST/uikit/b-widget-wrapper/styles" "$DEST/uikit/b-dialog/assets"
cp "$BNovo/uikit/charts/"*.vue "$DEST/uikit/charts/"
cp "$BNovo/uikit/b-data-table/"* "$DEST/uikit/b-data-table/" 2>/dev/null || true
cp "$BNovo/uikit/b-widget-wrapper/"* "$DEST/uikit/b-widget-wrapper/" 2>/dev/null || true
cp -r "$BNovo/uikit/b-widget-wrapper/components" "$DEST/uikit/b-widget-wrapper/" 2>/dev/null || true
cp -r "$BNovo/uikit/b-widget-wrapper/styles" "$DEST/uikit/b-widget-wrapper/" 2>/dev/null || true
cp "$BNovo/uikit/b-btn-download.vue" "$DEST/uikit/" 2>/dev/null || true
cp "$BNovo/uikit/b-btn-group-separate.vue" "$DEST/uikit/" 2>/dev/null || true
cp "$BNovo/uikit/b-dialog/assets/sizing.js" "$DEST/uikit/b-dialog/assets/" 2>/dev/null || true

echo "Copy complete -> $DEST"
