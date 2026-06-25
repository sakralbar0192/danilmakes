<template>
  <div
    @click="handleTableClick"
    @focusin="handleTableFocusIn"
    @focusout="handleRootFocusOut"
    @input.capture="handleInput"
    @beforeinput.capture="handleTableBeforeInputCapture"
    @keydown.capture="handleTableKeydownCapture"
    @pointerdown.capture="handleTablePointerDownCapture"
    @mousedown.capture="handleTableMouseDownCapture"
    @mousemove="handleTableMouseMove"
  >
    <div
      v-if="pricesCalendarModel?.calendar?.length"
      class="tariff-demo-table-shell"
    >
      <div
        :class="[
          $style.tableScrollHost,
        { [$style['tableScrollHost--mobile-edit-elevated']]: isMobileTableElevatedOverSticky },
        { [$style.tableScrollHostWithHorizontalScrollbar]: horizontalScrollbarTrackVisible },
        { 'tariff-demo-mobile-edit-elevated-host': isMobileTableElevatedOverSticky },
      ]"
    >
      <div
        ref="tableStickyHeaderMeasure"
        :class="[$style.tableStickyHeader, 'tariff-demo-table-sticky-header']"
      >
        <div
          ref="tableHeaderHorizontalScrollRef"
          class="table-header-scroll-area"
          :class="$style.tableHeaderScrollArea"
        >
          <table-toolbar
            :style="{ width: calculatedWidth }"
            :mode="mode"
            :date-from="dateFrom"
            :calendar-loading="calendarLoading"
            :current-tariff="currentTariff"
            :enabled-combined-mode="enabledCombinedMode"
            :is-rms-pricing-enabled="isRmsPricingEnabled"
            :is-one-of-prices-modes-enabled="isOneOfPricesModesEnabled"
            :is-combined-mode-enabled="isCombinedModeEnabled"
            :is-restriction-mode-enabled="isRestrictionModeEnabled"
            :selected-restrictions="selectedRestrictions"
            :compact-restrictions="compactRestrictions"
            @change-selected-restrictions="setSelectedRestrictions"
            @change-compact-restrictions="applyCompactRestrictionsViewMode"
            @change-date="$emit('change-date', $event)"
            @change-mode="$emit('change-mode', $event)"
            @show-restrictions-popup="$emit('show-restrictions-popup')"
          />
          <months-row
            :style="{ ...gridStylesRow, width: calculatedWidth }"
            :compact-mode="compactMode"
            :selected-categories="selectedCategories"
            :suppress-categories-filter-click-until-ms="categoriesFilterSuppressClickUntilMs"
            :horizontal-scroll-left="horizontalScrollLeftForMonthLabels"
            :horizontal-scroll-client-width="horizontalScrollClientWidth"
            @toggle-compact-mode="setCompactMode"
            @show-categories-popup="$emit('show-categories-popup')"
          />
        </div>
      </div>
      <div
        ref="tableHorizontalScrollRef"
        class="table-scroll-area"
        :class="[
          $style.tableScrollArea,
          { [$style.tableScrollAreaWithHorizontalScrollbar]: horizontalScrollbarTrackVisible },
        ]"
      >
        <tariff-table-virtualized-grid
          ref="tariffTableVirtualizedGrid"
          :table-container-class="virtualizerTableClasses"
          :items="tableRows"
          :content-width="calculatedWidth"
          :buffer="$options.virtualizerBufferPx"
          :update-delay="$options.virtualizerUpdateDelayMs"
          :max-rendered-rows="virtualizerMaxRenderedRows"
          :min-item-size="minRowHeight"
          :scroll-position-skip-threshold-px="$options.virtualizerScrollSkipThresholdPx"
          :get-scroll-container="getPageScrollContainer"
          @scroll="handleScroll"
        >
          <template #default="{ item }">
            <roomtype-row
              v-if="item.type === $options.tableRowTypes.roomtype"
              :key="virtualRowComponentKey(item, $options.tableRowTypes.roomtype)"
              :style="virtualRowItemStyle(item)"
              :roomtype="item.roomtype"
              :compact-mode="compactMode"
              :is-rms-base-price-mode-active="isRmsBasePriceModeActive"
              :compact-restrictions="compactRestrictions"
              :row-height="item.height"
              :get-roomtype-day-meta="getRoomtypeDayMeta"
              :get-roomtype-closed-state="getRoomtypeClosedState"
              :without-beds-children="item.roomtype?.extra?.beds?.[$options.withoutPlaceTypeIndex]"
            />
            <subroom-row
              v-else-if="item.type === $options.tableRowTypes.subroom"
              :key="virtualRowComponentKey(item, $options.tableRowTypes.subroom)"
              :style="virtualRowItemStyle(item)"
              :compact-mode="compactMode"
              :subroom="item.subroom"
              :is-extra-charge="item.isExtraCharge"
              :without-beds-children="item.roomtype?.extra?.beds?.[$options.withoutPlaceTypeIndex]"
              :row-height="item.height"
            />
            <extra-charge-row
              v-else-if="item.type === $options.tableRowTypes.extraCharge"
              :key="virtualRowComponentKey(item, $options.tableRowTypes.extraCharge)"
              :style="virtualRowItemStyle(item)"
              :compact-mode="compactMode"
              :bed-type-id="item.bedTypeId"
              :children-age-id="item.childrenAgeId"
              :roomtype="item.roomtype"
              :row-height="item.height"
            />
            <restriction-row
              v-else-if="item.type === $options.tableRowTypes.restriction"
              :key="virtualRowComponentKey(item, $options.tableRowTypes.restriction)"
              :style="virtualRowItemStyle(item)"
              :restriction-type="item.restrictionType"
              :roomtype="item.roomtype"
              :row-height="item.height"
              :boolean-sheet-cell-key="booleanSheetCellKey"
              :restriction-cell-vm-resolver="getRestrictionCellVm"
              :restriction-row-vm-epoch-resolver="getRestrictionRowVmEpoch"
              @cell-mouse-down="handleStartRestrictionRowSelection({
                ...$event,
                roomTypeId: item.roomtype.id,
                rowIndex: item.index,
                restrictionType: item.restrictionType,
              })"
              @cell-mouse-enter="handleCellMouseEnterDuringSelection({
                ...$event,
                roomTypeId: item.roomtype.id,
                rowIndex: item.index,
                restrictionType: item.restrictionType,
              })"
            />
            <compact-restriction-row
              v-else-if="item.type === $options.tableRowTypes.compactRestriction"
              :key="virtualRowComponentKey(item, $options.tableRowTypes.compactRestriction)"
              :style="virtualRowItemStyle(item)"
              :roomtype="item.roomtype"
              :row-height="item.height"
              :selected-restrictions="selectedRestrictions"
              :boolean-sheet-cell-key="compactRestrictionBooleanSheetCellKey"
            />
          </template>
          <template #after>
            <div
              v-show="selectionActive"
              ref="selectionRangeOverlay"
              :class="[$style['selection-range'], 'selection-range']"
            >
              <restriction-row-selection-range
                :to-date="selectionRange.toDate"
                :from-date="selectionRange.fromDate"
              />
            </div>
          </template>
        </tariff-table-virtualized-grid>
      </div>
      <div
        v-show="horizontalScrollbarTrackVisible"
        :class="[$style.horizontalScrollbarStickyAnchor, 'tariff-prices-table-hscroll-track']"
      >
        <div
          ref="tableHorizontalScrollbarTrackRef"
          class="table-horizontal-scrollbar-track"
          :class="$style.horizontalScrollbarTrack"
          @scroll="onHorizontalScrollbarTrackScroll"
        >
          <div
            aria-hidden="true"
            :style="{ width: calculatedWidth, height: '1px' }"
          />
        </div>
      </div>
    </div>
    </div>
    <v-card v-else height="200">
      <b-screen-overlay :size="64" block :dark="false"/>
    </v-card>
    <tariff-table-overlays
      :price-cell-tooltip-controller="priceCellTooltipController"
      :show-other-tariffs-tooltip="showOtherPricesTooltip"
      :tooltip-anchor-cell-key="tooltipAnchorCellKey"
      :need-show-reset-approval-popup="needShowResetApprovalPopup"
      :reset-approval-info="resetApprovalInfo"
      :boolean-restriction-sheet="booleanRestrictionSheet"
      :compact-boolean-restriction-dropdown="compactBooleanRestrictionDropdown"
      :dependent-restriction-readonly-sheet="dependentRestrictionReadonlySheet"
      @approve-reset-price="approveResetPrice"
      @dismiss-reset-approval="dismissResetApproval"
      @close-boolean-sheet="closeBooleanRestrictionSheet"
      @apply-boolean-sheet="applyBooleanRestrictionFromSheet"
      @close-compact-boolean-dropdown="closeCompactBooleanRestrictionDropdown"
      @apply-compact-boolean-dropdown="applyCompactBooleanRestrictionDropdown"
      @close-dependent-restriction-readonly-sheet="closeDependentRestrictionReadonlySheet"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import TariffInterfaceSettingsService from "@/services/tariff/interface-settings";
import RoomtypeModel from "@/models/roomtype";
import CompactRestrictionRow from "./rows/compact-restriction-row.vue";
import { roomtypeNameCellWidth,
  roomtypeNameCellWidthCompact,
  roomtypeNameCellHeight,
  cellWidth,
  cellHeight,
  compactCellHeight,
  roomtypeCompactNameCellHeight,
  virtualizerBufferPx,
  virtualizerUpdateDelayMs,
  virtualizerScrollSkipThresholdPx,
  TABLE_VIEWPORT_RESIZE_REFRESH_THRESHOLD_PX } from "./config/table-grid-metrics.js";
import { restrictionTypes } from "../../config/screen-config.js";
import { buildTableRows, computeTableRowsStructureKey } from "./utils/build-table-rows.js";
import { buildRmsCategoryConfigToken, filterRoomtypesForBaseBpMode, resolveRmsRuleScope } from "../../lib/tariff/price-save-layer.js";
import { findRoomtypeOrSubroomById } from "../../lib/flat-roomtypes.js";
import tariffTablePriceTextSelection from "./mixins/tariff-table-price-text-selection.js";
import tariffTableRestrictionSelection from "./mixins/tariff-table-restriction-selection.js";
import tariffTableHorizontalScroll from "./mixins/tariff-table-horizontal-scroll.js";
import tariffTableMobileEdit from "./mixins/tariff-table-mobile-edit.js";
import tariffTableCellEvents from "./mixins/tariff-table-cell-events.js";
import createTariffTableProvide from "./utils/create-tariff-table-provide.js";
import { createPriceCellTooltipController } from "./utils/create-price-cell-tooltip-controller.js";
import { findCellRootByKey as findCellRootByKeyInTable } from "./utils/find-cell-root.js";
import { captureActiveEditableCellKey,
  restoreEditableCellFocus } from "./lib/editing/restore-editable-cell-focus.js";
import { shouldRestoreEditableCellFocusAfterLayoutRefresh } from "./lib/editing/should-restore-editable-cell-focus-after-layout-refresh.js";
import { resolveOtherTariffsTooltipAnchorCellKey } from "./lib/editing/resolve-other-tariffs-tooltip-anchor-cell-key.js";
import { syncOtherTariffsTooltipAnchorFromActiveElement } from "./lib/editing/sync-other-tariffs-tooltip-anchor-from-active-element.js";
import { shouldRefreshVirtualizerOnViewportResize } from "./lib/editing/should-refresh-virtualizer-on-viewport-resize.js";
import { isDesktopPriceInputInScrollContainer } from "../../lib/screen/recompute-scroll-fit-preserving-desktop-price-input.js";
import { isTableInlineEditSessionActive,
  shouldAllowVirtualizerRefresh } from "./lib/editing/mobile-edit-session.js";
import { resolveVirtualizerRefreshAction } from "./lib/editing/resolve-virtualizer-refresh-action.js";
import { scheduleVirtualizerLayoutRefresh } from "./lib/editing/schedule-virtualizer-layout-refresh.js";
import { computePriceCellVm, getPriceCellDataId } from "./logic/build-price-cell-vm.js";
import { buildAvailabilityDayMeta } from "./logic/build-availability-day-meta.js";
import { computeRestrictionCellVm } from "./logic/build-restriction-cell-vm.js";
import TableToolbar from "./toolbar/toolbar.vue";
import MonthsRow from "./rows/months-row.vue";
import RoomtypeRow from "./rows/roomtype-row.vue";
import SubroomRow from "./rows/subroom-row.vue";
import ExtraChargeRow from "./rows/extra-charge-row.vue";
import RestrictionRow from "./rows/restriction-row.vue";
import RestrictionRowSelectionRange from "./overlays/restriction-row-selection-range.vue";
import TariffTableVirtualizedGrid from "./grid/tariff-table-virtualized-grid.vue";
import TariffTableOverlays from "./overlays/tariff-table-overlays.vue";
import { getClosedSaleRestrictionRoomtypeId } from "./lib/closed-sale-roomtype-id.js";
import { shouldApplyWebKitSafariStickyHeaderFix } from "../../lib/screen/webkit-safari-sticky-fix.js";
import { buildPartsReadinessToken, isPartsPending } from "../../lib/screen/table-parts-readiness.js";
import { resolveRoomtypeDayMetaRequiredParts } from "../../lib/screen/resolve-table-required-parts.js";
import { resolveHorizontalDisplayCalendarSlice } from "./lib/scroll/tariff-horizontal-display-calendar-cache.js";
import { buildPriceRowEpochCacheKey,
  buildRestrictionRowEpochCacheKey,
  createRowVmEpochCache,
  getRowVmEpochFromCache,
  invalidateRowVmEpochCache,
  syncRowVmEpochCacheGlobalEpoch } from "./lib/row-vm-epoch-cache.js";

const EMPTY_TABLE_ROWS = Object.freeze([]);
const EPOCH_SIG_EMPTY = "";

function toPrimitiveEpochValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function buildObjectEpochSignature(obj) {
  if (!obj || typeof obj !== "object") {
    return EPOCH_SIG_EMPTY;
  }
  let sig = "";
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }
    sig += `${key}:${toPrimitiveEpochValue(obj[key])};`;
  }
  return sig;
}

export default {
  name: "TariffPricesTable",
  emits: [
    "change-date",
    "change-mode",
    "show-restrictions-popup",
    "show-categories-popup",
    "update-need-hide-footer",
    "update-need-hide-app-footer",
  ],
  components: {
    TableToolbar,
    MonthsRow,
    RoomtypeRow,
    SubroomRow,
    ExtraChargeRow,
    RestrictionRow,
    RestrictionRowSelectionRange,
    TariffTableVirtualizedGrid,
    TariffTableOverlays,
    CompactRestrictionRow,
  },
  mixins: [
    tariffTablePriceTextSelection,
    tariffTableRestrictionSelection,
    tariffTableHorizontalScroll,
    tariffTableMobileEdit,
    tariffTableCellEvents,
  ],
  inject: {
    getPricesPageScrollContainer: { default: null },
    getPricesPageStickyHeaderBottom: { default: null },
    recomputeScrollContainerFit: { default: null },
    recomputeScrollContainerFitPreservingDesktopPriceInput: { default: null },
    finishMobileEditFooterSession: { default: null },
  },
  provide() {
    return {
      ...createTariffTableProvide(this),
      getPricesTableHorizontalScrollContainer: () => this.$refs.tableHorizontalScrollRef ?? null,
    };
  },
  props: {
    calendarLoading: {
      type: Boolean,
      default: false,
    },
    isAvailabilityEditable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cellVmCachePrice: new Map(),
      cellVmCacheRestriction: new Map(),
      /** Мемоизация `tableRows`: стабильная ссылка при неизменной структуре строк (меньше сбросов виртуализатора). */
      tableRowsMemoKey: "",
      tableRowsMemoRows: null,
      /** Кэш стилей строк виртуализатора: стабильная ссылка при неизменных gridStylesRow/width/height/id */
      rowOuterStyleCache: new Map(),
      /** Инкремент при clear кэшей VM, чтобы row/window кэш безопасно протухал. */
      cellVmEpochNonce: 0,
      /** Singleton-тултипы ценовых ячеек. */
      priceCellTooltipController: createPriceCellTooltipController(),
      /** Реактивная высота viewport для `virtualizerMaxRenderedRows` (resize окна / ориентация). */
      viewportInnerHeight: window?.innerHeight ?? 0,
      tableViewportResizeObserver: null,
      tableViewportObservedEl: null,
      tableViewportResizeRafId: null,
      tableViewportLastAppliedHeight: 0,
      /** Отложенный refresh виртуализатора после resize viewport во время edit-сессии. */
      deferVirtualizerRefreshUntilEditEnds: false,
      safariStickyCompositingActive: false,
      /** Императивный кэш среза календаря для provide (стабильная ссылка при том же окне). */
      horizontalDisplayCalendarCache: { key: "", slice: [] },
      priceRowVmEpochCache: createRowVmEpochCache(),
      restrictionRowVmEpochCache: createRowVmEpochCache(),
    };
  },
  // Переменные для миксинов
  roomtypeNameCellWidth,
  roomtypeNameCellWidthCompact,
  roomtypeNameCellHeight,
  cellWidth,
  cellHeight,
  withoutPlaceTypeIndex: RoomtypeModel.WITHOUT_PLACE_TYPE_INDEX,
  restrictionTypes,
  closedRestrictionName: PriceAndRestrictionsService.closedRestrictionName,
  selectionHoldDelay: 200,
  minSelectionDragDistance: 6,
  tableRowTypes: {
    roomtype: "RoomtypeRow",
    extraCharge: "ExtraChargeRow",
    restriction: "RestrictionRow",
    compactRestriction: "CompactRestrictionRow",
    subroom: "SubroomRow",
  },
  virtualizerBufferPx,
  virtualizerUpdateDelayMs,
  virtualizerScrollSkipThresholdPx,
  computed: {
    ...mapState("hotelRoom", ["roomtypes"]),
    ...mapState("tariffPricesAndRestrictions", [
      "currentTariff",
      "dateFrom",
      "mode",
      "selectedCategories",
      "pricesCalendarModel",
      "pricesCalendarModelUpdatedAt",
      "restrictionDraftIndex",
      "compactMode",
      "selectedRestrictions",
      "enabledCombinedMode",
      "compactRestrictions",
      "interfaceSettings",
      "partsLoadState",
    ]),
    ...mapGetters("tariffPricesAndRestrictions", ["isRmsPricingEnabled", "isOneOfPricesModesEnabled", "isRestrictionModeEnabled", "isCurrentTariffDepend", "isCombinedModeEnabled", "isDynamicPricesModeEnabled", "parentPriceModification", "parentUsesRmsPricing", "isTableContentPending", "tableContentParts"]),
    tableInteractionDisabled() {
      return this.isTableContentPending;
    },
    tableContentPartsReadinessToken() {
      return buildPartsReadinessToken(this.tableContentParts, this.partsLoadState);
    },
    priceVmGlobalEpoch() {
      return [
        this.cellVmEpochNonce,
        this.pricesCalendarModelUpdatedAt ?? "",
        this.currentTariff?.id ?? "",
        this.currentTariff?.parent_id ?? "",
        this.canResetPriceToDefault ? 1 : 0,
        this.mode ?? "",
        this.dateFrom ?? "",
        this.parentPriceModification ?? "",
        this.isDynamicPricesModeEnabled ? 1 : 0,
        this.isOneOfPricesModesEnabled ? 1 : 0,
        this.isMobileDevice ? 1 : 0,
        this.isCurrentTariffDepend ? 1 : 0,
        this.$store.state.hotel?.currency_sign || "",
        this.currentCellHeight,
        this.tableContentPartsReadinessToken,
      ].join("|");
    },
    canResetPriceToDefault() {
      return TariffInterfaceSettingsService.canResetPriceToDefault({
        interfaceSettingsModel: this.interfaceSettings,
        isCurrentTariffDepend: this.isCurrentTariffDepend,
      });
    },
    restrictionVmGlobalEpoch() {
      return [
        this.cellVmEpochNonce,
        this.pricesCalendarModelUpdatedAt ?? "",
        this.currentTariff?.id ?? "",
        this.currentTariff?.parent_id ?? "",
        this.mode ?? "",
        this.dateFrom ?? "",
        this.isMobileDevice ? 1 : 0,
        this.isRestrictionModeEnabled ? 1 : 0,
        this.currentCellHeight,
        this.compactRestrictions ? 1 : 0,
        JSON.stringify(this.currentTariff?.dependent_restrictions || {}),
        this.tableContentPartsReadinessToken,
        buildObjectEpochSignature(this.restrictionDraftIndex),
      ].join("|");
    },
    needShowResetApprovalPopup() {
      return !!this.resetApprovalInfo.id && this.resetApprovalInfo.day && this.resetApprovalInfo.callback instanceof Function;
    },
    currentCellHeight() {
      return this.compactRestrictions ? compactCellHeight : cellHeight;
    },
    roomtypeCellHeight() {
      return this.compactRestrictions ? roomtypeCompactNameCellHeight : roomtypeNameCellHeight;
    },
    gridStyles() {
      const nameColumnWidth = this.compactMode
        ? roomtypeNameCellWidthCompact
        : roomtypeNameCellWidth;

      return {
        display: "grid",
        gridTemplateColumns: `${nameColumnWidth}px repeat(${this.pricesCalendarModel.calendar.length}, ${cellWidth}px)`,
      };
    },
    gridStylesRow() {
      const nameColumnWidth = this.compactMode
        ? roomtypeNameCellWidthCompact
        : roomtypeNameCellWidth;
      const daysWidth = (this.pricesCalendarModel.calendar ?? []).length * cellWidth;

      return {
        display: "grid",
        gridTemplateColumns: `${nameColumnWidth}px ${daysWidth}px`,
      };
    },
    calculatedWidth() {
      return `${roomtypeNameCellWidth + ((this.pricesCalendarModel.calendar ?? []).length * cellWidth)}px`;
    },
    /**
     * Потолок строк виртуализатора: ~высота окна / минимальная строка + запас (сжимает overscan в пикселях).
     */
    virtualizerMaxRenderedRows() {
      if (!this.minRowHeight) {
        return 40;
      }
      const vh = this.viewportInnerHeight || window?.innerHeight || 800;
      const approx = Math.ceil(vh / this.minRowHeight) + 10;
      return Math.max(24, Math.min(56, approx));
    },
    minRowHeight() {
      return Math.min(this.roomtypeCellHeight, this.currentCellHeight);
    },
    /** Модификатор z-index: только если липкая шапка таблицы реально перекрывает редактируемую ячейку. */
    isMobileTableElevatedOverSticky() {
      return this.isMobileDevice && this.mobileTableCellInputFocused && this.mobileEditStickyOverlapsHeader;
    },
    /** Открыт ли bottom sheet ограничений (моб. и десктоп). */
    hasOpenRestrictionSheets() {
      return Boolean(this.booleanRestrictionSheet) || Boolean(this.dependentRestrictionReadonlySheet);
    },
    shouldHideAppMobileFooter() {
      return this.isMobileDevice && (
        this.mobileTableCellInputFocused || this.hasOpenRestrictionSheets
      );
    },
    shouldHidePageFooter() {
      return this.shouldHideAppMobileFooter
        || this.resetApprovalInfo.callback instanceof Function
        || this.hasOpenRestrictionSheets;
    },
    /** Суффикс query для ссылок на экран того же тарифа (даты/режим). */
    tariffPricesQuerySuffix() {
      const params = new URLSearchParams(this.$route?.query || {}).toString();
      return params ? `?${params}` : "";
    },
    booleanSheetCellKey() {
      return this.booleanRestrictionSheet?.cellKey || "";
    },
    compactRestrictionBooleanSheetCellKey() {
      return this.compactBooleanRestrictionDropdown?.cellKey || "";
    },
    isRmsBasePriceModeActive() {
      return this.isRmsPricingEnabled && !this.isDynamicPricesModeEnabled;
    },
    /** «Базовые цены для бизнес-правил»: скрываем ExtraChargeRow (roomtypeId + childrenAgeId + bedTypeId), не subroom и не категории. */
    omitExtraChargeRowsInTable() {
      return this.isRmsPricingEnabled && !this.isDynamicPricesModeEnabled;
    },
    displayedRoomtypes() {
      const base = this.selectedCategories.length
        ? this.roomtypes.filter(roomtype => this.selectedCategories.includes(roomtype.id))
        : this.roomtypes;
      if (!this.isRmsPricingEnabled || this.isDynamicPricesModeEnabled) {
        return base;
      }
      const { scope } = resolveRmsRuleScope({ rmsPricesRuleSource: this.pricesCalendarModel.rmsPricesRuleSource });
      const filterScope = scope === "category" ? "category" : "object";
      return filterRoomtypesForBaseBpMode({
        roomtypes: base,
        model: this.pricesCalendarModel,
        planId: this.currentTariff.id,
        scope: filterScope,
      });
    },
    useCompactRestrictionRow() {
      return this.compactRestrictions && !this.isMobileDevice;
    },
    /** Токен RMS-конфига категорий: инвалидирует `tableRows` при догрузке `dynamic`. */
    rmsCategoryConfigToken() {
      if (!this.isRmsPricingEnabled || this.isDynamicPricesModeEnabled) {
        return "";
      }
      return buildRmsCategoryConfigToken({
        planId: this.currentTariff?.id,
        model: this.pricesCalendarModel,
        dynamicLoaded: Boolean(this.partsLoadState?.dynamicLoaded),
      });
    },
    /** Ключ структуры строк (без побочных эффектов); мемоизация в `watch.tableRowsStructureKey`. */
    tableRowsStructureKey() {
      const calendarLength = this.pricesCalendarModel?.calendar?.length ?? 0;
      return computeTableRowsStructureKey({
        displayedRoomtypes: this.displayedRoomtypes,
        selectedCategories: this.selectedCategories,
        selectedRestrictions: this.selectedRestrictions,
        isOneOfPricesModesEnabled: this.isOneOfPricesModesEnabled,
        isRestrictionModeEnabled: this.isRestrictionModeEnabled,
        isCombinedModeEnabled: this.isCombinedModeEnabled,
        useCompactRestrictionRow: this.useCompactRestrictionRow,
        omitExtraChargeRows: this.omitExtraChargeRowsInTable,
        cellHeight: this.currentCellHeight,
        modelContextToken: [
          this.currentTariff?.id ?? "",
          this.dateFrom ?? "",
          calendarLength,
        ].join(":"),
        rmsCategoryConfigToken: this.rmsCategoryConfigToken,
      });
    },
    tableRows() {
      return this.tableRowsMemoRows ?? EMPTY_TABLE_ROWS;
    },
    virtualizerTableClasses() {
      return [
        this.$style["table-container"],
        { [this.$style["selection-active"]]: this.selectionActive },
        { [this.$style["table-container--mobile-edit-elevated"]]: this.isMobileTableElevatedOverSticky },
        { "tariff-demo-table-container--safari-compositing": this.safariStickyCompositingActive },
      ];
    },
    showOtherPricesTooltip() {
      if (!this.interfaceSettings.showOtherPricesHint) {
        return false;
      }

      return this.isOneOfPricesModesEnabled && !this.isMobileDevice;
    },
  },

  watch: {
    isMobileDevice(isMobile) {
      if (isMobile) {
        this.tooltipAnchorCellKey = null;
        this.priceCellTooltipController?.hide?.();
      }
    },
    horizontalDayWindow: {
      handler() {
        this.syncHorizontalDisplayCalendarCache();
      },
      deep: true,
    },
    gridStylesRow() {
      this.rowOuterStyleCache.clear();
    },
    calculatedWidth() {
      this.rowOuterStyleCache.clear();
    },
    compactMode() {
      if (isTableInlineEditSessionActive(this.getTableInlineEditSessionArgs())) {
        this.deferVirtualizerRefreshUntilEditEnds = true;
        return;
      }
      this.refreshVirtualizedTableLayout({ force: true });
    },
    tableRowsStructureKey: {
      handler(structureKey) {
        if (structureKey === this.tableRowsMemoKey && this.tableRowsMemoRows) {
          return;
        }
        const restoreFocusCellKey = captureActiveEditableCellKey(
          this.$el,
          this.mobileLastFocusedEditableCellKey,
        );
        this.tooltipAnchorCellKey = null;
        this.rowOuterStyleCache.clear();
        const restrictionTypeKeys = Object.keys(this.$options.restrictionTypes)
          .filter((restrictionType) => restrictionType !== this.$options.closedRestrictionName);
        const rows = buildTableRows({
          displayedRoomtypes: this.displayedRoomtypes,
          restrictionTypeKeys,
          isOneOfPricesModesEnabled: this.isOneOfPricesModesEnabled,
          isRestrictionModeEnabled: this.isRestrictionModeEnabled,
          isCombinedModeEnabled: this.isCombinedModeEnabled,
          useCompactRestrictionRow: this.useCompactRestrictionRow,
          omitExtraChargeRows: this.omitExtraChargeRowsInTable,
          selectedRestrictions: this.selectedRestrictions,
          tableRowTypes: this.$options.tableRowTypes,
          roomtypeNameCellHeight: this.roomtypeCellHeight,
          cellHeight: this.currentCellHeight,
        });
        this.tableRowsMemoKey = structureKey;
        this.tableRowsMemoRows = Object.freeze(rows);
        this.$nextTick(() => {
          this.refreshVirtualizedTableLayout({ restoreFocusCellKey, force: true });
        });
      },
      immediate: true,
    },
    shouldHidePageFooter: {
      handler(v) {
        this.$emit("update-need-hide-footer", v);
      },
      immediate: true,
    },
    shouldHideAppMobileFooter: {
      handler(v) {
        this.$emit("update-need-hide-app-footer", v);
      },
      immediate: true,
    },
    pricesCalendarModel() {
      this.clearHorizontalDisplayCalendarCache();
      this.syncHorizontalDisplayCalendarCache();
      this.clearCellVmCache();
      this.tooltipAnchorCellKey = null;
      this.prefetchTariffScreenMeta();
    },
    pricesCalendarModelUpdatedAt() {
      this.clearCellVmCache();
    },
    "currentTariff.id": function handler() {
      this.clearCellVmCache();
      this.dependentRestrictionReadonlySheet = null;
      this.tooltipAnchorCellKey = null;
      this.prefetchTariffScreenMeta();
    },
    dateFrom() {
      this.clearHorizontalDisplayCalendarCache();
      this.syncHorizontalDisplayCalendarCache();
      this.clearCellVmCache();
      this.tooltipAnchorCellKey = null;
      this.prefetchTariffScreenMeta();
    },
    mode() {
      this.clearCellVmCache();
      this.tooltipAnchorCellKey = null;
      this.prefetchTariffScreenMeta();
    },
    isTableContentPending(isPending) {
      if (isPending) {
        this.clearMobileEdit?.();
        this.tooltipAnchorCellKey = null;
        this.selectionActive = false;
        this.resetSelectionRangeState?.();
        return;
      }
      this.clearCellVmCache();
      this.$nextTick(() => {
        this.refreshVirtualizedTableLayout({ force: true });
      });
    },
    tableContentPartsReadinessToken() {
      this.clearCellVmCache();
    },
    restrictionDraftIndex: {
      handler() {
        this.clearCellVmCache();
      },
      deep: true,
    },
  },
  created() {
    if (typeof navigator !== "undefined") {
      this.safariStickyCompositingActive = shouldApplyWebKitSafariStickyHeaderFix(navigator);
    }
  },
  mounted() {
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("click", this.resetMobileEditWhenClickOutside);
    this.$nextTick(() => {
      this.attachTableViewportResizeObserver();
      this.prefetchTariffScreenMeta();
      this.syncHorizontalDisplayCalendarCache();
    });
  },
  beforeUnmount() {
    this.detachTableViewportResizeObserver();
    this.priceCellTooltipController?.destroy?.();
    this.clearSelectionActivationTimer();
    window.removeEventListener("mouseup", this.onMouseUp);
    this.booleanRestrictionSheet = null;
    this.compactBooleanRestrictionDropdown = null;
    this.dependentRestrictionReadonlySheet = null;
    this.$emit("update-need-hide-footer", false);
    this.$emit("update-need-hide-app-footer", false);
    window.removeEventListener("click", this.resetMobileEditWhenClickOutside);
  },
  methods: {
    clearHorizontalDisplayCalendarCache() {
      this.horizontalDisplayCalendarCache = { key: "", slice: [] };
    },
    syncHorizontalDisplayCalendarCache() {
      const next = resolveHorizontalDisplayCalendarSlice({
        calendar: this.pricesCalendarModel?.calendar ?? [],
        window: this.horizontalDayWindow,
        prevCache: this.horizontalDisplayCalendarCache,
      });
      if (next !== this.horizontalDisplayCalendarCache) {
        this.horizontalDisplayCalendarCache = next;
      }
    },
    /** Часть `meta` для черновиков/индексов; раньше ждали в каждом `setUpdatingPrices` — уводило гонки при вводе. */
    prefetchTariffScreenMeta() {
      if (!this.currentTariff?.id) {
        return;
      }
      this.$store.dispatch("tariffPricesAndRestrictions/ensureMetaLoaded").catch(() => {});
    },
    ...mapActions("tariffPricesAndRestrictions", [
      "setCompactMode",
      "setSelectedRestrictions",
      "setCompactRestrictions",
      "applyCompactRestrictionsViewMode",
    ]),
    updateViewportInnerHeight() {
      const container = this.getPricesPageScrollContainer?.();
      const containerHeight = container?.clientHeight;
      if (typeof containerHeight === "number" && containerHeight > 0) {
        this.viewportInnerHeight = containerHeight;
        return;
      }
      this.viewportInnerHeight = window?.innerHeight ?? 0;
    },
    attachTableViewportResizeObserver() {
      const container = this.getPricesPageScrollContainer?.();
      if (!container || typeof ResizeObserver === "undefined") {
        this.updateViewportInnerHeight();
        return;
      }
      if (this.tableViewportObservedEl === container && this.tableViewportResizeObserver) {
        this.updateViewportInnerHeight();
        return;
      }
      this.detachTableViewportResizeObserver();
      const observer = new ResizeObserver(() => {
        this.scheduleTableViewportResizeHandling();
      });
      observer.observe(container);
      this.tableViewportResizeObserver = observer;
      this.tableViewportObservedEl = container;
      this.tableViewportLastAppliedHeight = container.clientHeight || 0;
      this.updateViewportInnerHeight();
    },
    scheduleTableViewportResizeHandling() {
      if (this.tableViewportResizeRafId != null) {
        return;
      }
      this.tableViewportResizeRafId = requestAnimationFrame(() => {
        this.tableViewportResizeRafId = null;
        this.handleTableViewportResize();
      });
    },
    getTableInlineEditSessionArgs() {
      const scrollEl = this.getPricesPageScrollContainer?.() || null;
      const activeElement = typeof document !== "undefined" ? document.activeElement : null;
      return {
        mobileTableCellInputFocused: this.mobileTableCellInputFocused,
        isMobileEditableInputFocused: this.isMobileEditableInputFocused?.(),
        isDesktopDevice: this.isDesktopDevice,
        isDesktopPriceInputInScrollContainer,
        scrollEl,
        activeElement,
      };
    },
    handleTableViewportResize() {
      const prevHeight = this.tableViewportLastAppliedHeight;
      this.updateViewportInnerHeight();
      const nextHeight = this.viewportInnerHeight;
      const editSessionActive = isTableInlineEditSessionActive(this.getTableInlineEditSessionArgs());
      if (editSessionActive) {
        this.deferVirtualizerRefreshUntilEditEnds = true;
        return;
      }
      if (shouldRefreshVirtualizerOnViewportResize({
        prevHeightPx: prevHeight,
        nextHeightPx: nextHeight,
        thresholdPx: TABLE_VIEWPORT_RESIZE_REFRESH_THRESHOLD_PX,
        editSessionActive,
      })) {
        this.tableViewportLastAppliedHeight = nextHeight;
        this.refreshVirtualizedTableLayout();
      }
    },
    detachTableViewportResizeObserver() {
      if (this.tableViewportResizeRafId != null && typeof cancelAnimationFrame !== "undefined") {
        cancelAnimationFrame(this.tableViewportResizeRafId);
        this.tableViewportResizeRafId = null;
      }
      this.tableViewportResizeObserver?.disconnect?.();
      this.tableViewportResizeObserver = null;
      this.tableViewportObservedEl = null;
    },
    runDeferredVirtualizerRefreshIfNeeded() {
      if (!this.deferVirtualizerRefreshUntilEditEnds) {
        return;
      }
      if (isTableInlineEditSessionActive(this.getTableInlineEditSessionArgs())) {
        return;
      }
      this.deferVirtualizerRefreshUntilEditEnds = false;
      this.refreshVirtualizedTableLayout({ force: true });
      this.syncOtherTariffsTooltipAnchorFromFocus?.();
    },
    syncOtherTariffsTooltipAnchorFromFocus() {
      if (!this.showOtherPricesTooltip || this.isMobileDevice) {
        return;
      }
      const activeElement = typeof document !== "undefined" ? document.activeElement : null;
      const cellKey = syncOtherTariffsTooltipAnchorFromActiveElement({
        tableRootEl: this.$el,
        activeElement,
      });
      const anchorCellKey = resolveOtherTariffsTooltipAnchorCellKey(cellKey);
      if (anchorCellKey) {
        this.tooltipAnchorCellKey = anchorCellKey;
      }
    },
    clearCellVmCache() {
      this.cellVmCachePrice.clear();
      this.cellVmCacheRestriction.clear();
      this.cellVmEpochNonce += 1;
      invalidateRowVmEpochCache(this.priceRowVmEpochCache);
      invalidateRowVmEpochCache(this.restrictionRowVmEpochCache);
    },
    /** Синхронизация виртуализатора и горизонтального окна после смены compactRestrictions / resize viewport. */
    refreshVirtualizedTableLayout({
      restoreFocusCellKey = null,
      force = false,
      fullPoolReset: fullPoolResetOverride,
    } = {}) {
      const inlineEditActive = isTableInlineEditSessionActive(this.getTableInlineEditSessionArgs());
      const decision = resolveVirtualizerRefreshAction({
        force,
        inlineEditSessionActive: inlineEditActive,
      });
      if (decision.action === "defer") {
        this.deferVirtualizerRefreshUntilEditEnds = true;
        return;
      }
      if (
        !force
        && !shouldAllowVirtualizerRefresh(this.getTableInlineEditSessionArgs())
      ) {
        this.deferVirtualizerRefreshUntilEditEnds = true;
        return;
      }
      const fullPoolReset = typeof fullPoolResetOverride === "boolean"
        ? fullPoolResetOverride
        : decision.fullPoolReset;
      const explicitRestoreKey = restoreFocusCellKey || "";
      const focusKey = explicitRestoreKey || captureActiveEditableCellKey(this.$el, "");
      if (force) {
        this.rowOuterStyleCache.clear();
      }
      scheduleVirtualizerLayoutRefresh(() => {
        const virtualizer = this.$refs.tariffTableVirtualizedGrid?.$refs?.tableVirtualizer;
        virtualizer?.invalidateNestedOuterViewportCache?.();
        virtualizer?.forceUpdateState?.({ fullPoolReset });
        this.updateHorizontalScrollState?.();
        this.ensureHorizontalScrollListeners?.();
        if (!focusKey) {
          return;
        }
        if (!shouldRestoreEditableCellFocusAfterLayoutRefresh({
          isMobileDevice: this.isMobileDevice,
          focusKey,
          explicitRestoreFocusCellKey: explicitRestoreKey,
          mobileGuardArgs: {
            nowMs: Date.now(),
            focusRestoreAllowedUntilMs: this.mobileEditFocusRestoreAllowedUntilMs,
            mobileTableCellInputFocused: this.mobileTableCellInputFocused,
            isMobileEditableInputFocused: this.isMobileEditableInputFocused?.(),
            explicitRestoreFocusCellKey: explicitRestoreKey,
          },
        })) {
          return;
        }
        this.$nextTick(() => {
          if (restoreEditableCellFocus(this.$el, focusKey)) {
            if (this.showOtherPricesTooltip) {
              this.tooltipAnchorCellKey = resolveOtherTariffsTooltipAnchorCellKey(focusKey);
            }
          }
        });
      }, {
        nextTick: (fn) => {
          this.$nextTick(fn);
        },
        requestAnimationFrame: typeof requestAnimationFrame === "function"
          ? requestAnimationFrame
          : undefined,
      });
    },
    virtualRowComponentKey(item, branchType = item?.type) {
      if (!item?.id) {
        return "";
      }
      return `${branchType}-${item.id}-${this.compactRestrictions ? 1 : 0}-${item.height}`;
    },
    virtualRowItemStyle(item) {
      if (!item) {
        return this.gridStylesRow;
      }
      const w = this.calculatedWidth;
      const key = `${item.type}-${item.id}-${item.height}-${w}`;
      let cached = this.rowOuterStyleCache.get(key);
      if (!cached) {
        cached = Object.freeze({
          ...this.gridStylesRow,
          height: `${item.height}px`,
          width: w,
        });
        this.rowOuterStyleCache.set(key, cached);
      }
      return cached;
    },
    findCellRootByKey(cellKey) {
      return findCellRootByKeyInTable(this.$el, cellKey, this.cellRootDomCache);
    },
    hasActiveMobileEditableCellFocus() {
      return this.isMobileEditableInputFocused();
    },
    findCalendarDay(date = "") {
      return this.pricesCalendarModel?.calendar?.find((day) => day?.date === date) || {
        date,
        weekday: "",
      };
    },
    findRoomtypeById(roomtypeId = "") {
      return findRoomtypeOrSubroomById(this.roomtypes || [], roomtypeId);
    },
    getRoomtypeClosedState(roomtypeId, date) {
      const restrictions = this.$store.state.tariffPricesAndRestrictions.updatedRestrictions[roomtypeId]?.[date] ?? {};
      if (this.$options.closedRestrictionName in restrictions) {
        return !!Number(restrictions[this.$options.closedRestrictionName]);
      }

      return this.pricesCalendarModel.checkClosedRestriction(roomtypeId, date);
    },
    getPriceCellVm({
      roomtype,
      day,
      isMain = false,
      childrenAgeId = "",
      bedTypeId = "",
    }) {
      const dataId = getPriceCellDataId(roomtype, childrenAgeId, bedTypeId);
      const s = this.$store.state.tariffPricesAndRestrictions;
      const roomId = roomtype.id;
      const updatingPricesEffective = { [roomId]: s.updatingPrices[roomId] };
      const pricesToDeleteEffective = { [dataId]: s.pricesToDelete[dataId] || [] };
      const unacceptablePricesEffective = { [dataId]: Object.keys(s.unacceptableIndex[dataId] || {}) };
      return computePriceCellVm({
        roomtype,
        day,
        isMain,
        childrenAgeId,
        bedTypeId,
        pricesCalendarModel: this.pricesCalendarModel,
        currentTariff: this.currentTariff,
        updatingPrices: updatingPricesEffective,
        pricesToDelete: pricesToDeleteEffective,
        unacceptablePrices: unacceptablePricesEffective,
        getRoomtypeClosedState: (rid, d) => this.getRoomtypeClosedState(rid, d),
        isDynamicPricesModeEnabled: this.isDynamicPricesModeEnabled,
        parentPriceModification: this.parentPriceModification,
        isOneOfPricesModesEnabled: this.isOneOfPricesModesEnabled,
        isMobileDevice: this.isMobileDevice,
        isCurrentTariffDepend: this.isCurrentTariffDepend,
        currencySign: this.$store.state.hotel?.currency_sign,
        pricesCalendarModelUpdatedAt: this.pricesCalendarModelUpdatedAt,
        cellVmCachePrice: this.cellVmCachePrice,
        cellHeight: this.currentCellHeight,
        parentUsesRmsPricing: this.parentUsesRmsPricing,
        canResetPriceToDefault: this.canResetPriceToDefault,
        isRmsPricingEnabled: this.isRmsPricingEnabled,
        allRoomtypes: this.roomtypes,
        partsLoadState: this.partsLoadState,
      });
    },
    getPriceRowVmEpoch({
      roomtype,
      childrenAgeId = "",
      bedTypeId = "",
    }) {
      const globalEpoch = this.priceVmGlobalEpoch;
      syncRowVmEpochCacheGlobalEpoch(this.priceRowVmEpochCache, globalEpoch);
      const roomId = roomtype?.id;
      if (!roomId) {
        return globalEpoch;
      }
      const dataId = getPriceCellDataId(roomtype, childrenAgeId, bedTypeId);
      const s = this.$store.state.tariffPricesAndRestrictions;
      const roomUpdating = childrenAgeId && bedTypeId
        ? s.updatingPrices?.[roomId]?.[PriceAndRestrictionsService.updatingExtraChargesPricesFieldName]?.[childrenAgeId]?.[bedTypeId]
        : s.updatingPrices?.[roomId];
      const updatingSig = buildObjectEpochSignature(roomUpdating);
      const pricesToDelete = s.pricesToDelete?.[dataId] || [];
      const deleteSig = pricesToDelete.length ? pricesToDelete.join(",") : "";
      const unacceptableSig = buildObjectEpochSignature(s.unacceptableIndex?.[dataId]);
      const closedName = this.$options.closedRestrictionName;
      const closedOwnerId = getClosedSaleRestrictionRoomtypeId(roomtype);
      const closedBranch = s.updatedRestrictions?.[closedOwnerId] || {};
      let closedSig = "";
      for (const date in closedBranch) {
        if (!Object.prototype.hasOwnProperty.call(closedBranch, date)) {
          continue;
        }
        const value = closedBranch?.[date]?.[closedName];
        if (value !== undefined) {
          closedSig += `${date}:${Number(value) ? 1 : 0},`;
        }
      }
      const availabilitySig = buildObjectEpochSignature(s.updatingAvailability?.[roomId]);
      const mutableSig = [
        updatingSig,
        deleteSig,
        unacceptableSig,
        closedSig,
        availabilitySig,
      ].join("|");
      const cacheKey = buildPriceRowEpochCacheKey(globalEpoch, roomId, `${dataId}|${mutableSig}`);
      return getRowVmEpochFromCache(this.priceRowVmEpochCache, cacheKey, () => [
        globalEpoch,
        roomId,
        dataId,
        updatingSig,
        deleteSig,
        unacceptableSig,
        closedSig,
        availabilitySig,
      ].join("|"));
    },
    getRestrictionCellVm({
      roomtype, day, restrictionType,
      updatedRestrictionsOverride,
    }) {
      const s = this.$store.state.tariffPricesAndRestrictions;
      const roomId = roomtype.id;
      const closedOwnerId = getClosedSaleRestrictionRoomtypeId(roomtype);
      const updatedRestrictionsNarrow = { [roomId]: s.updatedRestrictions[roomId] };
      if (closedOwnerId !== "" && closedOwnerId != null && String(closedOwnerId) !== String(roomId)) {
        updatedRestrictionsNarrow[closedOwnerId] = s.updatedRestrictions[closedOwnerId];
      }
      const unacceptableByDate = s.unacceptableRestrictions?.[roomId] ?? s.unacceptableRestrictions?.[`${roomId}`] ?? {};
      const runCompute = () => computeRestrictionCellVm({
        roomtype,
        day,
        restrictionType,
        pricesCalendarModel: this.pricesCalendarModel,
        updatedRestrictions: updatedRestrictionsNarrow,
        updatedRestrictionsOverride,
        currentTariff: this.currentTariff,
        isMobileDevice: this.isMobileDevice,
        isRestrictionModeEnabled: this.isRestrictionModeEnabled,
        closedRestrictionName: this.$options.closedRestrictionName,
        cellVmCacheRestriction: this.cellVmCacheRestriction,
        pricesCalendarModelUpdatedAt: this.pricesCalendarModelUpdatedAt,
        cellHeight: this.currentCellHeight,
        unacceptableRestrictions: unacceptableByDate,
        partsLoadState: this.partsLoadState,
      });
      return runCompute();
    },
    getRestrictionRowVmEpoch({
      roomtype,
      restrictionType = "",
      selectedRestrictionTypes = [],
    }) {
      const globalEpoch = this.restrictionVmGlobalEpoch;
      syncRowVmEpochCacheGlobalEpoch(this.restrictionRowVmEpochCache, globalEpoch);
      const roomId = roomtype?.id;
      if (!roomId) {
        return globalEpoch;
      }
      const selectedSig = Array.isArray(selectedRestrictionTypes)
        ? selectedRestrictionTypes.join(",")
        : "";
      const s = this.$store.state.tariffPricesAndRestrictions;
      const roomRestrictions = s.updatedRestrictions?.[roomId] || {};
      let roomRestrictionsSig = "";
      for (const date in roomRestrictions) {
        if (!Object.prototype.hasOwnProperty.call(roomRestrictions, date)) {
          continue;
        }
        const byDate = roomRestrictions[date] || {};
        if (restrictionType) {
          if (Object.prototype.hasOwnProperty.call(byDate, restrictionType)) {
            roomRestrictionsSig += `${date}[${restrictionType}:${String(byDate[restrictionType] ?? "")}]|`;
          }
          continue;
        }
        const valuesSig = buildObjectEpochSignature(byDate);
        if (valuesSig) {
          roomRestrictionsSig += `${date}[${valuesSig}]|`;
        }
      }
      const roomUnacceptable = s.unacceptableRestrictions?.[roomId]
        || s.unacceptableRestrictions?.[`${roomId}`]
        || {};
      const unacceptableSig = buildObjectEpochSignature(roomUnacceptable);
      const closedName = this.$options.closedRestrictionName;
      const closedOwnerId = getClosedSaleRestrictionRoomtypeId(roomtype);
      const closedBranch = s.updatedRestrictions?.[closedOwnerId] || {};
      let closedSig = "";
      for (const date in closedBranch) {
        if (!Object.prototype.hasOwnProperty.call(closedBranch, date)) {
          continue;
        }
        const value = closedBranch?.[date]?.[closedName];
        if (value !== undefined) {
          closedSig += `${date}:${Number(value) ? 1 : 0},`;
        }
      }
      const mutableSig = [
        roomRestrictionsSig,
        unacceptableSig,
        closedSig,
      ].join("|");
      const cacheKey = buildRestrictionRowEpochCacheKey(
        globalEpoch,
        `${roomId}|${selectedSig}|${mutableSig}`,
        restrictionType,
      );
      return getRowVmEpochFromCache(this.restrictionRowVmEpochCache, cacheKey, () => [
        globalEpoch,
        roomId,
        restrictionType,
        selectedSig,
        roomRestrictionsSig,
        unacceptableSig,
        closedSig,
      ].join("|"));
    },
    getRoomtypeDayMeta({ roomtype, day }) {
      const requiredParts = resolveRoomtypeDayMetaRequiredParts({ isRestrictionModeEnabled: this.isRestrictionModeEnabled });
      const isDataPending = isPartsPending(requiredParts, this.partsLoadState);
      const roomtypeId = roomtype.id;
      const dayDate = day.date;
      const isSaleClosed = isDataPending
        ? false
        : this.getRoomtypeClosedState(getClosedSaleRestrictionRoomtypeId(roomtype), dayDate);
      const savedAvailability = isDataPending
        ? ""
        : this.pricesCalendarModel.getAvailability(roomtypeId, dayDate);
      const s = this.$store.state.tariffPricesAndRestrictions;
      return buildAvailabilityDayMeta({
        savedAvailability,
        updatingAvailability: s.updatingAvailability,
        roomtypeId,
        dayDate,
        isChmOnly: Boolean(this.$store.state.hotel?.isChmOnly),
        isDataPending,
        isSaleClosed,
        day,
      });
    },
    handleScroll() {
      const scrollEl = this.getHorizontalScrollElement();
      const scheduleHorizontal = this.shouldScheduleHorizontalScrollStateUpdate(scrollEl);
      const mobileEditActive = this.isMobileDevice && (
        this.mobileTableCellInputFocused
        || isTableInlineEditSessionActive(this.getTableInlineEditSessionArgs())
      );
      if (!scheduleHorizontal && !mobileEditActive) {
        return;
      }
      if (this.showOtherPricesTooltip) {
        this.priceCellTooltipController?.onExternalScrollOrResize?.();
      }
      if (mobileEditActive) {
        this.scheduleMobileEditStickyOverlapCheck();
      }
      if (scheduleHorizontal) {
        this.scheduleHorizontalScrollStateUpdate();
      }
    },
    getPageScrollContainer() {
      const container = this.getPricesPageScrollContainer?.();
      return container ?? window;
    },
    getPricesTableHorizontalScrollContainer() {
      return this.$refs.tableHorizontalScrollRef ?? null;
    },
    reattachHorizontalScrollListeners() {
      this.detachHorizontalScrollListener();
      this.$nextTick(() => {
        this.attachHorizontalScrollListener();
        this.updateHorizontalScrollState();
        this.refreshHorizontalScrollbarTrack();
      });
    },
    getTariffTableVirtualizer() {
      return this.$refs.tariffTableVirtualizedGrid?.$refs?.tableVirtualizer ?? null;
    },
  },
};
</script>

<style lang="scss" module>
.tableStickyHeader {
  position: sticky;
  left: 0;
  z-index: 4;
  background-color: $white;
}

.tableHeaderScrollArea {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
    height: 0;
    width: 0;
  }

  @include respondBelow(md) {
    touch-action: pan-x pan-y;
  }
}

.table-container {
  position: relative;
  // contain: strict; /* Ограничивает область перерисовки */
}

/**
 * Мобилка: тело таблицы выше липкой шапки таблицы (toolbar+months), только если шапка
 * пересекается с ячейкой, в которой сфокусирован инпут — см. `mobileEditStickyOverlapsHeader` / `rectsOverlap2D`.
 */
.tableScrollHost--mobile-edit-elevated {
  .tableStickyHeader {
    z-index: 1;
  }

  .table-container--mobile-edit-elevated {
    position: relative;
    z-index: 2;
  }
}

.selection-active {
  cursor: ew-resize;
}

.selection-range {
  position: absolute;
  background: rgba(30, 139, 195, 0.08);
  border: 1px solid $primary;
  border-radius: 4px;
  z-index: 10;
}

.tableScrollHost {
  position: relative;
}

$table-horizontal-scrollbar-track-height: 8px;

.tableScrollHostWithHorizontalScrollbar {
  padding-bottom: $table-horizontal-scrollbar-track-height + 1px;
}

.tableScrollAreaWithHorizontalScrollbar {
  margin-bottom: 2px;
}

.horizontalScrollbarStickyAnchor {
  position: sticky;
  bottom: 0;
  z-index: 5;
  height: $table-horizontal-scrollbar-track-height;
  overflow: hidden;
  pointer-events: none;
  background-color: var(--demo-surface, #fff);
  border-top: 1px solid var(--demo-border-soft, #e8eef3);
}

.horizontalScrollbarTrack {
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  background-color: $white;
  pointer-events: auto;
  @include scrollbar();

  @include respondBelow(md) {
    touch-action: pan-x;
  }
}

.tableScrollArea {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: clip;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
    height: 0;
    width: 0;
  }

  @include respondBelow(md) {
    touch-action: pan-x pan-y;
  }
}
</style>
