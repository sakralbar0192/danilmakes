<template>
  <div>
    <info-block class="mb-outer">
      <template #title>
        {{ $t('Цена продажи') }}
      </template>
      <template #content>
        <p class="mb-inner">
          {{ $t('В данном режиме показываются 4 вида цен:') }}
        </p>
        <ol class="pl-groups" :class="$style.list">
          <li class="mb-inner">
            <p>
              <span class="font-weight-bold">{{ $t('Цены по Бизнес-правилам') }}</span>.
              {{ $t('Рассчитываются автоматически от базовой цены по условиям') }}
              <a href="/tariff/automation/list" target="_blank">{{ $t('Бизнес-правила') }}</a>.
            </p>
          </li>
          <li class="mb-inner">
            <span class="font-weight-bold">{{ $t('Базовые цены') }}</span>.
            {{ $t('Показываются для категорий, участвующих в') }}
            <a href="/tariff/automation/list" target="_blank">{{ $t('Бизнес-правиле') }}</a>,
            {{ $t('пока условия правила не применились.') }}
          </li>
          <li>
            <p class="mb-inner">
              <span class="font-weight-bold">{{ $t('Цены по умолчанию') }}</span>.
              {{ $t('Включают:') }}
            </p>
            <ul class="pl-groups" :class="$style.list">
              <li class="mb-inner">
                <p>
                  {{ $t('Цены за размещение взрослых на основных местах, указанные в') }}
                  <a :href="`/tariff/edit/${currentTariff.id}`" target="_blank">{{ $t('Настройках тарифа') }}</a>,
                  {{ $t('для категорий не участвующих в') }}
                  <a href="/tariff/automation/list" target="_blank">{{ $t('Бизнес-правиле') }}</a>.
                </p>
              </li>
              <li v-if="hasExtraChargesCategories" class="mb-inner">
                <p>
                  {{ $t('Цены за дополнительные места и детей на основном месте, настроенные в') }}
                  <a href="/roomTypes" target="_blank">{{ $t('Категориях') }}</a>.
                </p>
              </li>
            </ul>
          </li>
          <li class="mb-inner">
            <span class="font-weight-bold">{{ $t('Ручные цены') }}</span>.
            {{ $t('Выставляются вручную на определенный период. Бизнес-правила на такие цены не применяются.') }}
          </li>
        </ol>
      </template>
      <template #footerTitle>
        <span class="font-weight-bold">{{ $t('Примеры цен') }}:</span>
      </template>
      <template #footerBlock>
        <div class="d-flex justify-space-between align-center flex-grow-1 flex-wrap gap-groups">
          <div :class="['d-flex align-center', {'flex-column': !isMobileDevice}]" :style="{width: isMobileDevice ? '240px' : null}">
            <p :class="['mb-ingroup flex-grow-1', $style.caption]">
              {{ $t('по Бизнес-правилам') }}
            </p>
            <presentation-price-cell without-caption :presentation-mode="$options.priceCellDynamicPresentationMode"/>
          </div>
          <div :class="['d-flex align-center', {'flex-column': !isMobileDevice}]" :style="{width: isMobileDevice ? '240px' : null}">
            <p :class="['mb-ingroup flex-grow-1', $style.caption]">
              {{ $t('базовые / по умолчанию') }}
            </p>
            <presentation-price-cell without-caption :presentation-mode="$options.priceCellDefaultPresentationMode"/>
          </div>
          <div :class="['d-flex align-center', {'flex-column': !isMobileDevice}]" :style="{width: isMobileDevice ? '240px' : null}">
            <p :class="['mb-ingroup flex-grow-1', $style.caption]">
              {{ $t('ручные') }}
            </p>
            <presentation-price-cell without-caption :presentation-mode="$options.priceCellManualPresentationMode"/>
          </div>
        </div>
      </template>
    </info-block>
    <price-round-block class="mb-outer"/>
    <instructions-rms-price-editing-info class="mb-outer"/>
    <instructions-sale-category-info-block/>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { priceCellPresentationModes } from "../../config/screen-config.js";
import InfoBlock from "./info-block.vue";
import PresentationPriceCell from "../table/cells/presentation-price-cell.vue";
import PriceRoundBlock from "./price-round-block.vue";
import InstructionsRmsPriceEditingInfo from "./instructions-rms-price-editing-info.vue";
import InstructionsSaleCategoryInfoBlock from "./instructions-sale-category-info-block.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsInfoDrawerDynamic",
  components: {
    InfoBlock,
    PresentationPriceCell,
    PriceRoundBlock,
    InstructionsRmsPriceEditingInfo,
    InstructionsSaleCategoryInfoBlock,
  },
  priceCellManualPresentationMode: priceCellPresentationModes.manual,
  priceCellDefaultPresentationMode: priceCellPresentationModes.default,
  priceCellDynamicPresentationMode: priceCellPresentationModes.dynamic,
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["currentTariff"]),
    ...mapGetters("tariffPricesAndRestrictions", ["hasExtraChargesCategories"]),
  },
};
</script>

<style lang="scss" module>
.list {
  > li::marker {
    font-weight: bold;
  }
}

.caption {
  color: $caption !important;
  font-size: 12px;
}
</style>
