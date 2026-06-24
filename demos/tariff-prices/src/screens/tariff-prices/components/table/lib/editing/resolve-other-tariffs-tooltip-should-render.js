import { cellTypes } from "../../config/cell-types.js";

/**
 * @param {{
 *   anchorEl?: HTMLElement | null,
 *   isLoading?: boolean,
 *   error?: string,
 *   itemsLength?: number,
 * }} args
 * @returns {boolean}
 */
// eslint-disable-next-line import/prefer-default-export
export function resolveOtherTariffsTooltipShouldRender({
  anchorEl = null,
  isLoading = false,
  error = "",
  itemsLength = 0,
} = {}) {
  if (!anchorEl) {
    return false;
  }
  if (typeof anchorEl.isConnected === "boolean" && !anchorEl.isConnected) {
    return false;
  }
  const cellType = anchorEl.dataset?.cellType || "";
  if (cellType !== cellTypes.price && cellType !== cellTypes.extraPrice) {
    return false;
  }
  return isLoading || Boolean(error) || itemsLength > 0;
}
