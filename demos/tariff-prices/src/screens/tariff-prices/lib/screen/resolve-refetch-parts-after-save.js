/* eslint-disable no-use-before-define */
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { isEmptyObject } from "@/utils/object";
import { isExtraChargePriceId } from "../../components/table/lib/cell-identity.js";
import { buildSendingDataFromDraft } from "./build-price-save-sending-data.js";
import { buildPriceSaveRoutingContext } from "../tariff/price-save-layer.js";

export { buildSendingDataFromDraft };

const PART_ORDER = ["planPrices", "extra", "dynamic", "restrictions", "meta"];

function deletePricesTouchExtraPart(deletePrices = {}) {
  return classifyDeletePrices(deletePrices).hasExtra;
}

/**
 * @param {object} [deletePrices]
 * @returns {{ hasExtra: boolean, hasRegular: boolean }}
 */
export function classifyDeletePrices(deletePrices = {}) {
  let hasExtra = false;
  let hasRegular = false;
  for (const key of Object.keys(deletePrices || {})) {
    if (isExtraChargePriceId(String(key))) {
      hasExtra = true;
    } else {
      hasRegular = true;
    }
  }
  return { hasExtra, hasRegular };
}

function addPartsFromDeletePrices(parts, deletePrices = {}) {
  const { hasExtra, hasRegular } = classifyDeletePrices(deletePrices);
  if (hasExtra) {
    parts.add("extra");
  }
  if (hasRegular) {
    parts.add("planPrices");
  }
}

/**
 * Какие parts календаря перезапросить после успешного save по фактическим изменениям.
 *
 * @param {{
 *   updatingPrices?: object,
 *   pricesToDelete?: object,
 *   updatedRestrictions?: object,
 *   currentTariff?: object,
 *   isDynamicPricesModeEnabled?: boolean,
 *   isRmsPricingEnabled?: boolean,
 *   pricesCalendarModel?: object,
 *   roomtypes?: object[],
 *   sendingData?: object,
 *   isDependentTariff?: boolean,
 *   hasStayConflictMeta?: boolean,
 * }} context
 * @returns {string[]}
 */
export function resolveRefetchPartsAfterSave(context = {}) {
  const parts = new Set();
  const sendingData = context.sendingData || buildSendingDataFromDraft(context);

  // eslint-disable-next-line no-use-before-define
  collectRefetchPartsFromPriceDrafts({
    updatingPrices: context.updatingPrices,
    pricesToDelete: context.pricesToDelete,
  }).forEach((part) => parts.add(part));

  if (!isEmptyObject(sendingData.extra_charges)) {
    parts.add("extra");
  }
  if (!isEmptyObject(sendingData.prices)) {
    parts.add("planPrices");
  }
  if (!isEmptyObject(sendingData.delete_prices)) {
    addPartsFromDeletePrices(parts, sendingData.delete_prices);
  }
  if (!isEmptyObject(sendingData.dynamic_prices) || !isEmptyObject(sendingData.delete_dynamic_prices)) {
    parts.add("dynamic");
  }
  if (!isEmptyObject(sendingData.restrictions)) {
    parts.add("restrictions");
    if (context.isDependentTariff || context.hasStayConflictMeta) {
      parts.add("meta");
    }
  }
  if (!isEmptyObject(sendingData.availability)) {
    parts.add("meta");
  }

  return enrichRefetchPartsForSalesLayer(orderParts(parts), {
    isRmsPricingEnabled: context.isRmsPricingEnabled,
    isDynamicPricesModeEnabled: context.isDynamicPricesModeEnabled,
  });
}

/**
 * Тело POST /tariff/updatePrices (plan_id, price_massive, …), не payload дровера.
 */
export function isApiShapedPostPayload(sendingData = {}) {
  if (isMassDrawerSendingPayload(sendingData)) {
    return false;
  }
  return sendingData.plan_id != null && sendingData.plan_id !== "";
}

export function buildPriceLayerRoutingFromContext(context = {}) {
  if (
    typeof context.routePriceSaveLayer === "function"
    || typeof context.routePriceDeleteLayer === "function"
  ) {
    return {
      saveLayerCb: context.routePriceSaveLayer ?? null,
      deleteLayerCb: context.routePriceDeleteLayer ?? context.routePriceSaveLayer ?? null,
    };
  }
  return buildPriceSaveRoutingContext({
    planId: context.currentTariff?.id,
    roomtypes: context.roomtypes ?? [],
    model: context.pricesCalendarModel,
    isRmsPricingEnabled: context.isRmsPricingEnabled,
    isDynamicPricesModeEnabled: context.isDynamicPricesModeEnabled,
  });
}

/**
 * Единая точка выбора parts после save (mass drawer, footer, API-shape).
 *
 * @param {Parameters<typeof resolveRefetchPartsAfterSave>[0] & {
 *   sendingData?: object|null,
 *   routePriceSaveLayer?: ((planId: unknown, roomtypeId: unknown) => boolean)|null,
 * }} context
 * @returns {string[]}
 */
export function resolveRefetchPartsForSave(context = {}) {
  const { sendingData = null } = context;
  const enrichOpts = {
    isRmsPricingEnabled: context.isRmsPricingEnabled,
    isDynamicPricesModeEnabled: context.isDynamicPricesModeEnabled,
  };

  if (sendingData && isMassDrawerSendingPayload(sendingData)) {
    const { saveLayerCb, deleteLayerCb } = buildPriceLayerRoutingFromContext(context);
    return resolveRefetchPartsFromMassDrawerPayload(sendingData, {
      routePriceSaveLayer: saveLayerCb,
      routePriceDeleteLayer: deleteLayerCb,
      ...enrichOpts,
    });
  }

  if (sendingData && isApiShapedPostPayload(sendingData)) {
    return enrichRefetchPartsForSalesLayer(
      resolveRefetchPartsFromSendingData(sendingData),
      enrichOpts,
    );
  }

  return resolveRefetchPartsAfterSave(context);
}

/**
 * Parts из черновиков цен/удалений (в т.ч. наценки extra charge по dataId).
 *
 * @param {{ updatingPrices?: object, pricesToDelete?: object }} args
 * @returns {string[]}
 */
export function collectRefetchPartsFromPriceDrafts({
  updatingPrices = {},
  pricesToDelete = {},
} = {}) {
  const parts = new Set();
  const extraField = PriceAndRestrictionsService.updatingExtraChargesPricesFieldName;

  for (const room of Object.values(updatingPrices || {})) {
    if (room && typeof room === "object" && !isEmptyObject(room[extraField])) {
      parts.add("extra");
      break;
    }
  }

  for (const dataId of Object.keys(pricesToDelete || {})) {
    if (isExtraChargePriceId(dataId)) {
      parts.add("extra");
    }
  }

  return [...parts];
}

/**
 * Parts для refetch по телу POST (в т.ч. массовое сохранение).
 *
 * @param {object} sendingData
 * @returns {string[]}
 */
/**
 * Payload дровера массовых цен (до преобразования в тело API).
 *
 * @param {object} sendingData
 * @returns {boolean}
 */
export function isMassDrawerSendingPayload(sendingData = {}) {
  const tariffId = sendingData?.tariffId;
  if (tariffId == null || tariffId === "") {
    return false;
  }
  return Boolean(
    sendingData.periods
    || sendingData.prices
    || sendingData.pricesToDelete
    || sendingData.roomtypes,
  );
}

/**
 * Parts refetch по payload дровера «Изменение цен на период».
 *
 * @param {object} sendingData
 * @param {{
 *   routePriceSaveLayer?: ((planId: unknown, roomtypeId: unknown) => boolean)|null,
 *   routePriceDeleteLayer?: ((planId: unknown, roomtypeId: unknown, date: string) => boolean)|null,
 *   isRmsPricingEnabled?: boolean,
 *   isDynamicPricesModeEnabled?: boolean,
 * }} [options]
 * @returns {string[]}
 */
export function resolveRefetchPartsFromMassDrawerPayload(
  sendingData = {},
  {
    routePriceSaveLayer = null,
    routePriceDeleteLayer = null,
    isRmsPricingEnabled = false,
    isDynamicPricesModeEnabled = false,
  } = {},
) {
  const enrichOpts = { isRmsPricingEnabled, isDynamicPricesModeEnabled };
  const deleteLayerCb = routePriceDeleteLayer ?? routePriceSaveLayer;

  if (sendingData.pricesToDelete && !isEmptyObject(sendingData.pricesToDelete)) {
    const parts = new Set();
    Object.entries(sendingData.pricesToDelete).forEach(([entityId, dates]) => {
      if (isExtraChargePriceId(String(entityId))) {
        parts.add("extra");
        return;
      }
      parts.add("planPrices");
      if (routePriceSaveLayer?.(sendingData.tariffId, entityId)) {
        parts.add("dynamic");
        return;
      }
      if (isDynamicPricesModeEnabled) {
        const touchesDynamicDelete = (dates || []).some(
          (date) => deleteLayerCb?.(sendingData.tariffId, entityId, date),
        );
        if (touchesDynamicDelete) {
          parts.add("dynamic");
        }
      }
    });
    return enrichRefetchPartsAfterMassPriceSave(orderParts(parts), enrichOpts);
  }

  const apiShape = PriceAndRestrictionsService.buildMassivePricesSendingData(
    sendingData,
    routePriceSaveLayer,
  );
  return enrichRefetchPartsAfterMassPriceSave(
    resolveRefetchPartsFromSendingData(apiShape),
    enrichOpts,
  );
}

/**
 * Для RMS после mass save на слое продаж подгружаем planPrices и dynamic вместе:
 * planPrices — plan_prices + prices_all, dynamic — rms_prices_all (таблица читает оба слоя).
 *
 * @param {string[]} parts
 * @param {{ isRmsPricingEnabled?: boolean, isDynamicPricesModeEnabled?: boolean }} [options]
 * @returns {string[]}
 */
export function enrichRefetchPartsAfterMassPriceSave(
  parts = [],
  { isRmsPricingEnabled = false, isDynamicPricesModeEnabled = false } = {},
) {
  const set = new Set(parts);
  if (
    isRmsPricingEnabled
    && isDynamicPricesModeEnabled
    && (set.has("dynamic") || set.has("planPrices"))
  ) {
    set.add("planPrices");
    set.add("dynamic");
  }
  return orderParts(set);
}

/** Alias: enrich для footer-save и mass на слое «Цена продажи». */
export const enrichRefetchPartsForSalesLayer = enrichRefetchPartsAfterMassPriceSave;

export function resolveRefetchPartsFromSendingData(sendingData = {}) {
  const parts = new Set();

  if (
    !isEmptyObject(sendingData.extra_charges)
    || (Array.isArray(sendingData.extra_charges_ids) && sendingData.extra_charges_ids.length)
    || deletePricesTouchExtraPart(sendingData.delete_prices)
  ) {
    parts.add("extra");
  }
  if (
    !isEmptyObject(sendingData.prices)
    || !isEmptyObject(sendingData.price_massive)
    || (Array.isArray(sendingData.roomtype_ids) && sendingData.roomtype_ids.length)
    || classifyDeletePrices(sendingData.delete_prices).hasRegular
  ) {
    parts.add("planPrices");
  }
  if (
    !isEmptyObject(sendingData.dynamic_prices)
    || !isEmptyObject(sendingData.delete_dynamic_prices)
    || !isEmptyObject(sendingData.dynamic_price_massive)
    || (Array.isArray(sendingData.dynamic_roomtype_ids) && sendingData.dynamic_roomtype_ids.length)
  ) {
    parts.add("dynamic");
  }
  if (
    !isEmptyObject(sendingData.restrictions)
    || !isEmptyObject(sendingData.restrictions_massive)
  ) {
    parts.add("restrictions");
  }
  if (!isEmptyObject(sendingData.availability)) {
    parts.add("meta");
  }

  return orderParts(parts);
}

function orderParts(parts) {
  return PART_ORDER.filter((part) => parts.has(part));
}
