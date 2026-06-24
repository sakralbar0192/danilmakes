import { shouldRestoreMobileEditableCellFocus } from "./should-restore-mobile-editable-cell-focus.js";

/**
 * Разрешено ли восстановить фокус (и anchor other-tariffs tooltip) после refreshVirtualizedTableLayout.
 *
 * @param {{
 *   isMobileDevice?: boolean,
 *   focusKey?: string,
 *   explicitRestoreFocusCellKey?: string,
 *   mobileGuardArgs?: object,
 * }} args
 * @returns {boolean}
 */
// eslint-disable-next-line import/prefer-default-export
export function shouldRestoreEditableCellFocusAfterLayoutRefresh({
  isMobileDevice = false,
  focusKey = "",
  explicitRestoreFocusCellKey = "",
  mobileGuardArgs = {},
} = {}) {
  if (!focusKey) {
    return false;
  }
  if (explicitRestoreFocusCellKey) {
    return true;
  }
  if (!isMobileDevice) {
    return true;
  }
  return shouldRestoreMobileEditableCellFocus({
    ...mobileGuardArgs,
    explicitRestoreFocusCellKey: explicitRestoreFocusCellKey || "",
  });
}
