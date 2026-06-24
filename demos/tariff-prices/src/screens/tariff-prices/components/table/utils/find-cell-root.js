/**
 * Найти корневой элемент ячейки по `data-cell-key` с простым кэшем на последний ключ.
 *
 * @param {HTMLElement|null} rootEl — корень таблицы (`this.$el`)
 * @param {string} cellKey
 * @param {{ cellRootCacheKey: string, cellRootCacheEl: Element|null }} cache — мутируется
 * @returns {Element|null}
 */
// eslint-disable-next-line import/prefer-default-export
export function findCellRootByKey(rootEl, cellKey, cache) {
  if (!cellKey || !rootEl) {
    return null;
  }
  if (cache.cellRootCacheKey === cellKey && cache.cellRootCacheEl?.isConnected) {
    return cache.cellRootCacheEl;
  }
  let el = null;
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    try {
      el = rootEl.querySelector(`[data-cell-root][data-cell-key="${CSS.escape(cellKey)}"]`);
    } catch (e) {
      el = null;
    }
  }
  if (!el) {
    const roots = rootEl.querySelectorAll("[data-cell-root][data-cell-key]");
    for (let i = 0; i < roots.length; i++) {
      if (roots[i].dataset.cellKey === cellKey) {
        el = roots[i];
        break;
      }
    }
  }
  cache.cellRootCacheKey = cellKey;
  cache.cellRootCacheEl = el;
  return el;
}
