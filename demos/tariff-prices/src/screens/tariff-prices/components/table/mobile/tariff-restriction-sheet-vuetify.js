/** Игнорировать ложное @input=false от Vuetify сразу после mount. */
export const TARIFF_RESTRICTION_SHEET_VUETIFY_FALSE_GUARD_MS = 350;

/**
 * @param {number} openedAtMs
 * @param {number} [now]
 * @returns {boolean}
 */
export function shouldIgnoreTariffRestrictionSheetVuetifyClose(openedAtMs, now = Date.now()) {
  return now - openedAtMs < TARIFF_RESTRICTION_SHEET_VUETIFY_FALSE_GUARD_MS;
}
