/**
 * Гистерезис горизонтального окна дней: не сужаем уже опубликованный диапазон,
 * пока «сырой» диапазон от скролла полностью помещается внутрь предыдущего.
 * Так реже пересобираются видимые колонки при небольшом джиттере scrollLeft.
 *
 * Если предыдущее окно покрывает весь календарь — всегда принимаем новый диапазон
 * (первый переход от полной ширины к срезу).
 *
 * @param {object|null|undefined} prev — { startIndex, endIndex } (end исключительный)
 * @param {{ startIndex: number, endIndex: number }} next
 * @param {number} dayCount
 */
// eslint-disable-next-line import/prefer-default-export
export function mergeHorizontalDayRangeWithHysteresis(prev, next, dayCount) {
  if (!next || next.endIndex <= next.startIndex) {
    return { startIndex: next?.startIndex ?? 0, endIndex: next?.endIndex ?? 0 };
  }
  if (!prev || prev.endIndex <= prev.startIndex) {
    return { startIndex: next.startIndex, endIndex: next.endIndex };
  }
  const prevSpan = prev.endIndex - prev.startIndex;
  if (prevSpan >= dayCount) {
    return { startIndex: next.startIndex, endIndex: next.endIndex };
  }
  if (
    next.startIndex >= prev.startIndex
    && next.endIndex <= prev.endIndex
  ) {
    return { startIndex: prev.startIndex, endIndex: prev.endIndex };
  }
  return { startIndex: next.startIndex, endIndex: next.endIndex };
}
