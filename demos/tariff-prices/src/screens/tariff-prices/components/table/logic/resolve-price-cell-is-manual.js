import { isDynamicLayerRmsManualCell } from "@/models/tariff/rms-manual-override";

/**
 * «Ручная» ячейка (чёрный жирный).
 * Dynamic mode: RMS manual (в т.ч. originalValue === null — сохранённая ручная без RMS-расчёта),
 * либо черновик на слое продаж; цена в prices_all для категории без БП; object-level manual без записи в БП.
 * Унаследованная база из prices_all у категории с БП (артефакт manual + original === default) — серая.
 *
 * @param {{
 *   isDynamicPricesModeEnabled: boolean,
 *   priceToRemoved: boolean,
 *   isUpdating?: boolean,
 *   categoryWritesToDynamicLayer?: boolean,
 *   categoryHasDynamicRule?: boolean,
 *   childrenAgeId?: string,
 *   internalPrice?: { manual?: boolean, unlocked?: boolean },
 *   rmsPriceInfo?: { manual?: boolean, value?: number, originalValue?: number|null }|null,
 *   defaultPriceForWeekday?: number,
 *   hasPricesAllForDate?: boolean,
 *   pricesAllValueForDate?: number|null,
 * }} input
 * @returns {boolean}
 */
export function resolvePriceCellIsManual({
  isDynamicPricesModeEnabled,
  priceToRemoved,
  isUpdating = false,
  categoryWritesToDynamicLayer = false,
  categoryHasDynamicRule = false,
  childrenAgeId = "",
  internalPrice,
  rmsPriceInfo = null,
  defaultPriceForWeekday = 0,
  hasPricesAllForDate = false,
  pricesAllValueForDate = null,
}) {
  if (priceToRemoved) {
    return false;
  }
  if (childrenAgeId) {
    return Boolean(internalPrice?.manual || internalPrice?.unlocked);
  }
  if (!isDynamicPricesModeEnabled) {
    return Boolean(internalPrice?.manual || internalPrice?.unlocked);
  }
  if (
    rmsPriceInfo?.manual
    && categoryWritesToDynamicLayer
    && !categoryHasDynamicRule
  ) {
    return true;
  }
  const rmsManualInput = {
    rmsPriceInfo,
    defaultPriceForWeekday,
    hasPricesAllForDate,
    pricesAllValueForDate,
  };
  if (isDynamicLayerRmsManualCell(rmsManualInput)) {
    return true;
  }
  if (!categoryWritesToDynamicLayer && hasPricesAllForDate) {
    return true;
  }
  if (isUpdating) {
    return true;
  }
  return false;
}

/**
 * Можно ли сбрасывать сохранённую цену через setPriceToDelete (remove), а не unsetUpdatingPrice (reset).
 *
 * @param {{
 *   isDynamicPricesModeEnabled: boolean,
 *   categoryWritesToDynamicLayer?: boolean,
 *   categoryHasDynamicRule?: boolean,
 *   childrenAgeId?: string,
 *   rmsPriceInfo?: { manual?: boolean, value?: number, originalValue?: number|null }|null,
 *   defaultPriceForWeekday?: number,
 *   hasPricesAllForDate?: boolean,
 *   pricesAllValueForDate?: number|null,
 * }} input
 * @returns {boolean}
 */
export function canMarkPriceForDelete({
  isDynamicPricesModeEnabled,
  categoryWritesToDynamicLayer = false,
  categoryHasDynamicRule = false,
  childrenAgeId = "",
  rmsPriceInfo = null,
  defaultPriceForWeekday = 0,
  hasPricesAllForDate = false,
  pricesAllValueForDate = null,
}) {
  if (childrenAgeId || !isDynamicPricesModeEnabled) {
    return true;
  }
  if (
    rmsPriceInfo?.manual
    && categoryWritesToDynamicLayer
    && !categoryHasDynamicRule
  ) {
    return true;
  }
  if (!categoryWritesToDynamicLayer && hasPricesAllForDate) {
    return true;
  }
  return isDynamicLayerRmsManualCell({
    rmsPriceInfo,
    defaultPriceForWeekday,
    hasPricesAllForDate,
    pricesAllValueForDate,
  });
}
