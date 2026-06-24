/** Селектор контента, при фокусе в котором anchor other-tariffs tooltip не сбрасывается. */
export const OTHER_TARIFFS_TOOLTIP_FOCUS_OUT_MENU_SELECTOR = [
  "[data-other-tariffs-prices-tooltip-root]",
  ".v-menu__content",
  ".v-menu__content--active",
  ".menuable__content__active",
  "[data-boolean-restriction-sheet-root]",
  "[data-compact-boolean-dropdown-root]",
  "[data-dependent-restriction-readonly-sheet-root]",
].join(", ");

/**
 * @param {() => void} clearTimer
 */
export function clearOtherTariffsTooltipOpenTimer(clearTimer) {
  clearTimer();
}

/**
 * Отложенное открытие меню после установки anchor (macrotask 0).
 *
 * @param {{
 *   cellKey: string,
 *   expectedCellKey: string,
 *   onShow: () => void,
 *   scheduleTimer: (fn: () => void) => number,
 *   clearTimer: () => void,
 * }} args
 * @returns {boolean}
 */
export function scheduleOtherTariffsTooltipOpen({
  cellKey,
  expectedCellKey,
  onShow,
  scheduleTimer,
  clearTimer,
}) {
  clearTimer();
  if (!cellKey) {
    return false;
  }
  scheduleTimer(() => {
    if (expectedCellKey === cellKey) {
      onShow();
    }
  });
  return true;
}

/**
 * @param {{
 *   activeElement: Element | null | undefined,
 *   rootCellKey: string,
 *   tooltipAnchorCellKey: string | null,
 * }} args
 * @returns {string | null}
 */
export function resolveOtherTariffsTooltipAnchorAfterFocusOut({
  activeElement,
  rootCellKey,
  tooltipAnchorCellKey,
}) {
  if (activeElement?.closest?.(OTHER_TARIFFS_TOOLTIP_FOCUS_OUT_MENU_SELECTOR)) {
    return tooltipAnchorCellKey;
  }
  if (tooltipAnchorCellKey === rootCellKey) {
    return null;
  }
  return tooltipAnchorCellKey;
}
