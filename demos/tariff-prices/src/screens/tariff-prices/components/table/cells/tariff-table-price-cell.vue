<template>
  <div
    :class="[$style['price-cell-root'], { [$style['price-cell-root--pending']]: cellVm.isDataPending }]"
  >
    <tariff-table-cell-skeleton
      v-if="cellVm.isDataPending"
      :cell-height="cellVm.cellHeight"
    />
    <div
      v-else
      ref="cellRoot"
      v-bind="mergePriceCellTooltipAttrs()"
      :style="priceCellActivatorStyle"
      class="tariff-demo-and-restrictions-table-price-cell d-flex flex-column align-center justify-center"
      :class="cellClasses"
      data-test="tariff-price-cell"
      :data-id="cellVm.dataId"
      :data-date="cellVm.day.date"
      :data-weekday="cellVm.day.weekday"
      :data-closed="cellVm.isSaleClosed ? 1 : 0"
      :data-cell-type="$options.cellType"
      :data-cell-key="cellVm.cellKey"
      :data-price-manual="cellVm.isManual ? 1 : 0"
      data-cell-root
      @mouseenter.capture="onCellRootMouseEnterCapture"
      @mouseleave="onCellRootMouseLeave"
      @focusin="onCellFocusIn"
      @focusout="onCellFocusOut"
    >
      <div
        :class="$style['price-input-wrap']"
        :style="effectiveHeight"
      >
        <div :class="$style['price-input-zoom-inner']">
          <input
            :id="cellVm.cellKey"
            type="text"
            inputmode="decimal"
            enterkeyhint="done"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            tabindex="0"
            :class="[$style['price-text-field'], $style['price-text-field--ios-guard']]"
            :value="cellVm.displayedPriceValue"
            :style="effectiveHeight"
          >
        </div>
      </div>
      <b-btn
        v-if="cellVm.needShowResetButton"
        data-price-reset-anchor
        :class="$style['reset-button']"
        color="primary"
        text
        text-inline
        squared
        :tabindex="resetButtonTabindex"
        :data-action="cellVm.buttonAction"
        @mouseleave.stop="onResetMouseLeave"
      >
        <v-icon class="icon-redo"/>
      </b-btn>
    </div>
  </div>
</template>

<script>
import { buildPriceCellMainTooltipSnapshot, buildPriceCellResetTooltipSnapshot } from "../logic/surface/build-price-cell-tooltip-snapshots.js";
import { mergePriceCellTooltipAttrs as mergePriceCellTooltipAttrsPure } from "../logic/surface/merge-price-cell-tooltip-attrs.js";
import { getPriceCellModifierFlags } from "../logic/surface/price-cell-class-flags.js";
import { cellWidth } from "../config/table-grid-metrics.js";
import { cellTypes } from "../config/cell-types.js";
import TariffTableCellSkeleton from "./tariff-table-cell-skeleton.vue";

export default {
  name: "TariffTablePriceCell",
  components: { TariffTableCellSkeleton },
  inject: { tariffPriceCellTooltipController: { default: null } },
  props: {
    cellVm: {
      type: Object,
      required: true,
    },
  },
  cellType: cellTypes.price,
  cellWidth,
  data() {
    return { cellHasFocusWithin: false };
  },
  computed: {
    priceCellActivatorStyle() {
      return {
        height: `${this.cellVm.cellHeight}px`,
        width: `${this.$options.cellWidth}px`,
        boxSizing: "border-box",
      };
    },
    effectiveHeight() {
      return { height: `${this.cellVm.cellHeight - 1}px` };
    },
    priceCellFlags() {
      return getPriceCellModifierFlags(this.cellVm);
    },
    cellClasses() {
      const f = this.priceCellFlags;
      return [
        this.$style["price-cell"],
        {
          [this.$style["price-cell-main"]]: f.isMain,
          [this.$style["price-cell-sub"]]: f.isSub,
          [this.$style["price-cell-closed"]]: f.isSaleClosed,
          [this.$style["price-cell-manual"]]: f.isManual,
          [this.$style["price-cell-dynamic"]]: f.isDynamic,
          [this.$style["price-cell-error"]]: f.isError,
          "bordered-b bordered-r rounded-0": true,
        },
      ];
    },
    resetButtonTabindex() {
      if (!this.cellVm.needShowResetButton) {
        return undefined;
      }
      return this.cellHasFocusWithin ? 0 : -1;
    },
  },
  methods: {
    mergePriceCellTooltipAttrs(attrs) {
      return mergePriceCellTooltipAttrsPure(this.isMobileDevice, attrs || {});
    },
    getMainSnapshot() {
      return buildPriceCellMainTooltipSnapshot(this.cellVm);
    },
    getResetSnapshot() {
      return buildPriceCellResetTooltipSnapshot(this.cellVm);
    },
    onCellRootMouseEnterCapture(e) {
      const c = this.tariffPriceCellTooltipController;
      if (!c || this.isMobileDevice) {
        return;
      }
      const resetEl = e.target?.closest?.("[data-price-reset-anchor]");
      if (resetEl && this.cellVm.needShowResetButton) {
        c.cancelHideSoon();
        const resetArgs = {
          anchorEl: resetEl,
          getSnapshot: this.getResetSnapshot,
          getMainSnapshot: this.getMainSnapshot,
        };
        c.scheduleShowReset(resetArgs);
        return;
      }
      if (!this.cellVm.isTooltipDisabled) {
        c.cancelHideSoon();
        c.scheduleShowMain({ anchorEl: this.$refs.cellRoot, getSnapshot: this.getMainSnapshot });
      }
    },
    onCellRootMouseLeave(e) {
      const c = this.tariffPriceCellTooltipController;
      if (!c || this.isMobileDevice) {
        return;
      }
      const to = e.relatedTarget;
      const tip = typeof document !== "undefined"
        ? document.querySelector("[data-price-cell-tooltip-root]")
        : null;
      if (to instanceof Node && tip?.contains(to)) {
        return;
      }
      c.scheduleHideSoon();
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
    onResetMouseLeave(e) {
      const c = this.tariffPriceCellTooltipController;
      if (!c || this.isMobileDevice) {
        return;
      }
      const to = e.relatedTarget;
      const cellRoot = this.$refs.cellRoot;
      const tip = typeof document !== "undefined"
        ? document.querySelector("[data-price-cell-tooltip-root]")
        : null;
      if (to instanceof Node && tip?.contains(to)) {
        return;
      }
      if (to instanceof Node && cellRoot?.contains(to)) {
        if (!this.cellVm.isTooltipDisabled) {
          c.scheduleShowMainAfterResetLeave({ cellRootEl: cellRoot, getSnapshot: this.getMainSnapshot });
        }
        return;
      }
      c.scheduleHideSoon();
    },
  },
};
</script>

<style lang="scss" module>
@import '../../../styles/variables.scss';
@import '../../../styles/ios-input-zoom-guard.scss';
@import '../styles/cells/cell-reset-button';

.price-cell-root {
  display: contents;
}

.price-cell-root--pending {
  display: block;
  pointer-events: none;
}

.price-text-field {
  padding: 0 0 2px;
  width: $cell-width;
  height: $tariff-table-cell-inner-height;
  text-align: center;

  &:not(:focus) {
    color: $price-cell-default-text-color;
  }

  &--ios-guard {
    @include tariff-ios-input-zoom-field;
  }
}

.price-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: $cell-width;
  height: $tariff-table-cell-inner-height;
  overflow: hidden;
}

.price-input-zoom-inner {
  @include tariff-ios-input-zoom-inner;
}

.price-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: url("/public/spa/img/custom-cursor.png") 3 8, auto;
  font-size: 12px !important;

  .price-text-field:focus,
  &:focus-within .price-text-field {
    outline: 1px solid $primary;
    outline-offset: -1px;
    background-color: $white;
  }

  .price-text {
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: $cell-width;
    height: $tariff-table-cell-inner-height;
    pointer-events: none;
    color: $price-cell-default-text-color;
    max-width: 100%;
    margin: 0;

    >span:first-of-type {
      text-align: center;
    }
  }

  &-main {
    background-color: $main-cell-bg-color !important;
    border-left: 1px solid $main-cell-bg-color !important;

    &:hover {
      border-left: 1px solid $main-cell-hover-bg-color !important;
      background-color: $main-cell-hover-bg-color !important;
    }
  }

  &-sub {
    background-color: $sub-cell-bg-color !important;
    border-left: 1px solid $sub-cell-bg-color !important;

    &:hover {
      border-left: 1px solid $sub-cell-hover-bg-color !important;
      background-color: $sub-cell-hover-bg-color !important;
    }
  }

  &-dynamic {
    .price-text {
      font-style: italic;

      span:first-of-type::after {
        content: '*';
        position: relative;
        right: 3px;
        color: $tariff-dynamic-marker;
      }
    }

    .price-text-field:not(:focus) {
      font-style: italic;
    }

    .price-input-wrap::after {
      content: '*';
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: $tariff-dynamic-marker;
      font-style: italic;
      pointer-events: none;
    }
  }

  &-manual {
    .price-text {
      font-weight: 600;
      color: $main;
      font-style: normal;

      span:first-of-type::after {
        content: '';
        display: none;
      }
    }

    .price-text-field:not(:focus) {
      font-weight: 600;
      color: $main;
      font-style: normal;
    }

    .price-input-wrap::after {
      content: none;
    }
  }

  &-closed {
    background-color: $closed-bg-color !important;
    border-left: 1px solid $closed-bg-color !important;

    .price-text > span:first-of-type {
      text-decoration: line-through;
    }

    .price-text-field:not(:focus) {
      text-decoration: line-through;
      background-color: $closed-bg-color !important;
    }

    &:hover {
      border-left: 1px solid $closed-hover-bg-color !important;
      background-color: $closed-hover-bg-color !important;
    }

    .price-text-field {
      background-color: $closed-bg-color !important;
    }
  }

  &-error {
    .price-text {
      outline: 1px solid $tariff-cell-conflict-outline !important;
      z-index: 2;
    }

    .price-text-field {
      outline: 1px solid $tariff-cell-conflict-outline !important;
      outline-offset: -1px;
    }

    &:focus-within .price-text-field {
      outline: 1px solid $primary !important;
      outline-offset: -1px;
      z-index: 3;
      position: relative;
    }

    &:focus-within .price-text {
      outline: 1px solid $primary !important;
      outline-offset: -1px;
      z-index: 3;
      position: relative;
    }
  }

  &:hover .reset-button,
  &:focus-within .reset-button {
    opacity: 1;
    pointer-events: all;
  }
}

</style>
