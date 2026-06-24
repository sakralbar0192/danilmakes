/**
 * Геометрия нижнего «перекрытия» для скролл-контейнера ЦиО: fixed-футеры и виртуальная клавиатура.
 * Чистые функции для юнит-тестов и контроллера `scroll-container-bottom-fit-controller.js`.
 */

/**
 * Часть экрана, перекрытая клавиатурой / оверлеем, по разнице layout viewport и visualViewport.
 * @param {{ visualViewport: VisualViewport | null | undefined, windowInnerHeight: number }} args
 * @returns {number} пиксели ≥ 0
 */
export function computeKeyboardIntrusionPx({ visualViewport, windowInnerHeight }) {
  if (!visualViewport || typeof visualViewport.offsetTop !== "number" || typeof visualViewport.height !== "number") {
    return 0;
  }
  if (!Number.isFinite(windowInnerHeight) || windowInnerHeight <= 0) {
    return 0;
  }
  const occluded = windowInnerHeight - (visualViewport.offsetTop + visualViewport.height);
  return occluded > 0 ? occluded : 0;
}

/**
 * Видимая по вертикали часть прямоугольника (DOMRect) внутри [0, windowInnerHeight].
 * @param {DOMRect | { top: number, bottom: number } | null | undefined} rect
 * @param {number} windowInnerHeight
 * @returns {number} пиксели ≥ 0
 */
export function computeVisibleRectHeightInViewport(rect, windowInnerHeight) {
  if (!rect || typeof rect.bottom !== "number" || typeof rect.top !== "number") {
    return 0;
  }
  if (!Number.isFinite(windowInnerHeight) || windowInnerHeight <= 0) {
    return 0;
  }
  const bottom = Math.min(windowInnerHeight, rect.bottom);
  const top = Math.max(0, rect.top);
  const h = bottom - top;
  return h > 0 ? h : 0;
}

/**
 * Сколько пикселей от низа viewport занято/недоступно из-за элемента (fixed-футер, клавиатура).
 * Считаем расстояние от низа viewport до верхней границы прямоугольника:
 * этот вариант корректно учитывает `margin-bottom` (например, `headerHeightGroup`
 * сдвигает `b-screen-footer` вверх под `bnovo-mobile-footer--outer`) и любые случаи,
 * когда зона недоступна для таблицы между rect.top и низом viewport.
 *
 * @param {DOMRect | { top: number } | null | undefined} rect
 * @param {number} windowInnerHeight
 * @returns {number} пиксели ≥ 0
 */
export function computeBottomOcclusionFromRect(rect, windowInnerHeight) {
  if (!rect || typeof rect.top !== "number") {
    return 0;
  }
  if (!Number.isFinite(windowInnerHeight) || windowInnerHeight <= 0) {
    return 0;
  }
  const top = Math.max(0, rect.top);
  const occluded = windowInnerHeight - top;
  return occluded > 0 ? occluded : 0;
}

/**
 * Перекрытие снизу по Virtual Keyboard API (Chromium): `boundingRect` в координатах layout viewport.
 * @param {Navigator | null | undefined} nav
 * @param {number} windowInnerHeight
 * @returns {number} пиксели ≥ 0
 */
export function computeVirtualKeyboardOverlayIntrusionPx(nav, windowInnerHeight) {
  const r = nav?.virtualKeyboard?.boundingRect;
  if (!r || typeof r.height !== "number" || r.height < 8) {
    return 0;
  }
  return computeBottomOcclusionFromRect(r, windowInnerHeight);
}

/**
 * Суммарное перекрытие снизу: max(fixed-футеры) и клавиатура (VV / VK overlay).
 * Футеры и клавиатуру не суммируем — при открытой клавиатуре футеры обычно уже скрыты.
 *
 * @param {{
 *   pageFooterRect: DOMRect | { top: number } | null | undefined,
 *   appMobileFooterRect: DOMRect | { top: number } | null | undefined,
 *   keyboardIntrusionPx: number,
 *   windowInnerHeight: number,
 * }} args
 * @returns {number} пиксели ≥ 0
 */
export function computeBottomOcclusionPx({
  pageFooterRect,
  appMobileFooterRect,
  keyboardIntrusionPx,
  windowInnerHeight,
}) {
  const fixedOcclusion = Math.max(
    computeBottomOcclusionFromRect(pageFooterRect, windowInnerHeight),
    computeBottomOcclusionFromRect(appMobileFooterRect, windowInnerHeight),
  );
  const kb = Number.isFinite(keyboardIntrusionPx) && keyboardIntrusionPx > 0 ? keyboardIntrusionPx : 0;
  return Math.max(fixedOcclusion, kb);
}

/** Совпадает с `--prices-table-bottom-gap` в `styles/index.scss` (отступ в calc max-height). */
export const PRICES_TABLE_SCROLL_BOTTOM_GAP_PX = 8;

/** Нижняя граница высоты области скролла таблицы; дополнительно не ниже ~12% окна на маленьких экранах. */
export const MIN_PRICES_SCROLL_VIEWPORT_PX = 120;

/** Минимальное перекрытие (px), чтобы считать клавиатуру реально открытой для `max-height` (не фантом VK до анимации). */
export const SCROLL_LAYOUT_KEYBOARD_INTRUSION_MIN_PX = 48;

/** Доля innerHeight: ниже — visualViewport сжат клавиатурой (как в mobile-keyboard-viewport). */
export const SCROLL_LAYOUT_VV_KEYBOARD_HEIGHT_RATIO = 0.9;

/**
 * Учёт клавиатуры в `--prices-table-bottom-occlusion` при inline-edit на мобилке.
 * Chromium overlay VK: до раскрытия клавиатуры `boundingRect` может дать ложное перекрытие при `visualViewport` без сжатия.
 *
 * @param {{
 *   visualViewport: VisualViewport | null | undefined,
 *   windowInnerHeight: number,
 *   navigatorLike?: Navigator | null,
 *   vvIntrusionPx?: number,
 *   vkIntrusionPx?: number,
 *   mobileInlineEditActive?: boolean,
 * }} args
 * @returns {number}
 */
export function resolveScrollContainerKeyboardIntrusionPx({
  visualViewport,
  windowInnerHeight,
  navigatorLike = null,
  vvIntrusionPx = 0,
  vkIntrusionPx = 0,
  mobileInlineEditActive = false,
}) {
  const vv = Number.isFinite(vvIntrusionPx) && vvIntrusionPx > 0 ? vvIntrusionPx : 0;
  const vk = Number.isFinite(vkIntrusionPx) && vkIntrusionPx > 0 ? vkIntrusionPx : 0;
  const raw = Math.max(vv, vk);
  if (!mobileInlineEditActive || raw <= 0) {
    return raw;
  }
  if (!Number.isFinite(windowInnerHeight) || windowInnerHeight <= 0) {
    return 0;
  }
  const vvRatioOpen = Boolean(
    visualViewport
    && typeof visualViewport.height === "number"
    && visualViewport.height < windowInnerHeight * SCROLL_LAYOUT_VV_KEYBOARD_HEIGHT_RATIO,
  );
  if (vv >= SCROLL_LAYOUT_KEYBOARD_INTRUSION_MIN_PX || vvRatioOpen) {
    return raw;
  }
  const r = navigatorLike?.virtualKeyboard?.boundingRect;
  const vkHeight = r && typeof r.height === "number" ? r.height : 0;
  if (
    vk >= SCROLL_LAYOUT_KEYBOARD_INTRUSION_MIN_PX
    && vkHeight >= SCROLL_LAYOUT_KEYBOARD_INTRUSION_MIN_PX
    && r
    && typeof r.top === "number"
    && r.top >= windowInnerHeight * 0.55
  ) {
    return raw;
  }
  return 0;
}

/**
 * Ограничивает нижнее перекрытие так, чтобы `max-height` скролл-контейнера не схлопывалась почти до нуля
 * (WebView / гонки VV и футеров).
 *
 * @param {{
 *   topOffsetPx: number,
 *   bottomOcclusionPx: number,
 *   windowInnerHeight: number,
 *   bottomGapPx?: number,
 *   minScrollViewportPx?: number,
 * }} args
 * @returns {number}
 */
export function clampBottomOcclusionForMinScrollViewport({
  topOffsetPx,
  bottomOcclusionPx,
  windowInnerHeight,
  bottomGapPx = PRICES_TABLE_SCROLL_BOTTOM_GAP_PX,
  minScrollViewportPx = MIN_PRICES_SCROLL_VIEWPORT_PX,
}) {
  if (!Number.isFinite(bottomOcclusionPx) || bottomOcclusionPx < 0) {
    return 0;
  }
  if (!Number.isFinite(windowInnerHeight) || windowInnerHeight <= 0) {
    return bottomOcclusionPx;
  }
  const top = Number.isFinite(topOffsetPx) && topOffsetPx > 0 ? topOffsetPx : 0;
  const gap = Number.isFinite(bottomGapPx) && bottomGapPx >= 0 ? bottomGapPx : 0;
  const baseMin = Number.isFinite(minScrollViewportPx) && minScrollViewportPx > 0 ? minScrollViewportPx : 0;
  const dynamicMin = Math.max(baseMin, Math.floor(windowInnerHeight * 0.12));
  const maxBottomOcclusion = windowInnerHeight - top - gap - dynamicMin;
  if (!Number.isFinite(maxBottomOcclusion)) {
    return bottomOcclusionPx;
  }
  const cap = Math.max(0, maxBottomOcclusion);
  return Math.min(bottomOcclusionPx, cap);
}

const APP_HEADER_SELECTOR = ".bnovo-header--outer .app-menu--outer, .demo-banner";

/**
 * Нижняя граница fixed-шапки приложения в координатах viewport (для sticky шапки таблицы в WebKit).
 * @param {{ querySelector?: (sel: string) => Element | null }} [documentLike]
 * @returns {number} пиксели ≥ 0
 */
export function resolveAppHeaderBottomPx(documentLike) {
  const el = documentLike?.querySelector?.(APP_HEADER_SELECTOR);
  if (!el?.getBoundingClientRect) {
    return 0;
  }
  return Math.max(0, Math.round(el.getBoundingClientRect().bottom));
}

/**
 * `top` для липкой шапки таблицы: не выше низа header приложения (WebKit Safari липнет к viewport).
 * @param {{ scrollContainerTopPx: number, appHeaderBottomPx: number }} args
 * @returns {number}
 */
export function computeTableStickyTopPx({ scrollContainerTopPx, appHeaderBottomPx }) {
  const containerTop = Number.isFinite(scrollContainerTopPx) && scrollContainerTopPx > 0
    ? scrollContainerTopPx
    : 0;
  const headerBottom = Number.isFinite(appHeaderBottomPx) && appHeaderBottomPx > 0
    ? appHeaderBottomPx
    : 0;
  return Math.max(containerTop, headerBottom);
}

/**
 * `top` для sticky шапки таблицы относительно scroll-контейнера (mobile WebKit).
 * @param {{ scrollContainerTopPx: number, appHeaderBottomPx: number }} args
 * @returns {number}
 */
export function computeTableStickyTopRelativePx({ scrollContainerTopPx, appHeaderBottomPx }) {
  const containerTop = Number.isFinite(scrollContainerTopPx) && scrollContainerTopPx > 0
    ? scrollContainerTopPx
    : 0;
  if (containerTop <= 0) {
    return 0;
  }
  const absolute = computeTableStickyTopPx({ scrollContainerTopPx: containerTop, appHeaderBottomPx });
  return Math.max(0, absolute - containerTop);
}
