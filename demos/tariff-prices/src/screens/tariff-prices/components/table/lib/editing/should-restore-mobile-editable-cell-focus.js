/**
 * Разрешено ли восстановить фокус в редактируемой ячейке после refreshVirtualizedTableLayout.
 * Grace-window покрывает цепочку «тап → скрытие футера → resize»; после выхода из edit — restore запрещён.
 *
 * @param {{
 *   nowMs?: number,
 *   focusRestoreAllowedUntilMs?: number,
 *   mobileTableCellInputFocused?: boolean,
 *   isMobileEditableInputFocused?: boolean,
 *   explicitRestoreFocusCellKey?: string,
 * }} args
 */
export function shouldRestoreMobileEditableCellFocus({
  nowMs = Date.now(),
  focusRestoreAllowedUntilMs = 0,
  mobileTableCellInputFocused = false,
  isMobileEditableInputFocused = false,
  explicitRestoreFocusCellKey = "",
} = {}) {
  const sessionActive = Boolean(mobileTableCellInputFocused || isMobileEditableInputFocused);
  if (!sessionActive) {
    return false;
  }
  const graceOpen = focusRestoreAllowedUntilMs > 0 && nowMs < focusRestoreAllowedUntilMs;
  if (graceOpen) {
    return true;
  }
  return Boolean(explicitRestoreFocusCellKey);
}
