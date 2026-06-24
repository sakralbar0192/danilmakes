<template>
  <div :class="wrapperClass">
    <v-tooltip v-if="showDesktopDisplayControls" location="bottom">
      <template #activator="{ props: tooltipProps }">
        <b-btn
          v-bind="tooltipProps"
          data-tour="prices-and-restrictions-tour-fullscreen-step"
          data-test="tariff-toolbar-expand-table"
          squared
          color="secondary"
          class="mr-space"
          :aria-disabled="toolbarInteractionLocked"
          :class="{ 'tariff-toolbar-btn--locked': toolbarInteractionLocked }"
          @click="handleFullscreenClick"
        >
          <v-icon>{{ fullscreenModeIcon }}</v-icon>
        </b-btn>
      </template>
      <template #default>
        {{ $t(fullscreenModeButtonText) }}
      </template>
    </v-tooltip>

    <b-btn-group
      v-if="isOneOfPricesModesEnabled && isRmsPricingEnabled"
      v-model="internalMode"
      :borderless="false"
      active-class="font-weight-bold v-btn-toggle--active"
      class="tariff-prices-and-restrictions-table-toolbar__price-toggler pr-space"
    >
      <b-btn outlined color="tertiary" :value="modeDynamicPrice">
        {{ dynamicPriceToggleLabel }}
      </b-btn>
      <b-tooltip-arrowed bottom max-width="200">
        <template #activator="{ props: tooltipActivatorProps }">
          <b-btn
            outlined
            color="tertiary"
            :value="modeDefaultPrice"
            v-bind="tooltipActivatorProps"
          >
            {{ basePriceToggleLabel }}
          </b-btn>
        </template>
        <span>{{ $t('Базовые цены указаны только для категорий, которые участвуют в Бизнес-правилах') }}</span>
      </b-tooltip-arrowed>
    </b-btn-group>
    <div v-if="isCombinedModeEnabled && showDesktopDisplayControls" :class="restrictionWrapClass">
      <b-input-group :end-width="140">
        <template #start>
          <restriction-select
            :value="selectedRestrictions"
            :compact-restrictions="compactRestrictions"
            @input="$emit('change-selected-restrictions', $event)"
          />
        </template>
        <template #end>
          <div data-tour="prices-and-restrictions-tour-display-mode-step">
            <b-select
              v-model="internalCompactRestrictions"
              item-text="title"
              item-value="value"
              :show-search="false"
              :items="$options.compactRestrictionsModeOptions"
              hide-details
            />
          </div>
        </template>
      </b-input-group>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import RestrictionSelect from "./restriction-select.vue";

export default {
  name: "TariffToolbarPriceRestrictionsRow",
  components: { RestrictionSelect },
  props: {
    mode: {
      type: String,
      required: true,
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
    /** `desktop`: ряд с `ml-group` у restriction; `mobile`: колонка */
    variant: {
      type: String,
      default: "desktop",
      validator: (v) => ["desktop", "mobile"].includes(v),
    },
    compactRestrictions: {
      type: Boolean,
      default: false,
    },
    toolbarInteractionLocked: {
      type: Boolean,
      default: false,
    },
  },
  compactRestrictionsModeOptions: Object.freeze([
    { title: "Развернуто", value: false },
    { title: "Компактно", value: true },
  ]),
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["fullscreenMode"]),
    internalMode: {
      get() {
        return this.mode;
      },
      set(v) {
        this.$emit("change-mode", v);
      },
    },
    internalCompactRestrictions: {
      get() {
        return this.compactRestrictions;
      },
      set(v) {
        this.$emit("change-compact-restrictions", v);
      },
    },
    modeDefaultPrice() {
      return this.enabledCombinedMode ? PriceAndRestrictionsService.modeRestrictionsWithPrices : PriceAndRestrictionsService.modeDefaultPrice;
    },
    modeDynamicPrice() {
      return this.enabledCombinedMode ? PriceAndRestrictionsService.modeRestrictionsWithDynamicPrices : PriceAndRestrictionsService.modeDynamicPrice;
    },
    wrapperClass() {
      return this.variant === "mobile"
        ? "d-flex align-start flex-column gap-ingroup"
        : "d-flex align-center";
    },
    showDesktopDisplayControls() {
      return this.variant === "desktop";
    },
    restrictionWrapClass() {
      return this.variant === "desktop" ? "ml-group" : "";
    },
    fullscreenModeButtonText() {
      return this.fullscreenMode ? "Выйти из полноэкранного режима" : "Полноэкранный режим";
    },
    fullscreenModeIcon() {
      return this.fullscreenMode ? "icon-exit-full-screen" : "icon-full-screen";
    },
    dynamicPriceToggleLabel() {
      return this.isRmsPricingEnabled ? this.$t("Цена продажи") : this.$t("Динамические цены");
    },
    basePriceToggleLabel() {
      if (!this.isRmsPricingEnabled || this.variant === "mobile") {
        return this.$t("Базовые цены");
      }
      return this.$t("Базовые цены для бизнес-правил");
    },
  },
  methods: {
    handleFullscreenClick() {
      if (this.toolbarInteractionLocked) {
        return;
      }
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
        return;
      }
      document.documentElement.requestFullscreen?.();
    },
  },
};
</script>

<style lang="scss" scoped>
:global(.tariff-toolbar-btn--locked) {
  pointer-events: none;
  cursor: default;
}

.tariff-prices-and-restrictions-table-toolbar__price-toggler {
  .v-btn {
    color: $main !important;
    background-color: transparent !important;

    &.v-btn--selected,
    &.v-btn-toggle--active.v-btn--active {
      color: $primary !important;
      background-color: $primary-lighten-4 !important;
      border-color: $secondary-blue-hover !important;
      padding-right: 11px;
    }
  }
}
</style>
