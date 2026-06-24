import { syncHorizontalScrollLeft } from "./table-horizontal-scrollbar-track.js";

/**
 * Синхронизирует scrollLeft между парой горизонтальных контейнеров (шапка ↔ тело таблицы).
 * @param {{
 *   sourceEl: Element | null | undefined,
 *   targetEl: Element | null | undefined,
 * }} args
 * @returns {boolean} true, если target был обновлён
 */
// eslint-disable-next-line import/prefer-default-export
export function syncPairedHorizontalScroll({ sourceEl, targetEl } = {}) {
  if (!sourceEl || !targetEl) {
    return false;
  }
  const scrollLeft = sourceEl.scrollLeft || 0;
  const prev = targetEl.scrollLeft || 0;
  syncHorizontalScrollLeft(targetEl, scrollLeft);
  return Math.abs((targetEl.scrollLeft || 0) - prev) >= 1;
}
