<template>
  <div>
    <div
      class="nowrap pa-ingroup pl-groups d-flex align-center justify-space-between bordered-b bordered-r bordered-l rounded-0 tariff-demo-table-name-cell"
      :style="[$options.nameStyles, {
        maxWidth: `${$options.roomtypeNameCellWidth}px`,
        height: `${rowHeight}px`,
        boxSizing: 'border-box',
      }]"
    >
      <span class="text-truncate">
        {{ $t("Ограничения") }}
      </span>
      <compact-restriction-row-hint/>
    </div>
    <div :style="daysWrapperStyle">
      <div :style="hcalDaysRowFlexStyle">
        <div :style="hcalLeadingSpacerStyle" aria-hidden="true"/>
        <div :style="visibleDaysStyle">
          <tariff-table-compact-restriction-cell
            v-for="item in compactRestrictionCellsForVisibleDays"
            :key="item.day.date"
            :stay-cell-vms="item.stayCellVms"
            :close-cell-vms="item.closeCellVms"
            :boolean-sheet-cell-key="booleanSheetCellKey"
            :row-height="rowHeight"
          />
        </div>
        <div :style="hcalTrailingSpacerStyle" aria-hidden="true"/>
      </div>
    </div>
  </div>
</template>

<script>
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { roomtypeNameCellWidth,
  cellWidth,
  nameCellStyles,
  compactRestrictionCellHeight,
  rowWindowCacheLimit } from "../config/table-grid-metrics.js";
import tariffHorizontalCalendarSlice from "../mixins/tariff-horizontal-calendar-slice.js";
import CompactRestrictionRowHint from "../restriction-row-hints/compact-restriction-row-hint.vue";
import TariffTableCompactRestrictionCell from "../cells/tariff-table-compact-restriction-cell.vue";

export default {
  name: "TariffPricesCompactRestrictionRow",
  components: {
    CompactRestrictionRowHint,
    TariffTableCompactRestrictionCell,
  },
  mixins: [tariffHorizontalCalendarSlice],
  inject: {
    getRestrictionCellVm: { default: null },
    getRestrictionRowVmEpoch: { default: null },
  },
  props: {
    roomtype: {
      type: Object,
      required: true,
    },
    calendar: {
      type: Array,
      default: null,
    },
    selectedRestrictions: {
      type: Array,
      default: () => [],
    },
    booleanSheetCellKey: {
      type: String,
      default: "",
    },
    rowHeight: {
      type: Number,
      default: compactRestrictionCellHeight,
    },
  },
  roomtypeNameCellWidth,
  cellWidth,
  cellHeight: compactRestrictionCellHeight,
  nameStyles: nameCellStyles,
  stayRestrictionTypes: Object.freeze([
    PriceAndRestrictionsService.restrictionTypeEnum.minstay,
    PriceAndRestrictionsService.restrictionTypeEnum.minstayA,
    PriceAndRestrictionsService.restrictionTypeEnum.maxstay,
  ]),
  closeRestrictionTypes: Object.freeze([
    PriceAndRestrictionsService.restrictionTypeEnum.closedArrival,
    PriceAndRestrictionsService.restrictionTypeEnum.closedDeparture,
  ]),
  data() {
    return {
      rowWindowCompactRestrictionCellsCache: new Map(),
      rowDayCompactRestrictionCellsCache: new Map(),
    };
  },
  computed: {
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
    shouldShowStayGroup() {
      if (!this.selectedRestrictions.length) {
        return true;
      }
      return this.$options.stayRestrictionTypes.some(type => this.selectedRestrictions.includes(type));
    },
    shouldShowCloseGroup() {
      if (!this.selectedRestrictions.length) {
        return true;
      }
      return this.$options.closeRestrictionTypes.some(type => this.selectedRestrictions.includes(type));
    },
    visibleStayRestrictionTypes() {
      return this.shouldShowStayGroup ? this.$options.stayRestrictionTypes : [];
    },
    visibleCloseRestrictionTypes() {
      return this.shouldShowCloseGroup ? this.$options.closeRestrictionTypes : [];
    },
    restrictionRowVmEpoch() {
      const selectedTypes = [
        ...this.visibleStayRestrictionTypes,
        ...this.visibleCloseRestrictionTypes,
      ];
      if (typeof this.getRestrictionRowVmEpoch !== "function") {
        return "";
      }
      return this.getRestrictionRowVmEpoch({
        roomtype: this.roomtype,
        selectedRestrictionTypes: selectedTypes,
      });
    },
    compactRestrictionCellsForVisibleDays() {
      const selectedTypes = [
        ...this.visibleStayRestrictionTypes,
        ...this.visibleCloseRestrictionTypes,
      ];
      const vmEpoch = this.restrictionRowVmEpoch;
      const cacheKey = this.getRowWindowCacheKey(vmEpoch, selectedTypes);
      const cached = cacheKey ? this.rowWindowCompactRestrictionCellsCache.get(cacheKey) : null;
      if (cached) {
        return cached;
      }
      const fn = this.getRestrictionCellVm;
      if (typeof fn !== "function") {
        return [];
      }

      const rows = this.hcalDisplayCalendar.map((day) => {
        const dayKey = day?.date || "";
        const cachedDay = dayKey ? this.rowDayCompactRestrictionCellsCache.get(dayKey) : null;
        if (cachedDay && cachedDay.epoch === vmEpoch) {
          return {
            day,
            stayCellVms: cachedDay.stayCellVms,
            closeCellVms: cachedDay.closeCellVms,
          };
        }
        const stayCellVms = this.visibleStayRestrictionTypes.map((restrictionType) => fn({
          roomtype: this.roomtype,
          day,
          restrictionType,
        }));
        const closeCellVms = this.visibleCloseRestrictionTypes.map((restrictionType) => fn({
          roomtype: this.roomtype,
          day,
          restrictionType,
        }));
        if (dayKey) {
          if (this.rowDayCompactRestrictionCellsCache.size >= rowWindowCacheLimit) {
            const oldestDayKey = this.rowDayCompactRestrictionCellsCache.keys().next().value;
            if (oldestDayKey !== undefined) {
              this.rowDayCompactRestrictionCellsCache.delete(oldestDayKey);
            }
          }
          this.rowDayCompactRestrictionCellsCache.set(dayKey, {
            stayCellVms,
            closeCellVms,
            epoch: vmEpoch,
          });
        }
        return {
          day,
          stayCellVms,
          closeCellVms,
        };
      });
      if (cacheKey) {
        if (this.rowWindowCompactRestrictionCellsCache.size >= rowWindowCacheLimit) {
          const oldestKey = this.rowWindowCompactRestrictionCellsCache.keys().next().value;
          if (oldestKey !== undefined) {
            this.rowWindowCompactRestrictionCellsCache.delete(oldestKey);
          }
        }
        this.rowWindowCompactRestrictionCellsCache.set(cacheKey, rows);
      }
      return rows;
    },
  },
  watch: {
    restrictionRowVmEpoch() {
      this.rowWindowCompactRestrictionCellsCache.clear();
      this.rowDayCompactRestrictionCellsCache.clear();
    },
  },
  methods: {
    getRowWindowCacheKey(vmEpoch = "", selectedTypesInput = null) {
      if (!this.roomtype?.id) {
        return "";
      }
      const selectedTypes = selectedTypesInput || [
        ...this.visibleStayRestrictionTypes,
        ...this.visibleCloseRestrictionTypes,
      ];
      const epoch = vmEpoch || this.restrictionRowVmEpoch;
      return [
        this.roomtype.id,
        "compact",
        selectedTypes.join(","),
        this.hcalWindowKey,
        epoch,
      ].join("|");
    },
  },
};
</script>
