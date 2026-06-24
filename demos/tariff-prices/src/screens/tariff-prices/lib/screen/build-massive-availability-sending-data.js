import moment from "moment";
import { isEmptyObject } from "@/utils/object";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { expandMassiveAvailabilityForReadModel } from "./expand-massive-availability-for-read-model.js";

const SENDING_FMT = "DD-MM-YYYY";
const VALUE_FMT = "YYYY-MM-DD";

function isFilledCellValue(raw) {
  return raw !== "" && raw !== null && raw !== undefined;
}

function normalizeAvailabilityValue(raw) {
  const num = Number(raw);
  if (!Number.isInteger(num) || num < 0) {
    throw new Error("availability.invalid");
  }
  return PriceAndRestrictionsService.formatAvailabilityValueForServer(num);
}

/**
 * Build drawer/API payload for POST /tariff/updateMassiveAvailability.
 *
 * @param {object} data
 * @param {Array<{ period: string[], uid?: string }>} data.periods
 * @param {number[]|string[]} data.roomtypes
 * @param {number[]} data.weekdays
 * @param {Record<string, Record<string|number, *>>} data.grid
 * @returns {{ datePeriods: object[], availabilityMassive: object, availability: object }}
 */
// eslint-disable-next-line import/prefer-default-export
export function buildMassiveAvailabilitySendingData(data = {}) {
  const selectedRoomtypes = new Set((data.roomtypes || []).map(String));
  const selectedWeekdays = new Set((data.weekdays || []).map(String));

  const datePeriods = (data.periods || []).map((item) => ({
    date_from: moment(item.period[0], VALUE_FMT).format(SENDING_FMT),
    date_to: moment(item.period[1], VALUE_FMT).format(SENDING_FMT),
  }));

  const availabilityMassive = {};
  for (const [roomtypeId, byWeekday] of Object.entries(data.grid || {})) {
    if (!selectedRoomtypes.has(String(roomtypeId))) {
      continue;
    }
    for (const [weekday, raw] of Object.entries(byWeekday || {})) {
      if (!selectedWeekdays.has(String(weekday))) {
        continue;
      }
      if (!isFilledCellValue(raw)) {
        continue;
      }
      if (!availabilityMassive[roomtypeId]) {
        availabilityMassive[roomtypeId] = {};
      }
      availabilityMassive[roomtypeId][String(weekday)] = normalizeAvailabilityValue(raw);
    }
  }

  if (!datePeriods.length) {
    throw new Error("availability.periods.empty");
  }
  if (isEmptyObject(availabilityMassive)) {
    throw new Error("availability.massive.empty");
  }

  return {
    datePeriods,
    availabilityMassive,
    availability: expandMassiveAvailabilityForReadModel(datePeriods, availabilityMassive),
  };
}
