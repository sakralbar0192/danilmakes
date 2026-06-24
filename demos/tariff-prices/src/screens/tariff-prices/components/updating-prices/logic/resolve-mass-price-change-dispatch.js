import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { buildMassPriceCrossFillEntries } from "./cross-fill-weekday-prices.js";

/**
 * Resolve Vuex dispatches for a mass-prices table cell change.
 *
 * @param {object} params
 * @param {string} [params.id] — roomtype id from dataset
 * @param {string|number} [params.weekday] — weekday column or "all"
 * @param {string|number} [params.rawValue] — raw input value
 * @param {number[]} [params.selectedRoomtypes]
 * @param {number[]} [params.selectedWeekdays]
 * @returns {{ priceEntries: Array<{ id: string|number, day: string|number, value: * }>, weekdaySync: object|null }}
 */
// eslint-disable-next-line import/prefer-default-export
export function resolveMassPriceChangeDispatch({
  id,
  weekday,
  rawValue,
  selectedRoomtypes = [],
  selectedWeekdays = [],
}) {
  const value = PriceAndRestrictionsService.parseAmount(rawValue, true);
  const priceEntries = [];
  let weekdaySync = null;

  if (!id && weekday) {
    const kind = weekday === PriceAndRestrictionsService.allWeekdayValue
      ? "allCategoriesAllDays"
      : "allCategoriesDay";
    priceEntries.push(...buildMassPriceCrossFillEntries({
      kind,
      weekday,
      value,
      selectedRoomtypeIds: selectedRoomtypes,
      selectedWeekdays,
    }));
    weekdaySync = {
      weekday,
      value,
      selectedWeekdays,
    };
  } else if (id && weekday) {
    if (weekday === PriceAndRestrictionsService.allWeekdayValue) {
      priceEntries.push(...buildMassPriceCrossFillEntries({
        kind: "categoryAllDays",
        roomtypeId: id,
        value,
        selectedWeekdays,
      }));
    } else {
      priceEntries.push({
        value,
        id,
        day: weekday,
      });
    }
  }

  return { priceEntries, weekdaySync };
}
