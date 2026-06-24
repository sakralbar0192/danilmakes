import { MOBILE_EDITING_BODY_CLASS } from "../../../lib/screen/mobile-app-footer-controller.js";

const MASS_PRICES_VALUES_SELECTOR = "[data-test=\"tariff-mass-prices-values\"]";

export function isInsideMassPricesTable(target) {
  return Boolean(target?.closest?.(MASS_PRICES_VALUES_SELECTOR));
}

/**
 * @returns {"noop"|"stayInTable"|"leaveTable"|"filterBlur"}
 */
export function resolveMassPricesDrawerBlurAction({
  wasInMassPricesTable,
  stillInMassPricesTable,
  relatedTargetInsideContent,
}) {
  if (wasInMassPricesTable) {
    if (stillInMassPricesTable) {
      return "stayInTable";
    }
    return "leaveTable";
  }

  if (relatedTargetInsideContent) {
    return "noop";
  }

  return "filterBlur";
}

/**
 * Keyboard dismiss tracking + body class for mass-prices drawer mobile editing.
 *
 * @param {{
 *   window: Window | null,
 *   document: Document | null,
 *   className?: string,
 *   fallbackDelayMs?: number,
 * }} options
 */
export function createMassPricesDrawerKeyboardSession({
  window: win,
  document: doc,
  className = MOBILE_EDITING_BODY_CLASS,
  fallbackDelayMs = 200,
}) {
  let keyboardBaseViewportHeight = null;
  let resizeHandler = null;
  let fallbackTimer = null;

  function cancelKeyboardHideTracking() {
    if (resizeHandler && win) {
      win.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }

  function ensureMobileEditingBodyClass() {
    if (doc && !doc.body.classList.contains(className)) {
      doc.body.classList.add(className);
    }
  }

  function removeMobileEditingBodyClass() {
    if (doc) {
      doc.body.classList.remove(className);
    }
  }

  function finishKeyboardHideTracking() {
    cancelKeyboardHideTracking();
    removeMobileEditingBodyClass();
  }

  function startKeyboardHideTracking() {
    if (!win) {
      finishKeyboardHideTracking();
      return;
    }

    if (!keyboardBaseViewportHeight) {
      keyboardBaseViewportHeight = win.innerHeight;
    }

    cancelKeyboardHideTracking();

    resizeHandler = () => {
      if (win.innerHeight >= keyboardBaseViewportHeight) {
        finishKeyboardHideTracking();
      }
    };

    win.addEventListener("resize", resizeHandler);

    fallbackTimer = setTimeout(() => {
      finishKeyboardHideTracking();
    }, fallbackDelayMs);
  }

  function onTableInputFocus() {
    cancelKeyboardHideTracking();
    ensureMobileEditingBodyClass();
  }

  function destroy() {
    cancelKeyboardHideTracking();
    removeMobileEditingBodyClass();
    keyboardBaseViewportHeight = null;
  }

  return {
    cancelKeyboardHideTracking,
    ensureMobileEditingBodyClass,
    removeMobileEditingBodyClass,
    startKeyboardHideTracking,
    finishKeyboardHideTracking,
    onTableInputFocus,
    destroy,
  };
}
