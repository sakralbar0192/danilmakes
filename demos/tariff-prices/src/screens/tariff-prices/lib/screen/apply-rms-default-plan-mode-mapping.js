import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";

/**
 * Маппинг режима страницы тарифа для RMS-тарифов (parity с PHP User::get_default_plan_mode).
 * @param {string} mode
 * @param {boolean} isRmsPricingEnabled
 * @param {boolean} [enabledCombinedMode=true]
 * @returns {string}
 */
// eslint-disable-next-line import/prefer-default-export
export function applyRmsDefaultPlanModeMapping(
  mode,
  isRmsPricingEnabled,
  enabledCombinedMode = true,
) {
  if (!isRmsPricingEnabled) {
    return mode;
  }

  const {
    modeDefaultPrice,
    modeDynamicPrice,
    modeRestrictionsWithPrices,
    modeRestrictionsWithDynamicPrices,
  } = PriceAndRestrictionsService;

  if (mode === modeRestrictionsWithPrices) {
    return enabledCombinedMode ? modeRestrictionsWithDynamicPrices : modeDynamicPrice;
  }
  if (mode === modeDefaultPrice) {
    return enabledCombinedMode ? modeRestrictionsWithDynamicPrices : modeDynamicPrice;
  }

  return mode;
}
