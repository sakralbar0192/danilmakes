/**
 * Нужен ли forceUpdate виртуализатора при resize scroll-контейнера.
 * @param {{ prevHeightPx: number, nextHeightPx: number, thresholdPx?: number, editSessionActive?: boolean }} args
 */
export function shouldRefreshVirtualizerOnViewportResize({
  prevHeightPx,
  nextHeightPx,
  thresholdPx = 24,
  editSessionActive = false,
} = {}) {
  if (editSessionActive) {
    return false;
  }
  if (!Number.isFinite(nextHeightPx) || nextHeightPx <= 0) {
    return false;
  }
  if (!Number.isFinite(prevHeightPx) || prevHeightPx <= 0) {
    return true;
  }
  return Math.abs(nextHeightPx - prevHeightPx) >= thresholdPx;
}
