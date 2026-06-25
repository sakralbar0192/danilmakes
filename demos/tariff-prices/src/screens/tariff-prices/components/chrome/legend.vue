<template>
  <v-card
    :class="['px-groups py-inner d-flex align-center', $style.legend]"
    outlined
    data-test="tariff-page-legend"
  >
    <legend-prices v-if="isOneOfPricesModesEnabled"/>
    <legend-restrictions v-else/>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import LegendPrices from "./legend/legend-prices.vue";
import LegendRestrictions from "./legend/legend-restrictions.vue";

export default {
  name: "TariffPricesLegend",
  components: { LegendPrices, LegendRestrictions },
  computed: { ...mapGetters("tariffPricesAndRestrictions", ["isOneOfPricesModesEnabled"]) },
};
</script>

<style lang="scss" module>
@import '../../styles/variables.scss';

.legend {
  background-color: $secondary-hover !important;
  gap: map-get($gaps, groups);
  max-height: 75px;
}
</style>
