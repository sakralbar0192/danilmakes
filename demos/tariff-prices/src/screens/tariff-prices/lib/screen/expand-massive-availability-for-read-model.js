import moment from "moment";

const SENDING_FMT = "DD-MM-YYYY";
const READ_FMT = "YYYY-MM-DD";

function normalizeWeekdayKey(weekday) {
  return String(weekday);
}

function hasMassiveWeekdayValue(raw) {
  return raw !== "" && raw !== null && raw !== undefined;
}

/**
 * Expand massive availability (weekday grid) into read-model tree (roomtype → Y-m-d → int).
 * Port of Sales::_get_availability_array_from_massive.
 *
 * @param {Array<{date_from: string, date_to: string}>} datePeriods — d-m-Y
 * @param {Record<string, Record<string|number, number|string>>} availabilityMassive
 * @returns {Record<string, Record<string, number>>}
 */
// eslint-disable-next-line import/prefer-default-export
export function expandMassiveAvailabilityForReadModel(datePeriods = [], availabilityMassive = {}) {
  const merged = {};

  for (const period of datePeriods || []) {
    const dateFrom = moment(period.date_from, SENDING_FMT);
    const dateTo = moment(period.date_to, SENDING_FMT);
    if (!dateFrom.isValid() || !dateTo.isValid()) {
      continue;
    }

    const totalDays = dateTo.diff(dateFrom, "days") + 1;
    let day = dateFrom.isoWeekday();
    let cursor = dateFrom.clone();

    for (let i = 0; i < totalDays; i += 1) {
      const dateKey = cursor.format(READ_FMT);
      const weekdayKey = normalizeWeekdayKey(day);

      for (const [roomtypeId, byWeekday] of Object.entries(availabilityMassive || {})) {
        const raw = byWeekday?.[weekdayKey] ?? byWeekday?.[day];
        if (!hasMassiveWeekdayValue(raw)) {
          continue;
        }
        const value = Number(raw);
        if (!Number.isInteger(value) || value < 0) {
          continue;
        }
        if (!merged[roomtypeId]) {
          merged[roomtypeId] = {};
        }
        merged[roomtypeId][dateKey] = value;
      }

      day += 1;
      if (day > 7) {
        day = 1;
      }
      cursor = cursor.add(1, "day");
    }
  }

  return merged;
}
