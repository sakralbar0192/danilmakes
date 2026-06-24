/**
 * @param {{
 *   isOneOfPricesModesEnabled?: boolean,
 *   isRestrictionModeEnabled?: boolean,
 *   isRmsPricingEnabled?: boolean,
 *   isDynamicPricesModeEnabled?: boolean,
 *   hasExtraChargesCategories?: boolean,
 *   needsHotelChildrenAgesLabels?: boolean,
 *   isCurrentTariffDepend?: boolean,
 *   parentUsesRmsPricing?: boolean,
 * }} [context]
 * @returns {string[]}
 */
export function resolveTableShellParts() {
  return ["base"];
}

/**
 * @param {Parameters<typeof resolveTableContentParts>[0]} context
 * @returns {string[]}
 */
export function resolveTableRequiredParts(context = {}) {
  // eslint-disable-next-line no-use-before-define
  return [...resolveTableShellParts(), ...resolveTableContentParts(context)];
}

/**
 * Parts для наполнения ячеек (без base — shell грузится отдельно).
 *
 * @param {{
 *   isOneOfPricesModesEnabled?: boolean,
 *   isRestrictionModeEnabled?: boolean,
 *   isRmsPricingEnabled?: boolean,
 *   isDynamicPricesModeEnabled?: boolean,
 *   hasExtraChargesCategories?: boolean,
 *   needsHotelChildrenAgesLabels?: boolean,
 *   isCurrentTariffDepend?: boolean,
 *   parentUsesRmsPricing?: boolean,
 * }} context
 * @returns {string[]}
 */
export function resolveTableContentParts({
  isOneOfPricesModesEnabled = false,
  isRestrictionModeEnabled = false,
  isRmsPricingEnabled = false,
  isDynamicPricesModeEnabled = false,
  hasExtraChargesCategories = false,
  needsHotelChildrenAgesLabels = false,
  isCurrentTariffDepend = false,
  parentUsesRmsPricing = false,
} = {}) {
  const parts = [];

  if (isOneOfPricesModesEnabled) {
    parts.push("planPrices", "meta");
    if (isRmsPricingEnabled) {
      parts.push("dynamic");
    }
  }

  const needsExtraPart = (hasExtraChargesCategories && isOneOfPricesModesEnabled)
    || needsHotelChildrenAgesLabels;
  if (needsExtraPart) {
    parts.push("extra");
  }

  if (isRestrictionModeEnabled) {
    parts.push("restrictions");
  }

  if (isCurrentTariffDepend && parentUsesRmsPricing && !parts.includes("dynamic")) {
    parts.push("dynamic");
  }

  return [...new Set(parts)];
}

/**
 * @param {{
 *   childrenAgeId?: string,
 *   bedTypeId?: string,
 *   isDynamicPricesModeEnabled?: boolean,
 *   isRmsPricingEnabled?: boolean,
 *   isCurrentTariffDepend?: boolean,
 *   parentUsesRmsPricing?: boolean,
 * }} input
 * @returns {string[]}
 */
export function resolvePriceCellRequiredParts({
  childrenAgeId = "",
  bedTypeId = "",
  isDynamicPricesModeEnabled = false,
  isRmsPricingEnabled = false,
  isCurrentTariffDepend = false,
  parentUsesRmsPricing = false,
} = {}) {
  if (childrenAgeId && bedTypeId) {
    return ["base", "extra"];
  }

  const parts = ["base", "planPrices"];
  if (isRmsPricingEnabled || (isCurrentTariffDepend && parentUsesRmsPricing)) {
    parts.push("dynamic");
  }
  return parts;
}

/**
 * @param {{ needsMetaForAvailability?: boolean }} [input]
 * @returns {string[]}
 */
export function resolveRestrictionCellRequiredParts({ needsMetaForAvailability = true } = {}) {
  const parts = ["base", "restrictions"];
  if (needsMetaForAvailability) {
    parts.push("meta");
  }
  return parts;
}

/**
 * Метаданные строки категории: availability (meta) и closed (restrictions).
 *
 * @param {{ isRestrictionModeEnabled?: boolean }} [context]
 * @returns {string[]}
 */
export function resolveRoomtypeDayMetaRequiredParts({ isRestrictionModeEnabled = false } = {}) {
  const parts = ["base", "meta"];
  if (isRestrictionModeEnabled) {
    parts.push("restrictions");
  }
  return parts;
}

/**
 * Store context для resolveTableContentParts из getters.
 *
 * @param {object} getters — tariffPricesAndRestrictions getters
 * @returns {string[]}
 */
export function resolveTableContentPartsFromGetters(getters = {}) {
  return resolveTableContentParts({
    isOneOfPricesModesEnabled: getters.isOneOfPricesModesEnabled,
    isRestrictionModeEnabled: getters.isRestrictionModeEnabled,
    isRmsPricingEnabled: getters.isRmsPricingEnabled,
    isDynamicPricesModeEnabled: getters.isDynamicPricesModeEnabled,
    hasExtraChargesCategories: getters.hasExtraChargesCategories,
    needsHotelChildrenAgesLabels: getters.needsHotelChildrenAgesLabels,
    isCurrentTariffDepend: getters.isCurrentTariffDepend,
    parentUsesRmsPricing: getters.parentUsesRmsPricing,
  });
}
