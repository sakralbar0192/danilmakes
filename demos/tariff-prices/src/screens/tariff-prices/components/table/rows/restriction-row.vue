<template>
  <div>
    <div
      class="nowrap pa-ingroup pl-groups d-flex align-center justify-space-between bordered-b bordered-r bordered-l rounded-0"
      :style="[$options.nameStyles, { maxWidth: `${$options.roomtypeNameCellWidth}px`, height: `${rowHeight}px`, boxSizing: 'border-box' }]"
    >
      <span class="text-truncate">
        {{ $options.restrictionTypes[restrictionType].table }}
      </span>
      <restriction-row-hint :restriction-type="restrictionType"/>
    </div>
    <div :style="daysWrapperStyle">
      <div :style="hcalDaysRowFlexStyle">
        <div :style="hcalLeadingSpacerStyle" aria-hidden="true"/>
        <div :style="visibleDaysStyle">
          <div
            v-for="(item, localIndex) in restrictionCellsForVisibleDays"
            ref="restrictionCells"
            :key="item.day.date"
          >
            <tariff-table-restriction-cell
              :cell-vm="item.cellVm"
              :boolean-sheet-cell-key="booleanSheetCellKey"
              @mousedown="handleCellMouseDown($event, item.day, localIndex)"
              @mouseenter="handleCellEnter($event, item.day, localIndex)"
            />
          </div>
        </div>
        <div :style="hcalTrailingSpacerStyle" aria-hidden="true"/>
      </div>
    </div>
  </div>
</template>

<script>
import { restrictionTypes } from "../../../config/screen-config.js";
import { roomtypeNameCellWidth, cellWidth, cellHeight, nameCellStyles,
  rowWindowCacheLimit } from "../config/table-grid-metrics.js";
import tariffHorizontalCalendarSlice from "../mixins/tariff-horizontal-calendar-slice.js";
import TariffTableRestrictionCell from "../cells/tariff-table-restriction-cell.vue";
import RestrictionRowHint from "../restriction-row-hints/restriction-row-hint.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsTableRestrictionRow",
  components: {
    TariffTableRestrictionCell,
    RestrictionRowHint,
  },
  mixins: [tariffHorizontalCalendarSlice],
  inject: {
    getRestrictionCellVm: { default: null },
    getRestrictionRowVmEpoch: { default: null },
  },
  props: {
    restrictionCellVmResolver: {
      type: Function,
      default: null,
    },
    restrictionRowVmEpochResolver: {
      type: Function,
      default: null,
    },
    roomtype: {
      type: Object,
      required: true,
    },
    restrictionType: {
      type: String,
      required: true,
    },
    calendar: {
      type: Array,
      default: null,
    },
    booleanSheetCellKey: {
      type: String,
      default: "",
    },
    rowHeight: {
      type: Number,
      default: cellHeight,
    },
  },
  roomtypeNameCellWidth,
  cellWidth,
  cellHeight,
  nameStyles: nameCellStyles,
  restrictionTypes,
  data() {
    return {
      rowWindowRestrictionCellsCache: new Map(),
      rowDayRestrictionCellsCache: new Map(),
    };
  },
  computed: {
    resolveGetRestrictionCellVm() {
      return this.restrictionCellVmResolver || this.getRestrictionCellVm;
    },
    resolveGetRestrictionRowVmEpoch() {
      return this.restrictionRowVmEpochResolver || this.getRestrictionRowVmEpoch;
    },
    restrictionRowVmEpoch() {
      const fn = this.resolveGetRestrictionRowVmEpoch;
      if (typeof fn !== "function") {
        return "";
      }
      return fn({
        roomtype: this.roomtype,
        restrictionType: this.restrictionType,
      });
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
        width: `${count * cw}px`,
      };
    },
    restrictionCellsForVisibleDays() {
      const vmEpoch = this.restrictionRowVmEpoch;
      const cacheKey = this.getRowWindowCacheKey(vmEpoch);
      const cached = cacheKey ? this.rowWindowRestrictionCellsCache.get(cacheKey) : null;
      if (cached) {
        return cached;
      }
      const fn = this.resolveGetRestrictionCellVm;
      if (typeof fn !== "function") {
        return [];
      }
      const rows = this.hcalDisplayCalendar.map((day) => {
        const dayKey = day?.date || "";
        const cachedDay = dayKey ? this.rowDayRestrictionCellsCache.get(dayKey) : null;
        if (cachedDay && cachedDay.epoch === vmEpoch) {
          return {
            day,
            cellVm: cachedDay.cellVm,
          };
        }
        const cellVm = fn({
          roomtype: this.roomtype,
          day,
          restrictionType: this.restrictionType,
        });
        if (dayKey) {
          if (this.rowDayRestrictionCellsCache.size >= rowWindowCacheLimit) {
            const oldestDayKey = this.rowDayRestrictionCellsCache.keys().next().value;
            if (oldestDayKey !== undefined) {
              this.rowDayRestrictionCellsCache.delete(oldestDayKey);
            }
          }
          this.rowDayRestrictionCellsCache.set(dayKey, {
            cellVm,
            epoch: vmEpoch,
          });
        }
        return {
          day,
          cellVm,
        };
      });
      if (cacheKey) {
        if (this.rowWindowRestrictionCellsCache.size >= rowWindowCacheLimit) {
          const oldestKey = this.rowWindowRestrictionCellsCache.keys().next().value;
          if (oldestKey !== undefined) {
            this.rowWindowRestrictionCellsCache.delete(oldestKey);
          }
        }
        this.rowWindowRestrictionCellsCache.set(cacheKey, rows);
      }
      return rows;
    },
  },
  watch: {
    restrictionRowVmEpoch() {
      this.rowWindowRestrictionCellsCache.clear();
      this.rowDayRestrictionCellsCache.clear();
    },
  },
  methods: {
    getRowWindowCacheKey(vmEpoch = "") {
      if (!this.roomtype?.id || !this.restrictionType) {
        return "";
      }
      const epoch = vmEpoch || this.restrictionRowVmEpoch;
      return [
        this.roomtype.id,
        this.restrictionType,
        this.hcalWindowKey,
        epoch,
      ].join("|");
    },
    handleCellMouseDown(event, day, localIndex) {
      this.$emit("cell-mouse-down", {
        event,
        day,
        cellIndex: this.hcalStartIndex + localIndex,
        rect: this.$el.getBoundingClientRect(),
      });
    },
    handleCellEnter(event, day, localIndex) {
      this.$emit("cell-mouse-enter", {
        event,
        day,
        cellIndex: this.hcalStartIndex + localIndex,
      });
    },
  },
};
</script>
