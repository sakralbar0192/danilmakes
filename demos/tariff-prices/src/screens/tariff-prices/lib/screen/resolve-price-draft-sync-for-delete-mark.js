import { isPriceDraftEqualToSaved } from "../../config/resolve-price-draft-from-input.js";

/**
 * @param {object} [pricesToDelete]
 * @param {string} id
 * @param {string} date
 * @returns {boolean}
 */
export function isPriceCellMarkedForDelete(pricesToDelete = {}, id = "", date = "") {
  if (!id || !date) {
    return false;
  }
  return (pricesToDelete[id] ?? []).includes(date);
}

/**
 * Не синхронизировать черновик при blur/input, если ячейка помечена на delete
 * и значение инпута совпадает с baseline сброса (пользователь не редактировал).
 *
 * @param {{
 *   isMarkedForDelete?: boolean,
 *   draftValue?: string|number,
 *   resetBaseline?: string|number|null,
 * }} input
 * @returns {boolean}
 */
export function shouldSkipPriceDraftSyncForDeleteMark({
  isMarkedForDelete = false,
  draftValue,
  resetBaseline,
} = {}) {
  if (!isMarkedForDelete) {
    return false;
  }
  if (resetBaseline === null || resetBaseline === undefined || resetBaseline === "") {
    return false;
  }
  return isPriceDraftEqualToSaved(draftValue, resetBaseline);
}
