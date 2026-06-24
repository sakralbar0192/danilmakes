<template>
  <div>
    <info-block class="mb-outer">
      <template #title>
        {{ titleText }}
      </template>
      <template #content>
        {{ $t('По клику на ячейку') }}
      </template>
      <template #footerBlock>
        <presentation-price-cell without-caption :presentation-mode="$options.priceCellDefaultPresentationMode"/>
      </template>
    </info-block>
    <info-block class="mb-outer">
      <template #content>
        {{ isMobileDevice ? $t('По клику на кнопку Редактировать') : $t('По клику на кнопку Редактировать цены') }}
      </template>
      <template #footerBlock>
        <b-btn :squared="isMobileDevice">
          <v-icon v-if="isMobileDevice" class="icon-edit"/>
          <template v-else>
            {{ $t("Редактировать цены") }}
          </template>
        </b-btn>
      </template>
    </info-block>
  </div>
</template>

<script>
import { priceCellPresentationModes } from "../../config/screen-config.js";
import InfoBlock from "./info-block.vue";
import PresentationPriceCell from "../table/cells/presentation-price-cell.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsInstructionsRmsPriceEditingInfo",
  components: { InfoBlock, PresentationPriceCell },
  priceCellDefaultPresentationMode: priceCellPresentationModes.default,
  props: {
    titleOverride: {
      type: String,
      default: null,
    },
  },
  computed: {
    titleText() {
      return this.titleOverride ?? this.$t("Редактирование цены");
    },
  },
};
</script>
