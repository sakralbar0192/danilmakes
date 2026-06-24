/**
 * На мобилке VTooltip даёт активатору tabindex=0 — см. tariff-table-price-cell.
 * @param {boolean} isMobileDevice
 * @param {Record<string, unknown>} [attrs]
 */
// eslint-disable-next-line import/prefer-default-export
export function mergePriceCellTooltipAttrs(isMobileDevice, attrs = {}) {
  if (!isMobileDevice) {
    return attrs;
  }
  return { ...attrs, tabindex: -1 };
}
