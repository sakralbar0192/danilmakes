import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { cellTypes } from "../../config/cell-types.js";

/**
 * Mobile focusin on copied restriction cell should open readonly sheet, not edit session.
 *
 * @param {{
 *   cellType?: string,
 *   dataId?: string,
 *   dependentRestrictions?: Record<string, unknown>|null,
 * }} args
 * @returns {string|null} restrictionType when sheet should open
 */
export function shouldOpenDependentRestrictionReadonlyOnMobileFocus({
  cellType = "",
  dataId = "",
  dependentRestrictions = null,
} = {}) {
  if (cellType !== cellTypes.restriction) {
    return null;
  }
  const restrictionType = (dataId || "").split("_")[1] || "";
  if (!restrictionType) {
    return null;
  }
  const key = PriceAndRestrictionsService.getServerRestrictionTypeName(restrictionType);
  if (!Number(dependentRestrictions?.[key])) {
    return null;
  }
  return restrictionType;
}
