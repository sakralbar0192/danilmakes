import { isEmptyObject } from "@/utils/object";
import { isMassDrawerSendingPayload } from "./resolve-refetch-parts-after-save.js";

function hasNonEmptyObject(value) {
  return value && typeof value === "object" && !isEmptyObject(value);
}

function hasNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Какие виды черновиков затронуты успешным save по телу запроса.
 *
 * @param {object|null|undefined} sendingData
 * @returns {{ prices: boolean, restrictions: boolean, availability: boolean }}
 */
// eslint-disable-next-line import/prefer-default-export
export function resolveTouchedDraftKinds(sendingData = null) {
  if (!sendingData) {
    return {
      prices: false, restrictions: false, availability: false,
    };
  }

  if (isMassDrawerSendingPayload(sendingData)) {
    const prices = Boolean(
      hasNonEmptyObject(sendingData.prices)
      || hasNonEmptyObject(sendingData.pricesToDelete)
      || hasNonEmptyArray(sendingData.periods)
      || hasNonEmptyArray(sendingData.roomtypes)
      || sendingData.priceDiff,
    );
    return {
      prices, restrictions: false, availability: false,
    };
  }

  const prices = Boolean(
    hasNonEmptyObject(sendingData.prices)
    || hasNonEmptyObject(sendingData.delete_prices)
    || hasNonEmptyObject(sendingData.dynamic_prices)
    || hasNonEmptyObject(sendingData.delete_dynamic_prices)
    || hasNonEmptyObject(sendingData.extra_charges)
    || hasNonEmptyObject(sendingData.price_massive)
    || hasNonEmptyObject(sendingData.dynamic_price_massive)
    || hasNonEmptyArray(sendingData.roomtype_ids)
    || hasNonEmptyArray(sendingData.dynamic_roomtype_ids)
    || hasNonEmptyArray(sendingData.extra_charges_ids),
  );

  const restrictions = Boolean(
    hasNonEmptyObject(sendingData.restrictions)
    || hasNonEmptyObject(sendingData.restrictions_massive),
  );

  const availability = Boolean(hasNonEmptyObject(sendingData.availability));

  return {
    prices, restrictions, availability,
  };
}
