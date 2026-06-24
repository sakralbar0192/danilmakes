import { cellTypes } from "../../config/cell-types.js";
import { resolveOtherTariffsTooltipAnchorOnPriceCellClick } from "./resolve-other-tariffs-tooltip-anchor-on-price-cell-click.js";

/**
 * Снимок состояния price-cell на pointerdown: был ли INPUT уже в фокусе до этого жеста.
 *
 * @param {PointerEvent | MouseEvent} event
 * @param {HTMLElement | null | undefined} tableRootEl
 * @returns {{ cellKey: string, priceInputWasFocused: boolean }}
 */
export function captureOtherTariffsTooltipPointerDownState(event, tableRootEl) {
  const cellRoot = event?.target?.closest?.("[data-cell-root]");
  if (!cellRoot || !tableRootEl?.contains?.(cellRoot)) {
    return { cellKey: "", priceInputWasFocused: false };
  }
  const cellType = cellRoot.dataset?.cellType || "";
  if (cellType !== cellTypes.price && cellType !== cellTypes.extraPrice) {
    return { cellKey: "", priceInputWasFocused: false };
  }
  const cellKey = cellRoot.getAttribute("data-cell-key") || "";
  const input = cellRoot.querySelector?.("input[inputmode=\"decimal\"], input");
  const activeElement = typeof document !== "undefined" ? document.activeElement : null;
  const priceInputWasFocused = Boolean(input && activeElement === input);
  return { cellKey, priceInputWasFocused };
}

/**
 * Toggle-off на повторном клике по той же ячейке.
 * Клик по INPUT снимает anchor только если поле уже было в фокусе до pointerdown
 * (не тот же жест, что открыл попап через focusin).
 *
 * @param {{
 *   tooltipAnchorCellKey: string | null,
 *   cellKey: string,
 *   isInputClick: boolean,
 *   priceInputWasFocusedBeforePointerDown?: boolean,
 *   pointerDownCellKey?: string,
 * }} args
 * @returns {string | null}
 */
export function resolveOtherTariffsTooltipAnchorAfterPriceCellClick({
  tooltipAnchorCellKey = null,
  cellKey = "",
  isInputClick = false,
  priceInputWasFocusedBeforePointerDown = false,
  pointerDownCellKey = "",
} = {}) {
  if (isInputClick) {
    const allowInputClickToggleOff = pointerDownCellKey === cellKey
      && priceInputWasFocusedBeforePointerDown;
    if (!allowInputClickToggleOff) {
      return tooltipAnchorCellKey ?? null;
    }
  }
  return resolveOtherTariffsTooltipAnchorOnPriceCellClick(tooltipAnchorCellKey, cellKey);
}
