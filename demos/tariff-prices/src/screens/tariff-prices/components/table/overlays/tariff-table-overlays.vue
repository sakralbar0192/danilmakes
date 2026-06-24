<template>
  <template>
    <other-tariffs-prices-tooltip
      v-if="showOtherTariffsTooltip"
      :cell-key="tooltipAnchorCellKey"
    />
    <price-reset-approval-tooltip
      v-if="needShowResetApprovalPopup"
      :reset-approval-info="resetApprovalInfo"
      @approve="$emit('approve-reset-price')"
      @dismiss="$emit('dismiss-reset-approval')"
    />
    <boolean-restriction-bottom-sheet
      v-if="booleanRestrictionSheet"
      :restriction-type="booleanRestrictionSheet.restrictionType"
      :selected-value="booleanRestrictionSheet.selectedValue"
      @close="$emit('close-boolean-sheet')"
      @apply="$emit('apply-boolean-sheet', $event)"
    />
    <compact-boolean-restriction-dropdown
      v-if="compactBooleanRestrictionDropdown"
      :key="compactBooleanRestrictionDropdown.cellKey"
      :anchor-el="compactBooleanRestrictionDropdown.anchorEl"
      :restriction-type="compactBooleanRestrictionDropdown.restrictionType"
      :selected-value="compactBooleanRestrictionDropdown.selectedValue"
      @close="$emit('close-compact-boolean-dropdown')"
      @apply="$emit('apply-compact-boolean-dropdown', $event)"
    />
    <dependent-restriction-readonly-bottom-sheet
      v-if="dependentRestrictionReadonlySheet"
      :restriction-label="dependentRestrictionReadonlySheet.restrictionLabel"
      :parent-tariff-name="dependentRestrictionReadonlySheet.parentTariffName"
      :parent-tariff-href="dependentRestrictionReadonlySheet.parentTariffHref"
      @close="$emit('close-dependent-restriction-readonly-sheet')"
    />
    <tariff-price-cell-tooltip-overlay
      v-if="priceCellTooltipController"
      :controller="priceCellTooltipController"
    />
  </template>
</template>

<script>
import OtherTariffsPricesTooltip from "./other-tariffs-prices-tooltip.vue";
import PriceResetApprovalTooltip from "./price-reset-approval-tooltip.vue";
import BooleanRestrictionBottomSheet from "../mobile/boolean-restriction-bottom-sheet.vue";
import CompactBooleanRestrictionDropdown from "./compact-boolean-restriction-dropdown.vue";
import DependentRestrictionReadonlyBottomSheet from "../mobile/dependent-restriction-readonly-bottom-sheet.vue";
import TariffPriceCellTooltipOverlay from "./tariff-price-cell-tooltip-overlay.vue";

export default {
  name: "TariffTableOverlays",
  components: {
    OtherTariffsPricesTooltip,
    PriceResetApprovalTooltip,
    BooleanRestrictionBottomSheet,
    CompactBooleanRestrictionDropdown,
    DependentRestrictionReadonlyBottomSheet,
    TariffPriceCellTooltipOverlay,
  },
  props: {
    priceCellTooltipController: {
      type: Object,
      default: null,
    },
    showOtherTariffsTooltip: {
      type: Boolean,
      default: false,
    },
    tooltipAnchorCellKey: {
      type: String,
      default: null,
    },
    needShowResetApprovalPopup: {
      type: Boolean,
      default: false,
    },
    resetApprovalInfo: {
      type: Object,
      default: () => ({}),
    },
    booleanRestrictionSheet: {
      type: Object,
      default: null,
    },
    compactBooleanRestrictionDropdown: {
      type: Object,
      default: null,
    },
    dependentRestrictionReadonlySheet: {
      type: Object,
      default: null,
    },
  },
};
</script>
