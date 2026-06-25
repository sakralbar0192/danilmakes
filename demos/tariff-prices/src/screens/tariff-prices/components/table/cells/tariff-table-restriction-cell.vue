<template>
  <tariff-table-cell-skeleton
    v-if="cellVm.isDataPending"
    :cell-height="cellVm.cellHeight"
  />
  <div
    v-else
    ref="cellRoot"
    :style="[restrictionCellBoxStyle, cursorStyle]"
    :class="[
      'd-flex flex-column align-center justify-center tariff-restriction-cell-root',
      cellClass,
      'bordered-b bordered-r rounded-0',
      { [$style['restriction-cell--boolean-sheet']]: isBooleanSheetHighlight },
    ]"
    data-test="tariff-restriction-cell"
    :data-id="cellVm.dataId"
    :data-date="cellVm.day.date"
    :data-restriction-value="Number(cellVm.internalRestriction.value)"
    :data-cell-type="$options.cellType"
    :data-cell-key="cellVm.cellKey"
    :tabindex="booleanRootTabindex"
    :role="booleanRootRole"
    :aria-label="booleanAriaLabel"
    data-cell-root
    @mousedown.left="handleMouseDown"
    @mouseenter="handleMouseEnter"
    @focusin="onCellFocusIn"
    @focusout="onCellFocusOut"
    @keydown.enter.prevent="onBooleanRootKeydown"
    @keydown.space.prevent="onBooleanRootKeydown"
  >
    <p
      v-if="cellVm.isBooleanStateRestriction"
      :class="$style['restriction-text']"
    >
      <v-icon
        v-if="!!Number(cellVm.internalRestriction.value)"
        small
        color="primary"
        class="icon-minus-circle tariff-table-boolean-icon"
        style="pointer-events: none;"
      />
    </p>
    <div
      v-else
      :class="$style['restriction-input-wrap']"
    >
      <div :class="$style['restriction-input-zoom-inner']">
        <input
          :id="cellVm.cellKey"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          enterkeyhint="done"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :readonly="cellVm.isRestrictionCopied"
          :tabindex="numericInputTabindex"
          :class="[
            $style['restriction-text-field'],
            $style['restriction-text-field--ios-guard'],
          ]"
          :value="cellVm.displayedRestrictionValue"
          placeholder=""
        >
      </div>
    </div>
    <b-btn
      v-if="cellVm.needShowResetButton"
      :class="$style['reset-button']"
      color="primary"
      text
      text-inline
      squared
      :tabindex="resetButtonTabindex"
      :data-action="cellVm.buttonAction"
    >
      <v-icon class="icon-redo"/>
    </b-btn>
  </div>
</template>

<script>
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { restrictionTypes } from "../../../config/screen-config.js";
import { buildRestrictionCellCursorStyle } from "../logic/surface/restriction-cursor-css.js";
import { computeBooleanRestrictionRootTabindex } from "../logic/surface/compute-boolean-restriction-root-tabindex.js";
import { computeRestrictionNumericInputTabindex } from "../logic/surface/compute-restriction-numeric-input-tabindex.js";
import { getRestrictionCellModifierFlags } from "../logic/surface/restriction-cell-class-flags.js";
import { cellHeight, cellWidth } from "../config/table-grid-metrics.js";
import { cellTypes } from "../config/cell-types.js";
import TariffTableCellSkeleton from "./tariff-table-cell-skeleton.vue";

export default {
  name: "TariffTableRestrictionCell",
  components: { TariffTableCellSkeleton },
  props: {
    /** View model из `table/index` `getRestrictionCellVm` (батчится в строке). */
    cellVm: {
      type: Object,
      required: true,
    },
    booleanSheetCellKey: {
      type: String,
      default: "",
    },
  },
  cellType: cellTypes.restriction,
  cellHeight,
  cellWidth,
  restrictionTypes,
  data() {
    return { cellHasFocusWithin: false };
  },
  computed: {
    restrictionFlags() {
      return getRestrictionCellModifierFlags(this.cellVm, { booleanSheetCellKey: this.booleanSheetCellKey });
    },
    isBooleanSheetHighlight() {
      return this.restrictionFlags.isBooleanSheetHighlight;
    },
    cellClass() {
      const m = this.restrictionFlags.cellModifiers;
      return [
        this.$style["restriction-cell"],
        {
          [this.$style["restriction-cell-closed"]]: m.isClosed,
          [this.$style["restriction-cell-copied"]]: m.isCopied,
          [this.$style["restriction-cell-boolean"]]: m.isBoolean,
          [this.$style["restriction-cell-error"]]: m.isError,
        },
      ];
    },
    restrictionCellBoxStyle() {
      return {
        height: `${this.$options.cellHeight}px`,
        width: `${this.$options.cellWidth}px`,
        boxSizing: "border-box",
      };
    },
    cursorStyle() {
      return buildRestrictionCellCursorStyle({
        restrictionType: this.cellVm.restrictionType,
        closedArrivalName: PriceAndRestrictionsService.closedArrivalRestrictionName,
        closedDepartureName: PriceAndRestrictionsService.closedDepartureRestrictionName,
        pointerCssUrl: `url(${this.$localImage("pointer.png")}) , pointer`,
        customCursorCssUrl: `url(${this.$localImage("custom-cursor.png")}) 3 8, auto`,
      });
    },
    isBooleanInteractionLocked() {
      return Boolean(this.cellVm.isRestrictionCopied);
    },
    booleanRootTabindex() {
      return computeBooleanRestrictionRootTabindex(
        this.cellVm.isBooleanStateRestriction,
        this.cellVm.isRestrictionCopied,
      );
    },
    booleanRootRole() {
      return this.cellVm.isBooleanStateRestriction ? "button" : undefined;
    },
    booleanAriaLabel() {
      if (!this.cellVm.isBooleanStateRestriction) {
        return undefined;
      }
      const entry = this.$options.restrictionTypes?.[this.cellVm.restrictionType];
      const label = entry?.table;
      return typeof label === "string" ? label : undefined;
    },
    resetButtonTabindex() {
      if (!this.cellVm.needShowResetButton) {
        return undefined;
      }
      return this.cellHasFocusWithin ? 0 : -1;
    },
    numericInputTabindex() {
      return computeRestrictionNumericInputTabindex(Boolean(this.cellVm.isRestrictionCopied));
    },
  },
  methods: {
    handleMouseDown(event) {
      if (this.cellVm.isRestrictionCopied) {
        return;
      }
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      this.$emit("mousedown", event);
    },
    handleMouseEnter(event) {
      this.$emit("mouseenter", event);
    },
    onBooleanRootKeydown() {
      if (!this.cellVm.isBooleanStateRestriction || this.isBooleanInteractionLocked) {
        return;
      }
      const el = this.$refs.cellRoot;
      if (!el || typeof el.dispatchEvent !== "function") {
        return;
      }
      el.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: typeof window !== "undefined" ? window : undefined,
      }));
    },
    onCellFocusIn() {
      this.cellHasFocusWithin = true;
    },
    onCellFocusOut() {
      this.$nextTick(() => {
        const root = this.$refs.cellRoot;
        if (!root?.contains?.(document.activeElement)) {
          this.cellHasFocusWithin = false;
        }
      });
    },
  },
};
</script>

<style lang="scss" module>
@import '../../../styles/variables.scss';
@import '../../../styles/ios-input-zoom-guard.scss';
@import '../styles/cells/cell-reset-button';

.restriction-text-field {
  padding: 0 0 2px;
  width: $cell-width;
  height: $tariff-table-cell-inner-height;
  text-align: center;
  // Иначе UA даёт input:text cursor:text и перекрывает курсор ячейки (custom / not-allowed).
  cursor: inherit !important;

  &--ios-guard {
    @include tariff-ios-input-zoom-field;
  }
}

.restriction-input-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: $cell-width;
  height: $tariff-table-cell-inner-height;
  overflow: hidden;
}

.restriction-input-zoom-inner {
  @include tariff-ios-input-zoom-inner;
}

.restriction-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 12px !important;
  background-color: $sub-cell-bg-color !important;

  .restriction-text-field:focus,
  &:focus-within .restriction-text-field {
    outline: 1px solid $primary;
    outline-offset: -1px;
    z-index: 2;
    background-color: $white;
  }

  .restriction-text {
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: $cell-width;
    height: $tariff-table-cell-inner-height;
    pointer-events: none;
    color: $text-color;
    max-width: 100%;
  }

  &-closed {
    background-color: $closed-bg-color !important;
    border-left: 1px solid $closed-bg-color;

    &:hover {
      border-left: 1px solid $closed-hover-bg-color;
      background-color: $closed-hover-bg-color !important;
    }

    &:not(.restriction-cell-boolean) .restriction-text {
      text-decoration: line-through;
    }
  }

  &-copied {
    cursor: url("/tariffPrices/img/not-allowed-pointer.png"), pointer !important;

    .restriction-text {
      color: $price-cell-default-text-color !important;
    }

    .restriction-text-field[readonly] {
      pointer-events: none;
    }

    :global(.v-icon) {
      color: $tariff-copied-icon-muted !important;
    }
  }

  &-boolean:focus-visible {
    outline: 1px solid $primary;
    outline-offset: -1px;
    z-index: 2;
  }

  &-error {
    .restriction-text {
      outline: 1px solid $tariff-cell-conflict-outline !important;
      z-index: 2;
    }

    .restriction-text-field {
      outline: 1px solid $tariff-cell-conflict-outline !important;
      outline-offset: -1px;
      z-index: 2;
    }

    .restriction-text-field:focus {
      background-color: $white;
    }

    &:focus-within .restriction-text-field {
      outline: 1px solid $primary !important;
      outline-offset: -1px;
      z-index: 3;
      position: relative;
    }

    &:focus-within .restriction-text {
      outline: 1px solid $primary !important;
      outline-offset: -1px;
      z-index: 3;
      position: relative;
    }
  }
}

.restriction-cell--boolean-sheet {
  .restriction-text {
    outline: 1px solid $primary;
    outline-offset: -1px;
    background-color: $white;
  }
}

.restriction-cell:hover .reset-button,
.restriction-cell:focus-within .reset-button {
  opacity: 1;
  pointer-events: all;
}
</style>
