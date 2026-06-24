/**
 * Синхронизация пула VirtualView с видимым диапазоном [startIndex, endIndex).
 * Императивно мутирует pool и virtualElements; createView — фабрика нового view (регистрация в списке — снаружи).
 */

/**
 * @param {object} params
 * @param {number} params.startIndex
 * @param {number} params.endIndex
 * @param {Array} params.items
 * @param {string} params.keyField
 * @param {string} params.typeField
 * @param {{ getStartOffset: (i: number) => number }} params.measurementCache
 * @param {{ getActiveView: Function, getRecycledView: Function, putActiveView: Function }} params.pool
 * @param {Set} params.virtualElementsSet
 * @param {Array} params.virtualElements
 * @param {Function} params.createView (item, key, type, index) => view
 * @param {boolean} params.disableTransform
 */
// eslint-disable-next-line import/prefer-default-export
export function syncVirtualizerVisibleViews({
  startIndex,
  endIndex,
  items,
  keyField,
  typeField,
  measurementCache,
  pool,
  virtualElementsSet,
  virtualElements,
  createView,
  disableTransform,
}) {
  for (let i = startIndex; i < endIndex; i++) {
    const item = items[i];
    const key = item[keyField];
    if (key == null) {
      throw new Error(`Key is ${key} on item (keyField is '${keyField}')`);
    }

    let activeView = pool.getActiveView(key);

    if (!activeView) {
      activeView = pool.getRecycledView(item[typeField]);

      if (activeView) {
        activeView.setItemState({
          item,
          index: i,
          key,
        });
        if (!virtualElementsSet.has(activeView)) {
          virtualElements.push(activeView);
          virtualElementsSet.add(activeView);
        }
      } else {
        activeView = createView(item, key, item[typeField], i);
      }

      pool.putActiveView(key, activeView);
    } else if (activeView.item !== item) {
      activeView.item = item;
    }

    const styleStampBefore = activeView.styleStamp;
    activeView.setPosition(measurementCache.getStartOffset(i));
    if (activeView.styleStamp !== styleStampBefore) {
      activeView.updateStyle(disableTransform);
    }
  }
}
