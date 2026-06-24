import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";

export const ALL_WEEKDAYS_COLUMN = PriceAndRestrictionsService.allWeekdayValue;

function cloneGrid(grid = {}) {
  const next = {};
  for (const [roomtypeId, byWeekday] of Object.entries(grid || {})) {
    next[roomtypeId] = { ...(byWeekday || {}) };
  }
  return next;
}

function setWeekdayValues(targetRow, weekdays, value, selectedWeekdays) {
  const allowed = new Set((selectedWeekdays || []).map(Number));
  for (const weekday of weekdays) {
    if (!allowed.has(Number(weekday))) {
      continue;
    }
    targetRow[String(weekday)] = value;
  }
}

/**
 * Cross-fill price weekday grid (parity with availability cross-fill-weekday-grid).
 *
 * @param {object} params
 * @param {"categoryAllDays"|"allCategoriesDay"|"allCategoriesAllDays"} params.kind
 * @param {string|number} [params.roomtypeId]
 * @param {number|string} [params.weekday] — 1-7 or "all"
 * @param {*} params.value
 * @param {number[]} [params.selectedRoomtypeIds]
 * @param {number[]} [params.selectedWeekdays]
 * @param {object} [grid] — { [roomtypeId]: { [weekday]: value } }
 * @returns {object}
 */
export function applyCrossFillToPriceGrid({
  kind,
  roomtypeId,
  weekday,
  value,
  selectedRoomtypeIds = [],
  selectedWeekdays = [],
}, grid = {}) {
  const next = cloneGrid(grid);
  const roomtypeKey = String(roomtypeId);

  if (kind === "categoryAllDays") {
    if (!next[roomtypeKey]) {
      next[roomtypeKey] = {};
    }
    setWeekdayValues(next[roomtypeKey], selectedWeekdays, value, selectedWeekdays);
    next[roomtypeKey][ALL_WEEKDAYS_COLUMN] = value;
    return next;
  }

  if (kind === "allCategoriesDay") {
    for (const id of selectedRoomtypeIds) {
      const key = String(id);
      if (!next[key]) {
        next[key] = {};
      }
      next[key][String(weekday)] = value;
    }
    return next;
  }

  if (kind === "allCategoriesAllDays") {
    for (const id of selectedRoomtypeIds) {
      const key = String(id);
      if (!next[key]) {
        next[key] = {};
      }
      setWeekdayValues(next[key], selectedWeekdays, value, selectedWeekdays);
      next[key][ALL_WEEKDAYS_COLUMN] = value;
    }
  }

  return next;
}

export { syncAllCategoriesWeekdays as syncAllCategoriesPriceWeekdays } from "../../../lib/tariff/sync-all-categories-weekdays.js";

/**
 * Build Vuex price entries for setMassiveUpdatingPrices from a cross-fill action.
 *
 * @param {object} params
 * @param {"categoryAllDays"|"allCategoriesDay"|"allCategoriesAllDays"|"singleCell"} params.kind
 * @param {string|number} [params.roomtypeId]
 * @param {number|string} [params.weekday]
 * @param {*} params.value
 * @param {number[]} [params.selectedRoomtypeIds]
 * @param {number[]} [params.selectedWeekdays]
 * @returns {Array<{ id: string|number, day: string|number, value: * }>}
 */
export function buildMassPriceCrossFillEntries({
  kind,
  roomtypeId,
  weekday,
  value,
  selectedRoomtypeIds = [],
  selectedWeekdays = [],
}) {
  const grid = applyCrossFillToPriceGrid({
    kind,
    roomtypeId,
    weekday,
    value,
    selectedRoomtypeIds,
    selectedWeekdays,
  }, {});

  const entries = [];
  for (const [id, byWeekday] of Object.entries(grid)) {
    for (const [day, dayValue] of Object.entries(byWeekday || {})) {
      entries.push({
        id, day, value: dayValue,
      });
    }
  }
  return entries;
}
