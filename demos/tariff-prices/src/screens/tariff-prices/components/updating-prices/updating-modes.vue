<template>
  <v-responsive
    :width="isMobileDevice ? '100%' : 240"
    class="overflow-visible"
  >
    <b-select
      v-model="internalValue"
      class="pr-0"
      data-test="tariff-mass-prices-updating-mode"
      :items="availableModes"
      background-color="#f5f9fe"
    />
  </v-responsive>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import TariffInterfaceSettingsService from "@/services/tariff/interface-settings";
import { massiveUpdatingPricesModes } from "../../config/screen-config.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingPricesUpdatingModes",
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {};
  },
  massiveUpdatingPricesModes,
  computed: {
    ...mapState("hotel", ["rplansByIds"]),
    ...mapState("tariffPricesAndRestrictions", ["currentTariff", "interfaceSettings"]),
    ...mapGetters("tariffPricesAndRestrictions", ["isCurrentTariffDepend", "isRmsPricingEnabled"]),
    internalValue: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit("input", v);
      },
    },
    availableModes() {
      const modes = [...massiveUpdatingPricesModes];

      if (this.isCurrentTariffDepend) {
        const parentName = this.rplansByIds?.[this.currentTariff.parent_id]?.name;
        modes.push({
          id: PriceAndRestrictionsService.resetDependentPricesMode,
          name: this.$t("Вернуть зависимость от тарифа {tariffName}", { tariffName: parentName }),
        });
      } else if (
        !this.isRmsPricingEnabled
        && TariffInterfaceSettingsService.canResetPriceToDefault({
          interfaceSettingsModel: this.interfaceSettings,
          isCurrentTariffDepend: false,
        })
      ) {
        modes.push({
          id: PriceAndRestrictionsService.resetDefaultPricesMode,
          name: this.$t("Вернуть цену по умолчанию"),
        });
      }

      return modes;
    },
  },
};
</script>
