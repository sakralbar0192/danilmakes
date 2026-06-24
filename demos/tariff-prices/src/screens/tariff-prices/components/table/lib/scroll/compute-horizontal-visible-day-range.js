/**
 * Диапазон индексов дней календаря, попадающих в горизонтально прокручиваемую область + буфер в колонках.
 *
 * @param {object} p
 * @param {number} p.scrollLeft
 * @param {number} p.clientWidth
 * @param {number} p.nameColumnWidth — ширина колонки названия до первого дня
 * @param {number} p.cellWidth
 * @param {number} p.dayCount
 * @param {number} [p.bufferColumns=10] — шире окно → реже смена диапазона при горизонтальном скролле (больше колонок в DOM).
 */
// eslint-disable-next-line import/prefer-default-export
export function computeHorizontalVisibleDayRange({
  scrollLeft,
  clientWidth,
  nameColumnWidth,
  cellWidth,
  dayCount,
  bufferColumns = 10,
}) {
  if (!dayCount || cellWidth <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  const dayAreaLeft = nameColumnWidth;
  const dayAreaRight = dayAreaLeft + dayCount * cellWidth;
  const viewLeft = scrollLeft;
  const viewRight = scrollLeft + Math.max(0, clientWidth);

  const intersectLeft = Math.max(viewLeft, dayAreaLeft);
  const intersectRight = Math.min(viewRight, dayAreaRight);

  if (intersectLeft >= intersectRight) {
    const mid = Math.floor(dayCount / 2);
    const span = Math.min(bufferColumns * 2 + 1, dayCount);
    const half = Math.floor(span / 2);
    return {
      startIndex: Math.max(0, mid - half),
      endIndex: Math.min(dayCount, mid - half + span),
    };
  }

  const first = Math.floor((intersectLeft - dayAreaLeft) / cellWidth);
  const lastExclusive = Math.ceil((intersectRight - dayAreaLeft) / cellWidth);

  const startIndex = Math.max(0, first - bufferColumns);
  let endIndex = Math.min(dayCount, lastExclusive + bufferColumns);

  if (endIndex <= startIndex) {
    endIndex = Math.min(dayCount, startIndex + 1);
  }

  return { startIndex, endIndex };
}
