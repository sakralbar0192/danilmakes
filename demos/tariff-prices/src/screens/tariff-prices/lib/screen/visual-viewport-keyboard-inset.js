/**
 * Полоса между нижним краем layout viewport и нижним краем visual viewport
 * (клавиатура, home indicator и т.п.). Используется для подъёма fixed-бара над клавиатурой.
 *
 * Глобальный `meta viewport` с `interactive-widget` (resizes-content / overlays-content) намеренно
 * не меняем: это затрагивает весь SPA; поведение клавиатуры компенсируется здесь и в скролле ячейки.
 *
 * @param {Window} [win]
 * @returns {number} неотрицательное смещение в CSS px
 */
// eslint-disable-next-line import/prefer-default-export
export function computeKeyboardInsetPx(win) {
  if (typeof win === "undefined" || win == null) {
    return 0;
  }
  const vv = win.visualViewport;
  if (!vv) {
    return 0;
  }
  const innerH = win.innerHeight;
  if (!Number.isFinite(innerH) || innerH <= 0) {
    return 0;
  }
  const bottomOfVv = vv.offsetTop + vv.height;
  if (!Number.isFinite(bottomOfVv)) {
    return 0;
  }
  return Math.max(0, innerH - bottomOfVv);
}
