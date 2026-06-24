/** @param {Element | null | undefined} scrollEl */
export function hasTableHorizontalOverflow(scrollEl) {
  if (!scrollEl) {
    return false;
  }
  return scrollEl.scrollWidth > scrollEl.clientWidth + 1;
}

/**
 * @param {Element | null | undefined} target
 * @param {number} scrollLeft
 */
export function syncHorizontalScrollLeft(target, scrollLeft) {
  if (!target) {
    return;
  }
  const next = Number.isFinite(scrollLeft) && scrollLeft > 0 ? scrollLeft : 0;
  if (Math.abs((target.scrollLeft || 0) - next) < 1) {
    return;
  }
  target.scrollLeft = next;
}
