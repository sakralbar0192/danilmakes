<template>
  <div :class="$style['compact-cell-root']">
    <tariff-table-cell-skeleton
      v-if="isDataPending"
      :cell-height="rowHeight"
    />
    <div
      v-else
      :class="[
        $style['compact-cell'],
        { [$style['compact-cell--show-dividers']]: shouldShowDividers }
      ]"
      :style="compactCellStyle"
    >
      <div
        v-if="closeSegments.length"
        :class="$style['compact-row']"
        :style="closeRowStyle"
      >
        <button
          v-for="segment in closeSegments"
          :key="segment.cellVm.cellKey"
          type="button"
          :class="[$style['compact-segment-button'], segmentClass(segment)]"
          :style="segment.cursorStyle"
          :disabled="segment.cellVm.isRestrictionCopied"
          :tabindex="segment.cellVm.isRestrictionCopied ? -1 : 0"
          data-test="tariff-compact-restriction-cell"
          :data-id="segment.cellVm.dataId"
          :data-date="segment.cellVm.day.date"
          :data-restriction-value="Number(segment.cellVm.internalRestriction.value)"
          :data-cell-type="$options.cellType"
          :data-cell-key="segment.cellVm.cellKey"
          data-compact-boolean-dropdown
          data-cell-root
        >
          <v-icon
            v-if="Number(segment.cellVm.internalRestriction.value)"
            x-small
            class="icon-chevron-right"
            :class="$style['compact-segment-icon']"
          />
        </button>
      </div>
      <div
        v-if="staySegments.length"
        :class="[$style['compact-row'], $style['compact-row--stay']]"
        :style="stayRowStyle"
      >
        <div
          v-for="segment in staySegments"
          :key="segment.cellVm.cellKey"
          :class="segmentClass(segment)"
          :style="segment.cursorStyle"
          data-test="tariff-compact-restriction-cell"
          :data-id="segment.cellVm.dataId"
          :data-date="segment.cellVm.day.date"
          :data-restriction-value="Number(segment.cellVm.internalRestriction.value)"
          :data-cell-type="$options.cellType"
          :data-cell-key="segment.cellVm.cellKey"
          data-cell-root
        >
          <!-- Компактная строка на mobile breakpoint не показывается (`useCompactRestrictionRow`); zoom-guard для iOS при планшете/десктопной ширине. -->
          <div :class="$style['compact-segment-input-wrap']">
            <div :class="$style['compact-segment-input-zoom-inner']">
              <input
                :id="segment.cellVm.cellKey"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                enterkeyhint="done"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                tabindex="0"
                :readonly="segment.cellVm.isRestrictionCopied"
                :class="[$style['compact-segment-input'], $style['compact-segment-input--ios-guard']]"
                :value="segment.cellVm.displayedRestrictionValue"
                placeholder=""
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { buildRestrictionCellCursorStyle } from "../logic/surface/restriction-cursor-css.js";
import { getRestrictionCellModifierFlags } from "../logic/surface/restriction-cell-class-flags.js";
import { cellWidth, compactRestrictionCellHeight } from "../config/table-grid-metrics.js";
import { cellTypes } from "../config/cell-types.js";
import TariffTableCellSkeleton from "./tariff-table-cell-skeleton.vue";

export default {
  name: "TariffTableCompactRestrictionCell",
  components: { TariffTableCellSkeleton },
  inject: { tariffTableCellShared: { default: () => ({ isMobileDevice: false }) } },
  props: {
    stayCellVms: {
      type: Array,
      default: () => [],
    },
    closeCellVms: {
      type: Array,
      default: () => [],
    },
    booleanSheetCellKey: {
      type: String,
      default: "",
    },
    rowHeight: {
      type: Number,
      default: 0,
    },
  },
  cellType: cellTypes.restriction,
  cellHeight: compactRestrictionCellHeight,
  cellWidth,
  computed: {
    isMobileDevice() {
      return Boolean(this.tariffTableCellShared?.isMobileDevice);
    },
    compactCellStyle() {
      return {
        width: `${this.$options.cellWidth}px`,
        height: `${this.rowHeight}px`,
        gridTemplateRows: this.closeSegments.length && this.staySegments.length
          ? "1fr 1fr"
          : "1fr",
      };
    },
    closeRowStyle() {
      return { gridTemplateColumns: `repeat(${this.closeSegments.length}, minmax(0, 1fr))` };
    },
    stayRowStyle() {
      return { gridTemplateColumns: `repeat(${this.staySegments.length}, minmax(0, 1fr))` };
    },
    isDataPending() {
      return [...this.closeCellVms, ...this.stayCellVms].some(cellVm => cellVm?.isDataPending);
    },
    closeSegments() {
      if (this.isDataPending) {
        return [];
      }
      return this.closeCellVms.map(cellVm => this.buildSegmentVm(cellVm));
    },
    staySegments() {
      if (this.isDataPending) {
        return [];
      }
      return this.stayCellVms.map(cellVm => this.buildSegmentVm(cellVm));
    },
    shouldShowDividers() {
      const checkSegment = s => s.hasValue || s.flags?.cellModifiers?.isCopied;
      return this.closeSegments.some(checkSegment) || this.staySegments.some(checkSegment);
    },
  },
  methods: {
    buildSegmentVm(cellVm) {
      const internalRestriction = cellVm?.internalRestriction ?? { value: 0 };
      const numericValue = Number(internalRestriction.value);
      return {
        cellVm,
        hasValue: cellVm.isBooleanStateRestriction
          ? Boolean(numericValue)
          : Boolean(cellVm.displayedRestrictionValue),
        flags: getRestrictionCellModifierFlags(cellVm, {
          booleanSheetCellKey: this.booleanSheetCellKey,
          isMobileDevice: this.isMobileDevice,
          needShowBooleanActiveState: true,
        }),
        cursorStyle: buildRestrictionCellCursorStyle({
          restrictionType: cellVm.restrictionType,
          closedArrivalName: PriceAndRestrictionsService.closedArrivalRestrictionName,
          closedDepartureName: PriceAndRestrictionsService.closedDepartureRestrictionName,
          pointerCssUrl: `url(${this.$localImage("pointer.png")}) , pointer`,
          customCursorCssUrl: `url(${this.$localImage("custom-cursor.png")}) 3 8, auto`,
        }),
      };
    },
    segmentClass(segment) {
      const modifiers = segment.flags.cellModifiers;
      return [
        this.$style["compact-segment"],
        {
          [this.$style["compact-segment--boolean"]]: modifiers.isBoolean,
          [this.$style["compact-segment--closed"]]: modifiers.isClosed,
          [this.$style["compact-segment--copied"]]: modifiers.isCopied,
          [this.$style["compact-segment--filled"]]: segment.hasValue,
          [this.$style["compact-segment--empty"]]: !segment.hasValue,
          [this.$style["compact-segment--error"]]: modifiers.isError,
          [this.$style["compact-segment--boolean-active"]]: segment.flags.isBooleanSheetHighlight,
        },
      ];
    },
  },
};
</script>

<style lang="scss" module>
@import '../../../styles/variables.scss';
@import '../../../styles/ios-input-zoom-guard.scss';

.compact-cell-root {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.compact-segment-input-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.compact-segment-input-zoom-inner {
  @include tariff-ios-input-zoom-inner;
}

.compact-cell {
  display: grid;
  border-right: 1px solid $tariff-table-grid-border-color;
  border-bottom: 1px solid $tariff-table-grid-border-color;
  box-sizing: border-box;
  background-color: $white;

  &--show-dividers,
  &:hover {
    .compact-row:not(:first-child) {
      border-top-color: $tariff-table-grid-border-color;
    }
    .compact-segment:not(:first-child) {
      border-left-color: $tariff-table-grid-border-color;
    }
    .compact-segment--closed:not(.compact-segment--filled):not(.compact-segment--copied):hover {
      background-color: $closed-hover-bg-color;
    }
  }
}

.compact-row {
  display: grid;
  min-width: 0;
  min-height: 0;

  &:not(:first-child) {
    border-top: 1px solid transparent;
  }
}

.compact-row--stay {
  min-height: 0;
}

.compact-segment-button {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: inherit;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  appearance: none;

  &:disabled {
    cursor: inherit;
  }
}

.compact-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  background-color: $white;
  color: $text-color;
  position: relative;

  &:not(:first-child) {
    border-left: 1px solid transparent;
  }

  &:focus-within,
  &:focus,
  &--boolean-active {
    outline: 1px solid $primary;
    outline-offset: -1px;
  }

  &--filled {
    background-color: $compact-restriction-filled-bg-color;
  }

  &--empty {
    background-color: $white;

    &:not(.compact-segment--filled, .compact-segment--copied):hover {
      background-color: $sub-cell-hover-bg-color;
    }
  }

  &--closed {
    background-color: $closed-bg-color;

    &.compact-segment--filled {
      background-color: $compact-restriction-filled-bg-color;
    }

    &:not(.compact-segment--boolean):not(.compact-segment--copied) {
      .compact-segment-input {
        &:not(:focus) {
          text-decoration: line-through;
        }
      }
    }
  }

  &--boolean {
    .compact-segment--filled {
      background-color: $compact-restriction-boolean-filled-bg-color;
    }
  }

  &--copied {
    background: $copied-restriction-cell-background;
    color: $price-cell-default-text-color !important;
    cursor: url("/public/spa/img/not-allowed-pointer.png"), pointer !important;

    .compact-segment-icon {
      color: $price-cell-default-text-color !important;
    }

    &.compact-segment--filled {
      background-color: $compact-restriction-copied-filled-bg-color;
    }
  }

  &--error {
    z-index: 2;
    outline: 1px solid $error;
    outline-offset: -1px;
  }
}

.compact-segment-icon {
  color: $error !important;
  pointer-events: none;
}

.compact-segment-input {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0 2px;
  text-align: center;
  color: inherit;
  font-size: 12px;
  line-height: 1;
  cursor: inherit !important;
  background-color: transparent;
  box-sizing: border-box;
  margin: 0;

  &--ios-guard {
    @include tariff-ios-input-zoom-field;
  }

  &:focus {
    outline: none;
  }

  &[readonly] {
    pointer-events: none;
  }
}
</style>
