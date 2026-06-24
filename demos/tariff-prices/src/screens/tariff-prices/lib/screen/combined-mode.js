/**
 * Подмена режима при включённом combined (как в index.vue:changeMode до router.push).
 * @param {string} mode
 * @param {{
 *   enabledCombinedMode: boolean,
 *   isRmsPricingEnabled: boolean,
 *   modeDefaultPrice: string,
 *   modeDynamicPrice: string,
 *   modeRestrictions: string,
 *   modeRestrictionsWithPrices: string,
 *   modeRestrictionsWithDynamicPrices: string,
 * }} ctx
 * @returns {string}
 */
// eslint-disable-next-line import/prefer-default-export
export function remapModeForCombinedMode(mode, ctx) {
  if (!ctx.enabledCombinedMode) {
    return mode;
  }

  let next = mode;
  if (next === ctx.modeDefaultPrice) {
    next = ctx.modeRestrictionsWithPrices;
  } else if (next === ctx.modeDynamicPrice) {
    next = ctx.modeRestrictionsWithDynamicPrices;
  } else if (next === ctx.modeRestrictions) {
    next = ctx.isRmsPricingEnabled
      ? ctx.modeRestrictionsWithDynamicPrices
      : ctx.modeRestrictionsWithPrices;
  }
  return next;
}
