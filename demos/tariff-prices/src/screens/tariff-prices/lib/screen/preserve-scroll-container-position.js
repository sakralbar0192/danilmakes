/**
 * @param {HTMLElement | null | undefined} scrollEl
 * @returns {{ scrollTop: number, scrollLeft: number } | null}
 */
export function captureScrollContainerPosition(scrollEl) {
  if (!scrollEl || typeof scrollEl.scrollTop !== "number") {
    return null;
  }
  return {
    scrollTop: scrollEl.scrollTop,
    scrollLeft: typeof scrollEl.scrollLeft === "number" ? scrollEl.scrollLeft : 0,
  };
}

/**
 * @param {HTMLElement | null | undefined} scrollEl
 * @param {{ scrollTop: number, scrollLeft: number } | null | undefined} snapshot
 */
export function restoreScrollContainerPosition(scrollEl, snapshot) {
  if (!scrollEl || !snapshot || typeof scrollEl.scrollTop !== "number") {
    return;
  }
  const maxTop = Math.max(0, (scrollEl.scrollHeight || 0) - (scrollEl.clientHeight || 0));
  scrollEl.scrollTop = Math.min(Math.max(0, snapshot.scrollTop), maxTop);
  if (typeof scrollEl.scrollLeft === "number" && typeof snapshot.scrollLeft === "number") {
    const maxLeft = Math.max(0, (scrollEl.scrollWidth || 0) - (scrollEl.clientWidth || 0));
    scrollEl.scrollLeft = Math.min(Math.max(0, snapshot.scrollLeft), maxLeft);
  }
}

/**
 * Parts для refetch после mass save ограничений (drawer / drag selection).
 *
 * @param {{ isDependentTariff?: boolean }} options
 * @returns {string[]}
 */
export function buildMassRestrictionsRefetchParts({ isDependentTariff = false } = {}) {
  const parts = ["restrictions"];
  if (isDependentTariff) {
    parts.push("meta");
  }
  return parts;
}
