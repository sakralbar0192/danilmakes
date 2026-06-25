<template>
  <div class="d-flex align-center gap-groups">
    {{ $t('Легенда цен') }}
    <template v-if="isDynamicPricesModeEnabled">
      <legend-price-tooltip-swatch :presentation-mode="$options.priceCellDynamicPresentationMode">
        <span>
          <span class="d-block font-weight-bold">{{ $t('Цены по Бизнес-правилам') }}</span>
          <br>
          <span class="d-block">{{ $t('Рассчитываются автоматически от базовой цены по условиям Бизнес-правила.') }}</span>
        </span>
      </legend-price-tooltip-swatch>
      <legend-price-tooltip-swatch :presentation-mode="$options.priceCellDefaultPresentationMode">
        <span v-if="isCurrentTariffDepend">
          <span class="d-block font-weight-bold">{{ $t('Рассчитываемые цены') }}</span>
          <br>
          <span class="d-block">{{ $t('Автоматически рассчитываются на основе выбранного родительского тарифа') }}</span>
        </span>
        <span v-else>
          <span class="d-block font-weight-bold">{{ $t('Базовые цены') }}</span>
          <br>
          <span class="d-block">{{ $t('Показываются для категорий, участвующих в Бизнес-правиле, пока условия правила не применились.') }}</span>
          <br>
          <span class="d-block font-weight-bold mt-inner">{{ $t('Цены по умолчанию') }}</span>
          <br>
          <span v-if="hasExtraChargesCategories" class="d-block">— {{ $t('Цены за доп. места и детей на основном месте, настроенные в Категориях.') }}</span>
          <span class="d-block">— {{ $t('Цены за взрослых на основных местах в категориях, не участвующих в Бизнес-правиле.') }}</span>
        </span>
      </legend-price-tooltip-swatch>
      <legend-price-tooltip-swatch :presentation-mode="$options.priceCellManualPresentationMode">
        <span>
          <span class="d-block font-weight-bold">{{ $t('Ручные цены') }}</span>
          <br>
          <span class="d-block">{{ legendManualPricesTooltipBody }}</span>
        </span>
      </legend-price-tooltip-swatch>
    </template>
    <template v-else>
      <template v-if="isCurrentTariffDepend">
        <legend-price-tooltip-swatch :presentation-mode="$options.priceCellDefaultPresentationMode">
          <span v-if="legendDependentFirstTooltipIsCombined">
            <span class="d-block font-weight-bold">{{ $t('Рассчитываемые цены') }}</span>
            <br>
            <span class="d-block">{{ $t('Автоматически рассчитываются на основе выбранного родительского тарифа.') }}</span>
            <br>
            <span class="d-block font-weight-bold mt-inner">{{ $t('Цены по умолчанию') }}</span>
            <br>
            <span class="d-block">{{ $t('Цены за доп. места и детей на основном месте, настроенные в Категориях') }}</span>
          </span>
          <span v-else>
            <span class="d-block font-weight-bold">{{ $t('Рассчитываемые цены') }}</span>
            <br>
            <span class="d-block">{{ $t('Автоматически рассчитываются на основе выбранного родительского тарифа') }}</span>
          </span>
        </legend-price-tooltip-swatch>
        <legend-price-tooltip-swatch :presentation-mode="$options.priceCellManualPresentationMode">
          <span>
            <span class="d-block font-weight-bold">{{ $t('Ручные цены') }}</span>
            <br>
            <span class="d-block">{{ $t('Выставляются вручную на определённый период. Изменения цен в родительском тарифе на такие цены не влияют') }}</span>
          </span>
        </legend-price-tooltip-swatch>
      </template>
      <template v-else>
        <legend-price-tooltip-swatch :presentation-mode="$options.priceCellDefaultPresentationMode">
          <span>
            <span class="d-block font-weight-bold">{{ $t('Цены по умолчанию') }}</span>
            <br>
            <span v-if="hasExtraChargesCategories" class="d-block">— {{ $t('Цены за доп. места и детей на основном месте, настроенные в категориях.') }}</span>
            <span class="d-block">— {{ $t('Цены за взрослых на основных местах, указанные в настройках тарифа') }}</span>
          </span>
        </legend-price-tooltip-swatch>
        <legend-price-tooltip-swatch :presentation-mode="$options.priceCellManualPresentationMode">
          <span>
            <span class="d-block font-weight-bold">{{ $t('Ручные цены') }}</span>
            <br>
            <span class="d-block">{{ $t('Выставляются вручную на определенный период') }}</span>
          </span>
        </legend-price-tooltip-swatch>
      </template>
    </template>
    <presentation-price-cell
      legend-swatch
      :presentation-mode="$options.priceCellClosedPresentationMode"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { priceCellPresentationModes } from "../../../config/screen-config.js";
import PresentationPriceCell from "../../table/cells/presentation-price-cell.vue";
import LegendPriceTooltipSwatch from "./legend-price-tooltip-swatch.vue";

export default {
  name: "TariffLegendPrices",
  components: {
    LegendPriceTooltipSwatch,
    PresentationPriceCell,
  },
  priceCellDynamicPresentationMode: priceCellPresentationModes.dynamic,
  priceCellDefaultPresentationMode: priceCellPresentationModes.default,
  priceCellManualPresentationMode: priceCellPresentationModes.manual,
  priceCellClosedPresentationMode: priceCellPresentationModes.closed,
  computed: {
    ...mapGetters("tariffPricesAndRestrictions", [
      "isCurrentTariffDepend",
      "isDynamicPricesModeEnabled",
      "hasExtraChargesCategories",
    ]),
    legendDependentFirstTooltipIsCombined() {
      return this.isCurrentTariffDepend && this.hasExtraChargesCategories;
    },
    legendManualPricesTooltipBody() {
      return this.isCurrentTariffDepend
        ? this.$t("Выставляются вручную на определённый период. Изменения цен в родительском тарифе на такие цены не влияют")
        : this.$t("Выставляются вручную на определенный период. Бизнес-правила на такие цены не применяются");
    },
  },
};
</script>
