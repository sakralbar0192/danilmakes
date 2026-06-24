/**
 * Общая growth-эвристика для dismiss мобильной клавиатуры.
 *
 * Используется в двух местах:
 * - `mobile-edit-keyboard-session.js#probeMobileKeyboardDismissFromViewportChange` (probe-pass:
 *   накапливает ticks для антидребезга),
 * - `mobile-keyboard-dismiss.js#shouldApplyKeyboardDismissOnConfirm` (confirm-pass:
 *   читает snapshot, дополнительные условия по focus / vk overlay).
 *
 * До этого growth-логика дублировалась с одинаковыми порогами (0.97 session ratio, 0.88 inner ratio,
 * MOBILE_KEYBOARD_VV_GROW_DISMISS_MIN_PX), но независимыми реализациями — рисково при правке.
 */

import { MOBILE_KEYBOARD_VV_GROW_DISMISS_MIN_PX,
  MOBILE_KEYBOARD_VV_GROW_INNER_RATIO,
  MOBILE_KEYBOARD_VV_GROW_SESSION_RATIO } from "../../config/table-grid-metrics.js";

/**
 * Геометрия «visualViewport вырос → клавиатура, вероятно, закрылась».
 *
 * Триггерится, когда:
 * 1. Текущая эвристика `isMobileKeyboardLikelyOpen` уже false (`nextLikelyOpen=false`).
 * 2. Сессия ранее видела «сжатие» VV ниже `MOBILE_KEYBOARD_VV_GROW_SESSION_RATIO × innerH`
 *    (т.е. клавиатура «была» открыта).
 * 3. Текущая высота VV выросла минимум на `MOBILE_KEYBOARD_VV_GROW_DISMISS_MIN_PX` относительно session min.
 * 4. Текущая VV не ниже `MOBILE_KEYBOARD_VV_GROW_INNER_RATIO × innerH` (предотвращает ложный dismiss
 *    при «промежуточном» состоянии анимации клавиатуры).
 *
 * @param {{
 *   vvHeight: number,
 *   windowInnerHeight: number,
 *   sessionVvMinHeight: number | null | undefined,
 *   nextLikelyOpen?: boolean,
 * }} args
 * @returns {boolean}
 */
export function evaluateGrowthDismissGeometry({
  vvHeight,
  windowInnerHeight,
  sessionVvMinHeight,
  nextLikelyOpen = false,
} = {}) {
  if (nextLikelyOpen) {
    return false;
  }
  if (sessionVvMinHeight == null || !Number.isFinite(sessionVvMinHeight)) {
    return false;
  }
  if (!Number.isFinite(vvHeight) || !Number.isFinite(windowInnerHeight) || windowInnerHeight <= 0) {
    return false;
  }
  return (
    sessionVvMinHeight < windowInnerHeight * MOBILE_KEYBOARD_VV_GROW_SESSION_RATIO
    && vvHeight >= sessionVvMinHeight + MOBILE_KEYBOARD_VV_GROW_DISMISS_MIN_PX
    && vvHeight >= windowInnerHeight * MOBILE_KEYBOARD_VV_GROW_INNER_RATIO
  );
}
