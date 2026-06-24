#!/usr/bin/env bash
set -euo pipefail

BNovo="/home/dukhov/projects/bnovo_pms/bnovopms.ui/src"
DEST="/home/dukhov/projects/danilmakes/demos/tariff-prices/src"

mkdir -p "$DEST"

# Screen (no tests/docs)
rsync -a --exclude '__tests__' --exclude 'docs' \
  "$BNovo/screens/bnovo-tariff-prices-and-restrictions/" \
  "$DEST/screens/tariff-prices/"

# Store modules
mkdir -p "$DEST/store/modules/tariff"
for f in hotel.js hotel-room.js user.js additional-services.js device.js; do
  cp "$BNovo/store/modules/$f" "$DEST/store/modules/" 2>/dev/null || true
done
cp "$BNovo/store/modules/tariff/prices-and-restrictions.js" "$DEST/store/modules/tariff/"

# Models
mkdir -p "$DEST/models/tariff"
cp "$BNovo/models/tariff/prices-calendar-model.js" "$DEST/models/tariff/"
cp "$BNovo/models/tariff/rms-"*.js "$DEST/models/tariff/" 2>/dev/null || true
cp "$BNovo/models/tariff/merge-plan-keyed-snapshot.js" "$DEST/models/tariff/"
cp "$BNovo/models/tariff/tariff-interface-settings-model.js" "$DEST/models/tariff/" 2>/dev/null || true
cp "$BNovo/models/hotel.js" "$DEST/models/"
cp "$BNovo/models/roomtype.js" "$DEST/models/"

# Services
mkdir -p "$DEST/services/tariff" "$DEST/services"
cp "$BNovo/services/tariff/price-and-restrictions.js" "$DEST/services/tariff/"
cp "$BNovo/services/tariff/interface-settings.js" "$DEST/services/tariff/"
cp "$BNovo/services/tariff/extra-charges.js" "$DEST/services/tariff/"
cp "$BNovo/services/hotel.js" "$DEST/services/"
cp "$BNovo/services/core.js" "$DEST/services/" 2>/dev/null || true
cp "$BNovo/services/application/index.js" "$DEST/services/application.js" 2>/dev/null || true

# Utils (collect via grep later - copy common ones)
mkdir -p "$DEST/utils"
for f in object.js uid.js array-helpers.js array-set-content.js object-structure-formatter.js \
  string-helpers.js form-data.js uri-helpers.js http.js ym-helpers.js; do
  cp "$BNovo/utils/$f" "$DEST/utils/" 2>/dev/null || true
done

# Mixins
mkdir -p "$DEST/mixins"
for f in appstate-mixin.js size-mixin.js model-mixin.js rus-word-caser-mixin.js scroll-into-view.js once-show.js; do
  cp "$BNovo/mixins/$f" "$DEST/mixins/" 2>/dev/null || true
done

# Directives
mkdir -p "$DEST/directives"
cp "$BNovo/directives/text-highlight.js" "$DEST/directives/" 2>/dev/null || true

# UIKit - tariff deps
UIKit_FILES=(
  alerts/b-alert.vue alerts/assets/get-alert-icon.js
  b-teleport-wrapper.vue b-btn.vue b-checkbox.vue b-switch.vue b-btn-group.vue
  b-tooltip-arrowed.vue b-menu.vue b-menu-tooltip.vue b-drawer.vue
  b-screen-overlay.vue b-screen-footer.vue b-col.js b-input-label.vue
  b-chip.vue b-btn-download.vue b-datepicker-prefilters.vue
  b-phone-field.vue b-status.vue b-counter.vue b-icon-tooltip.vue
  b-input-group.vue b-text-field.vue b-options-group.vue
  b-dropdown-datepicker.vue b-layout-tabs.vue b-screen-header.vue
  b-related-dropdown-date-range/index.vue
  b-select/index.vue b-select/components/VSelectGrouped.js
)
mkdir -p "$DEST/uikit/b-select/components" "$DEST/uikit/b-related-dropdown-date-range" "$DEST/uikit/alerts/assets" "$DEST/uikit/b-datepicker"
rsync -a "$BNovo/uikit/b-datepicker/" "$DEST/uikit/b-datepicker/"
for rel in "${UIKit_FILES[@]}"; do
  mkdir -p "$DEST/uikit/$(dirname "$rel")"
  cp "$BNovo/uikit/$rel" "$DEST/uikit/$rel" 2>/dev/null || true
done

# Scenario stub path
mkdir -p "$DEST/scenario/tours/modules"
cp "$BNovo/scenario/tours/modules/tour-step.js" "$DEST/scenario/tours/modules/" 2>/dev/null || true

# Automation service fragments
cp "$BNovo/services/automation/index.js" "$DEST/services/automation.js" 2>/dev/null || true

echo "Copy complete -> $DEST"
