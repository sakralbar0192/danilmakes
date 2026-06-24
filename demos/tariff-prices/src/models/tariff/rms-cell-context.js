/**
 * Контекст ячейки RMS / слоя продаж для одной даты (цена, manual, baseline сброса).
 *
 * @param {object|null} model — TariffPricesCalendarModel
 * @param {{
 *   planId: string|number,
 *   roomtypeId: string|number,
 *   date: string,
 *   weekday?: string|number|null,
 *   getOtherTariffPrice?: boolean,
 * }} params
 */
export function buildRmsSalesLayerCellContext(
  model,
  {
    planId,
    roomtypeId,
    date,
    weekday = null,
    getOtherTariffPrice = false,
  },
) {
  const pid = String(planId ?? "");
  const rid = String(roomtypeId ?? "");
  const rmsPriceInfo = model?.rmsPricesAll?.[pid]?.[rid]?.[date] ?? null;
  const hasPricesAllForDate = date in (model?.pricesAll?.[pid]?.[rid] || {});
  const pricesAllValueForDate = hasPricesAllForDate
    ? model?.pricesAll?.[pid]?.[rid]?.[date]
    : null;
  const hasPlanPriceForDate = !getOtherTariffPrice
    && date in (model?.planPrices?.[rid] || {});
  const planPriceForDate = hasPlanPriceForDate
    ? model?.planPrices?.[rid]?.[date]
    : null;
  const defaultPriceForWeekday = weekday != null
    ? model?.getDefaultPrice?.(pid, rid, weekday) ?? 0
    : 0;

  return {
    rmsPriceInfo,
    defaultPriceForWeekday,
    hasPricesAllForDate,
    pricesAllValueForDate,
    hasPlanPriceForDate,
    planPriceForDate,
    rmsCurrentValue: rmsPriceInfo?.value ?? null,
    rmsOriginalValue: rmsPriceInfo?.originalValue ?? null,
  };
}
