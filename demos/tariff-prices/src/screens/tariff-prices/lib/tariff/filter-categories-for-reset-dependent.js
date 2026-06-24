import { isExtraChargePriceId } from "../../components/table/lib/cell-identity.js";

/**
 * Убирает composite id наценок из выбранных категорий (режим reset_dependent_prices).
 *
 * @param {string[]} selectedRoomtypes
 * @returns {string[]}
 */
export function pruneExtraChargeIdsFromSelection(selectedRoomtypes = []) {
  return (selectedRoomtypes || []).filter((id) => !isExtraChargePriceId(String(id)));
}

/**
 * Скрывает строки наценок в grouped-селекте категорий дровера массовых цен.
 *
 * @param {Array<{ id: string|number, name?: string, elements?: Array<{ id: string|number }> }>} categories
 * @returns {typeof categories}
 */
export function filterCategoriesForResetDependent(categories = []) {
  return (categories || []).map((group) => {
    if (!group?.elements?.length) {
      return group;
    }
    const elements = group.elements.filter((element) => !isExtraChargePriceId(String(element?.id)));
    if (elements.length === group.elements.length) {
      return group;
    }
    return { ...group, elements };
  });
}
