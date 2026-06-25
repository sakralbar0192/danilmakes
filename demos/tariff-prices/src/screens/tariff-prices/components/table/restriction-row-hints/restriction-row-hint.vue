<template>
  <b-tooltip-arrowed right>
    <template #activator="{ props: activatorProps }">
      <v-icon
        class="icon-help-circle"
        v-bind="activatorProps"
        size="medium"
        :color="iconColor"
      />
    </template>
    <component :is="hintComponent"/>
  </b-tooltip-arrowed>
</template>

<script>
import { defineAsyncComponent } from "vue";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";

export default {
  name: "TariffPricesTableRestrictionRowHint",
  components: {
    ClosedArrivalHint: defineAsyncComponent(() => import("./closed-arrival-hint.vue")),
    ClosedDepartureHint: defineAsyncComponent(() => import("./closed-departure-hint.vue")),
    MinstayHint: defineAsyncComponent(() => import("./minstay-hint.vue")),
    MaxstayHint: defineAsyncComponent(() => import("./maxstay-hint.vue")),
    MinstayHintPerArrival: defineAsyncComponent(() => import("./minstay-hint-per-arrival.vue")),
  },
  hintComponentMapping: {
    [PriceAndRestrictionsService.restrictionTypeEnum.minstayA]: "MinstayHintPerArrival",
    [PriceAndRestrictionsService.restrictionTypeEnum.minstay]: "MinstayHint",
    [PriceAndRestrictionsService.restrictionTypeEnum.maxstay]: "MaxstayHint",
    [PriceAndRestrictionsService.restrictionTypeEnum.closedArrival]: "ClosedArrivalHint",
    [PriceAndRestrictionsService.restrictionTypeEnum.closedDeparture]: "ClosedDepartureHint",
  },
  props: {
    restrictionType: {
      type: String,
      required: true,
    },
  },
  computed: {
    hintComponent() {
      return this.$options.hintComponentMapping[this.restrictionType];
    },
    iconColor() {
      return this.$vuetify?.theme?.themes?.light?.secondary?.darken3 ?? "secondary";
    },
  },
};
</script>
