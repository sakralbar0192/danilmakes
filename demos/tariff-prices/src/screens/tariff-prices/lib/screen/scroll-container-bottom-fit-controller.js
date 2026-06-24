import { clampBottomOcclusionForMinScrollViewport,
  computeBottomOcclusionPx,
  computeKeyboardIntrusionPx,
  computeTableStickyTopPx,
  computeTableStickyTopRelativePx,
  computeVirtualKeyboardOverlayIntrusionPx,
  resolveAppHeaderBottomPx,
  resolveScrollContainerKeyboardIntrusionPx } from "./scroll-container-bottom-fit.js";
import { SCROLL_FIT_CSS_VAR_JITTER_PX,
  MOBILE_EDIT_TOUCH_HOLD_MS } from "../../components/table/config/table-grid-metrics.js";

const CSS_TOP = "--prices-table-top-offset";
export const CSS_STICKY_TOP = "--prices-table-sticky-top";
export const CSS_STICKY_TOP_RELATIVE = "--prices-table-sticky-top-relative";
const CSS_BOTTOM = "--prices-table-bottom-occlusion";
export const CSS_PAGE_STICKY_HEIGHT = "--prices-page-sticky-header-height";

/**
 * @param {{
 *   window: Window | null,
 *   document: Document | null,
 *   getScrollContainerEl: () => HTMLElement | null | undefined,
 *   getPageFooterEl: () => HTMLElement | null | undefined,
 *   getAppMobileFooterEl: () => HTMLElement | null | undefined,
 *   isAppMobileFooterHidden?: () => boolean,
 *   getPageStickyHeaderEl?: () => HTMLElement | null | undefined,
 *   isPageStickyHeightEnabled?: () => boolean,
 *   isMobileInlineEditActive?: () => boolean,
 *   getMobileKeyboardAffectsScrollLayout?: () => boolean,
 *   touchHoldMs?: number,
 *   now?: () => number,
 * }} options
 */
export function createScrollContainerBottomFitController({
  window: win,
  document: doc,
  getScrollContainerEl,
  getPageFooterEl,
  getAppMobileFooterEl,
  isAppMobileFooterHidden = () => false,
  getPageStickyHeaderEl = () => null,
  isPageStickyHeightEnabled = () => false,
  isMobileInlineEditActive = () => false,
  getMobileKeyboardAffectsScrollLayout = () => false,
  touchHoldMs = MOBILE_EDIT_TOUCH_HOLD_MS,
  now = () => Date.now(),
}) {
  let started = false;
  let rafId = null;
  let resizeHandler = null;
  let orientationHandler = null;
  let vvHandler = null;
  let vkHandler = null;
  /** @type {ResizeObserver | null} */
  let resizeObserver = null;
  /** @type {MutationObserver | null} */
  let bodyClassObserver = null;
  let pointerDownHandler = null;
  let touchStartHandler = null;
  /** Время (мс), до которого нельзя уменьшать применённый occlusion. */
  let touchHoldUntilMs = 0;
  /** Таймер на пересчёт после истечения hold-окна, чтобы применить «сжатые» значения. */
  let touchHoldReleaseTimer = null;
  /** Последнее ПРИМЕНЁННОЕ значение `--prices-table-bottom-occlusion`. */
  let lastAppliedOcclusionPx = 0;
  /** Для лёгкого reflow fixed-футера после закрытия клавиатуры (WebKit). */
  let prevKeyboardIntrusionPx = null;
  /** Debounce VV при открытой клавиатуре — меньше лишних пересчётов при смене фокуса между ячейками. */
  let vvScheduleTimer = null;
  let lastAppliedTopOffsetPx = null;
  let lastAppliedStickyTopPx = null;
  let lastAppliedStickyTopRelativePx = null;
  let lastAppliedBottomOcclusionCssPx = null;
  /** Memoization для refreshResizeObserverTargets — пересобираем только при изменении набора целей. */
  let observedRoTargetsKey = "";

  function shouldApplyCssVar(nextValue, prevValue) {
    if (prevValue == null || !Number.isFinite(prevValue)) {
      return true;
    }
    if (!Number.isFinite(nextValue)) {
      return true;
    }
    return Math.abs(nextValue - prevValue) >= SCROLL_FIT_CSS_VAR_JITTER_PX;
  }

  function scheduleRecompute() {
    if (!win || rafId != null) {
      return;
    }
    rafId = win.requestAnimationFrame(() => {
      rafId = null;
      // eslint-disable-next-line no-use-before-define
      recompute();
    });
  }

  function isLikelyKeyboardOpenForCoalesce() {
    if (!win) {
      return false;
    }
    const innerH = typeof win.innerHeight === "number" && Number.isFinite(win.innerHeight)
      ? win.innerHeight
      : 0;
    if (innerH <= 0) {
      return false;
    }
    const vvKb = computeKeyboardIntrusionPx({
      visualViewport: win.visualViewport,
      windowInnerHeight: innerH,
    });
    const nav = win.navigator;
    const vkKb = computeVirtualKeyboardOverlayIntrusionPx(nav, innerH);
    const kb = Math.max(vvKb, vkKb);
    const vv = win.visualViewport;
    if (kb > 12) {
      return true;
    }
    if (vv && typeof vv.height === "number" && vv.height < innerH * 0.94) {
      return true;
    }
    return false;
  }

  function scheduleRecomputeVisualViewport() {
    if (!win) {
      return;
    }
    const delay = isLikelyKeyboardOpenForCoalesce() ? 32 : 0;
    if (delay === 0) {
      if (vvScheduleTimer != null) {
        win.clearTimeout(vvScheduleTimer);
        vvScheduleTimer = null;
      }
      scheduleRecompute();
      return;
    }
    if (vvScheduleTimer != null) {
      win.clearTimeout(vvScheduleTimer);
    }
    vvScheduleTimer = win.setTimeout(() => {
      vvScheduleTimer = null;
      scheduleRecompute();
    }, delay);
  }

  function nudgePageFooterRepaint(pageFooterEl) {
    if (!pageFooterEl?.getBoundingClientRect || !win) {
      return;
    }
    const el = pageFooterEl;
    win.requestAnimationFrame(() => {
      (function readFooterLayoutForWebKitRepaint(footer) {
        return footer.offsetHeight + footer.getBoundingClientRect().height;
      }(el));
    });
  }

  function refreshResizeObserverTargets() {
    if (!resizeObserver) {
      return;
    }
    const scrollEl = getScrollContainerEl?.() || null;
    const pf = getPageFooterEl?.() || null;
    const af = isAppMobileFooterHidden() ? null : (getAppMobileFooterEl?.() || null);
    const pageHeader = isPageStickyHeightEnabled() ? (getPageStickyHeaderEl?.() || null) : null;

    // Сборка стабильного ключа набора целей: при идентичных DOM-ссылках skipаем disconnect/observe цикл
    // (на каждый VV/resize переподключение RO давало ~4 disconnect+observe вызовов и микросекундные паузы).
    const targets = [scrollEl, pf, af, pageHeader];
    const key = targets.map((el) => {
      if (!el) {
        return "0";
      }
      let id = el.__bnovoScrollFitRoId;
      if (!id) {
        id = `t${(refreshResizeObserverTargets.__counter = (refreshResizeObserverTargets.__counter || 0) + 1)}`;
        try {
          el.__bnovoScrollFitRoId = id;
        } catch (err) {
          // ignore (frozen object — крайне маловероятно для HTMLElement)
        }
      }
      return id;
    }).join("|");

    if (key === observedRoTargetsKey) {
      return;
    }
    observedRoTargetsKey = key;

    try {
      resizeObserver.disconnect();
    } catch (err) {
      // ignore
    }
    for (let i = 0; i < targets.length; i++) {
      const el = targets[i];
      if (!el) {
        continue;
      }
      try {
        resizeObserver.observe(el);
      } catch (err) {
        // ignore
      }
    }
  }

  function applyPageStickyHeaderHeight(scrollEl) {
    if (!isPageStickyHeightEnabled()) {
      scrollEl.style.removeProperty(CSS_PAGE_STICKY_HEIGHT);
      return;
    }
    const pageHeader = getPageStickyHeaderEl?.();
    const height = pageHeader
      ? Math.max(0, Math.round(pageHeader.offsetHeight || 0))
      : 0;
    scrollEl.style.setProperty(CSS_PAGE_STICKY_HEIGHT, `${height}px`);
  }

  function recompute() {
    const el = getScrollContainerEl?.();
    if (!el?.getBoundingClientRect || !el.style) {
      return;
    }
    const innerH = typeof win?.innerHeight === "number" && Number.isFinite(win.innerHeight)
      ? win.innerHeight
      : 0;
    if (innerH <= 0) {
      return;
    }

    const rect = el.getBoundingClientRect();
    const topOffset = Math.max(0, rect.top + 15);
    const appHeaderBottomPx = resolveAppHeaderBottomPx(doc);
    const stickyTop = computeTableStickyTopPx({
      scrollContainerTopPx: topOffset,
      appHeaderBottomPx,
    });
    const stickyTopRelative = computeTableStickyTopRelativePx({
      scrollContainerTopPx: topOffset,
      appHeaderBottomPx,
    });

    let pageRect = null;
    const pf = getPageFooterEl?.();
    if (pf?.getBoundingClientRect) {
      pageRect = pf.getBoundingClientRect();
    }

    let appRect = null;
    if (!isAppMobileFooterHidden()) {
      const af = getAppMobileFooterEl?.();
      if (af?.getBoundingClientRect) {
        appRect = af.getBoundingClientRect();
      }
    }

    const vvKb = computeKeyboardIntrusionPx({
      visualViewport: win?.visualViewport,
      windowInnerHeight: innerH,
    });
    const nav = typeof win !== "undefined" && win?.navigator ? win.navigator : null;
    const vkKb = computeVirtualKeyboardOverlayIntrusionPx(nav, innerH);
    let keyboardIntrusionPx = resolveScrollContainerKeyboardIntrusionPx({
      visualViewport: win?.visualViewport,
      windowInnerHeight: innerH,
      navigatorLike: nav,
      vvIntrusionPx: vvKb,
      vkIntrusionPx: vkKb,
      mobileInlineEditActive: getMobileKeyboardAffectsScrollLayout(),
    });
    const inlineEditActive = isMobileInlineEditActive();
    if (
      inlineEditActive
      && keyboardIntrusionPx <= 20
      && prevKeyboardIntrusionPx != null
      && prevKeyboardIntrusionPx > 48
      && vkKb >= 48
    ) {
      keyboardIntrusionPx = Math.max(keyboardIntrusionPx, vkKb);
    }

    const computedOcclusion = computeBottomOcclusionPx({
      pageFooterRect: pageRect,
      appMobileFooterRect: appRect,
      keyboardIntrusionPx,
      windowInnerHeight: innerH,
    });

    // Между pointerdown и click нельзя позволять контейнеру расти (occlusion не должен уменьшаться):
    // иначе scrollTop клампится при достижении нового max, контент сдвигается, и click попадает не туда.
    const holding = now() < touchHoldUntilMs;
    let bottomOcclusion = holding
      ? Math.max(computedOcclusion, lastAppliedOcclusionPx)
      : computedOcclusion;
    if (
      holding
      && isMobileInlineEditActive()
      && keyboardIntrusionPx <= 20
      && computedOcclusion < lastAppliedOcclusionPx
    ) {
      bottomOcclusion = computedOcclusion;
    }

    bottomOcclusion = clampBottomOcclusionForMinScrollViewport({
      topOffsetPx: topOffset,
      bottomOcclusionPx: bottomOcclusion,
      windowInnerHeight: innerH,
    });

    if (
      inlineEditActive
      && !holding
      && keyboardIntrusionPx <= 20
      && prevKeyboardIntrusionPx != null
      && prevKeyboardIntrusionPx > 48
      && vkKb >= 48
      && bottomOcclusion < lastAppliedOcclusionPx * 0.5
    ) {
      bottomOcclusion = Math.max(bottomOcclusion, lastAppliedOcclusionPx * 0.5);
      bottomOcclusion = clampBottomOcclusionForMinScrollViewport({
        topOffsetPx: topOffset,
        bottomOcclusionPx: bottomOcclusion,
        windowInnerHeight: innerH,
      });
    }

    const kbDroppedForRepaint = prevKeyboardIntrusionPx != null
      && prevKeyboardIntrusionPx > 48
      && keyboardIntrusionPx <= 20;
    prevKeyboardIntrusionPx = keyboardIntrusionPx;

    lastAppliedOcclusionPx = bottomOcclusion;

    if (shouldApplyCssVar(topOffset, lastAppliedTopOffsetPx)) {
      el.style.setProperty(CSS_TOP, `${topOffset}px`);
      lastAppliedTopOffsetPx = topOffset;
    }
    if (shouldApplyCssVar(stickyTop, lastAppliedStickyTopPx)) {
      el.style.setProperty(CSS_STICKY_TOP, `${stickyTop}px`);
      lastAppliedStickyTopPx = stickyTop;
    }
    if (shouldApplyCssVar(stickyTopRelative, lastAppliedStickyTopRelativePx)) {
      el.style.setProperty(CSS_STICKY_TOP_RELATIVE, `${stickyTopRelative}px`);
      lastAppliedStickyTopRelativePx = stickyTopRelative;
    }
    if (shouldApplyCssVar(bottomOcclusion, lastAppliedBottomOcclusionCssPx)) {
      el.style.setProperty(CSS_BOTTOM, `${bottomOcclusion}px`);
      lastAppliedBottomOcclusionCssPx = bottomOcclusion;
    }
    applyPageStickyHeaderHeight(el);

    if (kbDroppedForRepaint && pf?.style) {
      nudgePageFooterRepaint(pf);
    }

    refreshResizeObserverTargets();
  }

  function armTouchHold() {
    touchHoldUntilMs = now() + touchHoldMs;
    if (touchHoldReleaseTimer != null && win) {
      win.clearTimeout(touchHoldReleaseTimer);
      touchHoldReleaseTimer = null;
    }
    if (win && typeof win.setTimeout === "function") {
      touchHoldReleaseTimer = win.setTimeout(() => {
        touchHoldReleaseTimer = null;
        scheduleRecompute();
      }, touchHoldMs + 16);
    }
  }

  function onVirtualKeyboardGeometry() {
    scheduleRecompute();
  }

  function start() {
    if (started || !win) {
      return;
    }
    started = true;

    resizeHandler = () => scheduleRecompute();
    orientationHandler = () => scheduleRecompute();
    win.addEventListener("resize", resizeHandler);
    win.addEventListener("orientationchange", orientationHandler);

    const vv = win.visualViewport;
    if (vv) {
      vvHandler = () => scheduleRecomputeVisualViewport();
      vv.addEventListener("resize", vvHandler);
      vv.addEventListener("scroll", vvHandler);
    }

    const nav = win.navigator;
    const vk = nav?.virtualKeyboard;
    if (vk && typeof vk.addEventListener === "function") {
      vkHandler = onVirtualKeyboardGeometry;
      try {
        vk.addEventListener("geometrychange", vkHandler);
      } catch (err) {
        vkHandler = null;
      }
    }

    if (typeof win.ResizeObserver === "function") {
      resizeObserver = new win.ResizeObserver(() => scheduleRecompute());
    }

    if (doc?.body && typeof win.MutationObserver === "function") {
      bodyClassObserver = new win.MutationObserver(() => scheduleRecompute());
      try {
        bodyClassObserver.observe(doc.body, { attributes: true, attributeFilter: ["class"] });
      } catch (err) {
        bodyClassObserver = null;
      }
    }

    if (doc?.addEventListener) {
      // На современных мобильных устройствах оба события `pointerdown` и `touchstart` срабатывают
      // подряд при тапе — `armTouchHold` дублируется. Подписываемся только на `pointerdown`, если он
      // поддерживается. Для legacy WebView (без Pointer Events) fallback на `touchstart`.
      const hasPointerEvents = typeof win.PointerEvent === "function";
      pointerDownHandler = hasPointerEvents ? () => armTouchHold() : null;
      touchStartHandler = hasPointerEvents ? null : () => armTouchHold();
      if (pointerDownHandler) {
        try {
          doc.addEventListener("pointerdown", pointerDownHandler, { passive: true, capture: true });
        } catch (err) {
          doc.addEventListener("pointerdown", pointerDownHandler, true);
        }
      }
      if (touchStartHandler) {
        try {
          doc.addEventListener("touchstart", touchStartHandler, { passive: true, capture: true });
        } catch (err) {
          doc.addEventListener("touchstart", touchStartHandler, true);
        }
      }
    }

    refreshResizeObserverTargets();
    scheduleRecompute();
  }

  function destroy() {
    if (!started) {
      return;
    }
    started = false;

    if (rafId != null && win) {
      win.cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (resizeHandler && win) {
      win.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
    if (orientationHandler && win) {
      win.removeEventListener("orientationchange", orientationHandler);
      orientationHandler = null;
    }

    const vv = win?.visualViewport;
    if (vvHandler && vv) {
      vv.removeEventListener("resize", vvHandler);
      vv.removeEventListener("scroll", vvHandler);
    }
    vvHandler = null;

    const nav = win?.navigator;
    const vk = nav?.virtualKeyboard;
    if (vkHandler && vk && typeof vk.removeEventListener === "function") {
      try {
        vk.removeEventListener("geometrychange", vkHandler);
      } catch (err) {
        // ignore
      }
    }
    vkHandler = null;

    if (resizeObserver) {
      try {
        resizeObserver.disconnect();
      } catch (err) {
        // ignore
      }
      resizeObserver = null;
    }

    if (bodyClassObserver) {
      try {
        bodyClassObserver.disconnect();
      } catch (err) {
        // ignore
      }
      bodyClassObserver = null;
    }

    if (pointerDownHandler && doc?.removeEventListener) {
      try {
        doc.removeEventListener("pointerdown", pointerDownHandler, { capture: true });
      } catch (err) {
        doc.removeEventListener("pointerdown", pointerDownHandler, true);
      }
    }
    pointerDownHandler = null;
    if (touchStartHandler && doc?.removeEventListener) {
      try {
        doc.removeEventListener("touchstart", touchStartHandler, { capture: true });
      } catch (err) {
        doc.removeEventListener("touchstart", touchStartHandler, true);
      }
    }
    touchStartHandler = null;
    if (touchHoldReleaseTimer != null && win?.clearTimeout) {
      win.clearTimeout(touchHoldReleaseTimer);
      touchHoldReleaseTimer = null;
    }
    touchHoldUntilMs = 0;
    lastAppliedOcclusionPx = 0;
    prevKeyboardIntrusionPx = null;
    observedRoTargetsKey = "";
    if (vvScheduleTimer != null && win?.clearTimeout) {
      win.clearTimeout(vvScheduleTimer);
      vvScheduleTimer = null;
    }

    const el = getScrollContainerEl?.();
    if (el?.style) {
      el.style.removeProperty(CSS_TOP);
      el.style.removeProperty(CSS_STICKY_TOP);
      el.style.removeProperty(CSS_STICKY_TOP_RELATIVE);
      el.style.removeProperty(CSS_BOTTOM);
      el.style.removeProperty(CSS_PAGE_STICKY_HEIGHT);
    }
  }

  return {
    start,
    destroy,
    recompute: () => {
      if (rafId != null && win) {
        win.cancelAnimationFrame(rafId);
        rafId = null;
      }
      recompute();
    },
    scheduleRecompute,
  };
}
