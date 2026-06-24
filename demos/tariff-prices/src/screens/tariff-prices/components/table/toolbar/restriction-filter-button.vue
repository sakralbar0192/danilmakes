<template>
  <v-badge
    :class="['v-size--small', $style.badge]"
    color="sand"
    :value="hasActiveFilter"
  >
    <b-btn
      data-test="tariff-restrictions-filter-button"
      data-tour="prices-and-restrictions-tour-select-restrictions-step"
      squared
      color="secondary"
      @click="$emit('click')"
    >
      <v-icon class="icon-switches"/>
    </b-btn>
  </v-badge>
</template>

<script>
import { hasActiveRestrictionsFilter } from "../../../lib/screen/restriction-filter-active.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsRestrictionFilterButton",
  props: {
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
    hasActiveFilter() {
      return hasActiveRestrictionsFilter({
        selectedRestrictions: this.selectedRestrictions,
        compactRestrictions: this.compactRestrictions,
      });
    },
  },
};
</script>

<style lang="scss" module>
.badge {
  :global(.v-badge__wrapper) span {
    inset: auto auto calc(100% - 5px) calc(100% - 6px) !important;
    min-width: 8px !important;
    height: 8px !important;
    padding: 4px !important;
  }
}
</style>
