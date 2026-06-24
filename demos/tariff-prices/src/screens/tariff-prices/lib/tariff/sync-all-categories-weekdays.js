import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";

export const ALL_WEEKDAYS_COLUMN = PriceAndRestrictionsService.allWeekdayValue;

/**
 * Keep header row «Все категории» in sync with cross-fill grid updates.
 *
 * Invariant: editing a single weekday (`allCategoriesDay`) clears the «all days»
 * column — partial edit invalidates the aggregate value shown in that column.
 *
 * @param {object} params
 * @param {"allCategoriesDay"|"allCategoriesAllDays"} params.kind
 * @param {number|string} [params.weekday]
 * @param {*} params.value
 * @param {number[]} [params.selectedWeekdays]
 * @param {object} [state] — header row weekday values
 * @returns {object}
 */
// eslint-disable-next-line import/prefer-default-export
export function syncAllCategoriesWeekdays({
  kind,
  weekday,
  value,
  selectedWeekdays = [],
}, state = {}) {
  const next = { ...(state || {}) };

  if (kind === "allCategoriesAllDays") {
    for (const wd of selectedWeekdays) {
      next[String(wd)] = value;
    }
    next[ALL_WEEKDAYS_COLUMN] = value;
    return next;
  }

  if (kind === "allCategoriesDay") {
    next[String(weekday)] = value;
    next[ALL_WEEKDAYS_COLUMN] = "";
    return next;
  }

  return next;
}
