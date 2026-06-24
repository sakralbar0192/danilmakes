<template>
  <div
    :class="[$style['availability-cell-root'], { [$style['availability-cell-root--pending']]: cellVm.isDataPending }]"
  >
    <tariff-table-cell-skeleton
      v-if="cellVm.isDataPending"
      :cell-height="cellHeight"
    />
    <span
      v-else-if="!cellVm.isAvailabilityEditable"
      data-test="tariff-availability-cell-readonly"
    >
      {{ cellVm.availability }}
    </span>
    <div
      v-else
      ref="cellRoot"
      :style="cellActivatorStyle"
      class="d-flex flex-column align-center justify-center"
      :class="cellClasses"
      data-test="tariff-availability-cell"
      :data-id="cellVm.roomtypeId"
      :data-date="cellVm.dayDate"
      :data-saved-availability="cellVm.savedAvailability"
      :data-cell-type="$options.cellType"
      :data-cell-key="cellVm.cellKey"
      data-cell-root
    >
      <div
        :class="[$style['availability-input-wrap'], {
          [$style['availability-input-wrap--compact']]: isCompactCell,
        }]"
        :style="effectiveInnerHeight"
      >
        <div
          :class="[$style['availability-input-zoom-inner'], {
            [$style['availability-input-zoom-inner--compact']]: isCompactCell,
          }]"
        >
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
            tabindex="0"
            :class="[$style['availability-text-field'], $style['availability-text-field--ios-guard']]"
            :style="effectiveInnerHeight"
            :value="cellVm.availability"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { cellTypes } from "../config/cell-types.js";
import { cellWidth } from "../config/table-grid-metrics.js";
import TariffTableCellSkeleton from "./tariff-table-cell-skeleton.vue";

export default {
  name: "TariffTableAvailabilityCell",
  components: { TariffTableCellSkeleton },
  props: {
    cellVm: {
      type: Object,
      required: true,
    },
    cellHeight: {
      type: Number,
      required: true,
    },
  },
  cellType: cellTypes.availability,
  cellWidth,
  computed: {
    cellActivatorStyle() {
      return {
        height: `${this.cellHeight}px`,
        width: `${this.$options.cellWidth}px`,
        boxSizing: "border-box",
      };
    },
    effectiveInnerHeight() {
      return { height: `${Math.max(this.cellHeight - 1, 1)}px` };
    },
    cellClasses() {
      return [
        this.$style["availability-cell"],
        {
          [this.$style["availability-cell-manual"]]: this.cellVm.isAvailabilityUpdating,
          [this.$style["availability-cell-error"]]: this.cellVm.isInvalidAvailabilityDraft,
          [this.$style["availability-cell--compact"]]: this.isCompactCell,
          "bordered-b bordered-r rounded-0": true,
        },
      ];
    },
    isCompactCell() {
      return this.cellHeight <= 20;
    },
  },
};
</script>

<style lang="scss" module>
@import '../../../styles/variables.scss';
@import '../../../styles/ios-input-zoom-guard.scss';

.availability-cell-root {
  display: contents;
}

.availability-cell-root--pending {
  display: block;
  pointer-events: none;
}

.availability-text-field {
  padding: 0;
  width: $cell-width;
  text-align: center;
  border: none;
  background: transparent;
  box-sizing: border-box;
  line-height: 1;

  &:not(:focus) {
    color: $price-cell-default-text-color;
  }

  &--ios-guard {
    @include tariff-ios-input-zoom-field;
  }
}

.availability-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: $cell-width;
  overflow: hidden;
}

.availability-input-zoom-inner {
  @include tariff-ios-input-zoom-inner;
}

.availability-input-wrap--compact,
.availability-cell--compact {
  align-items: center;
  justify-content: center;
}

.availability-input-zoom-inner--compact {
  transform-origin: center center;
}

.availability-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: inherit !important;

  .availability-text-field:focus,
  &:focus-within .availability-text-field {
    outline: 1px solid $primary;
    outline-offset: -1px;
    background-color: $white;
  }

  &-manual {
    .availability-text-field:not(:focus) {
      font-weight: 600;
      color: $main;
      font-style: normal;
    }
  }

  &-error {
    .availability-text-field {
      outline: 1px solid $error !important;
      outline-offset: -1px;
    }

    &:focus-within .availability-text-field {
      outline: 1px solid $primary !important;
      outline-offset: -1px;
      z-index: 3;
      position: relative;
    }
  }
}
</style>
