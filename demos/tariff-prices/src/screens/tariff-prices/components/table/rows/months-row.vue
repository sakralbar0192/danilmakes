<template>
  <div>
    <v-card
      :max-width="$options.roomtypeNameCellWidth"
      height="64"
      :class="['d-flex align-center bordered rounded-0', $style['sticky-cell'], 'bnovo-tariff-prices-table-sticky-header-inner', {
        'pa-ingroup pl-groups justify-space-between': !compactMode,
        'pa-semi-inner justify-center': compactMode,
      }]"
    >
      <span v-if="!compactMode">
        {{ selectedCategories.length ? $t('Выбранные категории') : $t('Все категории') }}
      </span>
      <div>
        <v-badge
          :class="['v-size--small', $style.badge]"
          color="sand"
          :value="selectedCategories.length"
        >
          <v-tooltip bottom :disabled="isMobileDevice">
            <template #activator="{ props: activatorProps }">
              <b-btn
                data-test="tariff-categories-filter-button"
                squared
                color="secondary"
                small
                v-bind="activatorProps"
                data-tour="prices-and-restrictions-tour-category-filter-step"
                @click="onCategoriesFilterActivatorClick($event, activatorProps)"
              >
                <v-icon
                  class="icon-filter"
                />
              </b-btn>
            </template>
            <b>{{ $t('Фильтр по категории') }}</b>
          </v-tooltip>
        </v-badge>
        <b-btn
          v-if="isMobileDevice"
          squared
          class="ml-typo"
          :title="compactMode ? $t('Выйти из компактного режима') : $t('Перейти в компактный режим')"
          small
          color="tertiary"
          @click="onCompactModeClick"
        >
          <v-icon x-small :style="{ transform: compactMode ? `rotate(180deg)` : null}">
            icon-chevrons-left
          </v-icon>
        </b-btn>
      </div>
    </v-card>
    <div :class="$style.daysWrapper" :style="daysWrapperStyle">
      <div
        v-for="label in visibleMonthLabels"
        :key="label.key"
        :class="$style.monthLabelClip"
        :style="{
          left: `${label.clipLeftPx}px`,
          width: `${label.clipWidthPx}px`,
        }"
      >
        <div
          :class="[$style.monthLabelTrack, 'd-flex align-center justify-center font-weight-bold px-groups']"
          :style="{
            left: `${label.trackLeftPx}px`,
            width: `${label.trackWidthPx}px`,
          }"
        >
          <span :class="$style.monthLabelText">{{ label.monthName }}</span>
        </div>
      </div>
      <div :style="hcalDaysRowFlexStyle">
        <div :style="hcalLeadingSpacerStyle" aria-hidden="true"/>
        <div :style="visibleDaysStyle">
          <div
            v-for="(day, localIndex) in hcalDisplayCalendar"
            :key="day.date"
            :style="{ gridRow: 'span 2', display: 'flex', flexDirection: 'column' }"
          >
            <v-card
              height="25"
              :width="$options.cellWidth"
              :class="['d-flex align-center bordered-t rounded-0', {
                'bordered-r': monthsRowRightMonthBorder(localIndex),
              }]"
            />
            <v-card
              height="39"
              :width="$options.cellWidth"
              class="d-flex flex-column justify-center align-center bordered-t bordered-r bordered-b rounded-0"
              :data-visible-date="day.date"
            >
              <span style="font-size: 12px" class="font-weight-bold">
                {{ day.day }}
              </span>
              <span style="font-size: 10px" :class="{'primary--text': day.isWeekend}">
                {{ day.weekdayName.toUpperCase() }}
              </span>
            </v-card>
          </div>
        </div>
        <div :style="hcalTrailingSpacerStyle" aria-hidden="true"/>
      </div>
    </div>
  </div>
</template>

<script>
import { roomtypeNameCellWidth, roomtypeNameCellWidthCompact, cellWidth } from "../config/table-grid-metrics.js";
import tariffHorizontalCalendarSlice from "../mixins/tariff-horizontal-calendar-slice.js";
import { computeVisibleMonthLabelPositions } from "../lib/scroll/resolve-month-label-display.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsTableMonthRow",
  mixins: [tariffHorizontalCalendarSlice],
  roomtypeNameCellWidth,
  roomtypeNameCellWidthCompact,
  cellWidth,
  props: {
    calendar: {
      type: Array,
      default: null,
    },
    selectedCategories: {
      type: Array,
      default: () => [],
    },
    compactMode: {
      type: Boolean,
      default: false,
    },
    suppressCategoriesFilterClickUntilMs: {
      type: Number,
      default: 0,
    },
    horizontalScrollLeft: {
      type: Number,
      default: 0,
    },
    horizontalScrollClientWidth: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    nameColumnWidthPx() {
      return this.compactMode ? this.$options.roomtypeNameCellWidthCompact : this.$options.roomtypeNameCellWidth;
    },
    daysWrapperStyle() {
      const width = this.hcalCalendarLength * this.hcalCellWidth;
      return { width: `${width}px`, minWidth: `${width}px` };
    },
    visibleDaysStyle() {
      const count = this.hcalDisplayCalendar.length;
      const cw = this.hcalCellWidth;
      return {
        marginLeft: "0",
        display: "grid",
        gridTemplateColumns: `repeat(${count}, ${cw}px)`,
        gridTemplateRows: "25px 39px",
        gridAutoFlow: "column",
        width: `${count * cw}px`,
      };
    },
    visibleMonthLabels() {
      return computeVisibleMonthLabelPositions({
        calendar: this.hcalFullCalendar,
        scrollLeft: this.horizontalScrollLeft,
        clientWidth: this.horizontalScrollClientWidth,
        nameColumnWidth: this.nameColumnWidthPx,
        cellWidth: this.hcalCellWidth,
      });
    },
  },
  methods: {
    monthsRowGlobalIndex(localIndex) {
      return this.hcalStartIndex + localIndex;
    },
    monthsRowRightMonthBorder(localIndex) {
      const cal = this.hcalFullCalendar;
      const g = this.monthsRowGlobalIndex(localIndex);
      const day = cal[g];
      if (!day) {
        return false;
      }
      const nextName = g + 1 < cal.length ? cal[g + 1]?.monthName : null;
      return nextName !== day.monthName;
    },
    shouldSuppressStickyHeaderClickAfterScroll() {
      return this.isMobileDevice && Date.now() < this.suppressCategoriesFilterClickUntilMs;
    },
    onCategoriesFilterActivatorClick(e, activatorProps) {
      activatorProps?.onClick?.(e);
      this.onCategoriesFilterClick(e);
    },
    onCategoriesFilterClick(e) {
      if (this.shouldSuppressStickyHeaderClickAfterScroll()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      this.$emit("show-categories-popup");
    },
    onCompactModeClick(e) {
      if (this.shouldSuppressStickyHeaderClickAfterScroll()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      this.$emit("toggle-compact-mode", !this.compactMode);
    },
  },
};
</script>

<style lang="scss" module>
.sticky-cell {
  position: sticky;
  left: 0px;
  z-index: 4;
}

.daysWrapper {
  position: relative;
}

.monthLabelClip {
  position: absolute;
  top: 0;
  height: 25px;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.monthLabelTrack {
  position: absolute;
  top: 0;
  height: 25px;
  box-sizing: border-box;
}

.monthLabelText {
  white-space: nowrap;
  background-color: $white;
}

.badge {
  :global(.v-badge__wrapper) span {
    inset: auto auto calc(100% - 5px) calc(100% - 6px) !important;
    min-width: 8px !important;
    height: 8px !important;
    padding: 4px !important;
  }
}
</style>
