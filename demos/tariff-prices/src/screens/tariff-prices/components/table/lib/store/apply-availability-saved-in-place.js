import TariffPricesCalendarModel from "@/models/tariff/prices-calendar-model";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { isEmptyObject } from "@/utils/object";

function mergeAvailabilityTrees(baseAvailability = {}, savedAvailability = {}) {
  const metaKey = PriceAndRestrictionsService.availabilityReadModelMetaKey;
  const merged = {};

  for (const [roomtypeId, byDate] of Object.entries(baseAvailability || {})) {
    merged[roomtypeId] = { ...(byDate || {}) };
  }

  for (const [roomtypeId, byDate] of Object.entries(savedAvailability || {})) {
    if (!merged[roomtypeId]) {
      merged[roomtypeId] = {};
    }
    for (const [date, value] of Object.entries(byDate || {})) {
      if (date === metaKey) {
        continue;
      }
      merged[roomtypeId][date] = value;
    }
  }

  return merged;
}

/**
 * Patch read-model availability after successful save (before/after stale meta refetch).
 *
 * @param {import("@/models/tariff/prices-calendar-model").default|null|undefined} model
 * @param {object} [savedAvailability]
 */
// eslint-disable-next-line import/prefer-default-export
export function applyAvailabilitySavedInPlace(model, savedAvailability = {}) {
  if (!model || isEmptyObject(savedAvailability)) {
    return;
  }

  model._availabilityCache?.clear?.();
  model.availability = TariffPricesCalendarModel.formatAvailability(
    mergeAvailabilityTrees(model.availability, savedAvailability),
  );
}
