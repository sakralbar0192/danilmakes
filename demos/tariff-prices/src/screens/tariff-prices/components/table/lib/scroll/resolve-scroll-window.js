/**
 * Чистые функции: окно видимой вертикали относительно виртуализированного списка.
 */

export function resolveScrollWindowSelf(scrollTop, clientHeight) {
  return {
    start: scrollTop,
    end: scrollTop + clientHeight,
  };
}

/**
 * Страница / document scrolling: self — корень списка в координатах viewport.
 */
export function resolveScrollWindowPageScroll(selfTop, selfHeight, viewportHeight) {
  const start = Math.max(0, -selfTop);
  const end = Math.min(selfHeight, viewportHeight - selfTop);
  return {
    start,
    end: Math.max(start, end),
  };
}

/**
 * Внешний скролл-контейнер: пересечение видимой части outer с self.
 */
export function resolveScrollWindowNested(selfTop, selfHeight, outerTop, outerClientHeight) {
  let start = outerTop - selfTop;
  let size = outerClientHeight;
  if (start < 0) {
    size += start;
    start = 0;
  }
  if (start + size > selfHeight) {
    size = selfHeight - start;
  }
  size = Math.max(0, size);
  return {
    start,
    end: start + size,
  };
}
