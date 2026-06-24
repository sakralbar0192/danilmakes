/**
 * Категория участвует в БП по конфигурации rms_rule_roomtype_ids_by_plan.
 * modelUpdatedAt — токен инвалидации после in-place updateFrom модели (в паре с ruleConfigToken).
 *
 * @param {{
 *   planId: string|number|null|undefined,
 *   roomtypeId: string|number|null|undefined,
 *   pricesCalendarModel: {
 *     isCategoryHasDynamicRule?: (planId: string|number, roomtypeId: string|number) => boolean,
 *     getRmsRuleRoomtypeIdsToken?: (planId: string|number) => string,
 *   }|null,
 *   modelUpdatedAt?: string|number,
 *   isRmsPricingEnabled?: boolean,
 * }} ctx
 * @returns {boolean}
 */
// eslint-disable-next-line import/prefer-default-export
export function resolveIsBusinessRuleCategory({
  planId,
  roomtypeId,
  pricesCalendarModel,
  modelUpdatedAt = "",
  isRmsPricingEnabled = false,
}) {
  if (!planId || !roomtypeId || !pricesCalendarModel) {
    return false;
  }
  if (
    isRmsPricingEnabled
    && typeof pricesCalendarModel.isRmsRuleRoomtypeConfigLoadedForPlan === "function"
    && !pricesCalendarModel.isRmsRuleRoomtypeConfigLoadedForPlan(planId)
  ) {
    return false;
  }
  const ruleConfigToken = pricesCalendarModel.getRmsRuleRoomtypeIdsToken?.(planId) ?? "";
  const lookupKey = `${modelUpdatedAt}|${ruleConfigToken}`;
  return Boolean(lookupKey)
    && pricesCalendarModel.isCategoryHasDynamicRule?.(planId, roomtypeId) === true;
}
