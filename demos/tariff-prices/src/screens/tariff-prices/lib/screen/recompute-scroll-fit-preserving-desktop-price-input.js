import { captureScrollContainerPosition,
  restoreScrollContainerPosition } from "./preserve-scroll-container-position.js";
import { restoreDesktopPriceInputFocusAfterDraftSync } from "../../components/table/lib/editing/restore-desktop-price-input-focus-after-draft-sync.js";

/**
 * @param {HTMLElement | null | undefined} scrollEl
 * @param {Element | null | undefined} activeElement
 * @returns {boolean}
 */
export function isDesktopPriceInputInScrollContainer(scrollEl, activeElement) {
  if (!scrollEl || !activeElement || activeElement.nodeName !== "INPUT") {
    return false;
  }
  if (!scrollEl.contains(activeElement)) {
    return false;
  }
  const cellRoot = activeElement.closest?.("[data-cell-root]");
  if (!cellRoot || !scrollEl.contains(cellRoot)) {
    return false;
  }
  const cellType = cellRoot.dataset?.cellType || "";
  return cellType === "price-cell" || cellType === "extra-price-cell";
}

/**
 * Пересчёт scroll-fit при появлении page footer: сохранить scrollTop и фокус в price-input.
 *
 * @param {{
 *   scrollEl: HTMLElement | null | undefined,
 *   isDesktopDevice?: boolean,
 *   document?: Document | null,
 *   recompute: () => void,
 *   inputToRestore?: HTMLInputElement | null,
 * }} options
 * `inputToRestore` — явный input (после setUpdatingPrices фокус может уже уйти с activeElement).
 */
export function recomputeScrollFitPreservingDesktopPriceInput({
  scrollEl,
  isDesktopDevice = false,
  document: doc = typeof document !== "undefined" ? document : null,
  recompute,
  inputToRestore: inputToRestoreOverride = null,
}) {
  if (typeof recompute !== "function") {
    return;
  }

  const active = doc?.activeElement;
  const explicitInput = inputToRestoreOverride?.nodeName === "INPUT"
    && inputToRestoreOverride.isConnected
    ? inputToRestoreOverride
    : null;
  const activeInput = isDesktopPriceInputInScrollContainer(scrollEl, active) && active?.nodeName === "INPUT"
    ? active
    : null;
  const inputToRestore = explicitInput || activeInput;
  const preserve = Boolean(isDesktopDevice && inputToRestore && scrollEl);
  const snapshot = preserve ? captureScrollContainerPosition(scrollEl) : null;

  const runRecomputeAndRestore = () => {
    recompute();
    if (!snapshot || !scrollEl) {
      return;
    }
    restoreScrollContainerPosition(scrollEl, snapshot);
    if (inputToRestore?.isConnected) {
      restoreDesktopPriceInputFocusAfterDraftSync(inputToRestore, {
        isMobileDevice: false,
        document: doc,
      });
    }
  };

  const scheduleAfterFooterPaint = (fn) => {
    if (typeof requestAnimationFrame !== "function") {
      fn();
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(fn);
    });
  };

  if (preserve) {
    scheduleAfterFooterPaint(runRecomputeAndRestore);
    return;
  }

  recompute();
}
