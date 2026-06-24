/**
 * Подскролл ячейки в видимую область между липкой шапкой страницы и нижней границей visualViewport (клавиатура).
 * Лёгкая альтернатива удалённой `mobile-cell-scroll-session.js`: один проход без состояния сессии.
 */

import { rectsOverlap2D } from "./mobile-keyboard-viewport.js";

const EDGE_MARGIN_PX = 8;

/**
 * Нижняя граница видимой области контента в координатах viewport (учёт клавиатуры через visualViewport при наличии).
 * @param {VisualViewport | null | undefined} vv
 * @param {number} innerHeight
 */
export function getVisualViewportBottomBound(vv, innerHeight) {
  if (vv && typeof vv.offsetTop === "number" && typeof vv.height === "number") {
    return vv.offsetTop + vv.height;
  }
  return innerHeight;
}

/**
 * Нижняя граница, не закрытая оверлей-клавиатурой (Chromium `navigator.virtualKeyboard.overlaysContent = true`).
 * @param {DOMRect | { top: number, height: number } | null | undefined} vkBoundingRect
 * @param {number} innerHeight
 */
export function getVirtualKeyboardOverlayBottomBound(vkBoundingRect, innerHeight) {
  if (!vkBoundingRect || typeof vkBoundingRect.height !== "number" || vkBoundingRect.height < 8) {
    return innerHeight;
  }
  if (typeof vkBoundingRect.top !== "number" || !Number.isFinite(vkBoundingRect.top)) {
    return innerHeight;
  }
  if (vkBoundingRect.top >= innerHeight) {
    return innerHeight;
  }
  return Math.max(0, vkBoundingRect.top);
}

/**
 * Pure plan for vertical scroll-into-view (no DOM mutation).
 *
 * @param {{
 *   cellRootEl: Element,
 *   scrollContainerEl: Element | null,
 *   pageStickyBottomPx: number | null | undefined,
 *   visualViewport: VisualViewport | null | undefined,
 *   windowInnerHeight: number,
 *   virtualKeyboardBoundingRect?: DOMRect | { top: number, height: number } | null,
 *   scrollTop?: number,
 * }} args
 */
export function computeScrollIntoViewPlan({
  cellRootEl,
  scrollContainerEl,
  pageStickyBottomPx,
  visualViewport,
  windowInnerHeight,
  virtualKeyboardBoundingRect = null,
  scrollTop = scrollContainerEl?.scrollTop ?? 0,
}) {
  const invalid = {
    valid: false,
    safeTop: null,
    safeBottom: null,
    vvBottom: null,
    vkBottom: null,
    containerBottom: null,
    cellTop: null,
    cellBottom: null,
    delta: 0,
    wouldChange: false,
    vkHeight: null,
    scrollTopBefore: scrollTop,
    scrollTopAfter: scrollTop,
  };
  if (!cellRootEl?.getBoundingClientRect || !scrollContainerEl) {
    return invalid;
  }
  const cellRect = cellRootEl.getBoundingClientRect();
  const containerRect = typeof scrollContainerEl.getBoundingClientRect === "function"
    ? scrollContainerEl.getBoundingClientRect()
    : null;
  const stickyBottom = Math.max(0, Number(pageStickyBottomPx) || 0);
  const safeTop = Math.max(
    stickyBottom,
    containerRect && Number.isFinite(containerRect.top) ? containerRect.top : 0,
  ) + EDGE_MARGIN_PX;
  const vvBottom = getVisualViewportBottomBound(visualViewport, windowInnerHeight);
  const vkBottom = getVirtualKeyboardOverlayBottomBound(virtualKeyboardBoundingRect, windowInnerHeight);
  const vkHeight = virtualKeyboardBoundingRect && typeof virtualKeyboardBoundingRect.height === "number"
    ? virtualKeyboardBoundingRect.height
    : null;
  const containerBottom = containerRect && Number.isFinite(containerRect.bottom)
    ? containerRect.bottom
    : Number.POSITIVE_INFINITY;
  const safeBottom = Math.min(vvBottom, vkBottom, containerBottom) - EDGE_MARGIN_PX;

  if (!Number.isFinite(safeBottom) || safeBottom <= safeTop) {
    return {
      ...invalid,
      valid: false,
      safeTop,
      safeBottom,
      vvBottom,
      vkBottom,
      containerBottom: Number.isFinite(containerBottom) ? containerBottom : null,
      cellTop: cellRect.top,
      cellBottom: cellRect.bottom,
      vkHeight,
    };
  }

  let delta = 0;
  if (cellRect.top < safeTop) {
    delta -= safeTop - cellRect.top;
  }
  if (cellRect.bottom > safeBottom) {
    delta += cellRect.bottom - safeBottom;
  }

  const sc = scrollContainerEl;
  const prevTop = scrollTop;
  const maxScroll = Math.max(0, sc.scrollHeight - sc.clientHeight);
  const scrollTopAfter = delta === 0
    ? prevTop
    : Math.max(0, Math.min(maxScroll, prevTop + delta));

  return {
    valid: true,
    safeTop,
    safeBottom,
    vvBottom,
    vkBottom,
    containerBottom: Number.isFinite(containerBottom) ? containerBottom : null,
    cellTop: cellRect.top,
    cellBottom: cellRect.bottom,
    delta,
    wouldChange: delta !== 0 && scrollTopAfter !== prevTop,
    vkHeight,
    scrollTopBefore: prevTop,
    scrollTopAfter,
  };
}

/**
 * @param {{
 *   cellRootEl: Element,
 *   scrollContainerEl: Element | null,
 *   pageStickyBottomPx: number | null | undefined,
 *   visualViewport: VisualViewport | null | undefined,
 *   windowInnerHeight: number,
 *   virtualKeyboardBoundingRect?: DOMRect | { top: number, height: number } | null,
 * }} args
 * @returns {{ changed: boolean, plan: ReturnType<typeof computeScrollIntoViewPlan> }}
 */
export function scrollCellIntoEditableViewport({
  cellRootEl,
  scrollContainerEl,
  pageStickyBottomPx,
  visualViewport,
  windowInnerHeight,
  virtualKeyboardBoundingRect = null,
}) {
  if (!cellRootEl?.getBoundingClientRect || !scrollContainerEl) {
    return {
      changed: false,
      plan: computeScrollIntoViewPlan({
        cellRootEl,
        scrollContainerEl,
        pageStickyBottomPx,
        visualViewport,
        windowInnerHeight,
        virtualKeyboardBoundingRect,
      }),
    };
  }
  const sc = scrollContainerEl;
  const plan = computeScrollIntoViewPlan({
    cellRootEl,
    scrollContainerEl: sc,
    pageStickyBottomPx,
    visualViewport,
    windowInnerHeight,
    virtualKeyboardBoundingRect,
    scrollTop: sc.scrollTop,
  });
  if (!plan.valid || !plan.wouldChange) {
    return { changed: false, plan };
  }
  const prevTop = sc.scrollTop;
  sc.scrollTop = plan.scrollTopAfter;
  const changed = sc.scrollTop !== prevTop;
  return {
    changed,
    plan: {
      ...plan,
      scrollTopBefore: prevTop,
      scrollTopAfter: sc.scrollTop,
      wouldChange: changed,
    },
  };
}

/**
 * Подскролл горизонтального контейнера таблицы, если ячейка обрезана по X.
 * @param {{
 *   cellRootEl: Element,
 *   horizontalScrollEl: Element | null,
 * }} args
 * @returns {boolean}
 */
export function scrollCellIntoEditableViewportHorizontally({
  cellRootEl,
  horizontalScrollEl,
}) {
  if (!cellRootEl?.getBoundingClientRect || !horizontalScrollEl) {
    return false;
  }
  const cellRect = cellRootEl.getBoundingClientRect();
  const containerRect = horizontalScrollEl.getBoundingClientRect?.();
  if (!containerRect) {
    return false;
  }
  const safeLeft = containerRect.left + EDGE_MARGIN_PX;
  const safeRight = containerRect.right - EDGE_MARGIN_PX;
  if (!Number.isFinite(safeRight) || safeRight <= safeLeft) {
    return false;
  }

  let delta = 0;
  if (cellRect.left < safeLeft) {
    delta -= safeLeft - cellRect.left;
  }
  if (cellRect.right > safeRight) {
    delta += cellRect.right - safeRight;
  }
  if (delta === 0) {
    return false;
  }

  const sc = horizontalScrollEl;
  const prevLeft = sc.scrollLeft;
  const maxScroll = Math.max(0, sc.scrollWidth - sc.clientWidth);
  sc.scrollLeft = Math.max(0, Math.min(maxScroll, prevLeft + delta));
  return sc.scrollLeft !== prevLeft;
}

/**
 * Пересечение ячейки с «липкой зоной» страницы от верха viewport до нижней границы шапки (табы, инфо).
 * @param {DOMRect} cellRect
 * @param {number | null | undefined} pageStickyBottomPx
 * @param {number} innerWidth
 */
export function cellOverlapsPageStickyZone(cellRect, pageStickyBottomPx, innerWidth) {
  const topBound = Number(pageStickyBottomPx);
  if (!Number.isFinite(topBound) || topBound <= 0) {
    return false;
  }
  let effectiveInnerWidth = Number(innerWidth);
  if (!Number.isFinite(effectiveInnerWidth) || effectiveInnerWidth <= 0) {
    if (typeof document !== "undefined" && document.documentElement) {
      const fallback = document.documentElement.clientWidth;
      if (Number.isFinite(fallback) && fallback > 0) {
        effectiveInnerWidth = fallback;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  const zone = {
    left: 0,
    right: effectiveInnerWidth,
    top: 0,
    bottom: topBound,
  };
  return rectsOverlap2D(cellRect, zone);
}
