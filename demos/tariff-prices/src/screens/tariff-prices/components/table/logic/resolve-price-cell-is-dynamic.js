/**
 * Зелёная звёздочка (динамическая цена): true только когда отображаемое значение — RMS, а не дефолт.
 *
 * @param {{
 *   internalPrice?: { dynamic?: boolean },
 *   priceToRemoved: boolean,
 *   childrenAgeId?: string,
 *   rmsPriceInfo?: { manual?: boolean, originalValue?: number|null }|null,
 *   defaultPriceForWeekday?: number,
 * }} input
 * @returns {boolean}
 */
// eslint-disable-next-line import/prefer-default-export
export function resolvePriceCellIsDynamic({
  internalPrice,
  priceToRemoved,
  childrenAgeId = "",
  rmsPriceInfo = null,
  defaultPriceForWeekday = 0,
}) {
  if (childrenAgeId) {
    return false;
  }
  if (!priceToRemoved) {
    return Boolean(internalPrice?.dynamic);
  }

  if (internalPrice?.dynamic) {
    return true;
  }

  if (!rmsPriceInfo?.manual) {
    return false;
  }
  if (rmsPriceInfo.originalValue == null) {
    return false;
  }

  return Number(rmsPriceInfo.originalValue) !== Number(defaultPriceForWeekday ?? 0);
}
