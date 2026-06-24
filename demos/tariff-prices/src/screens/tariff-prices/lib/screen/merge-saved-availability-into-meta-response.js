import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { isEmptyObject } from "@/utils/object";

/**
 * Overlay saved availability from POST body over stale GET meta response.
 *
 * @param {object} [response]
 * @param {object} [savedAvailability]
 * @returns {object}
 */
// eslint-disable-next-line import/prefer-default-export
export function mergeSavedAvailabilityIntoMetaResponse(response = {}, savedAvailability = {}) {
  if (isEmptyObject(savedAvailability)) {
    return response;
  }

  const metaKey = PriceAndRestrictionsService.availabilityReadModelMetaKey;
  const mergedAvailability = {};

  for (const [roomtypeId, byDate] of Object.entries(response.availability || {})) {
    mergedAvailability[roomtypeId] = { ...(byDate || {}) };
  }

  for (const [roomtypeId, byDate] of Object.entries(savedAvailability)) {
    if (!mergedAvailability[roomtypeId]) {
      mergedAvailability[roomtypeId] = {};
    }
    for (const [date, value] of Object.entries(byDate || {})) {
      if (date === metaKey) {
        continue;
      }
      mergedAvailability[roomtypeId][date] = value;
    }
  }

  return {
    ...response,
    availability: mergedAvailability,
  };
}
