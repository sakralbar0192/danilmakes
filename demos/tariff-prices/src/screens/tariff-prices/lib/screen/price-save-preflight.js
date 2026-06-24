import { isExtraChargePriceId } from "../../components/table/lib/cell-identity.js";
import { buildPriceSaveRoutingContext } from "../tariff/price-save-layer.js";

/**
 * Есть ли среди сущностей хотя бы одна, чьи цены пойдут в dynamic_prices.
 * @param {string[]} roomtypeIds — ключи roomtype / subroom / "roomtype_children_bed" (берётся первый сегмент)
 */
export function massSaveTouchesDynamicLayer(roomtypeIds, routePriceSaveLayer, tariffId) {
  if (typeof routePriceSaveLayer !== "function" || tariffId == null) {
    return false;
  }
  return (roomtypeIds || []).some((id) => {
    const [roomtypeId] = String(id).split("_");
    return routePriceSaveLayer(tariffId, roomtypeId);
  });
}

/**
 * Есть ли удаление хотя бы на одной дате в delete_dynamic_prices.
 */
export function deleteSaveTouchesDynamicLayer(pricesToDelete, deleteLayerCb, tariffId) {
  if (typeof deleteLayerCb !== "function" || tariffId == null) {
    return false;
  }
  return Object.entries(pricesToDelete || {}).some(([entityId, dates]) => {
    if (isExtraChargePriceId(String(entityId))) {
      return false;
    }
    return (dates || []).some((date) => deleteLayerCb(tariffId, entityId, date));
  });
}

/**
 * Save (per-category) или delete (per-date) затронут dynamic_prices / delete_dynamic_prices.
 */
export function priceSaveTouchesDynamicLayer({
  entityIds = null,
  updatingPrices = {},
  pricesToDelete = {},
  saveLayerCb,
  deleteLayerCb,
  tariffId,
} = {}) {
  // eslint-disable-next-line no-use-before-define
  const ids = entityIds ?? collectPriceEntityIdsForLayerCheck({
    updatingPrices,
    pricesToDelete,
  });
  if (massSaveTouchesDynamicLayer(ids, saveLayerCb, tariffId)) {
    return true;
  }
  return deleteSaveTouchesDynamicLayer(pricesToDelete, deleteLayerCb, tariffId);
}

/**
 * Id сущностей из черновиков для проверки dynamic-слоя перед save.
 */
export function collectPriceEntityIdsForLayerCheck({
  updatingPrices = {},
  pricesToDelete = {},
} = {}) {
  const ids = new Set();
  Object.keys(updatingPrices).forEach((id) => ids.add(id));
  Object.keys(pricesToDelete).forEach((id) => ids.add(id));
  return [...ids];
}

/**
 * Догружает part `dynamic`, если save или delete затронет dynamic-слой.
 */
export async function ensureDynamicPartBeforePriceSave({
  ensureDynamicLoaded,
  entityIds = null,
  updatingPrices = {},
  pricesToDelete = {},
  currentTariff,
  roomtypes = [],
  pricesCalendarModel,
  isRmsPricingEnabled = false,
  isDynamicPricesModeEnabled = false,
}) {
  if (!isRmsPricingEnabled || !isDynamicPricesModeEnabled || typeof ensureDynamicLoaded !== "function") {
    return;
  }
  const { saveLayerCb, deleteLayerCb } = buildPriceSaveRoutingContext({
    planId: currentTariff?.id,
    roomtypes,
    model: pricesCalendarModel,
    isRmsPricingEnabled,
    isDynamicPricesModeEnabled,
  });
  const ids = entityIds ?? collectPriceEntityIdsForLayerCheck({
    updatingPrices,
    pricesToDelete,
  });
  if (priceSaveTouchesDynamicLayer({
    entityIds: ids,
    updatingPrices,
    pricesToDelete,
    saveLayerCb,
    deleteLayerCb,
    tariffId: currentTariff?.id,
  })) {
    await ensureDynamicLoaded();
  }
}
