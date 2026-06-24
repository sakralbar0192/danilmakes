import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { parsePriceId } from "../cell-identity.js";

export function updateUnacceptableIndex(index = {}, price = {
  id: "", day: "", value: "",
}, discountAmount = 0) {
  const {
    roomtypeId, childrenAgeId, bedTypeId,
  } = parsePriceId(price.id);
  if (!roomtypeId || !price?.day || (childrenAgeId && bedTypeId)) {
    return index;
  }

  const nextIndex = { ...(index || {}) };
  const roomIndex = { ...(nextIndex[roomtypeId] || {}) };
  const isUnacceptable = price.day !== PriceAndRestrictionsService.allWeekdayValue
    && price.value !== ""
    && Number(price.value || 0) < Math.abs(Number(discountAmount));

  if (isUnacceptable) {
    roomIndex[price.day] = true;
  } else {
    delete roomIndex[price.day];
  }

  if (Object.keys(roomIndex).length) {
    nextIndex[roomtypeId] = roomIndex;
  } else {
    delete nextIndex[roomtypeId];
  }

  return nextIndex;
}

export function convertUnacceptableIndexToState(index = {}) {
  return Object.entries(index).reduce((acc, [roomtypeId, daysMap]) => {
    const days = Object.keys(daysMap || {});
    if (days.length) {
      acc[roomtypeId] = days;
    }
    return acc;
  }, {});
}
