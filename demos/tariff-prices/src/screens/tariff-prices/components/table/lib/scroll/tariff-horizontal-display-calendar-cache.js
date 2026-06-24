/**
 * Императивный кэш среза календаря для provide `tariffTableHorizontalDisplayCalendar`.
 * Стабильная ссылка на массив при неизменном окне; rolling extend при расширении диапазона.
 */

/**
 * @param {Array} calendar
 * @param {{ startIndex: number, endIndex: number }|null|undefined} window
 * @returns {string}
 */
export function buildHorizontalDisplayCalendarCacheKey(calendar, window) {
  const cal = calendar ?? [];
  const len = cal.length;
  if (!len) {
    return "empty";
  }
  const w = window;
  if (!w || w.endIndex <= w.startIndex) {
    return `full:${len}:${cal[0]?.date ?? ""}:${cal[len - 1]?.date ?? ""}`;
  }
  const end = Math.min(len, w.endIndex);
  const first = cal[w.startIndex]?.date ?? "";
  const last = cal[end - 1]?.date ?? "";
  return `${w.startIndex}:${end}:${first}:${last}:${len}`;
}

/**
 * @param {object} params
 * @param {Array} params.calendar
 * @param {{ startIndex: number, endIndex: number }|null|undefined} params.window
 * @param {{ key?: string, slice?: Array }|null|undefined} params.prevCache
 * @returns {{ key: string, slice: Array }}
 */
export function resolveHorizontalDisplayCalendarSlice({
  calendar,
  window,
  prevCache = null,
}) {
  const cal = calendar ?? [];
  const key = buildHorizontalDisplayCalendarCacheKey(cal, window);

  if (!cal.length) {
    return { key, slice: cal };
  }

  const w = window;
  if (!w || w.endIndex <= w.startIndex) {
    if (prevCache?.key === key && prevCache.slice === cal) {
      return prevCache;
    }
    if (prevCache?.key === key && Array.isArray(prevCache.slice) && prevCache.slice.length === cal.length) {
      return prevCache;
    }
    return { key, slice: cal };
  }

  const startIndex = w.startIndex;
  const endIndex = Math.min(cal.length, w.endIndex);

  if (prevCache?.key === key && Array.isArray(prevCache.slice)) {
    return prevCache;
  }

  const prevSlice = prevCache?.slice;
  const prevKey = prevCache?.key ?? "";
  const canRoll = prevSlice?.length && prevKey && prevKey !== "empty" && prevKey !== key;

  if (canRoll) {
    const prevParts = prevKey.split(":");
    const prevStart = Number(prevParts[0]);
    const prevEnd = Number(prevParts[1]);
    const overlaps = startIndex < prevEnd && endIndex > prevStart;
    const expands = startIndex <= prevStart && endIndex >= prevEnd;
    const subsetShift = startIndex >= prevStart && endIndex <= prevEnd;

    if (subsetShift && prevSlice.length === prevEnd - prevStart) {
      const offset = startIndex - prevStart;
      const nextSlice = prevSlice.slice(offset, offset + (endIndex - startIndex));
      return { key, slice: nextSlice };
    }

    if (overlaps && (expands || endIndex > prevEnd || startIndex < prevStart)) {
      const nextSlice = [];
      for (let i = startIndex; i < endIndex; i++) {
        const prevIdx = i - prevStart;
        if (i >= prevStart && i < prevEnd && prevSlice[prevIdx] !== undefined) {
          nextSlice.push(prevSlice[prevIdx]);
        } else {
          nextSlice.push(cal[i]);
        }
      }
      return { key, slice: nextSlice };
    }
  }

  return {
    key,
    slice: cal.slice(startIndex, endIndex),
  };
}

/**
 * @param {{ key?: string, slice?: Array }|null|undefined} cache
 * @returns {Array}
 */
export function getHorizontalDisplayCalendarFromCache(cache) {
  return cache?.slice ?? [];
}
