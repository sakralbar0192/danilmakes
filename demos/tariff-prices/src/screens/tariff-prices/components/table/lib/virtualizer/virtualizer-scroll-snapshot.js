import { resolveScrollWindowNested, resolveScrollWindowPageScroll } from "../scroll/resolve-scroll-window.js";

/**
 * Метрики видимой области вложенного скролл-контейнера (без корня виртуализатора).
 * При скролле только по scrollTop/scrollLeft внутри контейнера его getBoundingClientRect() на экране стабилен — кэшируем между кадрами.
 */
// eslint-disable-next-line import/prefer-default-export
export function readNestedOuterViewportMetrics(scrollElement) {
  if (!scrollElement) {
    return { outerTop: 0, outerClientHeight: 0 };
  }
  const outerBounds = scrollElement.getBoundingClientRect();
  return {
    outerTop: outerBounds.top,
    outerClientHeight: scrollElement.clientHeight,
  };
}

/**
 * Вложенный скролл: одна getBoundingClientRect на корень виртуализатора; outer берётся из кэша.
 */
// eslint-disable-next-line import/prefer-default-export
export function readVirtualizerScrollSnapshotNestedSelfRectOnly({
  virtualizerEl,
  outerTop,
  outerClientHeight,
}) {
  if (!virtualizerEl) {
    return null;
  }
  const selfBounds = virtualizerEl.getBoundingClientRect();
  return resolveScrollWindowNested(
    selfBounds.top,
    selfBounds.height,
    outerTop,
    outerClientHeight,
  );
}

/**
 * Один проход getBoundingClientRect для корня виртуализатора + при необходимости outer (вложенный скролл).
 */
// eslint-disable-next-line import/prefer-default-export
export function readVirtualizerScrollSnapshot({
  virtualizerEl,
  isPageScroll,
  viewportHeight,
  scrollElement,
}) {
  if (!virtualizerEl) {
    return null;
  }
  if (isPageScroll) {
    const b = virtualizerEl.getBoundingClientRect();
    return resolveScrollWindowPageScroll(b.top, b.height, viewportHeight);
  }
  if (scrollElement) {
    const selfBounds = virtualizerEl.getBoundingClientRect();
    const outerBounds = scrollElement.getBoundingClientRect();
    return resolveScrollWindowNested(
      selfBounds.top,
      selfBounds.height,
      outerBounds.top,
      scrollElement.clientHeight,
    );
  }
  return null;
}
