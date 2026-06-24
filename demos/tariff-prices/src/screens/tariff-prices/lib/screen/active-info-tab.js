/**
 * Какой таб info-drawer соответствует режиму таблицы (до dispatch в store).
 * @param {string} mode
 * @param {{
 *   modeRestrictions: string,
 *   modeDynamicPrice: string,
 *   modeRestrictionsWithDynamicPrices: string,
 *   infoDrawerRestrictions: string,
 *   infoDrawerDynamic: string,
 *   infoDrawerDefault: string,
 * }} modes
 * @returns {string}
 */
// eslint-disable-next-line import/prefer-default-export
export function resolveActiveInfoTab(mode, modes) {
  if (mode === modes.modeRestrictions) {
    return modes.infoDrawerRestrictions;
  }

  const isDynamicBranch = [
    modes.modeDynamicPrice,
    modes.modeRestrictionsWithDynamicPrices,
  ].includes(mode);

  return isDynamicBranch ? modes.infoDrawerDynamic : modes.infoDrawerDefault;
}
