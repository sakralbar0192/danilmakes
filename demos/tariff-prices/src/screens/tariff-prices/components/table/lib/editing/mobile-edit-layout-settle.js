import { MOBILE_EDIT_TOUCH_HOLD_MS } from "../../config/table-grid-metrics.js";

/**
 * Задержка повторного layout-settle (iOS CriOS sticky-fix после edit).
 */
export function getMobileEditLayoutSettleDelayedMs(touchHoldMs = MOBILE_EDIT_TOUCH_HOLD_MS) {
  return touchHoldMs + 16;
}

/**
 * Нужен ли refresh виртуализатора в проходе layout-settle.
 * @param {{ deferVirtualizerRefreshUntilEditEnds?: boolean, editSessionActive?: boolean }} args
 */
export function shouldRefreshVirtualizerOnLayoutSettle({
  deferVirtualizerRefreshUntilEditEnds = false,
  editSessionActive = false,
} = {}) {
  if (editSessionActive) {
    return false;
  }
  return deferVirtualizerRefreshUntilEditEnds;
}

/**
 * Отменить ли delayed (повторный) проход layout-settle: пользователь начал новый focusin за время задержки.
 *
 * Сценарий: пользователь тапает в ячейку A → focusin (генерация=1) → schedule delayed pass (snapshot=1).
 * До срабатывания таймера он тапает в B → focusin (генерация=2). Delayed pass от A не должен
 * выполнять recompute layout, т.к. актуальный recompute придёт из новой сессии B.
 *
 * @param {{
 *   editSessionActive?: boolean,
 *   sessionGenerationAtSchedule?: number,
 *   currentSessionGeneration?: number,
 * }} args
 */
export function shouldCancelDelayedLayoutSettle({
  editSessionActive = false,
  sessionGenerationAtSchedule = 0,
  currentSessionGeneration = 0,
} = {}) {
  if (!editSessionActive) {
    return false;
  }
  return sessionGenerationAtSchedule !== currentSessionGeneration;
}
