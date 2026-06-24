/**
 * Решает, закрывать ли restriction sheets по window click вне ячеек.
 * Отдельная логика от clearMobileEdit: при открытии sheet Vuetify может
 * синтетически кликнуть по scrim до появления data-*-root в DOM.
 *
 * @param {{
 *   now: number,
 *   suppressUntilMs: number,
 *   booleanRestrictionSheet: object|null,
 *   dependentRestrictionReadonlySheet: object|null,
 *   compactBooleanRestrictionDropdown: object|null,
 *   clickedCell: Element|null,
 *   clickedBooleanSheet: Element|null,
 *   clickedCompactBooleanDropdown: Element|null,
 *   clickedDependentReadonlySheet: Element|null,
 * }} input
 */
// eslint-disable-next-line import/prefer-default-export
export function resolveRestrictionSheetOutsideDismiss(input) {
  const {
    now,
    suppressUntilMs,
    booleanRestrictionSheet,
    dependentRestrictionReadonlySheet,
    compactBooleanRestrictionDropdown,
    clickedCell,
    clickedBooleanSheet,
    clickedCompactBooleanDropdown,
    clickedDependentReadonlySheet,
  } = input;

  if (
    clickedCell
    || clickedBooleanSheet
    || clickedCompactBooleanDropdown
    || clickedDependentReadonlySheet
  ) {
    return {
      closeBooleanSheet: false,
      closeCompactBooleanDropdown: false,
      closeDependentReadonlySheet: false,
    };
  }

  if (now < suppressUntilMs) {
    return {
      closeBooleanSheet: false,
      closeCompactBooleanDropdown: false,
      closeDependentReadonlySheet: false,
    };
  }

  return {
    closeBooleanSheet: Boolean(booleanRestrictionSheet),
    closeCompactBooleanDropdown: Boolean(compactBooleanRestrictionDropdown),
    closeDependentReadonlySheet: Boolean(dependentRestrictionReadonlySheet),
  };
}
