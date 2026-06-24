/** Немедленно закрывает grace-window восстановления фокуса после edit-сессии. */
export function disarmMobileEditFocusRestoreGrace(state) {
  if (!state || typeof state !== "object") {
    return;
  }
  state.mobileEditFocusRestoreAllowedUntilMs = 0;
}
