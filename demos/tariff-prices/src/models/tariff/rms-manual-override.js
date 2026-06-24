/**
 * prices_all учитываем в baseline сброса только если это не эхо ручной RMS без original_value.
 *
 * @param {{
 *   hasPricesAllForDate?: boolean,
 *   pricesAllValueForDate?: number|null,
 *   rmsCurrentValue?: number|null,
 *   rmsOriginalValue?: number|null,
 * }} input
 * @returns {boolean}
 */
/**
 * Ручная цена на базовом слое по записи в prices_all (не plan_prices).
 * false для RMS-эхо в prices_all (то же значение, что rms без original_value).
 *
 * @param {{
 *   pricesAllValueForDate?: number|null,
 *   rmsCurrentValue?: number|null,
 *   rmsOriginalValue?: number|null,
 * }} input
 * @returns {boolean}
 */
export function resolveRegularPriceIsManualFromPricesAll({
  pricesAllValueForDate = null,
  rmsCurrentValue = null,
  rmsOriginalValue = null,
} = {}) {
  if (pricesAllValueForDate == null) {
    return false;
  }
  return shouldUsePricesAllForResetBaseline({
    hasPricesAllForDate: true,
    pricesAllValueForDate,
    rmsCurrentValue,
    rmsOriginalValue,
  });
}

export function shouldUsePricesAllForResetBaseline({
  hasPricesAllForDate = false,
  pricesAllValueForDate = null,
  rmsCurrentValue = null,
  rmsOriginalValue = null,
}) {
  if (!hasPricesAllForDate || pricesAllValueForDate == null) {
    return false;
  }
  if (rmsOriginalValue == null && rmsCurrentValue != null
    && Number(pricesAllValueForDate) === Number(rmsCurrentValue)) {
    return false;
  }
  return true;
}

/**
 * Fallback цены базового слоя: plan_prices → prices_all → default_prices.
 *
 * @param {{
 *   hasPlanPriceForDate?: boolean,
 *   planPriceForDate?: number|null,
 *   hasPricesAllForDate?: boolean,
 *   pricesAllValueForDate?: number|null,
 *   defaultPriceForWeekday?: number,
 *   rmsCurrentValue?: number|null,
 *   rmsOriginalValue?: number|null,
 * }} input
 * @returns {number|null}
 */
export function resolveBaseLayerPriceFallback({
  hasPlanPriceForDate = false,
  planPriceForDate = null,
  hasPricesAllForDate = false,
  pricesAllValueForDate = null,
  defaultPriceForWeekday = 0,
  rmsCurrentValue = null,
  rmsOriginalValue = null,
}) {
  if (hasPlanPriceForDate && planPriceForDate != null) {
    return planPriceForDate;
  }
  if (shouldUsePricesAllForResetBaseline({
    hasPricesAllForDate,
    pricesAllValueForDate,
    rmsCurrentValue,
    rmsOriginalValue,
  })) {
    return pricesAllValueForDate;
  }
  return defaultPriceForWeekday ?? null;
}

/**
 * Baseline сброса на динамическом слое:
 * (1) original_value из rms_prices_all, (2) plan → prices_all → default.
 *
 * @param {{
 *   rmsOriginalValue?: number|null,
 *   rmsCurrentValue?: number|null,
 *   hasPlanPriceForDate?: boolean,
 *   planPriceForDate?: number|null,
 *   defaultPriceForWeekday?: number,
 *   hasPricesAllForDate?: boolean,
 *   pricesAllValueForDate?: number|null,
 * }} input
 * @returns {number|null}
 */
export function resolveDynamicLayerResetBaseline({
  rmsOriginalValue = null,
  rmsCurrentValue = null,
  hasPlanPriceForDate = false,
  planPriceForDate = null,
  defaultPriceForWeekday = 0,
  hasPricesAllForDate = false,
  pricesAllValueForDate = null,
}) {
  if (rmsOriginalValue != null && rmsOriginalValue !== "") {
    return rmsOriginalValue;
  }
  return resolveBaseLayerPriceFallback({
    hasPlanPriceForDate,
    planPriceForDate,
    hasPricesAllForDate,
    pricesAllValueForDate,
    defaultPriceForWeekday,
    rmsCurrentValue,
    rmsOriginalValue,
  });
}

/**
 * Фактическая цена родителя с RMS для расчёта зависимого тарифа:
 * (1) текущая RMS-цена, (2) plan_prices → prices_all → default (как при сбросе базового слоя).
 *
 * @param {{
 *   rmsCurrentValue?: number|null,
 *   rmsOriginalValue?: number|null,
 *   hasPlanPriceForDate?: boolean,
 *   planPriceForDate?: number|null,
 *   defaultPriceForWeekday?: number,
 *   hasPricesAllForDate?: boolean,
 *   pricesAllValueForDate?: number|null,
 * }} input
 * @returns {number}
 */
export function resolveDynamicParentActualForDependent({
  rmsCurrentValue = null,
  rmsOriginalValue = null,
  hasPlanPriceForDate = false,
  planPriceForDate = null,
  defaultPriceForWeekday = 0,
  hasPricesAllForDate = false,
  pricesAllValueForDate = null,
}) {
  if (rmsCurrentValue != null && rmsCurrentValue !== "") {
    return Number(rmsCurrentValue);
  }
  return Number(resolveBaseLayerPriceFallback({
    hasPlanPriceForDate,
    planPriceForDate,
    hasPricesAllForDate,
    pricesAllValueForDate,
    defaultPriceForWeekday,
    rmsCurrentValue,
    rmsOriginalValue,
  }) ?? 0);
}

/**
 * Ручная цена на динамическом слое: запись из rms_prices_all с manual=true.
 * Учитывает артефакт API (наследование базы из prices_all) и сохранённую ручную без RMS-расчёта
 * (originalValue === null после save_manual_rms_prices).
 *
 * @param {{
 *   rmsPriceInfo?: { manual?: boolean, value?: number, originalValue?: number|null }|null,
 *   defaultPriceForWeekday?: number,
 *   hasPricesAllForDate?: boolean,
 *   pricesAllValueForDate?: number|null,
 * }} input
 * @returns {boolean}
 */
export function isDynamicLayerRmsManualCell({
  rmsPriceInfo = null,
  defaultPriceForWeekday = 0,
  hasPricesAllForDate = false,
  pricesAllValueForDate = null,
}) {
  if (!rmsPriceInfo?.manual) {
    return false;
  }
  if (!hasPricesAllForDate) {
    return true;
  }
  if (pricesAllValueForDate != null
    && Number(rmsPriceInfo.value) !== Number(pricesAllValueForDate)) {
    return true;
  }
  if (rmsPriceInfo.originalValue == null) {
    return true;
  }
  return Number(rmsPriceInfo.originalValue) !== Number(defaultPriceForWeekday ?? 0);
}
