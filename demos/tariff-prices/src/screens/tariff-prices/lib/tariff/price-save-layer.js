import { buildRmsSalesLayerCellContext } from "@/models/tariff/rms-cell-context";
import { isDynamicLayerRmsManualCell } from "@/models/tariff/rms-manual-override";
import { normalizeRmsPricesRuleSource } from "@/models/tariff/rms-rule-source";
import { isExtraChargesCategoryRoomtype,
  roomtypeHasChildrenAgesMarkupRows,
  roomtypesHaveExtraChargesCategory } from "@/services/tariff/extra-charges";
import { resolveBpRuleRoomtypeId } from "../flat-roomtypes.js";

export {
  isExtraChargesCategoryRoomtype,
  normalizeRmsPricesRuleSource,
  roomtypeHasChildrenAgesMarkupRows,
  roomtypesHaveExtraChargesCategory,
};

/** Категория исключена из БП (чекбокс в настройках категории). */
export function isRmsExcludedRoomtype(roomtype) {
  return Boolean(roomtype?.extra?.excluded);
}

/**
 * Тип БП на отеле: object-level (загрузка объекта) vs category-level (загрузка категории).
 * Источник — любое правило type=prices (`rmsPricesRuleSource`), не список категорий БП.
 */
export function resolveRmsRuleScope({ rmsPricesRuleSource } = {}) {
  const source = normalizeRmsPricesRuleSource(rmsPricesRuleSource);
  if (source === "object") {
    return {
      scope: "object", objectLevel: true, categoryLevel: false,
    };
  }
  if (source === "roomtype") {
    return {
      scope: "category", objectLevel: false, categoryLevel: true,
    };
  }
  return {
    scope: null, objectLevel: false, categoryLevel: true,
  };
}

/**
 * Запись основной цены категории (не extra_charge) в dynamic_prices vs prices.
 * @returns {boolean} true → dynamic_prices
 */
export function shouldWriteMainPriceToDynamicLayer({
  planId,
  roomtypeId,
  roomtypes,
  model,
  rmsPricesRuleSource,
  isRmsPricingEnabled,
  isDynamicPricesModeEnabled,
}) {
  if (!isRmsPricingEnabled || !isDynamicPricesModeEnabled) {
    return false;
  }
  const ruleRoomtypeId = resolveBpRuleRoomtypeId(roomtypes, roomtypeId);
  if (!ruleRoomtypeId) {
    return false;
  }
  const parentRoomtype = roomtypes.find((r) => String(r.id) === ruleRoomtypeId);
  if (!parentRoomtype || isRmsExcludedRoomtype(parentRoomtype)) {
    return false;
  }
  const { objectLevel } = resolveRmsRuleScope({ rmsPricesRuleSource });
  if (objectLevel) {
    return true;
  }
  return model?.isCategoryHasDynamicRule?.(planId, ruleRoomtypeId) === true;
}

/**
 * UI: категория пишет в dynamic_prices при редактировании (синхрон с save routing).
 * @returns {boolean}
 */
export function resolveCategoryWritesToDynamicLayer(params) {
  return shouldWriteMainPriceToDynamicLayer(params);
}

/**
 * Пара callbacks для save/delete слоёв цен (экран, mass-update, reset dependent).
 * @returns {{ saveLayerCb: Function|null, deleteLayerCb: Function|null }}
 */
/**
 * Маршрутизация слоёв цен для mass drawer / refetch (обёртка над buildPriceLayerCallbacks).
 *
 * @param {Parameters<typeof buildPriceLayerCallbacks>[0]} params
 * @returns {{ saveLayerCb: Function|null, deleteLayerCb: Function|null }}
 */
export function buildMassPriceLayerRoutingContext(params) {
  // eslint-disable-next-line no-use-before-define
  return buildPriceSaveRoutingContext(params);
}

/**
 * @param {{ date: string, weekday?: string|number }[]} [calendar]
 * @returns {Map<string, string|number>}
 */
export function buildWeekdayByDateMap(calendar = []) {
  return new Map((calendar || []).map((day) => [day.date, day.weekday]));
}

/**
 * Календарь + callbacks маршрутизации save/delete слоёв цен.
 *
 * @param {Parameters<typeof buildPriceLayerCallbacks>[0] & { calendar?: object[] }} params
 * @returns {{ weekdayByDate: Map<string, string|number>, saveLayerCb: Function|null, deleteLayerCb: Function|null }}
 */
export function buildPriceSaveRoutingContext({
  planId,
  roomtypes = [],
  model,
  rmsPricesRuleSource,
  isRmsPricingEnabled,
  isDynamicPricesModeEnabled,
  calendar,
  getWeekdayForDate: getWeekdayForDateParam,
} = {}) {
  const weekdayByDate = getWeekdayForDateParam
    ? null
    : buildWeekdayByDateMap(calendar ?? model?.calendar ?? []);
  const getWeekdayForDate = getWeekdayForDateParam
    ?? ((date) => weekdayByDate.get(date) ?? null);
  // eslint-disable-next-line no-use-before-define
  const callbacks = buildPriceLayerCallbacks({
    planId,
    roomtypes,
    model,
    rmsPricesRuleSource: rmsPricesRuleSource ?? model?.rmsPricesRuleSource ?? null,
    isRmsPricingEnabled,
    isDynamicPricesModeEnabled,
    getWeekdayForDate,
  });
  return {
    weekdayByDate: weekdayByDate ?? new Map(),
    ...callbacks,
  };
}

export function buildPriceLayerCallbacks({
  planId,
  roomtypes = [],
  model,
  rmsPricesRuleSource,
  isRmsPricingEnabled,
  isDynamicPricesModeEnabled,
  getWeekdayForDate,
}) {
  return {
    saveLayerCb: createPriceDynamicLayerCallback({
      planId,
      roomtypes,
      model,
      rmsPricesRuleSource,
      isRmsPricingEnabled,
      isDynamicPricesModeEnabled,
    }),
    deleteLayerCb: createPriceDeleteLayerCallback({
      planId,
      model,
      isRmsPricingEnabled,
      isDynamicPricesModeEnabled,
      getWeekdayForDate,
    }),
  };
}

/**
 * Callback для preparePricesForSaving / updateMassivePrices.
 * `null` — все цены в `prices` / `delete_prices` (RMS выключен или режим не «динамические цены»).
 */
export function createPriceDynamicLayerCallback({
  planId,
  roomtypes = [],
  model,
  rmsPricesRuleSource,
  isRmsPricingEnabled,
  isDynamicPricesModeEnabled,
}) {
  if (!isRmsPricingEnabled) {
    return null;
  }
  if (!isDynamicPricesModeEnabled) {
    return null;
  }
  const resolvedSource = rmsPricesRuleSource ?? model?.rmsPricesRuleSource ?? null;
  return (tariffId, roomtypeId) => shouldWriteMainPriceToDynamicLayer({
    planId: tariffId || planId,
    roomtypeId,
    roomtypes,
    model,
    rmsPricesRuleSource: resolvedSource,
    isRmsPricingEnabled,
    isDynamicPricesModeEnabled,
  });
}

/**
 * Удаление цены на дату: dynamic_prices vs prices (per-date на слое продаж).
 * @returns {boolean} true → delete_dynamic_prices
 */
export function shouldDeletePriceFromDynamicLayer({
  isDynamicPricesModeEnabled,
  planId,
  roomtypeId,
  date,
  weekday,
  model,
}) {
  if (!isDynamicPricesModeEnabled || !planId || !roomtypeId || !date) {
    return false;
  }
  const {
    rmsPriceInfo,
    defaultPriceForWeekday,
    hasPricesAllForDate,
    pricesAllValueForDate,
  } = buildRmsSalesLayerCellContext(model, {
    planId,
    roomtypeId,
    date,
    weekday,
  });
  return isDynamicLayerRmsManualCell({
    rmsPriceInfo,
    defaultPriceForWeekday,
    hasPricesAllForDate,
    pricesAllValueForDate,
  });
}

/**
 * Callback для preparePricesToDeleteForSaving на слое продаж (per-date).
 * На базовом слое возвращает () => false — всё в delete_prices.
 */
export function createPriceDeleteLayerCallback({
  planId,
  model,
  isRmsPricingEnabled,
  isDynamicPricesModeEnabled,
  getWeekdayForDate,
}) {
  if (!isRmsPricingEnabled || !isDynamicPricesModeEnabled) {
    return null;
  }
  return (tariffId, roomtypeId, date) => {
    const weekday = typeof getWeekdayForDate === "function"
      ? getWeekdayForDate(date)
      : null;
    return shouldDeletePriceFromDynamicLayer({
      isDynamicPricesModeEnabled: true,
      planId: tariffId || planId,
      roomtypeId,
      date,
      weekday,
      model,
    });
  };
}

/**
 * Фильтр категорий для таблицы в режиме «Базовые цены для БП».
 * @param {'object'|'category'} scope — из resolveRmsRuleScope
 */
export function filterRoomtypesForBaseBpMode({
  roomtypes,
  model,
  planId,
  scope,
}) {
  if (!Array.isArray(roomtypes)) {
    return [];
  }
  if (scope === "object") {
    return roomtypes.filter((rt) => !isRmsExcludedRoomtype(rt));
  }

  const configLoaded = model?.isRmsRuleRoomtypeConfigLoadedForPlan?.(planId) === true;
  const categoryIds = typeof model?.getRmsRuleRoomtypeIdsForPlan === "function"
    ? model.getRmsRuleRoomtypeIdsForPlan(planId)
    : [];
  if (!configLoaded || !categoryIds.length) {
    return roomtypes.filter((rt) => !isRmsExcludedRoomtype(rt));
  }

  return roomtypes.filter(
    (rt) => !isRmsExcludedRoomtype(rt)
      && model?.isCategoryHasDynamicRule?.(planId, rt.id),
  );
}

/**
 * Токен RMS-конфига категорий для мемоизации `tableRows`.
 * @param {{ planId?: string|number, model?: object, dynamicLoaded?: boolean }} params
 */
export function buildRmsCategoryConfigToken({
  planId,
  model,
  dynamicLoaded = false,
} = {}) {
  const source = model?.rmsPricesRuleSource ?? "";
  const idsToken = typeof model?.getRmsRuleRoomtypeIdsToken === "function"
    ? model.getRmsRuleRoomtypeIdsToken(planId)
    : "";
  return [
    String(planId ?? ""),
    String(source),
    dynamicLoaded ? 1 : 0,
    idsToken,
  ].join(":");
}
