import { isPriceTableInputPointerTarget,
  readInputSelectionRange,
  resetPriceTextSelectGestureState,
  resolvePriceTextSelectionSnapshot,
  shouldApplyDeferredPriceCellBlurAfterPointerUp,
  shouldKeepPriceInputFocusedAfterGesture,
  shouldRestorePriceInputFocusAfterPointerUp } from "../lib/editing/price-text-selection-gesture.js";

/**
 * Жест выделения текста в price-input: deferred blur, восстановление focus/selection после pointerup.
 * Safari: double requestAnimationFrame в finalizePriceTextSelectionOnPointerUp.
 */
export default {
  data() {
    return {
      priceTextSelectGestureInput: null,
      deferredPriceCellBlurEvent: null,
      deferredPriceCellBlurSelection: null,
      priceTextSelectLastNonCollapsedSelection: null,
    };
  },
  beforeDestroy() {
    this.detachPriceTextSelectSelectionListener();
  },
  methods: {
    attachPriceTextSelectSelectionListener() {
      if (typeof document === "undefined") {
        return;
      }
      document.addEventListener("selectionchange", this.handlePriceTextSelectionChange);
    },
    detachPriceTextSelectSelectionListener() {
      if (typeof document === "undefined") {
        return;
      }
      document.removeEventListener("selectionchange", this.handlePriceTextSelectionChange);
    },
    handlePriceTextSelectionChange() {
      const input = this.priceTextSelectGestureInput;
      if (!input) {
        return;
      }
      const selection = readInputSelectionRange(input);
      if (!selection.collapsed) {
        this.priceTextSelectLastNonCollapsedSelection = selection;
      }
    },
    rememberPriceTextSelectSelection(input = this.priceTextSelectGestureInput) {
      const selection = readInputSelectionRange(input);
      if (!selection.collapsed) {
        this.priceTextSelectLastNonCollapsedSelection = selection;
      }
      return selection;
    },
    armPriceTextSelectGesture(e) {
      if (e.button !== 0) {
        return;
      }
      const input = e.target?.nodeName === "INPUT" ? e.target : null;
      if (!isPriceTableInputPointerTarget(input, this.$el)) {
        return;
      }
      this.detachPriceTextSelectSelectionListener();
      resetPriceTextSelectGestureState(this);
      this.priceTextSelectGestureInput = input;
      this.rememberPriceTextSelectSelection(input);
      this.attachPriceTextSelectSelectionListener();
    },
    handleTablePointerDownCapture(e) {
      if (this.tableInteractionDisabled) {
        return;
      }
      this.rememberOtherTariffsTooltipPointerDownState?.(e);
      this.recordMobileEditPointerDownCellKey?.(e);
      this.armPriceTextSelectGesture(e);
    },
    handleTableMouseDownCapture(e) {
      if (this.tableInteractionDisabled) {
        return;
      }
      this.armPriceTextSelectGesture(e);
    },
    finalizePriceTextSelectionOnPointerUp() {
      this.rememberPriceTextSelectSelection();
      this.detachPriceTextSelectSelectionListener();
      const gestureInput = this.priceTextSelectGestureInput;
      const deferred = this.deferredPriceCellBlurEvent;
      const selection = resolvePriceTextSelectionSnapshot({
        gestureInput,
        deferredSelection: this.deferredPriceCellBlurSelection,
        lastNonCollapsedSelection: this.priceTextSelectLastNonCollapsedSelection,
      });

      if (!gestureInput && !deferred) {
        return;
      }

      const applyDeferredBlur = () => {
        if (!deferred) {
          return;
        }
        this.completeEditableCellBlurSession(deferred).catch(() => {});
      };

      const finish = () => {
        this.detachPriceTextSelectSelectionListener();
        const keepFocus = shouldKeepPriceInputFocusedAfterGesture(selection);

        resetPriceTextSelectGestureState(this);

        if (keepFocus && gestureInput) {
          try {
            const activeElement = typeof document !== "undefined" ? document.activeElement : null;
            if (shouldRestorePriceInputFocusAfterPointerUp({
              input: gestureInput,
              activeElement,
              selection,
            })) {
              gestureInput.focus({ preventScroll: true });
            }
            gestureInput.setSelectionRange(selection.start, selection.end);
          // eslint-disable-next-line no-empty
          } catch (err) {}
          return;
        }

        if (shouldApplyDeferredPriceCellBlurAfterPointerUp({
          deferredBlurEvent: deferred,
          restoreFocus: keepFocus,
        })) {
          applyDeferredBlur();
        }
      };

      requestAnimationFrame(() => requestAnimationFrame(finish));
    },
  },
};
