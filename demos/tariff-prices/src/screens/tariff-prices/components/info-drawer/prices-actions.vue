<template>
  <div>
    <info-block>
      <template #title>
        {{ $t('Редактирование цены') }}
      </template>
      <template #content>
        1. {{ $t('По клику на ячейку') }}
      </template>
      <template #footerBlock>
        <presentation-price-cell without-caption :presentation-mode="$options.priceCellDefaultPresentationMode"/>
      </template>
    </info-block>
    <info-block class="mb-outer">
      <template #content>
        2. {{ isMobileDevice ? $t('По клику на кнопку Редактировать') : $t('По клику на кнопку Редактировать цены') }}
      </template>
      <template #footerBlock>
        <b-btn
          :squared="isMobileDevice"
        >
          <v-icon v-if="isMobileDevice" class="icon-edit"/>
          <template v-else>
            {{ $t("Редактировать цены") }}
          </template>
        </b-btn>
      </template>
    </info-block>
    <div v-if="!isCombinedModeEnabled">
      <info-block>
        <template #title>
          {{ $t("Закрыть / открыть продажи во всей категории") }}
        </template>
        <template #content>
          1. {{ $t("По клику на статусы Открыто / Закрыто") }}
        </template>
        <template #footerBlock>
          <div class="d-flex justify-space-between w-full gap-space">
            <sale-availability-status-badge opened class="w-full"/>
            <sale-availability-status-badge class="w-full"/>
          </div>
        </template>
      </info-block>
      <info-block>
        <template #footerTitle>
          2. {{ $t("Двойным кликом по категории в таблице") }}
        </template>
        <template #footerBlock>
          <presentation-price-cell without-caption :presentation-mode="$options.priceCellManualPresentationMode"/>
          <div class="d-flex flex-column align-center justify-center">
            <v-icon class="icon-long-arrow-right"/>
            <v-icon class="icon-long-arrow-left"/>
          </div>
          <presentation-price-cell without-caption :presentation-mode="$options.priceCellClosedPresentationMode"/>
        </template>
      </info-block>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { priceCellPresentationModes } from "../../config/screen-config.js";
import SaleAvailabilityStatusBadge from "../widgets/sale-availability-status-badge.vue";
import InfoBlock from "./info-block.vue";
import PresentationPriceCell from "../table/cells/presentation-price-cell.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsInfoDrawerActions",
  components: {
    InfoBlock, PresentationPriceCell, SaleAvailabilityStatusBadge,
  },
  priceCellManualPresentationMode: priceCellPresentationModes.manual,
  priceCellClosedPresentationMode: priceCellPresentationModes.closed,
  priceCellDefaultPresentationMode: priceCellPresentationModes.default,
  computed: { ...mapGetters("tariffPricesAndRestrictions", ["isCombinedModeEnabled"]) },
};
</script>
