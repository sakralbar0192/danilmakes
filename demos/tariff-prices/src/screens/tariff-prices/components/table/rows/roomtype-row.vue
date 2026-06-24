<template>
  <div style="position: relative;" data-test="tariff-table-roomtype-block" :style="{ height: `${rowHeight}px` }">
    <div
      :class="['d-flex bordered-b bordered-r bordered-l rounded-0 flex-column', vmCss['main-cell'], {
        'pa-ingroup pl-groups': !compactMode && !compactRestrictions,
        'pa-typo': compactMode,
        'pl-groups pa-semi-inner': compactRestrictions,
      }]"
      :style="[$options.nameStyles, { maxWidth: `${$options.roomtypeNameCellWidth}px`, height: `${rowHeight}px` }]"
    >
      <div
        ref="nameRowCard"
        class="font-weight-bold d-flex align-center"
        style="height: 32px; box-sizing: border-box; padding-right: 5px"
      >
        <b-tooltip-arrowed v-if="(textOverflowed || isBusinessRuleCategory) && !isMobileDevice" right max-width="300">
          <template #activator="{ on, attrs }">
            <span
              ref="text"
              v-bind="attrs"
              :class="[vmCss['line-clamp'], { [vmCss['bp-roomtype-name']]: isBusinessRuleCategory }]"
              v-on="on"
            >
              {{ roomtypeNameWithBpPrefix }}
            </span>
          </template>
          <div>
            <span v-if="isBusinessRuleCategory">{{ $t("Категория") }}&nbsp;</span>
            <template v-if="textOverflowed">
              {{ roomtype.name }}&nbsp;
            </template>
            <span v-if="isBusinessRuleCategory">{{ $t("участвует в Бизнес-правилах") }}</span>
          </div>
        </b-tooltip-arrowed>
        <span
          v-else
          ref="text"
          :class="[vmCss['line-clamp'], { [vmCss['bp-roomtype-name']]: isBusinessRuleCategory }]"
        >
          {{ roomtypeNameWithBpPrefix }}
        </span>
      </div>
      <div
        v-if="!compactRestrictions"
        class="text-truncate"
        style="height: 20px; box-sizing: border-box;"
      >
        {{ $t('Свободные номера') }}
      </div>
      <div
        class="d-flex justify-space-between align-center"
        style="height: 23px; box-sizing: border-box;"
      >
        <people-count
          :adults="roomtype.adults"
          :children="roomtype.children || 0"
          :without-beds-children="withoutBedsChildren"
          :class="[{'ml-inner': !compactMode}]"
        />
        <subroom-people-tooltip :subroom="roomtype" :without-beds-children="withoutBedsChildren"/>
      </div>
    </div>
    <div :style="daysWrapperStyle">
      <div :style="hcalDaysRowFlexStyle">
        <div :style="hcalLeadingSpacerStyle" aria-hidden="true"/>
        <div :style="visibleDaysStyle">
          <div
            v-for="item in priceCellsForVisibleDays"
            :key="item.day.date"
            :class="vmCss['main-cell']"
            :style="{ gridRow: 'span 3', display: 'flex', flexDirection: 'column' }"
          >
            <div
              :style="[closedStatusCellBoxStyle, closedStatusCursorStyle]"
              :class="['bordered-b rounded-0', {
                [vmCss['status-cell']]: !Number(currentTariff?.dependent_restrictions?.[$options.closedRestrictionName]),
              }]"
              data-test="tariff-closed-status-cell"
              :data-id="closedSaleRestrictionRoomtypeId"
              :data-date="item.day.date"
              :data-closed="item.dayMeta?.isSaleClosed ? 1 : 0"
              :data-action="$options.closedStatusDataAttrName"
              data-cell-root
            />
            <div
              :style="{ height: compactRestrictions ? '16px' : '20px', width: `${$options.cellWidth}px`, boxSizing: 'border-box' }"
              :class="['bordered-b bordered-r rounded-0 d-flex align-center justify-center', {
                [vmCss['non-availability']]: !item.dayMeta?.isDataPending && Number(item.dayMeta?.availability) <= 0,
                [vmCss['closed-sale-cell']]: !item.dayMeta?.isDataPending && item.dayMeta?.isSaleClosed
                  && Number(item.dayMeta?.availability) > 0,
              }]"
            >
              <availability-cell
                :cell-vm="item.dayMeta"
                :cell-height="compactRestrictions ? 16 : 20"
              />
            </div>
            <tariff-table-price-cell
              :cell-vm="item.cellVm"
            />
          </div>
        </div>
        <div :style="hcalTrailingSpacerStyle" aria-hidden="true"/>
      </div>
    </div>
    <sale-availability-status-badge
      v-for="sequence of visibleClosedSaleSequences"
      :key="sequence.id"
      :style="sequencesStyleMap[sequence.id]"
      :opened="!sequence.closed"
    />
  </div>
</template>

<script>
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { buildClosedSaleSequencesForViewport } from "../lib/scroll/build-closed-sale-sequences-for-viewport.js";
import { buildRoomtypeClosedStatusCursorStyle } from "../logic/surface/roomtype-closed-status-cursor-css.js";
import { roomtypeNameCellWidth, roomtypeNameCellWidthCompact, cellWidth, cellHeight, nameCellStyles, closedStatusDataAttrName,
  compactCellHeight, rowWindowCacheLimit } from "../config/table-grid-metrics.js";
import TariffTablePriceCell from "../cells/tariff-table-price-cell.vue";
import AvailabilityCell from "../cells/availability-cell.vue";
import PeopleCount from "../shared/people-count.vue";
import SaleAvailabilityStatusBadge from "../../widgets/sale-availability-status-badge.vue";
import SubroomPeopleTooltip from "../shared/subroom-people-tooltip.vue";
import tariffHorizontalCalendarSlice from "../mixins/tariff-horizontal-calendar-slice.js";
import tariffVirtualizedCssModule from "../mixins/tariff-virtualized-css-module.js";
import { getClosedSaleRestrictionRoomtypeId } from "../lib/closed-sale-roomtype-id.js";
import { resolveIsBusinessRuleCategory } from "../logic/resolve-is-business-rule-category.js";

const SALE_STATUS_BADGE_HORIZONTAL_PADDING = 8;
const SALE_STATUS_BADGE_HOVER_LEFT = 10;
const SALE_STATUS_BADGE_HOVER_WIDTH = 68;
const SALE_STATUS_ROW_HEIGHT = 20;
const SALE_STATUS_ROW_HEIGHT_COMPACT = 16;
const CLOSED_STATUS_CELL_HEIGHT = 40;
const CLOSED_STATUS_CELL_HEIGHT_COMPACT = 24;

export default {
  name: "BnovoTariffPricesAndRestrictionsTableRoomtypeRow",
  components: {
    TariffTablePriceCell,
    AvailabilityCell,
    PeopleCount,
    SaleAvailabilityStatusBadge,
    SubroomPeopleTooltip,
  },
  mixins: [tariffHorizontalCalendarSlice, tariffVirtualizedCssModule],
  inject: {
    getPriceCellVm: { default: null },
    getPriceRowVmEpoch: { default: null },
    tariffTableCellShared: { default: null },
  },
  roomtypeNameCellWidth,
  cellWidth,
  nameStyles: nameCellStyles,
  closedStatusDataAttrName,
  closedRestrictionName: PriceAndRestrictionsService.closedRestrictionName,
  props: {
    roomtype: {
      type: Object,
      required: true,
    },
    withoutBedsChildren: {
      type: Array,
      default: () => [],
    },
    calendar: {
      type: Array,
      default: null,
    },
    compactMode: {
      type: Boolean,
      default: false,
    },
    compactRestrictions: {
      type: Boolean,
      default: false,
    },
    /** RMS: режим «базовые цены для бизнес-правил» (не слой продаж). */
    isRmsBasePriceModeActive: {
      type: Boolean,
      default: false,
    },
    getRoomtypeDayMeta: {
      type: Function,
      required: true,
    },
    getRoomtypeClosedState: {
      type: Function,
      required: true,
    },
    rowHeight: {
      type: Number,
      default: cellHeight,
    },
  },
  data() {
    return {
      textOverflowed: false,
      rowWindowPriceCellsCache: new Map(),
      rowDayPriceCellsCache: new Map(),
    };
  },
  computed: {
    pricesCalendarModel() {
      return this.tariffTableCellShared?.pricesCalendarModel ?? null;
    },
    currentTariff() {
      return this.tariffTableCellShared?.currentTariff ?? null;
    },
    pricesCalendarModelUpdatedAt() {
      return this.tariffTableCellShared?.pricesCalendarModelUpdatedAt ?? "";
    },
    isBusinessRuleCategory() {
      return resolveIsBusinessRuleCategory({
        planId: this.currentTariff?.id,
        roomtypeId: this.roomtype?.id,
        pricesCalendarModel: this.pricesCalendarModel,
        modelUpdatedAt: this.pricesCalendarModelUpdatedAt,
        isRmsPricingEnabled: Boolean(this.tariffTableCellShared?.isRmsPricingEnabled),
      });
    },
    roomtypeNameWithBpPrefix() {
      return this.isBusinessRuleCategory ? `*${this.roomtype.name}` : this.roomtype.name;
    },
    closedSaleRestrictionRoomtypeId() {
      return getClosedSaleRestrictionRoomtypeId(this.roomtype);
    },
    saleStatusMetrics() {
      const closedStatusCellHeight = this.compactRestrictions
        ? CLOSED_STATUS_CELL_HEIGHT_COMPACT
        : CLOSED_STATUS_CELL_HEIGHT;
      const badgeHeight = this.compactRestrictions
        ? SALE_STATUS_ROW_HEIGHT_COMPACT
        : SALE_STATUS_ROW_HEIGHT;

      return {
        closedStatusCellHeight,
        badgeHeight,
        badgeTop: (closedStatusCellHeight - badgeHeight) / 2,
        hoverLeft: SALE_STATUS_BADGE_HOVER_LEFT,
        hoverWidth: SALE_STATUS_BADGE_HOVER_WIDTH,
        horizontalPadding: SALE_STATUS_BADGE_HORIZONTAL_PADDING,
      };
    },
    closedStatusCellBoxStyle() {
      const {
        closedStatusCellHeight,
        badgeTop,
        badgeHeight,
        hoverLeft,
        hoverWidth,
      } = this.saleStatusMetrics;
      return {
        height: `${closedStatusCellHeight}px`,
        width: `${this.$options.cellWidth}px`,
        boxSizing: "border-box",
        "--status-cell-hover-top": `${badgeTop}px`,
        "--status-cell-hover-left": `${hoverLeft}px`,
        "--status-cell-hover-width": `${hoverWidth}px`,
        "--status-cell-hover-height": `${badgeHeight}px`,
      };
    },
    closedStatusCursorStyle() {
      return buildRoomtypeClosedStatusCursorStyle(
        this.currentTariff?.dependent_restrictions?.[this.$options.closedRestrictionName],
        `url(${this.$localImage("pointer.png")}) , pointer`,
        `url(${this.$localImage("not-allowed-pointer.png")}) , not-allowed`,
      );
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
        gridTemplateRows: [
          `${this.saleStatusMetrics.closedStatusCellHeight}px`,
          `${this.saleStatusMetrics.badgeHeight}px`,
          `${this.compactRestrictions ? compactCellHeight : cellHeight}px`,
        ].join(" "),
        gridAutoFlow: "column",
        width: `${count * cw}px`,
      };
    },
    /** Один проход по окну дней: метаданные дня + VM цены (раньше были отдельно dayMetaMap и priceCellsForVisibleDays). */
    priceCellsForVisibleDays() {
      const vmEpoch = typeof this.getPriceRowVmEpoch === "function"
        ? this.getPriceRowVmEpoch({ roomtype: this.roomtype })
        : "";
      const cacheKey = this.getRowWindowCacheKey(vmEpoch);
      const cached = cacheKey ? this.rowWindowPriceCellsCache.get(cacheKey) : null;
      if (cached) {
        return cached;
      }
      const fn = this.getPriceCellVm;
      const getMeta = this.getRoomtypeDayMeta;
      if (typeof fn !== "function" || typeof getMeta !== "function") {
        return [];
      }
      const rows = this.hcalDisplayCalendar.map((day) => {
        const dayKey = day?.date || "";
        const cachedDay = dayKey ? this.rowDayPriceCellsCache.get(dayKey) : null;
        if (cachedDay && cachedDay.epoch === vmEpoch) {
          return {
            day,
            dayMeta: cachedDay.dayMeta,
            cellVm: cachedDay.cellVm,
          };
        }
        const dayMeta = getMeta({
          roomtype: this.roomtype,
          day,
        });
        const cellVm = fn({
          roomtype: this.roomtype,
          day,
          isMain: true,
        });
        if (dayKey) {
          if (this.rowDayPriceCellsCache.size >= rowWindowCacheLimit) {
            const oldestDayKey = this.rowDayPriceCellsCache.keys().next().value;
            if (oldestDayKey !== undefined) {
              this.rowDayPriceCellsCache.delete(oldestDayKey);
            }
          }
          this.rowDayPriceCellsCache.set(dayKey, {
            dayMeta,
            cellVm,
            epoch: vmEpoch,
          });
        }
        return {
          day,
          dayMeta,
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
    /**
     * Бейджи закрытия продаж только для пробегов, пересекающих горизонтальное окно (без полного scan календаря).
     */
    visibleClosedSaleSequences() {
      const cal = this.hcalFullCalendar;
      if (!cal?.length) {
        return [];
      }
      const ownerId = this.closedSaleRestrictionRoomtypeId;
      const getClosed = (idx) => !!this.getRoomtypeClosedState(ownerId, cal[idx].date);
      const w = this.hcalWindow;
      const fullCalendar = !w || w.endIndex <= w.startIndex;
      return buildClosedSaleSequencesForViewport({
        calendar: cal,
        getClosed,
        winStart: fullCalendar ? 0 : w.startIndex,
        winEnd: fullCalendar ? cal.length : w.endIndex,
        fullCalendar,
      });
    },
    /**
     * Положение бейджей только для видимых в окне последовательностей.
     */
    sequencesStyleMap() {
      const result = {};
      const nameW = this.compactMode ? roomtypeNameCellWidthCompact : roomtypeNameCellWidth;
      const cw = this.$options.cellWidth;
      const {
        horizontalPadding,
        badgeHeight,
        badgeTop,
      } = this.saleStatusMetrics;
      for (const sequence of this.visibleClosedSaleSequences) {
        const left = nameW + (sequence.startIndex * cw);
        const width = ((sequence.endIndex + 1) - sequence.startIndex) * cw;
        result[sequence.id] = {
          position: "absolute",
          left: `${left + horizontalPadding}px`,
          width: `${width - horizontalPadding * 2}px`,
          height: `${badgeHeight}px`,
          top: `${badgeTop}px`,
          "pointer-events": "none",
        };
      }
      return result;
    },
    cellHeight() {
      return `${this.compactRestrictions ? compactCellHeight : cellHeight}px`;
    },
  },
  watch: {
    "roomtype.name": {
      handler() {
        this.$nextTick(this.checkOverflow);
      },
    },
    compactMode() {
      this.$nextTick(this.checkOverflow);
    },
    compactRestrictions() {
      this.$nextTick(this.checkOverflow);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.checkOverflow();
    });
  },
  methods: {
    getRowWindowCacheKey(vmEpoch = "") {
      if (!this.roomtype?.id) {
        return "";
      }
      const epoch = vmEpoch || (typeof this.getPriceRowVmEpoch === "function"
        ? this.getPriceRowVmEpoch({ roomtype: this.roomtype })
        : "");
      return [
        this.roomtype.id,
        this.hcalWindowKey,
        epoch,
      ].join("|");
    },
    checkOverflow() {
      const el = this.$refs.text;
      if (!el) return;
      const next = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
      if (this.textOverflowed === next) {
        return;
      }
      this.textOverflowed = next;
    },
  },
};
</script>

<style lang="scss" module>
@import '../../../styles/variables.scss';
@import '../styles/cells/tariff-surfaces';

.main-cell {
  @include tariff-roomtype-main-column-bg;

  >div:not(:global(.bnovo-tariff-prices-and-restrictions-table-price-cell)) {
    background-color: inherit;
  }

  >div.closed-sale-cell {
    @include tariff-closed-sale-surface;

    &.status-cell {
      &:hover {
        background-color: inherit !important;
        border-color: $main-cell-bg-color !important;
      }
    }
  }

  >div.non-availability {
    background-color: #FF9E94 !important;
  }
}

.status-cell {
  position: relative;

  &:hover {
    &::after {
      content: '';
      position: absolute;
      top: var(--status-cell-hover-top, 12px);
      left: var(--status-cell-hover-left, 10px);
      z-index: 10;
      width: var(--status-cell-hover-width, 68px);
      height: var(--status-cell-hover-height, 16px);
      border-radius: $border-radius-vertical-tabs;
      opacity: 0.24;
    }
  }

  &[data-closed="1"] {
    &:hover::after {
      background-color: #FF4433;
    }
  }

  &[data-closed="0"] {
    &:hover::after {
      background-color: $success;
    }
  }
}

.line-clamp {
  -webkit-line-clamp: 2;
  display: -webkit-box !important;
  -webkit-box-orient: vertical;
  white-space: initial;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  overflow: hidden;
}

.bp-roomtype-name {
  color: #2fac44;
  font-style: italic;
}
</style>
