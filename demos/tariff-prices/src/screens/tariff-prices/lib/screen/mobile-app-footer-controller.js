/**
 * Класс на document.body при скрытии внешнего футера приложения на мобилке + краткий трекинг resize после клавиатуры.
 * Зависимости передаются явно для тестов.
 *
 * Здесь используется `window.resize` / `innerHeight`, а не `visualViewport`: таблица слушает VV для
 * эвристики dismiss-клавиатуры; отдельный канал по layout viewport даёт стабильный сигнал
 * «клавиатура ушла» для `onKeyboardHiddenChange` и body-class без гонок с debounce VV (~200ms).
 */
export const MOBILE_EDITING_BODY_CLASS = "bnovo-tariff-prices-mobile-editing";

/**
 * @param {{
 *   window: Window | null,
 *   document: Document | null,
 *   className?: string,
 *   isMobileDevice: () => boolean,
 *   getShouldHideMobileAppFooterBar: () => boolean,
 *   onKeyboardHiddenChange: (hidden: boolean) => void,
 *   fallbackDelayMs?: number,
 * }} options
 */
export function createMobileAppFooterController({
  window: win,
  document: doc,
  className = MOBILE_EDITING_BODY_CLASS,
  isMobileDevice,
  getShouldHideMobileAppFooterBar,
  onKeyboardHiddenChange,
  fallbackDelayMs = 200,
}) {
  let keyboardBaseViewportHeight = null;
  let resizeHandler = null;
  let fallbackTimer = null;
  /** @type {boolean | null} */
  let lastKeyboardHiddenState = null;
  /** @type {boolean | null} */
  let lastAppliedHideOuter = null;
  /** @type {boolean | null} */
  let lastAppliedBodyHasClass = null;

  function applyBodyClass() {
    if (!doc) {
      return;
    }
    if (!isMobileDevice()) {
      doc.body.classList.remove(className);
      return;
    }
    const hideOuter = getShouldHideMobileAppFooterBar();
    if (hideOuter) {
      doc.body.classList.add(className);
    } else {
      doc.body.classList.remove(className);
    }
    const bodyHasClass = doc.body.classList.contains(className);
    if (lastAppliedHideOuter === hideOuter && lastAppliedBodyHasClass === bodyHasClass) {
      return;
    }
    lastAppliedHideOuter = hideOuter;
    lastAppliedBodyHasClass = bodyHasClass;
  }

  function finishKeyboardHideTracking() {
    if (!resizeHandler && !fallbackTimer && lastKeyboardHiddenState === false) {
      return;
    }
    if (resizeHandler && win) {
      win.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
    if (lastKeyboardHiddenState !== false) {
      onKeyboardHiddenChange(false);
      lastKeyboardHiddenState = false;
    }
    applyBodyClass();
  }

  function startKeyboardHideTracking() {
    if (!win) {
      finishKeyboardHideTracking();
      return;
    }

    if (!keyboardBaseViewportHeight) {
      keyboardBaseViewportHeight = win.innerHeight;
    }

    if (lastKeyboardHiddenState !== true) {
      onKeyboardHiddenChange(true);
      lastKeyboardHiddenState = true;
    }

    if (resizeHandler) {
      win.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }

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

  /**
   * Вызов после того, как родитель выставил tableHideMobileAppFooter.
   * @param {boolean} tableWantsHideAppFooter
   */
  function onTableAppFooterSignal(tableWantsHideAppFooter) {
    if (tableWantsHideAppFooter) {
      if (lastKeyboardHiddenState !== true) {
        onKeyboardHiddenChange(true);
        lastKeyboardHiddenState = true;
      }
    } else {
      finishKeyboardHideTracking();
    }
    applyBodyClass();
  }

  function destroy() {
    if (resizeHandler && win) {
      win.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
    }
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
    if (doc) {
      doc.body.classList.remove(className);
    }
    keyboardBaseViewportHeight = null;
    lastKeyboardHiddenState = null;
    lastAppliedHideOuter = null;
    lastAppliedBodyHasClass = null;
    onKeyboardHiddenChange(false);
  }

  /**
   * Завершение inline-edit: снять suppress page footer даже если overlay-VK всё ещё «открыта».
   */
  function finishEditSession() {
    finishKeyboardHideTracking();
  }

  return {
    syncBodyClass: applyBodyClass,
    onTableAppFooterSignal,
    startKeyboardHideTracking,
    finishKeyboardHideTracking,
    finishEditSession,
    destroy,
  };
}
