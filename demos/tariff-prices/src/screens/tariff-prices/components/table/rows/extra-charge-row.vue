<template>
  <div>
    <div
      :class="['d-flex align-center justify-space-between bordered-b bordered-r bordered-l rounded-0 tariff-demo-table-name-cell', {
        'pa-ingroup pl-groups': !compactMode,
        'pa-typo': compactMode,
      }]"
      :style="[$options.nameStyles, { maxWidth: `${$options.roomtypeNameCellWidth}px`, height: `${rowHeight}px`, boxSizing: 'border-box' }]"
    >
      <span :class="['nowrap', {'ml-inner': !compactMode}]">{{ extraChargeName }}</span>
      <span :style="{color: $vuetify.theme.current.colors.secondary}">
        {{ bedTypeString }}
      </span>
    </div>
    <div :style="daysWrapperStyle">
      <div :style="hcalDaysRowFlexStyle">
        <div :style="hcalLeadingSpacerStyle" aria-hidden="true"/>
        <div :style="visibleDaysStyle">
          <div
            v-for="item in priceCellsForVisibleDays"
            :key="item.day.date"
          >
            <tariff-table-price-cell
              :cell-vm="item.cellVm"
            />
          </div>
        </div>
        <div :style="hcalTrailingSpacerStyle" aria-hidden="true"/>
      </div>
    </div>
  </div>
</template>

<script>
import { getExtraChargeName, bedTypesShort, bedTypes } from "../../../config/screen-config.js";
import { roomtypeNameCellWidth, cellWidth, cellHeight, nameCellStyles,
  rowWindowCacheLimit } from "../config/table-grid-metrics.js";
import tariffHorizontalCalendarSlice from "../mixins/tariff-horizontal-calendar-slice.js";
import TariffTablePriceCell from "../cells/tariff-table-price-cell.vue";

export default {
  name: "TariffPricesTableRoomtypeRow",
  components: { TariffTablePriceCell },
  mixins: [tariffHorizontalCalendarSlice],
  inject: {
    getPriceCellVm: { default: null },
    getPriceRowVmEpoch: { default: null },
    tariffTableCellShared: { default: null },
  },
  props: {
    roomtype: {
      type: Object,
      required: true,
    },
    childrenAgeId: {
      type: String,
      required: true,
    },
    bedTypeId: {
      type: String,
      required: true,
    },
    calendar: {
      type: Array,
      default: null,
    },
    compactMode: {
      type: Boolean,
      default: false,
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
  data() {
    return {
      rowWindowPriceCellsCache: new Map(),
      rowDayPriceCellsCache: new Map(),
    };
  },
  computed: {
    childrenAgeInfo() {
      const ages = this.tariffTableCellShared?.pricesCalendarModel?.hotelChildrenAges;
      return ages?.[this.childrenAgeId] || {};
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
    bedTypeString() {
      return (this.compactMode ? bedTypesShort : bedTypes)[this.bedTypeId] || "";
    },
    extraChargeName() {
      return getExtraChargeName(
        this.childrenAgeId,
        this.childrenAgeInfo?.minAge,
        this.childrenAgeInfo?.maxAge,
        this.compactMode,
      );
    },
    priceCellsForVisibleDays() {
      const vmEpoch = typeof this.getPriceRowVmEpoch === "function"
        ? this.getPriceRowVmEpoch({
          roomtype: this.roomtype,
          childrenAgeId: this.childrenAgeId,
          bedTypeId: this.bedTypeId,
        })
        : "";
      const cacheKey = this.getRowWindowCacheKey(vmEpoch);
      const cached = cacheKey ? this.rowWindowPriceCellsCache.get(cacheKey) : null;
      if (cached) {
        return cached;
      }
      const fn = this.getPriceCellVm;
      if (typeof fn !== "function") {
        return [];
      }
      const rows = this.hcalDisplayCalendar.map((day) => {
        const dayKey = day?.date || "";
        const cachedDay = dayKey ? this.rowDayPriceCellsCache.get(dayKey) : null;
        if (cachedDay && cachedDay.epoch === vmEpoch) {
          return {
            day,
            cellVm: cachedDay.cellVm,
          };
        }
        const cellVm = fn({
          roomtype: this.roomtype,
          day,
          isMain: false,
          childrenAgeId: this.childrenAgeId,
          bedTypeId: this.bedTypeId,
        });
        if (dayKey) {
          if (this.rowDayPriceCellsCache.size >= rowWindowCacheLimit) {
            const oldestDayKey = this.rowDayPriceCellsCache.keys().next().value;
            if (oldestDayKey !== undefined) {
              this.rowDayPriceCellsCache.delete(oldestDayKey);
            }
          }
          this.rowDayPriceCellsCache.set(dayKey, {
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
        if (this.rowWindowPriceCellsCache.size >= rowWindowCacheLimit) {
          const oldestKey = this.rowWindowPriceCellsCache.keys().next().value;
          if (oldestKey !== undefined) {
            this.rowWindowPriceCellsCache.delete(oldestKey);
          }
        }
        this.rowWindowPriceCellsCache.set(cacheKey, rows);
      }
      return rows;
    },
  },
  methods: {
    getRowWindowCacheKey(vmEpoch = "") {
      if (!this.roomtype?.id || !this.childrenAgeId || !this.bedTypeId) {
        return "";
      }
      const epoch = vmEpoch || (typeof this.getPriceRowVmEpoch === "function"
        ? this.getPriceRowVmEpoch({
          roomtype: this.roomtype,
          childrenAgeId: this.childrenAgeId,
          bedTypeId: this.bedTypeId,
        })
        : "");
      return [
        this.roomtype.id,
        this.childrenAgeId,
        this.bedTypeId,
        this.hcalWindowKey,
        epoch,
      ].join("|");
    },
  },
};
</script>
