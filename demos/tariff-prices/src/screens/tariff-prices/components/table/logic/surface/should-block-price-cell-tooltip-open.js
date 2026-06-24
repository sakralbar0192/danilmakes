import { cellTypes } from "../../config/cell-types.js";

/**
 * @param {Element|null} [activeElement]
 * @returns {boolean}
 */
// eslint-disable-next-line import/prefer-default-export
export function shouldBlockPriceCellTooltipOpen(activeElement = null) {
  const ae = activeElement
    ?? (typeof document !== "undefined" ? document.activeElement : null);
  if (!ae || ae.nodeName !== "INPUT") {
    return false;
  }
  const root = ae.closest?.("[data-cell-root]");
  if (!root) {
    return false;
  }
  const cellType = root.dataset?.cellType || "";
  return cellType === cellTypes.restriction || cellType === cellTypes.availability;
}
