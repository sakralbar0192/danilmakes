/**
 * Пропуск обновления видимого диапазона виртуализатора при слишком малом сдвиге скролла.
 * По умолчанию: (minItemSize != null && diff < minItemSize) || diff < cacheMinSize.
 *
 * Если задан `absoluteSkipThresholdPx` (число), используется только он: пропуск при diff < порога.
 * Меньший порог (например 1) даёт более плавное обновление при фиксированных высотах строк.
 */
// eslint-disable-next-line import/prefer-default-export
export function shouldSkipVirtualizerScrollUpdate({
  positionDiff,
  minItemSize,
  cacheMinSize,
  absoluteSkipThresholdPx = null,
}) {
  if (absoluteSkipThresholdPx != null && typeof absoluteSkipThresholdPx === "number") {
    return positionDiff < absoluteSkipThresholdPx;
  }
  return (minItemSize != null && positionDiff < minItemSize)
    || positionDiff < cacheMinSize;
}
