<template>
  <div>
    <info-block v-if="isCurrentTariffDepend" class="mb-outer">
      <template #title>
        {{ $t('Цены') }}
      </template>
      <template #content>
        <p class="mb-inner">
          {{ $t('Цены, по которым вы продаете категории, бывают') }}:
        </p>
        <ol class="pl-groups" :class="$style.list">
          <li class="mb-inner">
            <p class="mb-0">
              <span class="font-weight-bold">{{ $t('Рассчитываемые цены.') }}</span>
              {{ $t('Автоматически рассчитываются на основе выбранного родительского тарифа.') }}
            </p>
          </li>
          <li v-if="isSomeCategoriesHasExtraCharges" class="mb-inner">
            <p class="mb-0">
              <span class="font-weight-bold">{{ $t('Цены по умолчанию') }}</span>.
              {{ $t('Цены за доп. места и детей на основном месте, настроенные в') }}
              <a href="/roomTypes" target="_blank">{{ $t('Категориях') }}</a>.
            </p>
          </li>
          <li v-if="hasExtraChargesCategories" class="mb-inner">
            <p class="mb-0">
              <span class="font-weight-bold">{{ $t('Цены по умолчанию.') }}</span>
              {{ $t('Цены за дополнительные места и детей на основном месте, настроенные в') }}
              <a href="/roomTypes" target="_blank">{{ $t('Категориях') }}</a>.
            </p>
          </li>
          <li class="mb-inner">
            <p class="mb-0">
              <span class="font-weight-bold">{{ $t('Ручные цены.') }}</span>
              {{ $t('Выставляются вручную на определенный период. Изменения цен в родительском тарифе на такие цены не влияют.') }}
            </p>
          </li>
        </ol>
      </template>
      <template #footerTitle>
        <span class="font-weight-bold">
          {{ $t('Примеры цен') }}:
        </span>
      </template>
      <template #footerBlock>
        <div class="d-flex align-center flex-grow-1 flex-wrap gap-space">
          <div class="d-flex align-center" :style="{width: isMobileDevice ? '240px' : null}">
            <p :class="['flex-grow-1 mb-0 mr-ingroup', $style.caption]">
              {{ dependentLegendCalculatedCaption }}
            </p>
            <presentation-price-cell without-caption :presentation-mode="$options.priceCellDefaultPresentationMode"/>
          </div>
          <div class="d-flex align-center" :style="{width: isMobileDevice ? '240px' : null}">
            <p :class="['flex-grow-1 mb-0 mr-ingroup', $style.caption]">
              {{ $t('ручные') }}
            </p>
            <presentation-price-cell without-caption :presentation-mode="$options.priceCellManualPresentationMode"/>
          </div>
        </div>
      </template>
    </info-block>
    <info-block v-else-if="isRmsPricingEnabled" class="mb-outer">
      <template #title>
        {{ $t('Базовые цены') }}
      </template>
      <template #content>
        <p class="mb-inner">
          {{ $t('Цены, от которых рассчитываются динамические цены по') }}
          <a href="/tariff/automation/advance-in-price" target="_blank">{{ $t('Бизнес-правилам') }}</a>.
        </p>
        <p class="mb-inner">
          {{ $t('Базовые цены бывают:') }}
        </p>
        <ol class="pl-groups" :class="$style.list">
          <li class="mb-inner">
            <p class="mb-inner">
              <span class="font-weight-bold">{{ $t('Цены по умолчанию') }}</span>.
              {{ $t('Включают:') }}
            </p>
            <ul class="pl-groups" :class="$style.list">
              <li class="mb-inner">
                <p class="mb-0">
                  {{ $t('Цены за размещение взрослых на основных местах, указанные в') }}
                  <a :href="`/tariff/edit/${currentTariff.id}`" target="_blank">{{ $t('Настройках тарифа') }}</a>.
                </p>
              </li>
              <li v-if="hasExtraChargesCategories" class="mb-inner">
                <p class="mb-0">
                  {{ $t('Цены за дополнительные места и детей на основном месте, настроенные в') }}
                  <a href="/roomTypes" target="_blank">{{ $t('Категориях') }}</a>.
                </p>
              </li>
            </ul>
          </li>
          <li class="mb-inner">
            <p class="mb-0">
              {{ $t('Ручные цены. Выставляются вручную на определенный период.') }}
            </p>
          </li>
        </ol>
      </template>
      <template #footerTitle>
        <span class="font-weight-bold">
          {{ $t('Примеры цен') }}:
        </span>
      </template>
      <template #footerBlock>
        <div class="d-flex align-center flex-grow-1 flex-wrap gap-space">
          <div class="d-flex align-center" :style="{width: isMobileDevice ? '240px' : null}">
            <p :class="['flex-grow-1 mr-ingroup mb-0', $style.caption]">
              {{ $t('по умолчанию') }}
            </p>
            <presentation-price-cell without-caption :presentation-mode="$options.priceCellDefaultPresentationMode"/>
          </div>
          <div class="d-flex align-center mr-ingroup" :style="{width: isMobileDevice ? '240px' : null}">
            <p :class="['flex-grow-1 mr-ingroup mb-0', $style.caption]">
              {{ $t('ручные') }}
            </p>
            <presentation-price-cell without-caption :presentation-mode="$options.priceCellManualPresentationMode"/>
          </div>
        </div>
      </template>
    </info-block>
    <info-block v-else class="mb-outer">
      <template #title>
        {{ $t('Цены') }}
      </template>
      <template #content>
        <p class="mb-inner">
          {{ $t('Цены, по которым вы продаете категории, бывают') }}:
        </p>
        <ol class="pl-groups" :class="$style.list">
          <li class="mb-inner">
            <template v-if="isSomeCategoriesHasExtraCharges">
              <p class="mb-ingroup">
                <span class="font-weight-bold">{{ $t('Цены по умолчанию') }}</span>.
                {{ $t('Включают:') }}
              </p>
              <ul style="list-style-type: disc">
                <li>
                  <p class="mb-inner">
                    {{ $t('Цены за размещение взрослых на основных местах, указанные в') }}
                    <a :href="`/tariff/edit/${currentTariff.id}`" target="_blank">{{ $t('Настройках тарифа.') }}</a>
                  </p>
                </li>
                <li>
                  <p class="mb-inner">
                    {{ $t('Цены за доп. места и детей на основном месте, настроенные в') }}
                    <a href="/roomTypes" target="_blank">{{ $t('Категориях') }}</a>.
                  </p>
                </li>
              </ul>
            </template>
            <template v-else>
              <span class="font-weight-bold">{{ $t('Цены по умолчанию') }}</span>.
              {{ $t('Цены за размещение взрослых на основных местах, указанные в') }}
              <a :href="`/tariff/edit/${currentTariff.id}`" target="_blank">{{ $t('Настройках тарифа.') }}</a>
            </template>
          </li>
          <li class="mb-inner">
            <span class="font-weight-bold">{{ $t('Ручные цены') }}</span>.
            {{ $t('Выставляются вручную на определенный период') }}.
          </li>
        </ol>
      </template>
      <template #footerTitle>
        <span class="font-weight-bold">
          {{ $t('Примеры цен') }}:
        </span>
      </template>
      <template #footerBlock>
        <div class="d-flex align-center flex-grow-1 flex-wrap gap-space">
          <div class="d-flex align-center" :style="{width: isMobileDevice ? '240px' : null}">
            <p :class="['flex-grow-1 mr-ingroup mb-0', $style.caption]">
              {{ $t('по умолчанию') }}
            </p>
            <presentation-price-cell without-caption :presentation-mode="$options.priceCellDefaultPresentationMode"/>
          </div>
          <div class="d-flex align-center mr-ingroup" :style="{width: isMobileDevice ? '240px' : null}">
            <p :class="['flex-grow-1 mr-ingroup mb-0', $style.caption]">
              {{ $t('ручные') }}
            </p>
            <presentation-price-cell without-caption :presentation-mode="$options.priceCellManualPresentationMode"/>
          </div>
        </div>
      </template>
    </info-block>
    <price-round-block/>
    <prices-actions/>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { priceCellPresentationModes } from "../../config/screen-config.js";
import InfoBlock from "./info-block.vue";
import PresentationPriceCell from "../table/cells/presentation-price-cell.vue";
import PriceRoundBlock from "./price-round-block.vue";
import PricesActions from "./prices-actions.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsInfoDrawerDefault",
  components: {
    InfoBlock, PresentationPriceCell, PriceRoundBlock, PricesActions,
  },
  priceCellManualPresentationMode: priceCellPresentationModes.manual,
  priceCellDefaultPresentationMode: priceCellPresentationModes.default,
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["currentTariff", "dateFrom", "mode"]),
    ...mapGetters("tariffPricesAndRestrictions", [
      "isRmsPricingEnabled",
      "isCurrentTariffDepend",
      "hasExtraChargesCategories",
    ]),
    dependentLegendCalculatedCaption() {
      return this.$t("рассчитываемые");
    },
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
