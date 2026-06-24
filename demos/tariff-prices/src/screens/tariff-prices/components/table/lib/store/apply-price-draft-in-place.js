import Vue from "@/shims/vue2-compat";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { parsePriceId } from "../cell-identity.js";
import { getPriceDraftKey } from "./price-draft-index.js";
import { updateUnacceptableIndex } from "./unacceptable-price-index.js";

/**
 * Удаляет день из pricesToDelete[id] in-place (Vue 2 реактивность).
 */
export function applyRemovePriceDayFromPricesToDelete(state, price = { id: "", day: "" }) {
  const { id, day } = price;
  if (!id || !day) return;
  const arr = (state.pricesToDelete[id] || []).filter(d => d !== day);
  if (arr.length) {
    Vue.set(state.pricesToDelete, id, arr);
  } else {
    Vue.delete(state.pricesToDelete, id);
  }
}

export function applySetUpdatingPriceValueInPlace(state, price = {
  id: "", day: "", value: "",
}) {
  const {
    roomtypeId, childrenAgeId, bedTypeId,
  } = parsePriceId(price.id);
  if (!roomtypeId || !price?.day) {
    return;
  }

  if (!state.updatingPrices[roomtypeId]) {
    Vue.set(state.updatingPrices, roomtypeId, {});
  }
  const room = state.updatingPrices[roomtypeId];

  if (childrenAgeId && bedTypeId) {
    const extraChargeKey = PriceAndRestrictionsService.updatingExtraChargesPricesFieldName;
    if (!room[extraChargeKey]) {
      Vue.set(room, extraChargeKey, {});
    }
    const ec = room[extraChargeKey];
    if (!ec[childrenAgeId]) {
      Vue.set(ec, childrenAgeId, {});
    }
    const ch = ec[childrenAgeId];
    if (!ch[bedTypeId]) {
      Vue.set(ch, bedTypeId, {});
    }
    Vue.set(ch[bedTypeId], price.day, String(price.value));
  } else {
    Vue.set(room, price.day, String(price.value));
  }
}

export function applyRemoveUpdatingPriceValueInPlace(state, price = { id: "", day: "" }) {
  const {
    roomtypeId, childrenAgeId, bedTypeId,
  } = parsePriceId(price.id);
  if (!roomtypeId || !price?.day || !state.updatingPrices[roomtypeId]) {
    return;
  }

  const room = state.updatingPrices[roomtypeId];

  if (childrenAgeId && bedTypeId) {
    const extraChargeKey = PriceAndRestrictionsService.updatingExtraChargesPricesFieldName;
    const ec = room[extraChargeKey];
    if (!ec?.[childrenAgeId]?.[bedTypeId]) {
      return;
    }
    const bedBranch = ec[childrenAgeId][bedTypeId];
    Vue.delete(bedBranch, price.day);
    if (!Object.keys(bedBranch).length) {
      Vue.delete(ec[childrenAgeId], bedTypeId);
      if (!Object.keys(ec[childrenAgeId]).length) {
        Vue.delete(ec, childrenAgeId);
      }
      if (!Object.keys(ec).length) {
        Vue.delete(room, extraChargeKey);
      }
    }
  } else {
    Vue.delete(room, price.day);
  }

  if (!Object.keys(room).length) {
    Vue.delete(state.updatingPrices, roomtypeId);
  }
}

export function applyPriceDraftIndexKey(state, price = {
  id: "", day: "", value: "",
}) {
  const k = getPriceDraftKey(price.id, price.day);
  Vue.set(state.priceDraftIndex, k, String(price.value));
}

export function applyRemovePriceDraftIndexKey(state, price = { id: "", day: "" }) {
  Vue.delete(state.priceDraftIndex, getPriceDraftKey(price.id, price.day));
}

/**
 * Синхронизирует только ветку unacceptableIndex для roomtypeId, затронутого price.
 */
export function applyUnacceptableIndexForPriceInPlace(state, price, discountAmount) {
  const nextFull = updateUnacceptableIndex(
    state.unacceptableIndex,
    price,
    discountAmount,
  );
  const {
    roomtypeId, childrenAgeId, bedTypeId,
  } = parsePriceId(price.id);
  if (!roomtypeId || (childrenAgeId && bedTypeId)) {
    return;
  }

  const nextRoom = nextFull[roomtypeId];
  if (nextRoom && Object.keys(nextRoom).length) {
    Vue.set(state.unacceptableIndex, roomtypeId, { ...nextRoom });
  } else if (state.unacceptableIndex[roomtypeId]) {
    Vue.delete(state.unacceptableIndex, roomtypeId);
  }
  state.unacceptableIndexEpoch = (state.unacceptableIndexEpoch || 0) + 1;
}
