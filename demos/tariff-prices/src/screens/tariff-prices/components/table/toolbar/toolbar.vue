<template>
  <div class="tariff-prices-and-restrictions-table-toolbar">
    <div
      class="d-flex align-start justify-space-between bordered-r bordered-t bordered-l background-white"
      :class="actionsClasses"
    >
      <div
        :class="['d-flex align-center gap-x-groups flex-wrap gap-y-ingroup', $style['sticky-ctrl'], 'bnovo-tariff-prices-table-sticky-header-inner']"
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
        v-if="hasStickyRightActions"
        :class="[$style['sticky-btn'], 'bnovo-tariff-prices-table-sticky-header-inner']"
      >
        <div class="d-flex align-center gap-x-groups">
          <restriction-filter-button
            v-if="showMobileRestrictionFilterButton"
            :selected-restrictions="selectedRestrictions"
            :compact-restrictions="false"
            @click="$emit('show-restrictions-popup')"
          />
          <div class="d-flex align-center gap-x-groups" data-tour="prices-and-restrictions-tour-edit-drawers-step">
            <template v-if="hasEditActions && isDesktopDevice">
              <b-btn
                v-if="isAvailabilityEditable"
                data-test="tariff-edit-availability-button"
                @click="$emit('update-availability')"
              >
                {{ $t("Редактировать наличие") }}
              </b-btn>
              <b-btn
                v-if="canShowUpdateRestrictionsButton"
                data-test="tariff-edit-restrictions-button"
                @click="$emit('update-restrictions')"
              >
                {{ $t("Редактировать ограничения") }}
              </b-btn>
              <b-btn
                v-if="isOneOfPricesModesEnabled"
                data-test="tariff-edit-prices-button"
                @click="$emit('update-prices')"
              >
                {{ $t("Редактировать цены") }}
              </b-btn>
            </template>
            <template v-if="hasEditActions && !isDesktopDevice">
              <b-btn
                v-if="useMobileDirectEditAction"
                squared
                :data-test="mobileDirectEditActionTestId"
                @click="handleMobileActionClick(mobileEditActions[0].value)"
              >
                <v-icon class="icon-edit"/>
              </b-btn>
              <b-menu
                v-else
                v-model="mobileActionsMenu"
                left
                bottom
                attach
                :close-on-content-click="false"
              >
                <template #activator="props">
                  <b-btn
                    v-bind="{...props.attrs}"
                    squared
                    v-on="{...props.on}"
                    @click="openMobileActionsMenu"
                  >
                    <v-icon class="icon-edit"/>
                  </b-btn>
                </template>
                <v-card class="tariff-prices-and-restrictions-table-toolbar__mobile-menu">
                  <v-card-title class="px-outer pb-inner d-flex flex-nowrap align-center">
                    <h3 class="text-h3 mb-0 font-weight-bold">
                      {{ $t("Редактировать") }}
                    </h3>
                    <v-spacer/>
                    <b-btn
                      icon
                      color="tertiary"
                      text
                      small
                      @click="closeMobileActionsMenu"
                    >
                      <v-icon class="icon-cross"/>
                    </b-btn>
                  </v-card-title>
                  <v-card-text class="px-outer pt-0 pb-groups">
                    <div class="d-flex flex-column">
                      <b-btn
                        v-for="action in mobileEditActions"
                        :key="action.value"
                        :data-test="action.value === 'prices'
                          ? 'tariff-edit-prices-button'
                          : (action.value === 'availability'
                            ? 'tariff-edit-availability-button'
                            : 'tariff-edit-restrictions-button')"
                        text
                        large
                        color="tertiary"
                        width="100%"
                        class="justify-start"
                        @click="handleMobileActionClick(action.value)"
                      >
                        {{ action.label }}
                      </b-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </b-menu>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="!isDesktopDevice && showMobileToolbarSecondRow"
      class="d-flex align-center justify-space-between pt-0 bordered-r bordered-l background-white"
      :class="[actionsClasses, $style['mobile-second-row']]"
    >
      <div
        :class="['d-flex align-start flex-column gap-ingroup', $style['sticky-ctrl'], 'bnovo-tariff-prices-table-sticky-header-inner']"
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
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import ToolbarDateNav from "./toolbar-date-nav.vue";
import ToolbarPriceRestrictionsRow from "./toolbar-price-restrictions-row.vue";
import RestrictionFilterButton from "./restriction-filter-button.vue";
import { massUpdateDrawersEnabled } from "../../../config/screen-config.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsTableToolbar",
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
    currentTariff: {
      type: Object,
      default: () => ({}),
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
    isRestrictionModeEnabled: {
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
    isAvailabilityEditable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { mobileActionsMenu: false };
  },
  computed: {
    actionsClasses() {
      return { "pa-groups pb-inner": true };
    },
    actionsStyles() {
      return { left: "16px" };
    },
    hasEditActions() {
      if (!massUpdateDrawersEnabled) {
        return false;
      }
      return this.isOneOfPricesModesEnabled
        || this.canShowUpdateRestrictionsButton
        || this.isAvailabilityEditable;
    },
    showMobileRestrictionFilterButton() {
      return !this.isDesktopDevice && this.isCombinedModeEnabled;
    },
    hasStickyRightActions() {
      return this.hasEditActions || this.showMobileRestrictionFilterButton;
    },
    showMobileToolbarSecondRow() {
      return this.isOneOfPricesModesEnabled && this.isRmsPricingEnabled;
    },
    mobileEditActions() {
      return [
        this.canShowUpdateRestrictionsButton
          ? { value: "restrictions", label: this.$t("Ограничения") }
          : null,
        this.isOneOfPricesModesEnabled
          ? { value: "prices", label: this.$t("Цены") }
          : null,
        this.isAvailabilityEditable
          ? { value: "availability", label: this.$t("Редактировать наличие") }
          : null,
      ].filter(Boolean);
    },
    /** Один доступный тип массового редактирования — без промежуточного bottom sheet (меню). */
    useMobileDirectEditAction() {
      return this.mobileEditActions.length === 1;
    },
    mobileDirectEditActionTestId() {
      const first = this.mobileEditActions[0];
      if (!first) return undefined;
      if (first.value === "prices") return "tariff-edit-prices-button";
      if (first.value === "availability") return "tariff-edit-availability-button";
      return "tariff-edit-restrictions-button";
    },
    canShowUpdateRestrictionsButton() {
      const allDependent = PriceAndRestrictionsService.hasAllDependentRestrictionsFor(this.currentTariff);
      return this.isRestrictionModeEnabled && !allDependent;
    },
  },
  methods: {
    openMobileActionsMenu() {
      this.mobileActionsMenu = true;
    },
    closeMobileActionsMenu() {
      this.mobileActionsMenu = false;
    },
    handleMobileActionClick(action) {
      if (action === "prices") {
        this.emitUpdatePrices();
      } else if (action === "restrictions") {
        this.emitUpdateRestrictions();
      } else if (action === "availability") {
        this.emitUpdateAvailability();
      }
    },
    emitUpdatePrices() {
      this.closeMobileActionsMenu();
      this.$emit("update-prices");
    },
    emitUpdateRestrictions() {
      this.closeMobileActionsMenu();
      this.$emit("update-restrictions");
    },
    emitUpdateAvailability() {
      this.closeMobileActionsMenu();
      this.$emit("update-availability");
    },
  },
};
</script>

<style lang="scss" module>
.sticky-btn {
  position: sticky;
  right: 0;
  z-index: 3;
  background-color: $white;
}

.sticky-ctrl {
  position: sticky;
  left: 0;
  z-index: 3;
  background-color: $white;
}

.mobile-second-row {
  min-height: 40px;
}
</style>
