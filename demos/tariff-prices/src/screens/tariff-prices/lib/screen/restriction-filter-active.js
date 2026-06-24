import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { compactRestrictionGroupItems,
  getDefaultSelectedRestrictionKeys,
  restrictionTypes } from "../../config/screen-config.js";

const allowedRestrictionIds = Object.freeze(
  Object.keys(restrictionTypes).filter(
    (type) => type !== PriceAndRestrictionsService.closedRestrictionName,
  ),
);

function filterAllowedRestrictions(selectedRestrictions = []) {
  return (selectedRestrictions || []).filter((id) => allowedRestrictionIds.includes(id));
}

function normalizeToCompactGroupIds(selectedRestrictions) {
  const selectedSet = new Set(filterAllowedRestrictions(selectedRestrictions));
  return compactRestrictionGroupItems.reduce((result, item) => {
    if (item.restrictionTypes.some((type) => selectedSet.has(type))) {
      result.push(item.id);
    }
    return result;
  }, []);
}

function stableKey(values) {
  return [...values].sort((a, b) => String(a).localeCompare(String(b))).join(",");
}

/**
 * Есть ли активный фильтр ограничений (отличный от дефолта «все кроме closed»).
 * Используется для оранжевого бейджа на мобильной кнопке фильтра.
 */
export function hasActiveRestrictionsFilter({
  selectedRestrictions = [],
  compactRestrictions = false,
} = {}) {
  const defaultKeys = getDefaultSelectedRestrictionKeys();

  if (compactRestrictions) {
    const defaultGroups = compactRestrictionGroupItems.map((item) => item.id);
    const currentGroups = normalizeToCompactGroupIds(selectedRestrictions);
    return stableKey(currentGroups) !== stableKey(defaultGroups);
  }

  return stableKey(filterAllowedRestrictions(selectedRestrictions)) !== stableKey(defaultKeys);
}
