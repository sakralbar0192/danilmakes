import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { restrictionSelectionGroups,
  restrictionTypes } from "../../config/screen-config.js";

export const restrictionSelectionOrder = Object.freeze(
  Object.keys(restrictionTypes).filter(
    (type) => type !== PriceAndRestrictionsService.closedRestrictionName,
  ),
);

export function normalizeRestrictionsForViewMode(selectedRestrictions = []) {
  const selectedSet = new Set(selectedRestrictions || []);
  const normalizedSet = new Set(selectedRestrictions || []);

  restrictionSelectionGroups.forEach((group) => {
    if (group.some((restrictionType) => selectedSet.has(restrictionType))) {
      group.forEach((restrictionType) => normalizedSet.add(restrictionType));
    }
  });

  return restrictionSelectionOrder.filter((restrictionType) => normalizedSet.has(restrictionType));
}
