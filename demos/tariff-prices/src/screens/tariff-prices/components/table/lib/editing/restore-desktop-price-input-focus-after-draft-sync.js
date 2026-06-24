/**
 * После commit черновика цены в Vuex controlled `:value` может сбросить фокус на десктопе.
 *
 * @param {HTMLInputElement | null | undefined} target
 * @param {{ isMobileDevice?: boolean, document?: Document | null }} options
 * @returns {boolean} true если фокус восстановлен на target
 */
// eslint-disable-next-line import/prefer-default-export
export function restoreDesktopPriceInputFocusAfterDraftSync(
  target,
  { isMobileDevice = false, document: doc = typeof document !== "undefined" ? document : null } = {},
) {
  if (isMobileDevice || !target || target.nodeName !== "INPUT" || !target.isConnected) {
    return false;
  }
  const active = doc?.activeElement;
  if (active === target) {
    return true;
  }
  if (typeof target.focus !== "function") {
    return false;
  }
  target.focus({ preventScroll: true });
  return doc?.activeElement === target;
}
