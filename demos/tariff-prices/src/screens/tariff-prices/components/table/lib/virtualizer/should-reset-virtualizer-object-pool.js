/**
 * Нужен ли полный сброс пула VirtualView (virtualElements = []).
 *
 * @param {{
 *   overlapsPrevRenderedRange?: boolean,
 *   force?: boolean,
 *   fullPoolReset?: boolean,
 * }} args
 */
// eslint-disable-next-line import/prefer-default-export
export function shouldResetVirtualizerObjectPool({
  overlapsPrevRenderedRange = false,
  force = false,
  fullPoolReset = true,
} = {}) {
  if (!overlapsPrevRenderedRange) {
    return true;
  }
  return Boolean(force && fullPoolReset);
}
