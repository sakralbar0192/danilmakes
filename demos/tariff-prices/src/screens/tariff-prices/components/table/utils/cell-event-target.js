/**
 * Разбор DOM-цели клика/фокуса для ячеек таблицы (data-cell-root, data-action).
 * Вынесено из table/index.vue для юнит-тестов и единой документации поведения на touch.
 */

export function getEventElement(target) {
  return typeof Element !== "undefined" && target instanceof Element ? target : null;
}

export function getCellRoot(target) {
  return target?.closest?.("[data-cell-root]") || null;
}

export function getActionTarget(target) {
  return target?.closest?.("[data-action]") || null;
}

/**
 * Если `event` с координатами указателя и прямой `closest` не нашёл ячейку,
 * пробуем `document.elementFromPoint` — на мобилке `event.target` иногда не ячейка.
 *
 * @param {MouseEvent|TouchEvent|PointerEvent|null} event
 * @returns {HTMLElement|null}
 */
export function resolveCellRootFromPointerEvent(event) {
  if (!event || typeof event.clientX !== "number" || typeof event.clientY !== "number") {
    return null;
  }
  if (typeof document === "undefined" || typeof document.elementFromPoint !== "function") {
    return null;
  }
  const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY);
  return elementAtPoint ? getCellRoot(elementAtPoint) : null;
}

/**
 * @param {EventTarget|null} target
 * @param {MouseEvent|TouchEvent|PointerEvent|null} [event]
 */
export function buildEventTargetPayload(target, event = null) {
  const rawTarget = getEventElement(target);
  const actionTarget = getActionTarget(rawTarget);
  let cellRoot = getCellRoot(actionTarget ?? rawTarget);
  if (!cellRoot) {
    cellRoot = resolveCellRootFromPointerEvent(event);
  }
  const resolvedTarget = cellRoot || actionTarget || rawTarget;

  return {
    rawTarget,
    actionTarget,
    cellRoot,
    target: resolvedTarget,
    data: {
      ...(cellRoot?.dataset || {}),
      ...(actionTarget?.dataset || {}),
    },
  };
}
