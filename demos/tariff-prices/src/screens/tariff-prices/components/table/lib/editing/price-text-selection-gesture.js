import { isPriceCellType } from "../cell-identity.js";

/** `INPUT` внутри price/extraPrice ячейки таблицы. */
export function isPriceTableInputPointerTarget(target, tableEl = null) {
  if (!target || target.nodeName !== "INPUT") {
    return false;
  }
  const cellRoot = target.closest?.("[data-cell-root]");
  if (!cellRoot || !tableEl?.contains?.(cellRoot)) {
    return false;
  }
  return isPriceCellType(cellRoot.dataset?.cellType);
}

export function readInputSelectionRange(input) {
  if (!input || input.nodeName !== "INPUT") {
    return {
      start: 0,
      end: 0,
      collapsed: true,
    };
  }
  const value = `${input.value ?? ""}`;
  const start = typeof input.selectionStart === "number" ? input.selectionStart : value.length;
  const end = typeof input.selectionEnd === "number" ? input.selectionEnd : start;
  return {
    start,
    end,
    collapsed: start === end,
  };
}

export function resolvePriceInputFromFocusOutTarget(eventTarget, fromCellRoot) {
  if (eventTarget?.nodeName === "INPUT") {
    return eventTarget;
  }
  return fromCellRoot?.querySelector?.("input[inputmode=\"decimal\"]")
    || fromCellRoot?.querySelector?.("input");
}

export function shouldDeferPriceCellBlurOnFocusOut({
  gestureInput = null,
  fromCellRoot = null,
  eventTarget = null,
} = {}) {
  if (!gestureInput || !fromCellRoot) {
    return false;
  }
  if (!isPriceCellType(fromCellRoot.dataset?.cellType)) {
    return false;
  }
  const input = resolvePriceInputFromFocusOutTarget(eventTarget, fromCellRoot);
  return input === gestureInput;
}

export function resolvePriceTextSelectionSnapshot({
  gestureInput = null,
  deferredSelection = null,
  lastNonCollapsedSelection = null,
} = {}) {
  if (lastNonCollapsedSelection && !lastNonCollapsedSelection.collapsed) {
    return lastNonCollapsedSelection;
  }
  if (deferredSelection && !deferredSelection.collapsed) {
    return deferredSelection;
  }
  const live = readInputSelectionRange(gestureInput);
  if (!live.collapsed) {
    return live;
  }
  return deferredSelection || lastNonCollapsedSelection || live;
}

export function shouldKeepPriceInputFocusedAfterGesture(selection = null) {
  return Boolean(selection && !selection.collapsed);
}

export function shouldRestorePriceInputFocusAfterPointerUp({
  input = null,
  activeElement = null,
  selection = null,
} = {}) {
  if (!input) {
    return false;
  }
  if (!selection || selection.collapsed) {
    return false;
  }
  return activeElement !== input;
}

export function shouldApplyDeferredPriceCellBlurAfterPointerUp({
  deferredBlurEvent = null,
  restoreFocus = false,
} = {}) {
  return Boolean(deferredBlurEvent) && !restoreFocus;
}

/** Сброс полей жеста выделения текста в price-input (mixin tariff-table-price-text-selection). */
export function resetPriceTextSelectGestureState(ctx) {
  if (!ctx) {
    return;
  }
  ctx.priceTextSelectGestureInput = null;
  ctx.deferredPriceCellBlurEvent = null;
  ctx.deferredPriceCellBlurSelection = null;
  ctx.priceTextSelectLastNonCollapsedSelection = null;
}
