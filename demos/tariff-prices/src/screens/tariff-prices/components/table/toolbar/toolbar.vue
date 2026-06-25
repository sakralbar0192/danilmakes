<template>
  <div class="tariff-prices-and-restrictions-table-toolbar">
    <div
      class="d-flex align-start justify-space-between bordered-r bordered-t bordered-l tariff-demo-table-header-cell"
      :class="actionsClasses"
    >
      <div
        :class="['d-flex align-center gap-x-groups flex-wrap gap-y-ingroup', $style['sticky-ctrl'], 'tariff-demo-table-sticky-header-inner']"
        :style="actionsStyles"
        style="min-width: 320px; max-width: calc(100vw - 470px);"
      >
        <toolbar-date-nav
          :date-from="dateFrom"
          :calendar-loading="calendarLoading"
          @change-date="$emit('change-date', $event)"
        />
        <template v-if="isDesktopDevice">
          <toolbar-price-restrictions-row
            variant="desktop"
            :mode="mode"
            :toolbar-interaction-locked="calendarLoading"
            :enabled-combined-mode="enabledCombinedMode"
            :is-rms-pricing-enabled="isRmsPricingEnabled"
            :is-one-of-prices-modes-enabled="isOneOfPricesModesEnabled"
            :is-combined-mode-enabled="isCombinedModeEnabled"
            :selected-restrictions="selectedRestrictions"
            :compact-restrictions="compactRestrictions"
            @change-mode="$emit('change-mode', $event)"
            @change-selected-restrictions="$emit('change-selected-restrictions', $event)"
            @change-compact-restrictions="$emit('change-compact-restrictions', $event)"
          />
        </template>
      </div>
      <div
        v-if="showMobileRestrictionFilterButton"
        :class="[$style['sticky-btn'], 'tariff-demo-table-sticky-header-inner']"
      >
        <restriction-filter-button
          :selected-restrictions="selectedRestrictions"
          :compact-restrictions="false"
          @click="$emit('show-restrictions-popup')"
        />
      </div>
    </div>
    <div
      v-if="!isDesktopDevice && showMobileToolbarSecondRow"
      class="d-flex align-center justify-space-between pt-0 bordered-r bordered-l tariff-demo-table-header-cell"
      :class="[actionsClasses, $style['mobile-second-row']]"
    >
      <div
        :class="['d-flex align-start flex-column gap-ingroup', $style['sticky-ctrl'], 'tariff-demo-table-sticky-header-inner']"
        :style="actionsStyles"
      >
        <toolbar-price-restrictions-row
          variant="mobile"
          :mode="mode"
          :enabled-combined-mode="enabledCombinedMode"
          :is-rms-pricing-enabled="isRmsPricingEnabled"
          :is-one-of-prices-modes-enabled="isOneOfPricesModesEnabled"
          :is-combined-mode-enabled="isCombinedModeEnabled"
          :selected-restrictions="selectedRestrictions"
          @change-mode="$emit('change-mode', $event)"
          @change-selected-restrictions="$emit('change-selected-restrictions', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ToolbarDateNav from "./toolbar-date-nav.vue";
import ToolbarPriceRestrictionsRow from "./toolbar-price-restrictions-row.vue";
import RestrictionFilterButton from "./restriction-filter-button.vue";

export default {
  name: "TariffPricesTableToolbar",
  components: {
    ToolbarDateNav,
    ToolbarPriceRestrictionsRow,
    RestrictionFilterButton,
  },
  props: {
    mode: {
      type: String,
      required: true,
    },
    dateFrom: {
      type: String,
      required: true,
    },
    calendarLoading: {
      type: Boolean,
      default: false,
    },
    enabledCombinedMode: {
      type: Boolean,
      default: false,
    },
    isRmsPricingEnabled: {
      type: Boolean,
      default: false,
    },
    isOneOfPricesModesEnabled: {
      type: Boolean,
      default: false,
    },
    isCombinedModeEnabled: {
      type: Boolean,
      default: false,
    },
    selectedRestrictions: {
      type: Array,
      default: () => [],
    },
    compactRestrictions: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    actionsClasses() {
      return { "pa-groups pb-inner": true };
    },
    actionsStyles() {
      return { left: "16px" };
    },
    showMobileRestrictionFilterButton() {
      return !this.isDesktopDevice && this.isCombinedModeEnabled;
    },
    showMobileToolbarSecondRow() {
      return this.isOneOfPricesModesEnabled && this.isRmsPricingEnabled;
    },
  },
};
</script>

<style lang="scss" module>
.sticky-btn {
  position: sticky;
  right: 0;
  z-index: 3;
  background-color: transparent;
}

.sticky-ctrl {
  position: sticky;
  left: 0;
  z-index: 3;
  background-color: transparent;
}

.mobile-second-row {
  min-height: 40px;
}
</style>
