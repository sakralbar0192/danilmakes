/**
 * Утилиты для сравнения и упорядочивания активных VirtualView в виртуализаторе.
 */

/**
 * @param {Iterable<{ raw: { index: number } }>} views
 * @returns {Array}
 */
export function sortVirtualViewsByRowIndex(views) {
  return Array.from(views).sort((a, b) => a.raw.index - b.raw.index);
}

/**
 * @param {Array|undefined} prev
 * @param {Array|undefined} next
 * @returns {boolean}
 */
export function areSameActiveRenderedViews(prev, next) {
  if (prev === next) {
    return true;
  }
  if (!prev || !next || prev.length !== next.length) {
    return false;
  }
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== next[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Активные представления в порядке индекса строки без сортировки Map (O(span) одна аллокация массива).
 */
export function collectActiveViewsInIndexOrder({
  items,
  startIndex,
  endIndex,
  keyField,
  getActiveView,
}) {
  const out = [];
  for (let i = startIndex; i < endIndex; i++) {
    const key = items[i][keyField];
    const view = getActiveView(key);
    if (view) {
      out.push(view);
    }
  }
  return out;
}

/**
 * Список активных view для v-for: только used и в [startIndex, endIndex).
 * Recycled view (raw.used === false) не попадают в DOM.
 */
export function collectActiveRenderedViewsInIndexOrder({
  items,
  startIndex,
  endIndex,
  keyField,
  getActiveView,
}) {
  const out = [];
  for (let i = startIndex; i < endIndex; i++) {
    const key = items[i][keyField];
    const view = getActiveView(key);
    if (view && view.raw.used) {
      out.push(view);
    }
  }
  return out;
}

/**
 * @param {object} params
 * @param {Array} params.items
 * @param {number} params.startIndex
 * @param {number} params.endIndex
 * @param {string} params.keyField
 * @param {Function} params.getActiveView
 * @param {Array|undefined} params.prevActiveRenderedViews
 * @returns {Array}
 */
export function rebuildActiveRenderedViews({
  items,
  startIndex,
  endIndex,
  keyField,
  getActiveView,
  prevActiveRenderedViews,
}) {
  const next = collectActiveRenderedViewsInIndexOrder({
    items,
    startIndex,
    endIndex,
    keyField,
    getActiveView,
  });
  if (areSameActiveRenderedViews(prevActiveRenderedViews, next)) {
    return prevActiveRenderedViews;
  }
  return next;
}
