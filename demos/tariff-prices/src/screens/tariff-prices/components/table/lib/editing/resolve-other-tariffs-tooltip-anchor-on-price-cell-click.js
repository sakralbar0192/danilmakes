/**
 * Повторный клик по той же ценовой ячейке закрывает попап других тарифов.
 *
 * @param {string|null} tooltipAnchorCellKey
 * @param {string} cellKey
 * @returns {string|null}
 */
// eslint-disable-next-line import/prefer-default-export
export function resolveOtherTariffsTooltipAnchorOnPriceCellClick(tooltipAnchorCellKey, cellKey) {
  if (tooltipAnchorCellKey && cellKey && tooltipAnchorCellKey === cellKey) {
    return null;
  }
  return tooltipAnchorCellKey ?? null;
}
