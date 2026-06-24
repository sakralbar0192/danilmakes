/**
 * Сохранение и восстановление фокуса в редактируемой ячейке таблицы после перерисовки виртуализатора.
 */

function queryCellRootByKey(rootEl, cellKey) {
  if (!rootEl || !cellKey) {
    return null;
  }
  if (typeof CSS !== "undefined" && CSS.escape) {
    return rootEl.querySelector(`[data-cell-root][data-cell-key="${CSS.escape(cellKey)}"]`);
  }
  const roots = rootEl.querySelectorAll("[data-cell-root][data-cell-key]");
  for (let i = 0; i < roots.length; i++) {
    if (roots[i].getAttribute("data-cell-key") === cellKey) {
      return roots[i];
    }
  }
  return null;
}

/**
 * @param {HTMLElement|null|undefined} tableRootEl
 * @param {string} [fallbackCellKey]
 * @returns {string}
 */
export function captureActiveEditableCellKey(tableRootEl, fallbackCellKey = "") {
  if (typeof document === "undefined" || !tableRootEl) {
    return fallbackCellKey || "";
  }
  const ae = document.activeElement;
  if (ae?.nodeName === "INPUT" && tableRootEl.contains(ae)) {
    const key = ae.closest?.("[data-cell-root]")?.getAttribute?.("data-cell-key");
    if (key) {
      return key;
    }
  }
  return fallbackCellKey || "";
}

/**
 * @param {HTMLElement|null|undefined} tableRootEl
 * @param {string} cellKey
 * @returns {boolean}
 */
export function restoreEditableCellFocus(tableRootEl, cellKey) {
  if (!tableRootEl || !cellKey) {
    return false;
  }
  const cellRoot = queryCellRootByKey(tableRootEl, cellKey);
  if (!cellRoot) {
    return false;
  }
  // Согласовано с `flushMobileEditCellInputToStore` в `tariff-table-mobile-edit.js`:
  // приоритет inputmode=decimal (price), затем numeric (restriction), затем общий fallback.
  const input = cellRoot.querySelector?.(
    "input[inputmode=\"decimal\"], input[inputmode=\"numeric\"], input[type=\"text\"], input",
  );
  if (!input || input.disabled) {
    return false;
  }
  input.focus?.({ preventScroll: true });
  return document.activeElement === input;
}
