import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import arrayHelpers from "@/utils/array-helpers";
import { buildPriceSaveRoutingContext } from "../tariff/price-save-layer.js";

/** Ответ API: конфликт min/max stay при сохранении ограничений */
export const STAY_MIN_MAX_API_ERROR_MESSAGE = "restriction.maxstay.greaterThanOrEqual; restriction.minstay.greaterThanOrEqual";

export function hasUnacceptablePrices(unacceptablePrices) {
  return Object.keys(unacceptablePrices || {}).length > 0;
}

/**
 * Есть ли даты с конфликтом min/max stay из `defineUnacceptableRestrictions` (в т.ч. родитель → дочерние тарифы).
 * @param {Record<string, Record<string, string[]>>} unacceptableRestrictions — roomtypeId → date → типы ограничений
 */
export function hasUnacceptableRestrictions(unacceptableRestrictions) {
  if (!unacceptableRestrictions || typeof unacceptableRestrictions !== "object") {
    return false;
  }
  return Object.values(unacceptableRestrictions).some((byDate) => byDate && typeof byDate === "object"
    && Object.values(byDate).some((types) => Array.isArray(types) && types.length > 0));
}

/**
 * Timestamps дат для диалога конфликта stay по карте из стора `unacceptableRestrictions`.
 * @param {Record<string, Record<string, string[]>>} unacceptableRestrictions
 * @returns {Set<number>}
 */
export function buildInvalidStayTimestampsFromUnacceptableRestrictions(unacceptableRestrictions = {}) {
  const timestamps = new Set();
  for (const byDate of Object.values(unacceptableRestrictions || {})) {
    if (!byDate || typeof byDate !== "object") {
      continue;
    }
    for (const [date, types] of Object.entries(byDate)) {
      if (Array.isArray(types) && types.length > 0) {
        timestamps.add(new Date(date).getTime());
      }
    }
  }
  return timestamps;
}

/**
 * Объединённые timestamps дат с конфликтом min/max stay: черновик ограничений + карта зависимых тарифов.
 * @param {{
 *   pricesCalendarModel: object,
 *   updatedRestrictions: object,
 *   unacceptableRestrictions: Record<string, Record<string, string[]>>,
 * }} args
 * @returns {Set<number>}
 */
export function mergeStayConflictTimestamps({
  pricesCalendarModel,
  updatedRestrictions,
  unacceptableRestrictions,
}) {
  const fromDraft = PriceAndRestrictionsService.getInvalidStayCombinationTimestampsInUpdatedRestrictions(
    pricesCalendarModel,
    updatedRestrictions,
  );
  const fromDependents = buildInvalidStayTimestampsFromUnacceptableRestrictions(unacceptableRestrictions);
  return new Set([...fromDraft, ...fromDependents]);
}

/**
 * Фрагмент HTML с именами категорий для диалога «невозможно изменить стоимость».
 * @param {string[]} roomtypeIds
 * @param {(id: string) => string|undefined} getRoomtypeName
 */
export function buildUnacceptablePriceCategoryTags(roomtypeIds, getRoomtypeName) {
  return roomtypeIds.map((roomtypeId) => {
    const name = getRoomtypeName(roomtypeId);
    return `<b><${name ?? ""}></b>`;
  }).join(", ");
}

/**
 * Тело запроса сохранения цен/ограничений из состояния экрана.
 */
export function buildUpdatePricesPayload({
  updatingPrices,
  currentTariff,
  pricesToDelete,
  updatedRestrictions,
  updatingAvailability = {},
}) {
  return {
    prices: updatingPrices,
    tariffId: currentTariff.id,
    pricesToDelete,
    updatedRestrictions,
    updatingAvailability,
    hasDefaultMinstayRestriction: Boolean(currentTariff?.has_default_restriction),
  };
}

/**
 * Последовательная валидация перед сохранением с early-exit.
 * Каждый checker должен вернуть boolean (или Promise<boolean>).
 */
export async function runSaveValidationSequence({
  checkNullishPrice,
  checkUnacceptablePrices,
  checkInvalidRestrictionStays,
}) {
  return await checkNullishPrice()
    && await checkUnacceptablePrices()
    && await checkInvalidRestrictionStays();
}

/**
 * Отправка сохранения цен/ограничений в API.
 * @returns {Promise<{ response: object, sendingData: object }>}
 */
export async function requestUpdatePrices({
  updatingPrices,
  currentTariff,
  pricesToDelete,
  updatedRestrictions,
  updatingAvailability = {},
  isDynamicPricesModeEnabled,
  isRmsPricingEnabled,
  pricesCalendarModel,
  roomtypes,
}) {
  const data = buildUpdatePricesPayload({
    updatingPrices,
    currentTariff,
    pricesToDelete,
    updatedRestrictions,
    updatingAvailability,
  });
  const { saveLayerCb, deleteLayerCb } = buildPriceSaveRoutingContext({
    planId: currentTariff?.id,
    roomtypes,
    model: pricesCalendarModel,
    isRmsPricingEnabled,
    isDynamicPricesModeEnabled,
  });
  const subrooms = arrayHelpers.toMap(roomtypes, "id", (room) => room.subrooms.map(it => it.id));
  const sendingData = PriceAndRestrictionsService.buildUpdatePricesSendingData(data, {
    routePriceSaveLayer: saveLayerCb,
    routePriceDeleteLayer: deleteLayerCb,
    subrooms,
  });
  const response = await PriceAndRestrictionsService.postUpdatePricesSendingData(sendingData);
  return { response, sendingData };
}

export function isStayMinMaxApiError(response) {
  return response?.error?.message === STAY_MIN_MAX_API_ERROR_MESSAGE;
}
