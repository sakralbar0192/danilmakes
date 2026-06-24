import { extractVisibleItemRange } from "./virtualizer-visible-range.js";

function clampRangeWithVisiblePriority({
  rawStartIndex,
  rawEndIndex,
  visibleStartIndex,
  visibleEndIndex,
  itemCount,
  maxRows,
}) {
  if (maxRows == null || maxRows <= 0 || itemCount <= 0) {
    return {
      startIndex: Math.max(0, rawStartIndex),
      endIndex: Math.min(rawEndIndex, itemCount),
    };
  }

  const startIndex = Math.max(0, Math.min(rawStartIndex, itemCount));
  const endIndex = Math.min(rawEndIndex, itemCount);
  const visStart = Math.max(0, Math.min(visibleStartIndex, itemCount));
  const visEnd = Math.min(visibleEndIndex, itemCount);

  if (endIndex - startIndex <= maxRows) {
    if (visEnd >= itemCount && endIndex < itemCount) {
      return { startIndex: Math.max(0, itemCount - maxRows), endIndex: itemCount };
    }
    return { startIndex, endIndex };
  }

  const coreStart = visStart;
  const coreEnd = visEnd;
  const coreSpan = coreEnd - coreStart;

  if (coreSpan > maxRows) {
    if (coreEnd >= itemCount) {
      return { startIndex: Math.max(0, itemCount - maxRows), endIndex: itemCount };
    }
    return {
      startIndex: coreStart,
      endIndex: Math.min(itemCount, coreStart + maxRows),
    };
  }

  let budget = maxRows - coreSpan;
  const expandTop = Math.min(budget, Math.max(0, coreStart - startIndex));
  budget -= expandTop;
  const expandBottom = Math.min(budget, Math.max(0, endIndex - coreEnd));

  return {
    startIndex: coreStart - expandTop,
    endIndex: coreEnd + expandBottom,
  };
}

/**
 * Видимый диапазон индексов: extractVisibleItemRange + clamp по maxRenderedRows.
 * Visible-окно (без buffer) всегда включается в результат.
 */
// eslint-disable-next-line import/prefer-default-export
export function computeClampedVisibleItemRange({
  scrollStart,
  scrollEnd,
  beforeHeight = 0,
  afterHeight = 0,
  buffer = 0,
  itemCount,
  measurementCache,
  maxRenderedRows = null,
}) {
  const visible = extractVisibleItemRange({
    scrollStart,
    scrollEnd,
    beforeHeight,
    afterHeight,
    buffer: 0,
    itemCount,
    measurementCache,
  });
  const raw = extractVisibleItemRange({
    scrollStart,
    scrollEnd,
    beforeHeight,
    afterHeight,
    buffer,
    itemCount,
    measurementCache,
  });
  return clampRangeWithVisiblePriority({
    rawStartIndex: raw.startIndex,
    rawEndIndex: raw.endIndex,
    visibleStartIndex: visible.startIndex,
    visibleEndIndex: visible.endIndex,
    itemCount,
    maxRows: maxRenderedRows,
  });
}
