export const HORIZONTAL_SCROLL_THROTTLE_MS = 80;
/** Мобилка: не открывать модалку категорий по ghost click после горизонтального скролла */
export const HORIZONTAL_SCROLL_SUPPRESS_CATEGORY_CLICK_MS = 450;
/** Порог |ΔscrollLeft| в px: выше — считаем горизонтальный скролл и подавляем ghost click по фильтру категорий */
export const HORIZONTAL_SCROLL_TRIGGER_THRESHOLD = 2;

/**
 * Обновление scrollLeft и при необходимости — окна подавления клика по фильтру категорий.
 */
export function computeHorizontalScrollStatePatch({
  scrollLeft,
  prevScrollLeft,
  isMobileDevice,
  now,
  currentCategoriesSuppressUntilMs,
}) {
  let categoriesFilterSuppressClickUntilMs = currentCategoriesSuppressUntilMs;
  if (
    isMobileDevice
    && prevScrollLeft != null
    && Math.abs(scrollLeft - prevScrollLeft) > HORIZONTAL_SCROLL_TRIGGER_THRESHOLD
  ) {
    categoriesFilterSuppressClickUntilMs = now + HORIZONTAL_SCROLL_SUPPRESS_CATEGORY_CLICK_MS;
  }
  return {
    horizontalScrollLeft: scrollLeft,
    prevScrollLeftForCategorySuppress: scrollLeft,
    categoriesFilterSuppressClickUntilMs,
  };
}

export function throttleFn(fn, delayMs) {
  let last = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - last >= delayMs || last === 0) {
      last = now;
      fn.apply(this, args);
    }
  };
}
