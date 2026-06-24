/**
 * Plan id ветки тарифа для снимка prices_all / rms_prices_all (как PHP _get_list_prices_plans_ids при show_price_hint=false).
 *
 * @param {{ id?: string|number, parent_id?: string|number }|null} currentTariff
 * @returns {string[]}
 */
export function resolveBranchPlanIds(currentTariff) {
  if (currentTariff?.id == null || currentTariff.id === "") {
    return [];
  }

  const ids = [String(currentTariff.id)];
  if (currentTariff.parent_id != null && currentTariff.parent_id !== "") {
    ids.push(String(currentTariff.parent_id));
  }

  return ids;
}

/**
 * @param {string[]} refetchParts
 * @param {{ id?: string|number, parent_id?: string|number }|null} currentTariff
 * @returns {{ replacePricesAllPlanIds?: string[], replaceRmsPricesAllPlanIds?: string[] }}
 */
export function resolveUpdateFromReplacePlanIds(refetchParts = [], currentTariff = null) {
  const parts = Array.isArray(refetchParts) ? refetchParts : [];
  const branchPlanIds = resolveBranchPlanIds(currentTariff);
  const options = {};

  if (parts.includes("planPrices") && branchPlanIds.length) {
    options.replacePricesAllPlanIds = branchPlanIds;
  }
  if (parts.includes("dynamic") && branchPlanIds.length) {
    options.replaceRmsPricesAllPlanIds = branchPlanIds;
  }

  return options;
}
