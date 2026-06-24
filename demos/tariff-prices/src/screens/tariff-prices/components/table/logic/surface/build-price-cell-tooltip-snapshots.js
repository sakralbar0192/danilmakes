/**
 * Снимки полей `cellVm` для singleton-тултипа (без ссылок на реактивные объекты после открытия).
 */

import { isExtraChargePriceId } from "../../lib/cell-identity.js";

/**
 * @param {object} cellVm — результат `computePriceCellVm`
 * @returns {{ basePriceOriginalValue: unknown }|null}
 */
export function buildPriceCellMainTooltipSnapshot(cellVm) {
  if (!cellVm || cellVm.isTooltipDisabled) {
    return null;
  }
  return { basePriceOriginalValue: cellVm.internalPrice?.originalValue ?? null };
}

/**
 * @param {object} cellVm
 * @returns {{
 *   kind: 'updating',
 *   fetchedValue: string,
 *   currencySign: string,
 *   isExtraChargesRow: boolean,
 * }|{
 *   kind: 'unlocked',
 *   currentTariffIsDependent: boolean,
 *   isExtraChargesRow: boolean,
 *   formattedOriginal: string,
 *   currencySign: string,
 * }|{
 *   kind: 'rule',
 *   originalValue: string|number,
 *   currencySign: string,
 * }|{
 *   kind: 'default',
 *   formattedOriginal: string,
 *   currencySign: string,
 * }|null}
 */
export function buildPriceCellResetTooltipSnapshot(cellVm) {
  if (!cellVm?.needShowResetButton) {
    return null;
  }
  const currencySign = cellVm.currencySign || "₽";
  if (cellVm.isUpdating) {
    return {
      kind: "updating",
      fetchedValue: String(cellVm.fetchedPrice?.value ?? ""),
      currencySign,
      isExtraChargesRow: Boolean(isExtraChargePriceId(cellVm.dataId)),
    };
  }
  if (cellVm.internalPrice?.unlocked) {
    const n = Number(cellVm.fetchedPrice?.originalValue);
    return {
      kind: "unlocked",
      currentTariffIsDependent: Boolean(cellVm.currentTariffIsDependent),
      isExtraChargesRow: Boolean(cellVm.currentTariffIsDependent && isExtraChargePriceId(cellVm.dataId)),
      formattedOriginal: Number.isFinite(n) ? n.toLocaleString("ru-RU") : String(cellVm.fetchedPrice?.originalValue ?? ""),
      currencySign,
    };
  }
  const ruleOriginal = cellVm.fetchedPrice?.originalValue;
  if (ruleOriginal != null && ruleOriginal !== "") {
    const usesRuleText = cellVm.categoryHasDynamicRule === true
      || cellVm.internalPrice?.dynamic === true;
    if (usesRuleText) {
      return {
        kind: "rule",
        originalValue: ruleOriginal,
        currencySign,
      };
    }
    const n = Number(ruleOriginal);
    return {
      kind: "default",
      formattedOriginal: Number.isFinite(n) ? n.toLocaleString("ru-RU") : String(ruleOriginal),
      currencySign,
    };
  }
  return null;
}
