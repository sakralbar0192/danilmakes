import { isPriceCellType, parseCellKey } from "../cell-identity.js";

/**
 * Возвращает cellKey для anchor other-tariffs tooltip только для price/extraPrice ячеек.
 *
 * @param {string | null | undefined} cellKey
 * @returns {string | null}
 */
// eslint-disable-next-line import/prefer-default-export
export function resolveOtherTariffsTooltipAnchorCellKey(cellKey = "") {
  if (!cellKey) {
    return null;
  }
  const { cellType } = parseCellKey(cellKey);
  return isPriceCellType(cellType) ? cellKey : null;
}
