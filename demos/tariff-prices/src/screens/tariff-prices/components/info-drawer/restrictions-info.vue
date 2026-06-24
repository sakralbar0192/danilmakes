<template>
  <div :class="$style['restrictions-info']" class="d-flex flex-column gap-outer">
    <info-block>
      <template #title>
        {{ $t("Ограничения") }}
      </template>
      <template #content>
        <p class="mb-inner">
          {{ $t("Ограничения бывают") }}
          {{ restrictionsInfo.length }}
          {{ $t("видов") }}:
        </p>
        <ol class="pl-groups">
          <li
            v-for="restrictionInfo in restrictionsInfo"
            :key="restrictionInfo.title"
            class="mb-inner"
          >
            <span class="font-weight-bold">{{ $t(restrictionInfo.title) }}</span>.
            {{ $t(restrictionInfo.content) }}.
          </li>
        </ol>
      </template>
      <template #footerTitle>
        <div class="text-h5">
          {{ $t("Примеры ограничений:") }}
        </div>
      </template>
      <template #footerBlock>
        <div v-if="compactRestrictions">
          <img
            :class="$style.image"
            :src="$localImage('restrictions/compact_restrictions.png')"
            :alt="$t('Пример ограничений')"
          >
        </div>
        <div v-else class="d-flex align-center flex-grow-1 flex-wrap gap-space">
          <div class="d-flex flex-column gap-typo align-center">
            <small class="text-secondary">{{ $t("нет ограничений") }}</small>
            <presentation-restriction-cell without-caption :presentation-mode="$options.restrictionCellNonePresentationMode"/>
          </div>
          <div v-if="isCurrentTariffHasDependedRestrictions" class="d-flex flex-column gap-typo align-center">
            <small class="text-secondary">{{ $t("скопированные") }}</small>
            <presentation-restriction-cell without-caption :presentation-mode="$options.restrictionCellCopiedPresentationMode"/>
          </div>
          <div v-if="!hasCurrentTariffEveryDependedRestrictions" class="d-flex flex-column gap-typo align-center">
            <small class="text-secondary">{{ isCurrentTariffHasDependedRestrictions ? $t("ручные") : $t("ограничения") }}</small>
            <presentation-restriction-cell without-caption :presentation-mode="$options.restrictionCellManualPresentationMode"/>
          </div>
        </div>
      </template>
    </info-block>
    <div v-if="!hasCurrentTariffEveryDependedRestrictions" class="d-flex flex-column gap-groups">
      <info-block>
        <template #title>
          {{ $t("Редактирование ограничений") }}
        </template>
        <template #content>
          1. {{ compactRestrictions ? $t('По клику на выбранную ячейку') : $t('По клику на ячейку') }}
        </template>
        <template #footerBlock>
          <div v-if="compactRestrictions">
            <img
              :src="$localImage('restrictions/compact_example.png')"
              :alt="$t('Редактирование ограничений с помощью выделения ячеек')"
            >
          </div>
          <div v-else class="d-flex align-center flex-grow-1 flex-wrap gap-space">
            <presentation-restriction-cell without-caption :presentation-mode="$options.restrictionCellManualEditedPresentationMode"/>
            <presentation-restriction-cell without-caption :presentation-mode="$options.restrictionCellManualToggledPresentationMode"/>
          </div>
        </template>
      </info-block>
      <info-block v-if="!isMobileDevice && !compactRestrictions">
        <template #content>
          2. {{ $t("Путем выделения ячеек — длинное нажатие и протягивание") }}
        </template>
        <template #footerBlock>
          <img
            width="100%"
            :src="$localImage('restrictions/restrictions_edit.png')"
            :alt="$t('Редактирование ограничений с помощью выделения ячеек')"
          >
        </template>
      </info-block>
      <info-block>
        <template #content>
          3. {{ isMobileDevice ? $t('По клику на кнопку Редактировать') : $t('По клику на кнопку Редактировать ограничения') }}
        </template>
        <template #footerBlock>
          <b-btn
            :squared="isMobileDevice"
          >
            <v-icon v-if="isMobileDevice" class="icon-edit"/>
            <template v-else>
              {{ $t("Редактировать ограничения") }}
            </template>
          </b-btn>
        </template>
      </info-block>
    </div>
    <b-alert v-if="isCurrentTariffHasDependedRestrictions" type="warning">
      {{ $t('Копируемые ограничения из родительского тарифа нельзя редактировать, для изменений перейдите в родительский тариф ') }}
      <a :href="restrictionsParentTariffUrl" target="_blank">{{ restrictionsParentTariff.name }}</a>
    </b-alert>
    <div v-if="!hasCurrentTariffEveryDependedRestrictions">
      <instructions-sale-category-info-block/>
      <info-block v-if="!isCombinedModeEnabled">
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
import { mapGetters, mapState } from "vuex";
import PresentationPriceCell from "../table/cells/presentation-price-cell.vue";
import { priceCellPresentationModes, restrictionCellPresentationModes } from "../../config/screen-config.js";
import InfoBlock from "./info-block.vue";
import PresentationRestrictionCell from "../table/cells/presentation-restriction-cell.vue";
import InstructionsSaleCategoryInfoBlock from "./instructions-sale-category-info-block.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsInfoDrawerRestrictionsInfo",
  components: {
    PresentationPriceCell,
    InfoBlock,
    PresentationRestrictionCell,
    InstructionsSaleCategoryInfoBlock,
  },
  priceCellManualPresentationMode: priceCellPresentationModes.manual,
  priceCellClosedPresentationMode: priceCellPresentationModes.closed,
  restrictionCellNonePresentationMode: restrictionCellPresentationModes.none,
  restrictionCellManualPresentationMode: restrictionCellPresentationModes.manual,
  restrictionCellManualToggledPresentationMode: restrictionCellPresentationModes.manualToggled,
  restrictionCellManualEditedPresentationMode: restrictionCellPresentationModes.manualEdited,
  restrictionCellCopiedPresentationMode: restrictionCellPresentationModes.copied,
  restrictionCellClosedPresentationMode: restrictionCellPresentationModes.closed,
  statusBarWidth: 104,
  statusBarHeight: 36,
  computed: {
    ...mapGetters("tariffPricesAndRestrictions", ["isCurrentTariffHasDependedRestrictions", "hasCurrentTariffEveryDependedRestrictions", "isCombinedModeEnabled"]),
    ...mapState("tariffPricesAndRestrictions", ["currentTariff", "compactRestrictions"]),
    ...mapState("hotel", ["rplansByIds"]),
    restrictionsParentTariff() {
      return this.rplansByIds[this.currentTariff?.dependent_restrictions?.parent_plan_id];
    },
    queryString() {
      const query = this.$route.query;
      const params = new URLSearchParams(query).toString();
      return params ? `?${params}` : "";
    },
    restrictionsParentTariffUrl() {
      return `/tariff/index/${this.restrictionsParentTariff?.id}${this.queryString}`;
    },
    restrictionsInfo() {
      const restrictions = [
        { title: "Минимальное количество ночей", content: "Минимальный срок проживания, если хотя бы одна дата проживания попадает на дату с установленным ограничением" },
        { title: "Минимальное количество ночей на заезд", content: "Минимальный срок проживания, если дата заезда попадает на дату с установленным ограничением" },
        { title: "Максимальное количество ночей", content: "Максимальный срок проживания, если хотя бы одна дата проживания попадает на дату с установленным ограничением" },
        { title: "Закрыт на заезд", content: "Категория недоступна для бронирования, если дата заезда попадает на дату с установленным ограничением" },
        { title: "Закрыт на выезд", content: "Категория недоступна для бронирования, если дата выезда попадает на дату с установленным ограничением" },
      ];

      if (this.isCombinedModeEnabled) {
        restrictions.push({ title: "Закрытие продажи", content: "Категория недоступна для бронирования, если хотя бы одна дата проживания попадает на дату с установленным ограничением" });
      }

      return restrictions;
    },
  },
};
</script>

<style lang="scss" module>
.restrictions-info {
  :global(.v-card__title),
  :global(.v-card__text) {
    padding: 0;
  }
}

.image {
  display: block;
  width: 100%;
  object-fit: cover;
}
</style>
