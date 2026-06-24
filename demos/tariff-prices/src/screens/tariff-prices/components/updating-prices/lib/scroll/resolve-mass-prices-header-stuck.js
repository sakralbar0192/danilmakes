/**
 * Scroll offset (px) of the table header (.before) from the scroll container content top.
 */
export function resolveMassPricesHeaderOffsetTop({ headerEl, scrollContainerEl } = {}) {
  if (!headerEl || !scrollContainerEl) {
    return null;
  }

  const headerRect = headerEl.getBoundingClientRect();
  const containerRect = scrollContainerEl.getBoundingClientRect();

  return headerRect.top - containerRect.top + scrollContainerEl.scrollTop;
}

/**
 * scrollTop at which the second header row ("Все категории") should collapse after scrolling past it.
 */
export function resolveAllCategoriesRowCollapseScrollTop({
  headerOffsetTop,
  allCategoriesRowHeight,
} = {}) {
  if (headerOffsetTop == null || allCategoriesRowHeight == null) {
    return null;
  }

  return headerOffsetTop + Math.max(0, allCategoriesRowHeight);
}

/**
 * Whether row 2 should be collapsed — driven only by scrollTop, not by sticky rect checks.
 */
export function resolveShouldCollapseAllCategoriesRow({
  scrollTop,
  collapseScrollTop,
  isCollapsed,
  enterHysteresisPx = 4,
  leaveHysteresisPx = 12,
} = {}) {
  if (collapseScrollTop == null || Number.isNaN(collapseScrollTop)) {
    return false;
  }

  if (!isCollapsed) {
    return scrollTop >= collapseScrollTop + enterHysteresisPx;
  }

  return scrollTop >= collapseScrollTop - leaveHysteresisPx;
}
