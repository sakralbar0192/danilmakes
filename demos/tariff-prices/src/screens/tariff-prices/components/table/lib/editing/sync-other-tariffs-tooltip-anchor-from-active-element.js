import { cellTypes } from "../../config/cell-types.js";

/**
 * Синхронизирует anchor other-tariffs tooltip с активным price-input в таблице.
 *
 * @param {{
 *   tableRootEl?: HTMLElement | null,
 *   activeElement?: Element | null,
 * }} args
 * @returns {string | null}
 */
// eslint-disable-next-line import/prefer-default-export
export function syncOtherTariffsTooltipAnchorFromActiveElement({
  tableRootEl = null,
  activeElement = null,
} = {}) {
  if (!tableRootEl || !activeElement || activeElement.nodeName !== "INPUT") {
    return null;
  }
  if (!tableRootEl.contains(activeElement)) {
    return null;
  }
  const root = activeElement.closest?.("[data-cell-root]");
  if (!root || !tableRootEl.contains(root)) {
    return null;
  }
  const cellType = root.dataset?.cellType || "";
  if (cellType !== cellTypes.price && cellType !== cellTypes.extraPrice) {
    return null;
  }
  return root.getAttribute("data-cell-key") || null;
}
