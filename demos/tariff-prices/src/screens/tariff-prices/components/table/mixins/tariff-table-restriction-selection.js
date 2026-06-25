import restrictionSelectionStateFactory from "../utils/restriction-selection-state.js";

/**
 * Выделение диапазона дат в строке ограничений (drag / long-press).
 */
export default {
  data() {
    return {
      selectionActive: false,
      mouseDowned: false,
      startSelectionPosition: {
        x: null,
        y: null,
      },
      selectionRange: restrictionSelectionStateFactory(),
      selectionDragStarted: false,
      selectionActivationTimer: null,
      /** После drag-selection: подавить следующий click (иначе toggle/focus под курсором). */
      suppressRestrictionCellClickOnce: false,
    };
  },
  methods: {
    handleStartRestrictionRowSelection(payload) {
      if (this.tableInteractionDisabled) {
        return;
      }
      this.mouseDowned = true;
      this.selectionDragStarted = false;
      this.clearSelectionActivationTimer();
      this.startSelectionPosition.x = payload.event.clientX;
      this.startSelectionPosition.y = payload.event.clientY;

      Object.assign(this.selectionRange, {
        fromDate: payload.day,
        toDate: payload.day,
        roomTypeId: payload.roomTypeId,
        rowIndex: payload.rowIndex,
        startCellIndex: payload.cellIndex,
        endCellIndex: payload.cellIndex,
        rowPositionTop: this.getRowTopOffset(payload.rect),
        restrictionType: payload.restrictionType,
      });

      this.selectionActivationTimer = setTimeout(() => {
        if (!this.mouseDowned) {
          return;
        }
        this.selectionActive = true;
        this.updateSelectionRangePosition();
      }, this.$options.selectionHoldDelay);
    },
    getRowTopOffset(rowRect) {
      if (!rowRect) {
        return;
      }
      const virtualizer = typeof this.getTariffTableVirtualizer === "function"
        ? this.getTariffTableVirtualizer()
        : this.$refs.tableContainer;
      const container = virtualizer?.$el;
      if (!container) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const visibleOffset = rowRect.top - containerRect.top;

      return virtualizer?.selfScroll
        ? visibleOffset + container.scrollTop
        : visibleOffset;
    },
    handleCellMouseEnterDuringSelection(payload) {
      if (!this.mouseDowned) {
        return;
      }
      if (payload.cellIndex < this.selectionRange.startCellIndex) {
        return;
      }
      if (payload.cellIndex > this.selectionRange.startCellIndex) {
        this.selectionDragStarted = true;
      }
      this.selectionRange.endCellIndex = payload.cellIndex;
      this.selectionRange.toDate = payload.day;
      this.clearSelectionActivationTimer();
      this.selectionActive = true;
      this.updateSelectionRangePosition();
    },
    handleTableMouseMove(e) {
      if (!this.mouseDowned) {
        return;
      }

      const xShift = Math.abs(e.clientX - this.startSelectionPosition.x);
      const isDragDistanceReached = xShift >= this.$options.minSelectionDragDistance;
      if (!this.selectionActive && !isDragDistanceReached) {
        return;
      }

      this.selectionDragStarted = this.selectionDragStarted || isDragDistanceReached;

      this.clearSelectionActivationTimer();
      this.selectionActive = true;
      this.updateSelectionRangePosition();
    },
    updateSelectionRangePosition() {
      const overlay = this.$refs.selectionRangeOverlay;
      if (!overlay) {
        return;
      }
      const start = this.selectionRange.startCellIndex * this.$options.cellWidth;
      const end = (this.selectionRange.endCellIndex + 1) * this.$options.cellWidth;

      const width = Math.max(this.$options.cellWidth, end - start);

      Object.assign(overlay.style, {
        top: `${this.selectionRange.rowPositionTop}px`,
        left: `${this.$options.roomtypeNameCellWidth + start}px`,
        width: `${width}px`,
        height: `${this.$options.cellHeight}px`,
        position: "absolute",
        pointerEvents: "none",
      });
    },
    onMouseUp() {
      this.finalizePriceTextSelectionOnPointerUp?.();
      this.clearMobileEditPointerDownCellKey?.();
      if (this.selectionActive) {
        this.suppressRestrictionCellClickOnce = true;
      }

      this.mouseDowned = false;
      this.selectionActive = false;
      this.resetSelectionRangeState();
    },
    clearSelectionActivationTimer() {
      if (!this.selectionActivationTimer) {
        return;
      }
      clearTimeout(this.selectionActivationTimer);
      this.selectionActivationTimer = null;
    },
    resetSelectionRangeState() {
      this.selectionRange = restrictionSelectionStateFactory();
      this.selectionDragStarted = false;
      this.startSelectionPosition.x = null;
      this.startSelectionPosition.y = null;
      this.clearSelectionActivationTimer();
    },
  },
};
