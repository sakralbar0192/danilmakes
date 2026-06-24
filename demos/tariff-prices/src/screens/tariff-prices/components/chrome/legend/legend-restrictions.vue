<template>
  <div class="d-flex align-center gap-groups">
    {{ $t('Легенда ограничений') }}
    <presentation-restriction-cell
      legend-swatch
      :presentation-mode="$options.restrictionCellNonePresentationMode"
    />
    <presentation-restriction-cell
      v-if="isCurrentTariffHasDependedRestrictions"
      legend-swatch
      :presentation-mode="$options.restrictionCellCopiedPresentationMode"
    />
    <presentation-restriction-cell
      v-if="!hasCurrentTariffEveryDependedRestrictions"
      legend-swatch
      :presentation-mode="$options.restrictionCellManualPresentationMode"
    />
    <presentation-restriction-cell
      v-if="!hasCurrentTariffEveryDependedRestrictions"
      :presentation-mode="$options.restrictionCellClosedPresentationMode"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { restrictionCellPresentationModes } from "../../../config/screen-config.js";
import PresentationRestrictionCell from "../../table/cells/presentation-restriction-cell.vue";

export default {
  name: "BnovoTariffLegendRestrictions",
  components: { PresentationRestrictionCell },
  restrictionCellNonePresentationMode: restrictionCellPresentationModes.none,
  restrictionCellManualPresentationMode: restrictionCellPresentationModes.manual,
  restrictionCellCopiedPresentationMode: restrictionCellPresentationModes.copied,
  restrictionCellClosedPresentationMode: restrictionCellPresentationModes.closed,
  computed: {
    ...mapGetters("tariffPricesAndRestrictions", [
      "hasCurrentTariffEveryDependedRestrictions",
      "isCurrentTariffHasDependedRestrictions",
    ]),
  },
};
</script>
