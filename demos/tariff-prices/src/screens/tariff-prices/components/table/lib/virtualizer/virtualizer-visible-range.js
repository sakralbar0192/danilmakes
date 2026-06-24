/**
 * Диапазон индексов видимых элементов виртуализатора по смещениям скролла и кэшу измерений.
 */
// eslint-disable-next-line import/prefer-default-export
export function extractVisibleItemRange({
  scrollStart,
  scrollEnd,
  beforeHeight = 0,
  afterHeight = 0,
  buffer = 0,
  itemCount,
  measurementCache,
}) {
  if (itemCount <= 0 || !measurementCache) {
    return { startIndex: 0, endIndex: 0 };
  }

  const start = scrollStart - beforeHeight - buffer;
  const end = scrollEnd + afterHeight + buffer;

  let low = 0;
  let high = itemCount;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (measurementCache.getEndOffset(mid) > start) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  const startIndex = low;
  let endIndex = startIndex;

  while (endIndex < itemCount && measurementCache.getStartOffset(endIndex) < end) {
    endIndex++;
  }

  if (itemCount > 0) {
    const totalSize = measurementCache.getEndOffset(itemCount - 1);
    if (end >= totalSize - 1) {
      endIndex = itemCount;
    }
  }

  return {
    startIndex: Math.max(0, startIndex),
    endIndex: Math.min(endIndex, itemCount),
  };
}
