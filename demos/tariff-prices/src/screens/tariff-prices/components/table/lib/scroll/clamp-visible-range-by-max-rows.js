/**
 * Сужает [startIndex, endIndex) до не более maxRows элементов, сохраняя верхнюю границу (startIndex).
 * Стабильнее при скролле, чем симметричное сжатие от центра.
 */
// eslint-disable-next-line import/prefer-default-export
export function clampVisibleRangeByMaxRows({
  startIndex, endIndex, itemCount, maxRows,
}) {
  if (maxRows == null || maxRows <= 0 || itemCount <= 0) {
    return { startIndex, endIndex };
  }

  const endClamped = Math.min(endIndex, itemCount);
  const startClamped = Math.max(0, Math.min(startIndex, endClamped));
  startIndex = startClamped;
  endIndex = endClamped;

  const span = endIndex - startIndex;
  if (span <= maxRows) {
    return { startIndex, endIndex };
  }

  const newEnd = Math.min(itemCount, startIndex + maxRows);
  return {
    startIndex,
    endIndex: Math.max(startIndex, newEnd),
  };
}
