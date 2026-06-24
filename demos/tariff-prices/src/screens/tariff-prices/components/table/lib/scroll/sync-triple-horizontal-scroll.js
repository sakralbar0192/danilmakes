import { syncHorizontalScrollLeft } from "./table-horizontal-scrollbar-track.js";

/**
 * Выставляет одинаковый scrollLeft на body, header и (опционально) track.
 * @param {{
 *   scrollLeft: number,
 *   bodyEl?: Element | null,
 *   headerEl?: Element | null,
 *   trackEl?: Element | null,
 *   syncTrack?: boolean,
 * }} args
 * @returns {boolean} true, если хотя бы один target изменился
 */
export function syncTripleHorizontalScrollLeft({
  scrollLeft,
  bodyEl = null,
  headerEl = null,
  trackEl = null,
  syncTrack = true,
} = {}) {
  const next = Number.isFinite(scrollLeft) && scrollLeft > 0 ? scrollLeft : 0;
  let changed = false;

  const apply = (el) => {
    if (!el) {
      return;
    }
    const prev = el.scrollLeft || 0;
    syncHorizontalScrollLeft(el, next);
    if (Math.abs((el.scrollLeft || 0) - prev) >= 1) {
      changed = true;
    }
  };

  apply(bodyEl);
  apply(headerEl);
  if (syncTrack) {
    apply(trackEl);
  }

  return changed;
}

/**
 * @param {{
 *   sourceEl?: Element | null,
 *   bodyEl?: Element | null,
 *   headerEl?: Element | null,
 *   trackEl?: Element | null,
 *   syncTrack?: boolean,
 * }} args
 * @returns {boolean}
 */
export function syncTripleHorizontalScrollFromSource({
  sourceEl = null,
  bodyEl = null,
  headerEl = null,
  trackEl = null,
  syncTrack = true,
} = {}) {
  if (!sourceEl) {
    return false;
  }
  return syncTripleHorizontalScrollLeft({
    scrollLeft: sourceEl.scrollLeft || 0,
    bodyEl,
    headerEl,
    trackEl,
    syncTrack,
  });
}

/**
 * Горизонтальный wheel (Shift+колёсико или преобладающий deltaX).
 * @param {WheelEvent} event
 * @returns {boolean}
 */
export function isHorizontalWheelEvent(event) {
  if (!event) {
    return false;
  }
  if (event.shiftKey) {
    return true;
  }
  return Math.abs(event.deltaX || 0) > Math.abs(event.deltaY || 0);
}
