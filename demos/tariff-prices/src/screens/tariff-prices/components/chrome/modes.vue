<template>
  <b-btn-group
    v-if="mode"
    v-model="internalMode"
    :borderless="false"
    active-class="font-weight-bold v-btn-toggle--active"
  >
    <b-btn color large="" :value="priceMode">
      {{ $t('Цены') }}
    </b-btn>
    <b-btn large color="" :value="$options.modeRestrictions">
      {{ $t('Ограничения') }}
    </b-btn>
  </b-btn-group>
</template>

<script>
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { mapGetters, mapState } from "vuex";

/** «Chrome» экрана — UI shell вокруг контента (панели, переключатели режима). */
export default {
  name: "TariffPricesModes",
  modeDefaultPrice: PriceAndRestrictionsService.modeDefaultPrice,
  modeDynamicPrice: PriceAndRestrictionsService.modeDynamicPrice,
  modeRestrictions: PriceAndRestrictionsService.modeRestrictions,
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["currentTariff", "mode"]),
    ...mapGetters("tariffPricesAndRestrictions", ["isRmsPricingEnabled", "isOneOfPricesModesEnabled"]),
    priceMode() {
      return this.isRmsPricingEnabled ? this.$options.modeDynamicPrice : this.$options.modeDefaultPrice;
    },
    internalMode: {
      get() {
        return this.isOneOfPricesModesEnabled ? this.priceMode : this.$options.modeRestrictions;
      },
      set(v) {
        this.$emit("change-mode", v);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.v-btn-toggle:not(.v-btn-toggle--group) > .v-btn {
  color: $main !important;
  background-color: transparent !important;

  &.v-btn-toggle--active.v-btn--active {
    color: $primary !important;
    background-color: $primary-lighten-4 !important;
    border-color: $secondary-blue-hover !important;
    padding-right: 11px;
  }
}
</style>
