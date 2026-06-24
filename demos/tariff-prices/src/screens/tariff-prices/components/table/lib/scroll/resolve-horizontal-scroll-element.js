/**
 * Горизонтальный скролл-контейнер таблицы ЦиО (`.table-scroll-area`).
 * @param {{
 *   getPricesTableHorizontalScrollContainer?: () => HTMLElement | null | undefined,
 *   tableHorizontalScrollRef?: HTMLElement | null | undefined,
 * }} args
 * @returns {HTMLElement | null}
 */
// eslint-disable-next-line import/prefer-default-export
export function resolveTableHorizontalScrollElement({
  getPricesTableHorizontalScrollContainer,
  tableHorizontalScrollRef,
} = {}) {
  if (typeof getPricesTableHorizontalScrollContainer === "function") {
    const el = getPricesTableHorizontalScrollContainer();
    if (el) {
      return el;
    }
  }
  return tableHorizontalScrollRef ?? null;
}
