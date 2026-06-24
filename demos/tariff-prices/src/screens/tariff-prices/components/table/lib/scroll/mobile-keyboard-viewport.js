/**
 * Эвристики visualViewport и пересечения прямоугольников для мобильной клавиатуры / липкой шапки.
 * (Логика подскролла ячейки в safe-area вынесена; см. историю `mobile-cell-scroll-geometry.js`.)
 */

import { computeKeyboardIntrusionPx } from "../../../../lib/screen/scroll-container-bottom-fit.js";
import { MOBILE_KEYBOARD_INTRUSION_OPEN_PX } from "../../config/table-grid-metrics.js";

/** Доля innerHeight: ниже — считаем, что visualViewport уже сжат клавиатурой (эвристика). */
export const MOBILE_VISUAL_VIEWPORT_KEYBOARD_HEIGHT_RATIO = 0.9;

/**
 * @param {VisualViewport | null | undefined} visualViewport
 * @param {number} windowInnerHeight
 */
export function getKeyboardIntrusionPx(visualViewport, windowInnerHeight) {
  return computeKeyboardIntrusionPx({ visualViewport, windowInnerHeight });
}

/**
 * @param {VisualViewport | null | undefined} visualViewport
 * @param {number} windowInnerHeight
 * @param {number} [thresholdPx=MOBILE_KEYBOARD_INTRUSION_OPEN_PX]
 */
export function isKeyboardIntrusionLikelyOpen(
  visualViewport,
  windowInnerHeight,
  thresholdPx = MOBILE_KEYBOARD_INTRUSION_OPEN_PX,
) {
  return getKeyboardIntrusionPx(visualViewport, windowInnerHeight) > thresholdPx;
}

/**
 * Комбинированная «клавиатура открыта» для dismiss и index.vue.
 * @param {{
 *   visualViewport: VisualViewport | null | undefined,
 *   windowInnerHeight: number,
 *   virtualKeyboardOpen?: boolean,
 *   intrusionThresholdPx?: number,
 * }} args
 */
export function isMobileKeyboardLikelyOpen({
  visualViewport,
  windowInnerHeight,
  virtualKeyboardOpen = false,
  intrusionThresholdPx = MOBILE_KEYBOARD_INTRUSION_OPEN_PX,
}) {
  const intrusionOpen = isKeyboardIntrusionLikelyOpen(
    visualViewport,
    windowInnerHeight,
    intrusionThresholdPx,
  );
  const ratioOpen = Boolean(
    visualViewport
    // eslint-disable-next-line no-use-before-define
    && isVisualViewportLikelyKeyboardOpen(visualViewport.height, windowInnerHeight),
  );
  return Boolean(intrusionOpen || ratioOpen || virtualKeyboardOpen);
}

/**
 * @param {number} prevIntrusionPx
 * @param {number} nextIntrusionPx
 * @param {number} [thresholdPx=MOBILE_KEYBOARD_INTRUSION_OPEN_PX]
 */
export function didKeyboardIntrusionLikelyClose(
  prevIntrusionPx,
  nextIntrusionPx,
  thresholdPx = MOBILE_KEYBOARD_INTRUSION_OPEN_PX,
) {
  return prevIntrusionPx > thresholdPx && nextIntrusionPx <= thresholdPx;
}

/**
 * @param {number} visualViewportHeight
 * @param {number} windowInnerHeight
 * @param {number} [thresholdRatio=MOBILE_VISUAL_VIEWPORT_KEYBOARD_HEIGHT_RATIO]
 */
export function isVisualViewportLikelyKeyboardOpen(
  visualViewportHeight,
  windowInnerHeight,
  thresholdRatio = MOBILE_VISUAL_VIEWPORT_KEYBOARD_HEIGHT_RATIO,
) {
  if (!Number.isFinite(visualViewportHeight) || !Number.isFinite(windowInnerHeight) || windowInnerHeight <= 0) {
    return false;
  }
  return visualViewportHeight < windowInnerHeight * thresholdRatio;
}

/**
 * Переход «клавиатура, вероятно, открыта» → «вероятно, закрыта» по двум последовательным вызовам эвристики.
 * @param {boolean} prevLikelyOpen
 * @param {boolean} nextLikelyOpen
 */
export function didKeyboardLikelyClose(prevLikelyOpen, nextLikelyOpen) {
  return Boolean(prevLikelyOpen) && !nextLikelyOpen;
}

/**
 * Ненулевое пересечение двух прямоугольников в координатах viewport (липкая шапка таблицы vs ячейка).
 * Защищено от null/undefined и невалидных DOMRect: вызывающий код может прочитать `getBoundingClientRect`
 * на detached-элементе или передать `null` в гонке с virtualizer refresh.
 * @param {DOMRect|{ left: number, right: number, top: number, bottom: number }|null|undefined} a
 * @param {DOMRect|{ left: number, right: number, top: number, bottom: number }|null|undefined} b
 */
export function rectsOverlap2D(a, b) {
  if (!a || !b) {
    return false;
  }
  if (
    typeof a.left !== "number" || typeof a.right !== "number"
    || typeof a.top !== "number" || typeof a.bottom !== "number"
    || typeof b.left !== "number" || typeof b.right !== "number"
    || typeof b.top !== "number" || typeof b.bottom !== "number"
  ) {
    return false;
  }
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/**
 * Доступен ли Virtual Keyboard API (в основном Chromium).
 * @param {Navigator | undefined} nav
 */
export function isVirtualKeyboardApiAvailable(nav) {
  return Boolean(nav && nav.virtualKeyboard && typeof nav.virtualKeyboard.addEventListener === "function");
}

/**
 * По `navigator.virtualKeyboard.boundingRect` — перекрытие экрана клавиатурой (layout viewport).
 * @param {Navigator | undefined} nav
 * @param {number} innerH
 * @returns {boolean | null} null если API недоступен
 */
export function isVirtualKeyboardGeometryLikelyOpen(nav, innerH) {
  if (!isVirtualKeyboardApiAvailable(nav)) {
    return null;
  }
  let r = null;
  try {
    // boundingRect — getter; в WebView некоторых версий может выбросить SecurityError
    // или вернуть proxy/прокинуть исключение. Фолбэк через try/catch — false (геометрия не доступна).
    r = nav.virtualKeyboard.boundingRect;
  } catch (err) {
    return false;
  }
  if (!r || typeof r.height !== "number") {
    return false;
  }
  if (r.height < 8) {
    return false;
  }
  if (!Number.isFinite(innerH) || innerH <= 0) {
    return r.height >= 8;
  }
  return r.bottom > 8 && r.top < innerH - 1;
}
