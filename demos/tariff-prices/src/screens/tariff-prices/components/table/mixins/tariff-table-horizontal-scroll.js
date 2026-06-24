import { computeHorizontalVisibleDayRange } from "../lib/scroll/compute-horizontal-visible-day-range.js";
import { mergeHorizontalDayRangeWithHysteresis } from "../lib/scroll/merge-horizontal-day-range-with-hysteresis.js";
import { resolveTableHorizontalScrollElement } from "../lib/scroll/resolve-horizontal-scroll-element.js";
import { hasTableHorizontalOverflow } from "../lib/scroll/table-horizontal-scrollbar-track.js";
import { isHorizontalWheelEvent,
  syncTripleHorizontalScrollFromSource } from "../lib/scroll/sync-triple-horizontal-scroll.js";
import { computeHorizontalScrollStatePatch } from "../utils/horizontal-scroll-state.js";
import { tableHorizontalScrollbarTrackHeightPx } from "../config/table-grid-metrics.js";

const HORIZONTAL_SCROLL_LEFT_EPSILON_PX = 1;
const PRICES_TABLE_HORIZONTAL_SCROLLBAR_RESERVE_CSS_VAR = "--prices-table-horizontal-scrollbar-reserve";
const HORIZONTAL_SCROLL_SETTLE_MS = 100;

/**
 * Горизонтальный скролл и окно видимых дней (`horizontalDayWindow`).
 * Ожидает на хосте: `getPricesTableHorizontalScrollContainer`, `getTariffTableVirtualizer`, `pricesCalendarModel`, `compactMode`,
 * `isMobileDevice`, `$options.roomtypeNameCellWidth*`, `$options.cellWidth`.
 */
export default {
  data() {
    return {
      horizontalDayWindow: { startIndex: 0, endIndex: 0 },
      horizontalScrollLeft: 0,
      horizontalScrollLeftForMonthLabels: 0,
      horizontalScrollClientWidth: 0,
      horizontalScrollLayoutSnapshot: {
        scrollLeft: null,
        columnIndex: null,
        clientWidth: null,
        compactMode: null,
        dayCount: null,
      },
      horizontalScrollStateRafId: null,
      prevScrollLeftForCategorySuppress: null,
      categoriesFilterSuppressClickUntilMs: 0,
      _horizontalScrollEl: null,
      _horizontalScrollHandler: null,
      _bodyHorizontalWheelHandler: null,
      _headerHorizontalScrollEl: null,
      _headerHorizontalScrollHandler: null,
      _headerHorizontalWheelHandler: null,
      horizontalScrollbarTrackVisible: false,
      _horizontalScrollbarTrackEl: null,
      _horizontalScrollbarTrackHandler: null,
      _horizontalWheelSyncRafId: null,
      _syncingHorizontalScrollLeft: false,
      _monthLabelScrollRafId: null,
      _horizontalScrollImmediateRafId: null,
      _horizontalScrollSettleTimeoutId: null,
      _horizontalScrollListenerAttached: false,
      _horizontalScrollWindowResizeAttached: false,
    };
  },
  watch: {
    "pricesCalendarModel.calendar.length": function onPricesCalendarModelCalendarLength(n) {
      this.horizontalDayWindow.startIndex = 0;
      this.horizontalDayWindow.endIndex = n || 0;
      this.$nextTick(() => {
        if (!this._horizontalScrollListenerAttached) {
          this.attachHorizontalScrollListener();
        } else {
          this.ensureHorizontalScrollListeners();
          this.updateHorizontalScrollState();
        }
      });
    },
    compactMode() {
      this.$nextTick(() => this.updateHorizontalScrollState());
    },
    horizontalScrollbarTrackVisible(visible) {
      if (visible) {
        this.$nextTick(() => this.ensureTrackHorizontalScrollListener());
      }
    },
    isTableContentPending(isPending) {
      if (isPending) {
        return;
      }
      this.$nextTick(() => {
        if (!this._horizontalScrollListenerAttached) {
          this.attachHorizontalScrollListener();
        } else {
          this.ensureHorizontalScrollListeners();
          this.updateHorizontalScrollState();
        }
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.attachHorizontalScrollListener();
    });
  },
  beforeDestroy() {
    if (this.horizontalScrollStateRafId != null) {
      cancelAnimationFrame(this.horizontalScrollStateRafId);
      this.horizontalScrollStateRafId = null;
    }
    if (this._horizontalScrollSettleTimeoutId != null) {
      clearTimeout(this._horizontalScrollSettleTimeoutId);
      this._horizontalScrollSettleTimeoutId = null;
    }
    if (this._horizontalScrollImmediateRafId != null) {
      cancelAnimationFrame(this._horizontalScrollImmediateRafId);
      this._horizontalScrollImmediateRafId = null;
    }
    if (this._monthLabelScrollRafId != null) {
      cancelAnimationFrame(this._monthLabelScrollRafId);
      this._monthLabelScrollRafId = null;
    }
    if (this._horizontalWheelSyncRafId != null) {
      cancelAnimationFrame(this._horizontalWheelSyncRafId);
      this._horizontalWheelSyncRafId = null;
    }
    this.detachHorizontalScrollListener();
    this.detachHorizontalScrollbarTrackListener();
  },
  methods: {
    shouldScheduleHorizontalScrollStateUpdate(scrollEl) {
      if (!scrollEl) {
        return true;
      }
      const snap = this.horizontalScrollLayoutSnapshot;
      const scrollLeft = scrollEl.scrollLeft || 0;
      const columnIndex = this.getHorizontalScrollColumnIndex(scrollLeft);
      const clientWidth = scrollEl.clientWidth || 0;
      const dayCount = this.pricesCalendarModel?.calendar?.length ?? 0;
      if (snap.scrollLeft == null) {
        return true;
      }
      return (Math.abs((snap.scrollLeft || 0) - scrollLeft) >= HORIZONTAL_SCROLL_LEFT_EPSILON_PX
        || snap.columnIndex !== columnIndex
        || snap.clientWidth !== clientWidth
        || snap.compactMode !== this.compactMode
        || snap.dayCount !== dayCount);
    },
    syncHorizontalScrollLayoutSnapshot(scrollEl) {
      if (!scrollEl) {
        this.horizontalScrollLayoutSnapshot = {
          scrollLeft: null,
          columnIndex: null,
          clientWidth: null,
          compactMode: null,
          dayCount: null,
        };
        return;
      }
      this.horizontalScrollLayoutSnapshot = {
        scrollLeft: scrollEl.scrollLeft || 0,
        columnIndex: this.getHorizontalScrollColumnIndex(scrollEl.scrollLeft || 0),
        clientWidth: scrollEl.clientWidth || 0,
        compactMode: this.compactMode,
        dayCount: this.pricesCalendarModel?.calendar?.length ?? 0,
      };
    },
    syncMonthLabelScrollMetricsFromElement(scrollEl) {
      if (!scrollEl) {
        return;
      }
      const scrollLeft = scrollEl.scrollLeft || 0;
      const clientWidth = scrollEl.clientWidth || 0;
      if (this.horizontalScrollLeftForMonthLabels !== scrollLeft) {
        this.horizontalScrollLeftForMonthLabels = scrollLeft;
      }
      if (this.horizontalScrollClientWidth !== clientWidth) {
        this.horizontalScrollClientWidth = clientWidth;
      }
    },
    scheduleMonthLabelScrollMetricsUpdate() {
      if (this._monthLabelScrollRafId != null) {
        return;
      }
      this._monthLabelScrollRafId = requestAnimationFrame(() => {
        this._monthLabelScrollRafId = null;
        const el = this.getHorizontalScrollElement();
        this.syncMonthLabelScrollMetricsFromElement(el);
      });
    },
    getHorizontalScrollColumnIndex(scrollLeft = 0) {
      const nameW = this.compactMode
        ? this.$options.roomtypeNameCellWidthCompact
        : this.$options.roomtypeNameCellWidth;
      const offset = Math.max(0, scrollLeft - nameW);
      return Math.floor(offset / this.$options.cellWidth);
    },
    scheduleHorizontalScrollStateUpdate() {
      if (this._horizontalScrollImmediateRafId == null) {
        this._horizontalScrollImmediateRafId = requestAnimationFrame(() => {
          this._horizontalScrollImmediateRafId = null;
          this.updateHorizontalScrollState({ useHysteresis: false });
        });
      }
      if (this._horizontalScrollSettleTimeoutId != null) {
        clearTimeout(this._horizontalScrollSettleTimeoutId);
      }
      this._horizontalScrollSettleTimeoutId = setTimeout(() => {
        this._horizontalScrollSettleTimeoutId = null;
        if (this.horizontalScrollStateRafId != null) {
          cancelAnimationFrame(this.horizontalScrollStateRafId);
        }
        this.horizontalScrollStateRafId = requestAnimationFrame(() => {
          this.horizontalScrollStateRafId = null;
          this.updateHorizontalScrollState({ useHysteresis: true });
        });
      }, HORIZONTAL_SCROLL_SETTLE_MS);
    },
    getHorizontalScrollElement() {
      const cached = this._horizontalScrollEl;
      if (cached && typeof document !== "undefined" && document.contains(cached)) {
        return cached;
      }
      return resolveTableHorizontalScrollElement({
        getPricesTableHorizontalScrollContainer: typeof this.getPricesTableHorizontalScrollContainer === "function"
          ? () => this.getPricesTableHorizontalScrollContainer()
          : undefined,
        tableHorizontalScrollRef: this.$refs.tableHorizontalScrollRef ?? null,
      });
    },
    getHeaderHorizontalScrollElement() {
      const cached = this._headerHorizontalScrollEl;
      if (cached && typeof document !== "undefined" && document.contains(cached)) {
        return cached;
      }
      const el = this.$refs.tableHeaderHorizontalScrollRef ?? null;
      if (el && typeof document !== "undefined" && document.contains(el)) {
        return el;
      }
      return null;
    },
    getHorizontalScrollbarTrackElement() {
      return this.$refs.tableHorizontalScrollbarTrackRef ?? null;
    },
    getHorizontalScrollTargets() {
      const bodyEl = this.getHorizontalScrollElement();
      const headerEl = this.getHeaderHorizontalScrollElement();
      const trackEl = this.horizontalScrollbarTrackVisible
        ? this.getHorizontalScrollbarTrackElement()
        : null;
      return {
        bodyEl, headerEl, trackEl,
      };
    },
    syncAllHorizontalScrollPositions(sourceEl) {
      if (this._syncingHorizontalScrollLeft) {
        return;
      }
      const source = sourceEl || this.getHorizontalScrollElement();
      if (!source) {
        return;
      }
      const {
        bodyEl, headerEl, trackEl,
      } = this.getHorizontalScrollTargets();
      this._syncingHorizontalScrollLeft = true;
      try {
        syncTripleHorizontalScrollFromSource({
          sourceEl: source,
          bodyEl,
          headerEl,
          trackEl,
          syncTrack: !!trackEl,
        });
      } finally {
        this._syncingHorizontalScrollLeft = false;
      }
      this.scheduleMonthLabelScrollMetricsUpdate();
    },
    handleHorizontalWheel(event) {
      if (!isHorizontalWheelEvent(event)) {
        return;
      }
      if (this._horizontalWheelSyncRafId != null) {
        return;
      }
      const sourceEl = event.currentTarget;
      this._horizontalWheelSyncRafId = requestAnimationFrame(() => {
        this._horizontalWheelSyncRafId = null;
        this.syncAllHorizontalScrollPositions(sourceEl);
        this.scheduleHorizontalScrollStateUpdate();
      });
    },
    onBodyHorizontalScroll() {
      const el = this.getHorizontalScrollElement();
      this.syncAllHorizontalScrollPositions(el);
      this.syncMonthLabelScrollMetricsFromElement(el);
      this.scheduleHorizontalScrollStateUpdate();
    },
    onHeaderHorizontalScroll() {
      const el = this.getHeaderHorizontalScrollElement();
      this.syncAllHorizontalScrollPositions(el);
      this.syncMonthLabelScrollMetricsFromElement(el);
      this.scheduleHorizontalScrollStateUpdate();
    },
    syncHorizontalScrollbarScrollPadding(visible) {
      const scrollEl = this.getPageScrollContainer?.();
      if (!scrollEl?.style) {
        return;
      }
      scrollEl.style.setProperty(
        PRICES_TABLE_HORIZONTAL_SCROLLBAR_RESERVE_CSS_VAR,
        visible ? `${tableHorizontalScrollbarTrackHeightPx}px` : "0px",
      );
    },
    refreshHorizontalScrollbarTrack() {
      const mainEl = this.getHorizontalScrollElement();
      const visible = hasTableHorizontalOverflow(mainEl);
      if (this.horizontalScrollbarTrackVisible !== visible) {
        this.horizontalScrollbarTrackVisible = visible;
        this.syncHorizontalScrollbarScrollPadding(visible);
        if (visible) {
          this.$nextTick(() => this.ensureTrackHorizontalScrollListener());
        }
      }
      if (mainEl) {
        this.syncAllHorizontalScrollPositions(mainEl);
      }
    },
    onHorizontalScrollbarTrackScroll() {
      this.syncAllHorizontalScrollPositions(this.getHorizontalScrollbarTrackElement());
      this.scheduleHorizontalScrollStateUpdate();
    },
    ensureBodyHorizontalScrollListener() {
      const el = this.getHorizontalScrollElement();
      if (!el) {
        return false;
      }
      if (this._horizontalScrollEl !== el) {
        this.detachBodyHorizontalScrollListener();
      }
      if (this._horizontalScrollHandler) {
        return true;
      }
      this._horizontalScrollEl = el;
      this._horizontalScrollHandler = () => {
        this.onBodyHorizontalScroll();
      };
      el.addEventListener("scroll", this._horizontalScrollHandler, { passive: true });
      this._bodyHorizontalWheelHandler = (e) => {
        this.handleHorizontalWheel(e);
      };
      el.addEventListener("wheel", this._bodyHorizontalWheelHandler, { passive: true });
      return true;
    },
    detachBodyHorizontalScrollListener() {
      if (this._horizontalScrollEl && this._horizontalScrollHandler) {
        this._horizontalScrollEl.removeEventListener("scroll", this._horizontalScrollHandler);
      }
      if (this._horizontalScrollEl && this._bodyHorizontalWheelHandler) {
        this._horizontalScrollEl.removeEventListener("wheel", this._bodyHorizontalWheelHandler);
      }
      this._horizontalScrollEl = null;
      this._horizontalScrollHandler = null;
      this._bodyHorizontalWheelHandler = null;
    },
    ensureHeaderHorizontalScrollListener() {
      const headerEl = this.getHeaderHorizontalScrollElement();
      if (!headerEl) {
        return false;
      }
      if (this._headerHorizontalScrollEl !== headerEl) {
        this.detachHeaderHorizontalScrollListener();
      }
      if (this._headerHorizontalScrollHandler) {
        return true;
      }
      this._headerHorizontalScrollEl = headerEl;
      this._headerHorizontalScrollHandler = () => {
        this.onHeaderHorizontalScroll();
      };
      headerEl.addEventListener("scroll", this._headerHorizontalScrollHandler, { passive: true });
      this._headerHorizontalWheelHandler = (e) => {
        this.handleHorizontalWheel(e);
      };
      headerEl.addEventListener("wheel", this._headerHorizontalWheelHandler, { passive: true });
      return true;
    },
    detachHeaderHorizontalScrollListener() {
      if (this._headerHorizontalScrollEl && this._headerHorizontalScrollHandler) {
        this._headerHorizontalScrollEl.removeEventListener("scroll", this._headerHorizontalScrollHandler);
      }
      if (this._headerHorizontalScrollEl && this._headerHorizontalWheelHandler) {
        this._headerHorizontalScrollEl.removeEventListener("wheel", this._headerHorizontalWheelHandler);
      }
      this._headerHorizontalScrollEl = null;
      this._headerHorizontalScrollHandler = null;
      this._headerHorizontalWheelHandler = null;
    },
    ensureTrackHorizontalScrollListener() {
      const trackEl = this.getHorizontalScrollbarTrackElement();
      if (!trackEl || this._horizontalScrollbarTrackHandler) {
        return !!trackEl;
      }
      this._horizontalScrollbarTrackEl = trackEl;
      this._horizontalScrollbarTrackHandler = () => {
        this.onHorizontalScrollbarTrackScroll();
      };
      trackEl.addEventListener("scroll", this._horizontalScrollbarTrackHandler, { passive: true });
      return true;
    },
    ensureHorizontalScrollListeners() {
      this.ensureBodyHorizontalScrollListener();
      this.ensureHeaderHorizontalScrollListener();
      if (this.horizontalScrollbarTrackVisible) {
        this.ensureTrackHorizontalScrollListener();
      }
    },
    attachHorizontalScrollbarTrackListener() {
      this.ensureTrackHorizontalScrollListener();
    },
    detachHorizontalScrollbarTrackListener() {
      if (this._horizontalScrollbarTrackEl && this._horizontalScrollbarTrackHandler) {
        this._horizontalScrollbarTrackEl.removeEventListener("scroll", this._horizontalScrollbarTrackHandler);
      }
      this._horizontalScrollbarTrackEl = null;
      this._horizontalScrollbarTrackHandler = null;
    },
    _closePopoversOnScroll() {
      const c = this.priceCellTooltipController;
      if (c && c.state && c.state.show) {
        c.hide();
      }
      const suppressSheets = Date.now() < (this.suppressRestrictionSheetOutsideDismissUntilMs || 0);
      if (suppressSheets) {
        return;
      }
      if (this.booleanRestrictionSheet) {
        this.booleanRestrictionSheet = null;
      }
      if (this.compactBooleanRestrictionDropdown) {
        this.compactBooleanRestrictionDropdown = null;
      }
      if (this.dependentRestrictionReadonlySheet) {
        this.dependentRestrictionReadonlySheet = null;
      }
    },
    updateHorizontalScrollState({ useHysteresis = true } = {}) {
      const el = this.getHorizontalScrollElement();
      const cal = this.pricesCalendarModel?.calendar ?? [];
      const n = cal.length;
      if (!el) {
        if (this.horizontalDayWindow.startIndex === 0 && this.horizontalDayWindow.endIndex === n) {
          this.syncHorizontalScrollLayoutSnapshot(null);
          return;
        }
        this.horizontalDayWindow.startIndex = 0;
        this.horizontalDayWindow.endIndex = n;
        this.syncHorizontalScrollLayoutSnapshot(null);
        return;
      }
      const scrollLeft = el.scrollLeft || 0;
      this._closePopoversOnScroll();
      const patch = computeHorizontalScrollStatePatch({
        scrollLeft,
        prevScrollLeft: this.prevScrollLeftForCategorySuppress,
        isMobileDevice: this.isMobileDevice,
        now: Date.now(),
        currentCategoriesSuppressClickUntilMs: this.categoriesFilterSuppressClickUntilMs,
      });

      const nameW = this.compactMode
        ? this.$options.roomtypeNameCellWidthCompact
        : this.$options.roomtypeNameCellWidth;
      const rawRange = computeHorizontalVisibleDayRange({
        scrollLeft,
        clientWidth: el.clientWidth || 0,
        nameColumnWidth: nameW,
        cellWidth: this.$options.cellWidth,
        dayCount: n,
      });
      const range = useHysteresis
        ? mergeHorizontalDayRangeWithHysteresis(
          {
            startIndex: this.horizontalDayWindow.startIndex,
            endIndex: this.horizontalDayWindow.endIndex,
          },
          rawRange,
          n,
        )
        : rawRange;

      const patchUnchanged = this.horizontalScrollLeft === patch.horizontalScrollLeft
        && this.prevScrollLeftForCategorySuppress === patch.prevScrollLeftForCategorySuppress
        && this.categoriesFilterSuppressClickUntilMs === patch.categoriesFilterSuppressClickUntilMs;
      const rangeUnchanged = this.horizontalDayWindow.startIndex === range.startIndex
        && this.horizontalDayWindow.endIndex === range.endIndex;

      if (patchUnchanged && rangeUnchanged) {
        this.syncHorizontalScrollLayoutSnapshot(el);
        return;
      }

      this.horizontalScrollLeft = patch.horizontalScrollLeft;
      this.prevScrollLeftForCategorySuppress = patch.prevScrollLeftForCategorySuppress;
      this.categoriesFilterSuppressClickUntilMs = patch.categoriesFilterSuppressClickUntilMs;
      this.horizontalDayWindow.startIndex = range.startIndex;
      this.horizontalDayWindow.endIndex = range.endIndex;
      this.syncHorizontalScrollLayoutSnapshot(el);
      this.syncAllHorizontalScrollPositions(el);
      this.refreshHorizontalScrollbarTrack();
    },
    attachHorizontalScrollListener() {
      if (!this.ensureBodyHorizontalScrollListener()) {
        return;
      }
      this.ensureHeaderHorizontalScrollListener();
      this.ensureTrackHorizontalScrollListener();
      if (!this._horizontalScrollWindowResizeAttached) {
        window.addEventListener(
          "resize",
          this.scheduleHorizontalScrollStateUpdate,
        );
        this._horizontalScrollWindowResizeAttached = true;
      }
      this.syncHorizontalScrollLayoutSnapshot(null);
      this._horizontalScrollListenerAttached = true;
      this.updateHorizontalScrollState();
      this.$nextTick(() => {
        this.syncAllHorizontalScrollPositions(this.getHorizontalScrollElement());
        this.refreshHorizontalScrollbarTrack();
      });
    },
    detachHorizontalScrollListener() {
      this.detachBodyHorizontalScrollListener();
      this.detachHeaderHorizontalScrollListener();
      if (this._horizontalScrollWindowResizeAttached) {
        window.removeEventListener(
          "resize",
          this.scheduleHorizontalScrollStateUpdate,
        );
        this._horizontalScrollWindowResizeAttached = false;
      }
      this._horizontalScrollListenerAttached = false;
      this.detachHorizontalScrollbarTrackListener();
      this.horizontalScrollbarTrackVisible = false;
      this.syncHorizontalScrollbarScrollPadding(false);
    },
  },
};
