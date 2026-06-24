const DEFAULT_MAIN_MAX_WIDTH = 192;
const DEFAULT_RESET_MAX_WIDTH = 280;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Позиция v-menu `absolute` для основного тултипа (аналог «справа» от ячейки).
 * @param {DOMRectReadOnly|{ left: number, right: number, top: number, bottom: number, width?: number, height?: number }} anchorRect
 * @param {{ innerWidth: number, innerHeight: number }} viewport
 * @param {{ maxWidth?: number }} [opts]
 * @returns {{ menuX: number, menuY: number, maxWidth: number }}
 */
export function computePriceCellMainMenuPosition(anchorRect, viewport, opts = {}) {
  const maxWidth = opts.maxWidth ?? DEFAULT_MAIN_MAX_WIDTH;
  const rightSpace = viewport.innerWidth - anchorRect.right;
  const menuX = rightSpace < maxWidth
    ? anchorRect.right - maxWidth
    : anchorRect.left;
  const menuY = anchorRect.top + (anchorRect.height || 0);
  return {
    menuX: clamp(menuX, 8, Math.max(8, viewport.innerWidth - maxWidth - 8)),
    menuY: clamp(menuY, 8, Math.max(8, viewport.innerHeight - 8)),
    maxWidth,
  };
}

/**
 * Позиция v-menu снизу от якоря (кнопка сброса).
 * @param {DOMRectReadOnly|{ left: number, right: number, top: number, bottom: number }} anchorRect
 * @param {{ innerWidth: number, innerHeight: number }} viewport
 * @param {{ maxWidth?: number }} [opts]
 * @returns {{ menuX: number, menuY: number, maxWidth: number }}
 */
export function computePriceCellResetMenuPosition(anchorRect, viewport, opts = {}) {
  const maxWidth = opts.maxWidth ?? DEFAULT_RESET_MAX_WIDTH;
  const menuX = Math.min(
    anchorRect.left,
    Math.max(8, viewport.innerWidth - maxWidth - 8),
  );
  const menuY = anchorRect.bottom + 8;
  return {
    menuX,
    menuY: clamp(menuY, 8, viewport.innerHeight - 8),
    maxWidth,
  };
}
